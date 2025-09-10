<template>
  <div class="gallery-page">
    <div class="page-header">
      <div class="header-content">
        <h1>Galerie verwalten</h1>
        <p>Lade Bilder hoch und verwalte die Fotogalerie des Alumni-Vereins</p>
        <!-- Breadcrumb -->
        <div v-if="galleryStore.currentFolderData" class="breadcrumb">
          <TomButton 
            @click="galleryStore.setCurrentFolder(null)" 
            title="Galerie"
            variant="secondary"
            size="small"
          />
          <span class="breadcrumb-separator">/</span>
         
          <span >
            {{ galleryStore.currentFolderData.name }}
          </span>
        </div>
      </div>
      <div class="header-actions">
        <!-- Neuer Ordner nur in Hauptgalerie -->
        <TomButton 
          v-if="!galleryStore.currentFolder" 
          @click="showFolderModal = true" 
          variant="secondary"
          title="Neuer Ordner"
          icon="folder-new"
        />
        
        
        <!-- Bilder hinzufügen nur wenn IN Ordner -->

        <TomButton 
          v-if="galleryStore.currentFolder"
          @click="showAddImagesModal = true" 
          variant="secondary" 
          title="Bilder hinzufügen"
          icon="add"
          
        />
        
     
        
        <!-- Bilder hochladen immer verfügbar -->
        <TomButton 
          @click="showUploadModal = true" 
          variant="primary"
          title="Bilder hochladen"
          icon="upload"
        />
      </div>
    </div>

    <!-- Ordner-Navigation -->
    <div v-if="!galleryStore.currentFolder && galleryStore.folders.length > 0" class="folders-section">
      <h2>Ordner</h2>
      <div class="folders-grid">
        <div 
          v-for="folder in galleryStore.folders" 
          :key="folder.id"
          class="folder-card"
          @click="galleryStore.setCurrentFolder(folder.id!)"
        >
          <div class="folder-icon">
            <img 
              v-if="folder.coverImageId && getCoverImage(folder.coverImageId)"
              :src="getCoverImage(folder.coverImageId)?.thumbnailUrl || getCoverImage(folder.coverImageId)?.imageUrl"
              :alt="`Cover für ${folder.name}`"
              class="folder-cover"
              @error="handleCoverImageError"
            />
            <div v-else class="folder-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 0 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25H11.69l-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v6.75Z" />
              </svg>
              <span class="placeholder-text">Kein Cover</span>
            </div>
          </div>
          <div class="folder-info">
            <div v-if="renamingFolder === folder.id" class="folder-rename" @click.stop>
              <input 
                ref="renameInput"
                v-model="renameValue" 
                type="text"
                class="folder-rename-input"
                @blur="cancelRename"
                @keyup.enter="confirmRename"
                @keyup.escape="cancelRename"
              />
              <div class="folder-rename-actions">
                <TomButton 
                  @click="confirmRename" 
                  title="Bestätigen"
                  icon="check"
                  variant="action"
                  size="small"
                />
                <TomButton 
                  @click="cancelRename" 
                  title="Abbrechen"
                  icon="close"
                  variant="action-delete"
                  size="small"
                />
              </div>
            </div>
            <div v-else>
              <h3>{{ folder.name }}</h3>
              <p v-if="folder.description">{{ folder.description }}</p>
              <span class="folder-count">{{ getImagesInFolderCount(folder.id!) }} Bilder</span>
            </div>
          </div>
          <div class="folder-actions visible" @click.stop>
            <TomButton 
              @click="setCoverImage(folder)" 
              variant="action" 
              title="Cover-Bild setzen"
              icon="image"
            />
           
            <TomButton 
              @click="confirmDeleteFolder(folder)" 
              variant="action-delete" 
              title="Ordner löschen"
              icon="delete"
            />
            <TomButton 
              @click="editFolder(folder)" 
              variant="action" 
              title="Ordner bearbeiten"
              icon="edit"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Image Grid Component -->
    <ImageGrid
      :images="galleryStore.filteredImages"
      :loading="galleryStore.loading"
      :total-images="galleryStore.currentFolder ? galleryStore.filteredImages.length : galleryStore.images.length"
      :stat-label="galleryStore.currentFolder ? 'Bilder im Ordner' : 'Bilder gesamt'"
      :current-folder-id="galleryStore.currentFolder"
      ref="imageGridRef"
      @bulk-delete="confirmBulkDelete"
      @upload-images="showUploadModal = true"
      @open-image="openImageModal"
      @edit-image="editImage"
      @delete-image="confirmDelete"
      @set-cover="setImageAsCover"
    />

     

    <!-- Upload Modal -->
    <ImageUploadModal
      :show="showUploadModal"
      :current-folder="galleryStore.currentFolder"
      @close="closeUploadModal"
      @upload-start="handleUploadStart"
    />

    <!-- Image Edit Modal -->
    <ImageEditModal
      :show="showEditModal"
      :editing-image="editingImage"
      :is-submitting="isSubmitting"
      @close="closeEditModal"
      @submit="submitImageEdit"
    />

    <!-- Image View Modal -->
    <ImageViewModal
      :show="showImageModal"
      :viewing-image="viewingImage"
      @close="closeImageModal"
    />

    <!-- Folder Modal -->
    <FolderModal
      :show="showFolderModal"
      :editing-folder="editingFolder"
      :is-submitting="isSubmitting"
      :available-images="galleryStore.images"
      @close="closeFolderModal"
      @submit="submitFolder"
    />

    <!-- Delete Confirmation Modal -->
    <DeleteModal
      :show="showDeleteModal"
      :title="imagesToDelete.length > 1 ? 'Bilder löschen' : 'Bild löschen'"
      :message="imagesToDelete.length === 1 ? 'Möchtest du das Bild wirklich löschen?' : `Möchtest du wirklich ${imagesToDelete.length} Bilder löschen?`"
      :is-submitting="isSubmitting"
      @close="showDeleteModal = false"
      @confirm="deleteImages"
    />

    <!-- Add Images to Folder Modal -->
    <AddImagesModal
      :show="showAddImagesModal"
      :folder-name="galleryStore.currentFolderData?.name || ''"
      :available-images="availableImages"
      :is-submitting="isSubmitting"
      @close="closeAddImagesModal"
      @add-images="addSelectedImagesToFolder"
    />

    <!-- Delete Folder Confirmation Modal -->
    <DeleteModal
      :show="showDeleteFolderModal"
      title="Ordner löschen"
      :message="folderToDelete ? 'Möchtest du den Ordner ' + folderToDelete.name + ' wirklich löschen?' : 'Ordner löschen'"
      warning="Alle Bilder im Ordner werden in die Hauptgalerie verschoben. Diese Aktion kann nicht rückgängig gemacht werden."
      confirm-text="Ordner löschen"
      :is-submitting="isSubmitting"
      @close="showDeleteFolderModal = false"
      @confirm="deleteFolderConfirmed"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useGalleryStore } from '../stores/gallery'
import type { GalleryImage, GalleryFolder } from '../lib/types'
import TomButton from '../tomponents/TomButton.vue'
import ImageGrid from '../components/galerie/ImageGrid.vue'
import ImageUploadModal from '../components/galerie/ImageUploadModal.vue'
import FolderModal from '../components/galerie/FolderModal.vue'
import ImageEditModal from '../components/galerie/ImageEditModal.vue'
import ImageViewModal from '../components/galerie/ImageViewModal.vue'
import DeleteModal from '../components/galerie/DeleteModal.vue'
import AddImagesModal from '../components/galerie/AddImagesModal.vue'

const galleryStore = useGalleryStore()

// Reactive state
const imageGridRef = ref<InstanceType<typeof ImageGrid>>()

// Modals
const showUploadModal = ref(false)
const showEditModal = ref(false)
const showImageModal = ref(false)
const showDeleteModal = ref(false)
const showFolderModal = ref(false)
const showDeleteFolderModal = ref(false)
const showAddImagesModal = ref(false)

// Upload state - moved to ImageUploadModal component

// Edit state
const editingImage = ref<GalleryImage | null>(null)
const viewingImage = ref<GalleryImage | null>(null)
const imagesToDelete = ref<string[]>([])
const editingFolder = ref<GalleryFolder | null>(null)
const folderToDelete = ref<GalleryFolder | null>(null)
const isSubmitting = ref(false)

// Form state - moved to respective modal components

// Add images to folder state - moved to AddImagesModal component

// Inline rename state
const renamingFolder = ref<string | null>(null)
const renameValue = ref('')
const renameInput = ref<HTMLInputElement>()
const breadcrumbRenameInput = ref<HTMLInputElement>()

// File input ref - moved to ImageUploadModal component

// Computed - removed as it's now handled by ImageGrid component

// Computed für Add Images Modal - moved to AddImagesModal component
const availableImages = computed(() => {
  // Zeige alle Bilder die NICHT im aktuellen Ordner sind
  return galleryStore.images.filter(image => {
    return image.folderId !== galleryStore.currentFolder
  })
})

// Methods - selection methods moved to ImageGrid component

// Upload methods - moved to ImageUploadModal component

// New upload handler for ImageUploadModal
const handleUploadStart = async (uploadData: { queue: any[], currentFolder: string | null, onProgress: (index: number, progress: number, status: string, error?: string) => void }) => {
  try {
    for (let i = 0; i < uploadData.queue.length; i++) {
      const item = uploadData.queue[i]
      
      try {
        uploadData.onProgress(i, 10, 'uploading')
        
        // Echtes Firebase Upload über den Gallery Store
        await galleryStore.uploadImage(item.file, item.title, uploadData.currentFolder || undefined)
        
        uploadData.onProgress(i, 100, 'completed')
      } catch (error) {
        console.error(`Upload fehlgeschlagen für ${item.name}:`, error)
        uploadData.onProgress(i, 0, 'error', error instanceof Error ? error.message : 'Unbekannter Fehler')
      }
    }
  } catch (error) {
    console.error('Upload-Prozess fehlgeschlagen:', error)
  }
}

const editImage = (image: GalleryImage) => {
  editingImage.value = image
  showEditModal.value = true
}

const submitImageEdit = async (data: { title: string }) => {
  if (!editingImage.value) return
  
  isSubmitting.value = true
  try {
    await galleryStore.updateImage(editingImage.value.id!, {
      title: data.title || undefined
    })
    closeEditModal()
  } catch (error) {
    console.error('Fehler beim Bearbeiten:', error)
  } finally {
    isSubmitting.value = false
  }
}

const openImageModal = (image: GalleryImage) => {
  viewingImage.value = image
  showImageModal.value = true
}

const confirmDelete = (image: GalleryImage) => {
  imagesToDelete.value = [image.id!]
  showDeleteModal.value = true
}

const confirmBulkDelete = () => {
  if (imageGridRef.value) {
    imagesToDelete.value = [...imageGridRef.value.selectedImages]
  showDeleteModal.value = true
  }
}

const deleteImages = async () => {
  isSubmitting.value = true
  try {
    for (const imageId of imagesToDelete.value) {
      await galleryStore.deleteImage(imageId)
    }
    
    // Entferne gelöschte Bilder aus Auswahl in ImageGrid
    if (imageGridRef.value) {
      imageGridRef.value.clearSelection()
    }
    
    showDeleteModal.value = false
    imagesToDelete.value = []
  } catch (error) {
    console.error('Fehler beim Löschen:', error)
  } finally {
    isSubmitting.value = false
  }
}

const closeUploadModal = () => {
  showUploadModal.value = false
}

const closeEditModal = () => {
  showEditModal.value = false
  editingImage.value = null
}

const closeImageModal = () => {
  showImageModal.value = false
  viewingImage.value = null
}

// Helper functions - moved to respective modal components

// Folder helpers
const getCoverImage = (imageId: string) => {
  return galleryStore.images.find(image => image.id === imageId)
}

const getImagesInFolderCount = (folderId: string) => {
  return galleryStore.images.filter(image => image.folderId === folderId).length
}

// Folder methods
const editFolder = (folder: GalleryFolder) => {
  editingFolder.value = folder
  showFolderModal.value = true
}

const setCoverImage = (folder: GalleryFolder) => {
  editingFolder.value = folder
  showFolderModal.value = true
}

const setImageAsCover = async (image: GalleryImage) => {
  if (!galleryStore.currentFolder || !image.id) return
  
  isSubmitting.value = true
  try {
    await galleryStore.updateFolder(galleryStore.currentFolder, {
      coverImageId: image.id
    })
  } catch (error) {
    console.error('Fehler beim Setzen des Cover-Bildes:', error)
  } finally {
    isSubmitting.value = false
  }
}

const removeCoverImage = async (folder: GalleryFolder) => {
  if (!folder.id) return
  
  isSubmitting.value = true
  try {
    await galleryStore.updateFolder(folder.id, {
      coverImageId: undefined
    })
  } catch (error) {
    console.error('Fehler beim Entfernen des Cover-Bildes:', error)
  } finally {
    isSubmitting.value = false
  }
}

const handleCoverImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
  // Das placeholder div wird automatisch angezeigt, da v-else verwendet wird
}

const submitFolder = async (data: { name: string; description: string; coverImageId?: string | null }) => {
  if (!data.name.trim()) return
  
  isSubmitting.value = true
  try {
    if (editingFolder.value) {
      // Update existing folder
      const updateData: Partial<GalleryFolder> = {
        name: data.name.trim()
      }
      
      if (data.description.trim()) {
        updateData.description = data.description.trim()
      } else {
        updateData.description = ''  // Leerer String statt undefined
      }
      
      if (data.coverImageId !== undefined) {
        updateData.coverImageId = data.coverImageId || undefined
      }
      
      await galleryStore.updateFolder(editingFolder.value.id!, updateData)
    } else {
      // Create new folder
      const folderData: Omit<GalleryFolder, 'id'> = {
        name: data.name.trim()
      }
      
      if (data.description.trim()) {
        folderData.description = data.description.trim()
      }
      
      if (data.coverImageId) {
        folderData.coverImageId = data.coverImageId
      }
      
      await galleryStore.createFolder(folderData)
    }
    closeFolderModal()
  } catch (error) {
    console.error('Fehler beim Speichern des Ordners:', error)
  } finally {
    isSubmitting.value = false
  }
}

const confirmDeleteFolder = (folder: GalleryFolder) => {
  folderToDelete.value = folder
  showDeleteFolderModal.value = true
}

const confirmDeleteCurrentFolder = () => {
  if (galleryStore.currentFolderData) {
    confirmDeleteFolder(galleryStore.currentFolderData)
  }
}

const deleteFolderConfirmed = async () => {
  if (!folderToDelete.value) return
  
  isSubmitting.value = true
  try {
    await galleryStore.deleteFolder(folderToDelete.value.id!)
    showDeleteFolderModal.value = false
    folderToDelete.value = null
  } catch (error) {
    console.error('Fehler beim Löschen des Ordners:', error)
  } finally {
    isSubmitting.value = false
  }
}

const closeFolderModal = () => {
  showFolderModal.value = false
  editingFolder.value = null
}

// Add Images to Folder methods - moved to AddImagesModal component

const addSelectedImagesToFolder = async (imageIds: string[]) => {
  if (!galleryStore.currentFolder || imageIds.length === 0) return
  
  isSubmitting.value = true
  try {
    // Verschiebe alle ausgewählten Bilder in den aktuellen Ordner
    await galleryStore.moveImagesBetweenFolders(
      imageIds,
      null, // von unorganisiert oder anderen Ordnern
      galleryStore.currentFolder
    )
    
    closeAddImagesModal()
  } catch (error) {
    console.error('Fehler beim Hinzufügen der Bilder zum Ordner:', error)
  } finally {
    isSubmitting.value = false
  }
}

const closeAddImagesModal = () => {
  showAddImagesModal.value = false
}

// Inline rename methods
const startRename = (folder: GalleryFolder) => {
  renamingFolder.value = folder.id!
  renameValue.value = folder.name
  
  // Focus das Input-Feld nach dem nächsten DOM-Update
  nextTick(() => {
    const input = renameInput.value || breadcrumbRenameInput.value
    if (input) {
      input.focus()
      input.select()
    }
  })
}

const confirmRename = async () => {
  if (!renamingFolder.value || !renameValue.value.trim()) {
    cancelRename()
    return
  }
  
  const newName = renameValue.value.trim()
  const folderId = renamingFolder.value
  
  // Prüfe ob sich der Name geändert hat
  const currentFolder = galleryStore.folders.find(f => f.id === folderId)
  if (currentFolder && currentFolder.name === newName) {
    cancelRename()
    return
  }
  
  try {
    await galleryStore.updateFolder(folderId, { name: newName })
    cancelRename()
  } catch (error) {
    console.error('Fehler beim Umbenennen des Ordners:', error)
    // Bei Fehler den Rename-Modus beibehalten
  }
}

const cancelRename = () => {
  renamingFolder.value = null
  renameValue.value = ''
}

onMounted(() => {
  galleryStore.fetchImages()
  galleryStore.fetchFolders()
})
</script>

<style scoped>
.gallery-page {
  padding: var(--spacing-xl);
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-xl);
  flex-wrap: wrap;
  gap: var(--spacing-lg);
}

.header-actions {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
  align-items: center;
  min-width: 0; /* Allows shrinking */
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
  font-size: var(--font-size-sm);
}

.breadcrumb-btn {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  text-decoration: underline;
}

.breadcrumb-separator {
  color: var(--color-gray-400);
}

.breadcrumb-current {
  color: var(--color-gray-600);
  font-weight: var(--font-weight-medium);
}

.breadcrumb-rename {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.breadcrumb-rename-input {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  min-width: 120px;
}

.breadcrumb-rename-input:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(83, 98, 254, 0.1);
}

.breadcrumb-rename-btn {
  height: 32px;
  padding: 0 var(--spacing-sm);
  border: none;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-left: var(--spacing-xs);
  white-space: nowrap;
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.breadcrumb-rename-btn.confirm {
  background: var(--color-green-500);
  color: var(--color-white);
  border: 2px solid var(--color-green-600);
}

.breadcrumb-rename-btn.confirm:hover {
  background: var(--color-green-600);
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(34, 197, 94, 0.3);
}

.breadcrumb-rename-btn.cancel {
  background: var(--color-gray-400);
  color: var(--color-white);
  border: 2px solid var(--color-gray-500);
}

.breadcrumb-rename-btn.cancel:hover {
  background: var(--color-gray-500);
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(107, 114, 128, 0.3);
}

.breadcrumb-rename-btn svg {
  width: 16px;
  height: 16px;
  stroke-width: 2;
  flex-shrink: 0;
}

.breadcrumb-rename-btn span {
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.header-content h1 {
  color: var(--color-secondary);
  margin-bottom: var(--spacing-sm);
}

.header-content p {
  color: var(--color-gray-600);
  margin: 0;
}

.btn-primary svg,
.btn-secondary svg {
  width: 20px;
  height: 20px;
}

/* Folders Section */
.folders-section {
  margin-bottom: var(--spacing-xl);
}

.folders-section h2 {
  color: var(--color-secondary);
  margin-bottom: var(--spacing-lg);
}

.folders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.folder-card {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
  cursor: pointer;
  border: 2px solid transparent;
  position: relative;
}

.folder-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary);
}

.folder-icon {
  width: 80px;
  height: 80px;
  margin-bottom: var(--spacing-md);
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 2px solid var(--color-gray-200);
  background: var(--color-gray-50);
  display: flex;
  align-items: center;
  justify-content: center;
}

.folder-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-normal);
}

.folder-card:hover .folder-cover {
  transform: scale(1.05);
}

.folder-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: var(--color-gray-400);
}

.folder-placeholder svg {
  width: 40px;
  height: 40px;
  margin-bottom: var(--spacing-xs);
}

.placeholder-text {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-align: center;
  color: var(--color-gray-500);
}

.folder-info h3 {
  color: var(--color-secondary);
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-lg);
}

.folder-rename {
  margin-bottom: var(--spacing-sm);
}

.folder-rename-input {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--color-secondary);
  margin-bottom: var(--spacing-sm);
}

.folder-rename-input:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(83, 98, 254, 0.1);
}

.folder-rename-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.rename-btn {
  height: 36px;
  padding: 0 var(--spacing-md);
  border: none;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.rename-btn.confirm {
  background: var(--color-green-500);
  color: var(--color-white);
  border: 2px solid var(--color-green-600);
}

.rename-btn.confirm:hover {
  background: var(--color-green-600);
  transform: scale(1.08);
  box-shadow: 0 6px 12px rgba(34, 197, 94, 0.4);
}

.rename-btn.cancel {
  background: var(--color-gray-400);
  color: var(--color-white);
  border: 2px solid var(--color-gray-500);
}

.rename-btn.cancel:hover {
  background: var(--color-gray-500);
  transform: scale(1.08);
  box-shadow: 0 6px 12px rgba(107, 114, 128, 0.4);
}

.rename-btn svg {
  width: 18px;
  height: 18px;
  stroke-width: 2.5;
  flex-shrink: 0;
}

.rename-btn span {
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.folder-info p {
  color: var(--color-gray-600);
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-sm);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.folder-count {
  color: var(--color-gray-500);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.folder-actions {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  display: flex;
  gap: var(--spacing-xs);
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.folder-actions.visible {
  opacity: 1;
}

.folder-card:hover .folder-actions {
  opacity: 1;
}

.action-btn.prominent {
  background: var(--color-red-500);
  color: var(--color-white);
  box-shadow: var(--shadow-md);
}

.action-btn.prominent:hover {
  background: var(--color-red-600);
  transform: scale(1.1);
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.7);
}

/* Image Grid styles moved to ImageGrid.vue component */

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-lg);
}

.modal-overlay.image-modal {
  background: rgba(0, 0, 0, 0.9);
}

.modal {
  background: var(--color-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal.small {
  max-width: 400px;
}

.modal.large {
  max-width: 900px;
  max-height: 95vh;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--color-gray-200);
}

.modal-header h2 {
  color: var(--color-secondary);
  margin: 0;
}

.close-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-gray-100);
  color: var(--color-gray-600);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.close-btn:hover {
  background: var(--color-gray-200);
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.modal-body {
  padding: var(--spacing-xl);
}

.modal-form {
  padding: var(--spacing-xl);
}

.modal-body .warning {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-md);
}

/* Upload Area */
.upload-area {
  border: 2px dashed var(--color-gray-300);
  border-radius: var(--radius-lg);
  padding: var(--spacing-2xl);
  text-align: center;
  transition: all var(--transition-normal);
  cursor: pointer;
}

.upload-area.dragover {
  border-color: var(--color-primary);
  background: rgba(83, 98, 254, 0.05);
}

.upload-icon {
  width: 60px;
  height: 60px;
  color: var(--color-gray-400);
  margin: 0 auto var(--spacing-lg);
}

.upload-icon svg {
  width: 100%;
  height: 100%;
}

.upload-area h3 {
  color: var(--color-secondary);
  margin-bottom: var(--spacing-md);
}

.upload-area p {
  color: var(--color-gray-600);
  margin-bottom: var(--spacing-lg);
}

/* Upload Queue */
.upload-queue {
  margin-top: var(--spacing-xl);
}

.upload-queue h4 {
  color: var(--color-secondary);
  margin-bottom: var(--spacing-lg);
}

.queue-list {
  max-height: 300px;
  overflow-y: auto;
}

.queue-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
}

.queue-thumbnail {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: var(--radius-sm);
}

.queue-info {
  flex: 1;
}

.queue-name-input {
  margin-bottom: var(--spacing-sm);
}

.queue-label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-secondary);
  margin-bottom: var(--spacing-xs);
}

.queue-title-input {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  transition: border-color var(--transition-fast);
}

.queue-title-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(83, 98, 254, 0.1);
}

.queue-meta {
  color: var(--color-gray-500);
  font-size: var(--font-size-xs);
  margin: 0;
  font-family: monospace;
}

.queue-remove {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--color-gray-100);
  color: var(--color-gray-600);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.queue-remove:hover {
  background: var(--color-error);
  color: var(--color-white);
}

.queue-remove svg {
  width: 16px;
  height: 16px;
}

/* Upload Progress */
.upload-progress {
  margin-top: var(--spacing-xl);
}

.upload-progress h4 {
  color: var(--color-secondary);
  margin-bottom: var(--spacing-lg);
}

.progress-item {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.progress-item.uploading {
  border-color: var(--color-primary);
  background: rgba(83, 98, 254, 0.02);
}

.progress-item.completed {
  border-color: var(--color-green-400);
  background: rgba(34, 197, 94, 0.02);
}

.progress-item.error {
  border-color: var(--color-red-400);
  background: rgba(239, 68, 68, 0.02);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.progress-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.progress-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.progress-icon {
  width: 16px;
  height: 16px;
}

.progress-icon.uploading {
  color: var(--color-primary);
  animation: pulse 2s infinite;
}

.progress-icon.completed {
  color: var(--color-green-500);
}

.progress-icon.error {
  color: var(--color-red-500);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.progress-bar {
  height: 6px;
  background: var(--color-gray-200);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width var(--transition-fast);
  border-radius: var(--radius-sm);
}

.progress-fill.pending {
  background: var(--color-gray-400);
}

.progress-fill.uploading {
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
}

.progress-fill.completed {
  background: var(--color-green-500);
}

.progress-percent {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-600);
}

.progress-error {
  margin-top: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: var(--color-red-50);
  color: var(--color-red-700);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  border: 1px solid var(--color-red-200);
}

/* Image Edit Modal */
.image-preview {
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.image-preview img {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: var(--radius-md);
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-secondary);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-family: inherit;
  resize: vertical;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(83, 98, 254, 0.1);
}

/* Image View Modal */
.image-modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-modal-close {
  position: absolute;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  width: 40px;
  height: 40px;
  border: none;
  border-radius: var(--radius-md);
  background: rgba(0, 0, 0, 0.5);
  color: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  z-index: 1;
}

.image-modal-close:hover {
  background: rgba(0, 0, 0, 0.7);
}

.image-modal-close svg {
  width: 24px;
  height: 24px;
}

.image-modal-content img {
  max-width: 100%;
  max-height: calc(90vh - 100px);
  object-fit: contain;
  border-radius: var(--radius-lg);
}

.image-modal-title {
  color: var(--color-white);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  margin-top: var(--spacing-lg);
  text-align: center;
}

.modal-actions {
  display: flex;
  gap: var(--spacing-lg);
  justify-content: flex-end;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-gray-200);
  margin-top: var(--spacing-lg);
}

.btn-danger {
  background-color: var(--color-error);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-lg);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.btn-danger:hover {
  background-color: #dc2626;
}

.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-danger svg {
  width: 20px;
  height: 20px;
}

/* Add Images Modal */
.add-images-search {
  margin-bottom: var(--spacing-lg);
}

.add-images-stats {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background: var(--color-gray-50);
  border-radius: var(--radius-md);
}

.add-images-stats .stat {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  font-weight: var(--font-weight-medium);
}

.add-images-content {
  max-height: 400px;
  overflow-y: auto;
}

.add-images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.add-image-item {
  border: 2px solid transparent;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-white);
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
}

.add-image-item:hover {
  border-color: var(--color-gray-300);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.add-image-item.selected {
  border-color: var(--color-primary);
  background: rgba(83, 98, 254, 0.05);
}

.add-image-checkbox {
  position: absolute;
  top: var(--spacing-sm);
  left: var(--spacing-sm);
  z-index: 1;
}

.add-image-checkbox input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.add-image-thumbnail {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.add-image-info {
  padding: var(--spacing-md);
}

.add-image-info h4 {
  color: var(--color-secondary);
  margin-bottom: var(--spacing-xs);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.add-image-date {
  color: var(--color-gray-500);
  font-size: var(--font-size-xs);
  margin: 0;
}

/* Medium screens - Tablets */
@media (max-width: 1024px) {
  .header-actions {
    gap: var(--spacing-sm);
    flex-wrap: wrap;
  }
  
  .header-actions .btn-primary,
  .header-actions .btn-secondary,
  .header-actions .btn-danger {
    font-size: var(--font-size-sm);
    padding: var(--spacing-sm) var(--spacing-lg);
    white-space: nowrap;
  }
  
  .header-actions svg {
    width: 16px;
    height: 16px;
  }
}

/* Tablet portrait and small desktop */
@media (max-width: 900px) {
  .header-actions {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }
  
  .header-actions .btn-primary,
  .header-actions .btn-secondary,
  .header-actions .btn-danger {
    width: 100%;
    justify-content: center;
  }
}

/* Small screens - Mobile */
@media (max-width: 768px) {
  .gallery-page {
    padding: var(--spacing-lg);
  }
  
  .page-header {
    flex-direction: column;
    gap: var(--spacing-lg);
    align-items: stretch;
  }
  
  .header-actions {
    flex-direction: column;
    gap: var(--spacing-sm);
    width: 100%;
  }
  
  .header-actions .btn-primary,
  .header-actions .btn-secondary,
  .header-actions .btn-danger {
    width: 100%;
    justify-content: center;
  }
  
  /* Image Grid responsive styles moved to ImageGrid.vue component */
  
  
  

  .modal {
    margin: var(--spacing-md);
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .add-images-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .add-images-stats {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
}

/* Extra small screens */
@media (max-width: 480px) {
  .header-actions {
    flex-direction: column;
    gap: var(--spacing-sm);
    width: 100%;
  }
  
  .header-actions .btn-primary,
  .header-actions .btn-secondary,
  .header-actions .btn-danger {
    width: 100%;
    justify-content: center;
    font-size: var(--font-size-sm);
    padding: var(--spacing-md);
  }
  
  .header-content h1 {
    font-size: var(--font-size-xl);
  }
  
  .breadcrumb {
    flex-wrap: wrap;
    font-size: var(--font-size-sm);
  }
}
</style>
