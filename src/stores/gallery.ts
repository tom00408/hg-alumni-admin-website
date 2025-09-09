import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GalleryImage, GalleryFolder } from '../lib/types'


export const useGalleryStore = defineStore('gallery', () => {
  // State
  const images = ref<GalleryImage[]>([])
  const folders = ref<GalleryFolder[]>([])
  const currentFolder = ref<string | null>(null) // null = keine Ordner-Filterung
  const loading = ref(false)
  const foldersLoading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const hasMore = ref(true)
  const pageSize = 12

  // Getters
  const latestImages = computed(() => {
    return images.value
      .sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0))
      .slice(0, 8)
  })

  const imagesByYear = computed(() => {
    const yearMap = new Map<number, GalleryImage[]>()
    
    images.value.forEach(image => {
      const year = image.createdAt?.toDate().getFullYear() || new Date().getFullYear()
      if (!yearMap.has(year)) {
        yearMap.set(year, [])
      }
      yearMap.get(year)!.push(image)
    })
    
    // Nach Jahr sortiert (neueste zuerst)
    return new Map([...yearMap.entries()].sort((a, b) => b[0] - a[0]))
  })

  const totalImages = computed(() => images.value.length)

  // Folder-related getters
  const currentFolderData = computed(() => {
    if (!currentFolder.value) return null
    return folders.value.find(folder => folder.id === currentFolder.value) || null
  })

  const filteredImages = computed(() => {
    if (!currentFolder.value) {
      // Zeige nur Bilder ohne Ordner-Zuordnung
      return images.value.filter(image => !image.folderId)
    }
    // Zeige nur Bilder aus dem aktuellen Ordner
    return images.value.filter(image => image.folderId === currentFolder.value)
  })

  const imagesInFolder = computed(() => {
    const folderMap = new Map<string, GalleryImage[]>()
    
    // Gruppiere Bilder nach Ordnern
    images.value.forEach(image => {
      const folderId = image.folderId || 'unorganized'
      if (!folderMap.has(folderId)) {
        folderMap.set(folderId, [])
      }
      folderMap.get(folderId)!.push(image)
    })
    
    return folderMap
  })

  // Actions
  const fetchImages = async (page = 1, reset = false) => {
    if (page === 1) {
      loading.value = true
    }
    error.value = null

    try {
      const { getImages } = await import('../services/gallery')
      const { images: newImages, hasMore: moreAvailable } = await getImages(page, pageSize)
      
      if (reset || page === 1) {
        images.value = newImages
      } else {
        images.value.push(...newImages)
      }
      
      hasMore.value = moreAvailable
      currentPage.value = page
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Laden der Galerie'
      console.error('Error fetching images:', err)
      // Fallback: leere Liste für Development
      images.value = []
    } finally {
      loading.value = false
    }
  }

  const loadMore = async () => {
    if (!hasMore.value || loading.value) return
    
    const nextPage = currentPage.value + 1
    await fetchImages(nextPage, false)
  }

  const uploadImage = async (file: File, title?: string, folderId?: string) => {
    try {
      const { uploadImage: uploadToFirebase } = await import('../services/gallery')
      const newImage = await uploadToFirebase(file, title, folderId)
      images.value.unshift(newImage)
      return newImage
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Hochladen des Bildes'
      throw err
    }
  }

  const addImage = async (imageData: Omit<GalleryImage, 'id'>) => {
    try {
      const { createImage } = await import('../services/gallery')
      const newImage = await createImage(imageData)
      images.value.unshift(newImage)
      return newImage
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Hinzufügen des Bildes'
      throw err
    }
  }

  const uploadMultipleImages = async (files: File[], folderId?: string) => {
    const uploadPromises = files.map(file => uploadImage(file, undefined, folderId))
    
    try {
      const results = await Promise.all(uploadPromises)
      return results
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Hochladen der Bilder'
      throw err
    }
  }

  const updateImage = async (id: string, data: Partial<GalleryImage>) => {
    try {
      const { updateImage: updateFirebaseImage } = await import('../services/gallery')
      await updateFirebaseImage(id, data)
      
      const index = images.value.findIndex(image => image.id === id)
      if (index !== -1) {
        images.value[index] = { ...images.value[index], ...data }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Aktualisieren des Bildes'
      throw err
    }
  }

  const deleteImage = async (id: string) => {
    try {
      const { deleteImage: deleteFirebaseImage } = await import('../services/gallery')
      await deleteFirebaseImage(id)
      images.value = images.value.filter(image => image.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Löschen des Bildes'
      throw err
    }
  }

  const getImageById = (id: string) => {
    return images.value.find(image => image.id === id)
  }

  const getImagesByYear = (year: number) => {
    return images.value
      .filter(image => image.createdAt?.toDate().getFullYear() === year)
      .sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0))
  }

  const searchImages = (query: string) => {
    const lowercaseQuery = query.toLowerCase()
    return images.value.filter(image => 
      image.title?.toLowerCase().includes(lowercaseQuery)
    ).sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0))
  }

  // Folder Actions
  const fetchFolders = async () => {
    foldersLoading.value = true
    error.value = null

    try {
      const { getFolders } = await import('../services/folders')
      folders.value = await getFolders()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Laden der Ordner'
      console.error('Error fetching folders:', err)
    } finally {
      foldersLoading.value = false
    }
  }

  const createFolder = async (folderData: Omit<GalleryFolder, 'id'>) => {
    try {
      const { createFolder: createFolderService } = await import('../services/folders')
      const newFolder = await createFolderService(folderData)
      folders.value.push(newFolder)
      folders.value.sort((a, b) => a.name.localeCompare(b.name))
      return newFolder
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Erstellen des Ordners'
      throw err
    }
  }

  const updateFolder = async (id: string, data: Partial<GalleryFolder>) => {
    try {
      const { updateFolder: updateFolderService } = await import('../services/folders')
      await updateFolderService(id, data)
      
      const index = folders.value.findIndex(folder => folder.id === id)
      if (index !== -1) {
        folders.value[index] = { ...folders.value[index], ...data }
        folders.value.sort((a, b) => a.name.localeCompare(b.name))
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Aktualisieren des Ordners'
      throw err
    }
  }

  const deleteFolder = async (id: string) => {
    try {
      const { deleteFolder: deleteFolderService } = await import('../services/folders')
      await deleteFolderService(id)
      
      folders.value = folders.value.filter(folder => folder.id !== id)
      
      // Falls der gelöschte Ordner aktuell angezeigt wird, zurück zur Hauptansicht
      if (currentFolder.value === id) {
        currentFolder.value = null
      }
      
      // Aktualisiere Bilder-Cache (Bilder wurden aus dem Ordner entfernt)
      await fetchImages(1, true)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Löschen des Ordners'
      throw err
    }
  }

  const setCurrentFolder = (folderId: string | null) => {
    currentFolder.value = folderId
  }

  const addImageToFolder = async (imageId: string, folderId: string) => {
    try {
      const { addImageToFolder: addToFolderService } = await import('../services/folders')
      await addToFolderService(imageId, folderId)
      
      const imageIndex = images.value.findIndex(image => image.id === imageId)
      if (imageIndex !== -1) {
        images.value[imageIndex].folderId = folderId
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Hinzufügen des Bildes zum Ordner'
      throw err
    }
  }

  const removeImageFromFolder = async (imageId: string) => {
    try {
      const { removeImageFromFolder: removeFromFolderService } = await import('../services/folders')
      await removeFromFolderService(imageId)
      
      const imageIndex = images.value.findIndex(image => image.id === imageId)
      if (imageIndex !== -1) {
        images.value[imageIndex].folderId = undefined
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Entfernen des Bildes aus dem Ordner'
      throw err
    }
  }

  const moveImagesBetweenFolders = async (imageIds: string[], fromFolderId: string | null, toFolderId: string | null) => {
    try {
      const { moveImagesBetweenFolders: moveImagesService } = await import('../services/folders')
      await moveImagesService(imageIds, fromFolderId, toFolderId)
      
      // Aktualisiere den lokalen State
      imageIds.forEach(imageId => {
        const imageIndex = images.value.findIndex(image => image.id === imageId)
        if (imageIndex !== -1) {
          images.value[imageIndex].folderId = toFolderId || undefined
        }
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Verschieben der Bilder'
      throw err
    }
  }

  const setFolderCoverImage = async (folderId: string, imageId: string) => {
    try {
      const { setFolderCoverImage: setCoverService } = await import('../services/folders')
      await setCoverService(folderId, imageId)
      
      const folderIndex = folders.value.findIndex(folder => folder.id === folderId)
      if (folderIndex !== -1) {
        folders.value[folderIndex].coverImageId = imageId
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Setzen des Cover-Bildes'
      throw err
    }
  }

  const clearError = () => {
    error.value = null
  }

  const reset = () => {
    // Blob URLs aufräumen
    images.value.forEach(image => {
      if (image.imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(image.imageUrl)
      }
      if (image.thumbnailUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(image.thumbnailUrl)
      }
    })
    
    images.value = []
    folders.value = []
    currentFolder.value = null
    currentPage.value = 1
    hasMore.value = true
    error.value = null
  }

  return {
    // State
    images,
    folders,
    currentFolder,
    loading,
    foldersLoading,
    error,
    currentPage,
    hasMore,
    pageSize,
    
    // Getters
    latestImages,
    imagesByYear,
    totalImages,
    currentFolderData,
    filteredImages,
    imagesInFolder,
    
    // Image Actions
    fetchImages,
    loadMore,
    addImage,
    uploadImage,
    uploadMultipleImages,
    updateImage,
    deleteImage,
    getImageById,
    getImagesByYear,
    searchImages,
    
    // Folder Actions
    fetchFolders,
    createFolder,
    updateFolder,
    deleteFolder,
    setCurrentFolder,
    addImageToFolder,
    removeImageFromFolder,
    moveImagesBetweenFolders,
    setFolderCoverImage,
    
    // Common Actions
    clearError,
    reset
  }
})
