import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  Timestamp,
  where 
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { GalleryFolder, GalleryImage } from '../lib/types'

const FOLDERS_COLLECTION = 'gallery_folders'
const IMAGES_COLLECTION = 'gallery'

/**
 * Alle Ordner laden
 */
export const getFolders = async (): Promise<GalleryFolder[]> => {
  try {
    const foldersCollection = collection(db, FOLDERS_COLLECTION)
    const q = query(foldersCollection, orderBy('name', 'asc'))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as GalleryFolder[]
  } catch (error) {
    console.error('Error fetching folders:', error)
    throw new Error('Fehler beim Laden der Ordner')
  }
}

/**
 * Ordner by ID laden
 */
export const getFolderById = async (id: string): Promise<GalleryFolder | null> => {
  try {
    const folderDoc = doc(db, FOLDERS_COLLECTION, id)
    const docSnap = await getDoc(folderDoc)
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as GalleryFolder
    } else {
      return null
    }
  } catch (error) {
    console.error('Error fetching folder by ID:', error)
    throw new Error('Fehler beim Laden des Ordners')
  }
}

/**
 * Neuen Ordner erstellen
 */
export const createFolder = async (folderData: Omit<GalleryFolder, 'id'>): Promise<GalleryFolder> => {
  try {
    const foldersCollection = collection(db, FOLDERS_COLLECTION)
    
    // Bereite die Daten vor und entferne undefined-Werte
    const cleanData: any = {
      name: folderData.name,
      createdAt: folderData.createdAt || Timestamp.now(),
      updatedAt: Timestamp.now()
    }
    
    // Füge optionale Felder nur hinzu, wenn sie Werte haben
    if (folderData.description && folderData.description.trim()) {
      cleanData.description = folderData.description.trim()
    }
    
    if (folderData.coverImageId) {
      cleanData.coverImageId = folderData.coverImageId
    }
    
    const docRef = await addDoc(foldersCollection, cleanData)
    
    return {
      id: docRef.id,
      ...cleanData
    } as GalleryFolder
  } catch (error) {
    console.error('Error creating folder:', error)
    throw new Error('Fehler beim Erstellen des Ordners')
  }
}

/**
 * Ordner aktualisieren
 */
export const updateFolder = async (id: string, folderData: Partial<GalleryFolder>): Promise<void> => {
  try {
    const folderDoc = doc(db, FOLDERS_COLLECTION, id)
    
    // Bereite die Update-Daten vor und entferne undefined-Werte
    const cleanData: any = {
      updatedAt: Timestamp.now()
    }
    
    // Füge nur definierte Felder hinzu
    if (folderData.name !== undefined) {
      cleanData.name = folderData.name
    }
    
    if (folderData.description !== undefined) {
      if (folderData.description && folderData.description.trim()) {
        cleanData.description = folderData.description.trim()
      } else {
        // Explizit löschen wenn leer
        cleanData.description = null
      }
    }
    
    if (folderData.coverImageId !== undefined) {
      cleanData.coverImageId = folderData.coverImageId
    }
    
    await updateDoc(folderDoc, cleanData)
  } catch (error) {
    console.error('Error updating folder:', error)
    throw new Error('Fehler beim Aktualisieren des Ordners')
  }
}

/**
 * Ordner löschen
 * Warnung: Alle Bilder in diesem Ordner werden aus dem Ordner entfernt (aber nicht gelöscht)
 */
export const deleteFolder = async (id: string): Promise<void> => {
  try {
    if (!id) {
      throw new Error('Keine Ordner-ID angegeben')
    }

    console.log('Starting folder deletion for:', id)
    
    // Erst alle Bilder aus dem Ordner entfernen
    await removeAllImagesFromFolder(id)
    
    // Dann den Ordner löschen
    const folderDoc = doc(db, FOLDERS_COLLECTION, id)
    await deleteDoc(folderDoc)
    
    console.log('Successfully deleted folder:', id)
  } catch (error) {
    console.error('Error deleting folder:', id, error)
    throw new Error(`Fehler beim Löschen des Ordners: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`)
  }
}

/**
 * Bilder in einem Ordner abrufen
 */
export const getImagesInFolder = async (folderId: string): Promise<GalleryImage[]> => {
  try {
    if (!folderId) {
      console.warn('getImagesInFolder: No folderId provided')
      return []
    }

    const imagesCollection = collection(db, IMAGES_COLLECTION)
    const q = query(
      imagesCollection, 
      where('folderId', '==', folderId)
      // Sortierung entfernt um Index-Fehler zu vermeiden
      // Falls Sortierung nötig ist, muss ein Firebase Index erstellt werden
    )
    const querySnapshot = await getDocs(q)
    
    const images = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as GalleryImage[]
    
    // Clientseitige Sortierung nach createdAt (neueste zuerst)
    return images.sort((a, b) => {
      const aTime = a.createdAt?.toMillis() || 0
      const bTime = b.createdAt?.toMillis() || 0
      return bTime - aTime
    })
  } catch (error) {
    console.error('Error fetching images in folder:', folderId, error)
    // Wenn es keine Bilder gibt oder ein anderer Fehler auftritt, gib leeres Array zurück
    return []
  }
}

/**
 * Bilder ohne Ordner abrufen (unorganisierte Bilder)
 */
export const getImagesWithoutFolder = async (): Promise<GalleryImage[]> => {
  try {
    const imagesCollection = collection(db, IMAGES_COLLECTION)
    const q = query(
      imagesCollection, 
      where('folderId', '==', null),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as GalleryImage[]
  } catch (error) {
    console.error('Error fetching images without folder:', error)
    throw new Error('Fehler beim Laden der unorganisierten Bilder')
  }
}

/**
 * Bild zu einem Ordner hinzufügen
 */
export const addImageToFolder = async (imageId: string, folderId: string): Promise<void> => {
  try {
    const imageDoc = doc(db, IMAGES_COLLECTION, imageId)
    await updateDoc(imageDoc, { folderId })
    
    // Aktualisiere das updatedAt des Ordners
    const folderDoc = doc(db, FOLDERS_COLLECTION, folderId)
    await updateDoc(folderDoc, { updatedAt: Timestamp.now() })
  } catch (error) {
    console.error('Error adding image to folder:', error)
    throw new Error('Fehler beim Hinzufügen des Bildes zum Ordner')
  }
}

/**
 * Bild aus einem Ordner entfernen
 */
export const removeImageFromFolder = async (imageId: string): Promise<void> => {
  try {
    const imageDoc = doc(db, IMAGES_COLLECTION, imageId)
    await updateDoc(imageDoc, { folderId: null })
  } catch (error) {
    console.error('Error removing image from folder:', error)
    throw new Error('Fehler beim Entfernen des Bildes aus dem Ordner')
  }
}

/**
 * Alle Bilder aus einem Ordner entfernen (Hilfsfunktion für Ordner-Löschung)
 */
export const removeAllImagesFromFolder = async (folderId: string): Promise<void> => {
  try {
    if (!folderId) {
      console.warn('removeAllImagesFromFolder: No folderId provided')
      return
    }

    const images = await getImagesInFolder(folderId)
    
    if (images.length === 0) {
      console.log('No images found in folder', folderId)
      return
    }
    
    console.log(`Removing ${images.length} images from folder ${folderId}`)
    
    // Alle Bilder parallel aus dem Ordner entfernen
    const updatePromises = images.map(image => {
      if (!image.id) {
        console.warn('Image without ID found:', image)
        return Promise.resolve()
      }
      return removeImageFromFolder(image.id)
    })
    
    await Promise.all(updatePromises)
    console.log('Successfully removed all images from folder', folderId)
  } catch (error) {
    console.error('Error removing all images from folder:', folderId, error)
    // Nicht mehr werfen - einfach loggen und weitermachen
    console.warn('Continuing with folder deletion despite error')
  }
}

/**
 * Cover-Bild für einen Ordner setzen
 */
export const setFolderCoverImage = async (folderId: string, imageId: string): Promise<void> => {
  try {
    // Prüfe, ob das Bild im Ordner ist
    const image = await import('./gallery').then(m => m.getImageById(imageId))
    if (!image || image.folderId !== folderId) {
      throw new Error('Bild ist nicht in diesem Ordner')
    }
    
    const folderDoc = doc(db, FOLDERS_COLLECTION, folderId)
    await updateDoc(folderDoc, { 
      coverImageId: imageId,
      updatedAt: Timestamp.now()
    })
  } catch (error) {
    console.error('Error setting folder cover image:', error)
    throw new Error('Fehler beim Setzen des Cover-Bildes')
  }
}

/**
 * Bilder zwischen Ordnern verschieben
 */
export const moveImagesBetweenFolders = async (
  imageIds: string[], 
  fromFolderId: string | null, 
  toFolderId: string | null
): Promise<void> => {
  try {
    const updatePromises = imageIds.map(imageId => {
      const imageDoc = doc(db, IMAGES_COLLECTION, imageId)
      return updateDoc(imageDoc, { folderId: toFolderId })
    })
    
    await Promise.all(updatePromises)
    
    // Update timestamps der betroffenen Ordner
    const folderUpdatePromises = []
    
    if (fromFolderId) {
      const fromFolderDoc = doc(db, FOLDERS_COLLECTION, fromFolderId)
      folderUpdatePromises.push(updateDoc(fromFolderDoc, { updatedAt: Timestamp.now() }))
    }
    
    if (toFolderId) {
      const toFolderDoc = doc(db, FOLDERS_COLLECTION, toFolderId)
      folderUpdatePromises.push(updateDoc(toFolderDoc, { updatedAt: Timestamp.now() }))
    }
    
    await Promise.all(folderUpdatePromises)
  } catch (error) {
    console.error('Error moving images between folders:', error)
    throw new Error('Fehler beim Verschieben der Bilder')
  }
}
