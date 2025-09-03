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
  limit,
  Timestamp 
} from 'firebase/firestore'
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage'
import { db, storage } from '../lib/firebase'
import type { GalleryImage } from '../lib/types'

const COLLECTION_NAME = 'gallery'
const STORAGE_PATH = 'gallery'

/**
 * Bilder mit Paginierung laden
 */
export const getImages = async (_page = 1, pageSize = 12): Promise<{
  images: GalleryImage[]
  hasMore: boolean
}> => {
  try {
    const imagesCollection = collection(db, COLLECTION_NAME)
    
    const q = query(
      imagesCollection,
      orderBy('createdAt', 'desc'),
      limit(pageSize + 1) // Ein Extra laden um zu prüfen ob mehr vorhanden
    )
    
    const querySnapshot = await getDocs(q)
    const images = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as GalleryImage[]
    
    const hasMore = images.length > pageSize
    if (hasMore) {
      images.pop() // Entferne das Extra-Element
    }
    
    return { images, hasMore }
  } catch (error) {
    console.error('Error fetching images:', error)
    throw new Error('Fehler beim Laden der Bilder')
  }
}

/**
 * Alle Bilder laden
 */
export const getAllImages = async (): Promise<GalleryImage[]> => {
  try {
    const imagesCollection = collection(db, COLLECTION_NAME)
    const q = query(imagesCollection, orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as GalleryImage[]
  } catch (error) {
    console.error('Error fetching all images:', error)
    throw new Error('Fehler beim Laden der Bilder')
  }
}

/**
 * Bild by ID laden
 */
export const getImageById = async (id: string): Promise<GalleryImage | null> => {
  try {
    const imageDoc = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(imageDoc)
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as GalleryImage
    } else {
      return null
    }
  } catch (error) {
    console.error('Error fetching image by ID:', error)
    throw new Error('Fehler beim Laden des Bildes')
  }
}

/**
 * Bild hochladen
 */
export const uploadImage = async (file: File, title?: string): Promise<GalleryImage> => {
  try {
    const timestamp = Date.now()
    const filename = `${timestamp}_${file.name}`
    const imageRef = ref(storage, `${STORAGE_PATH}/original/${filename}`)
    
    // Upload Original
    const uploadResult = await uploadBytes(imageRef, file)
    const imageUrl = await getDownloadURL(uploadResult.ref)
    
    // TODO: Implementiere Thumbnail-Generierung
    // Für jetzt verwenden wir das Original auch als Thumbnail
    const thumbnailUrl = imageUrl
    
    // Metadaten in Firestore speichern
    const imageData = {
      title: title || file.name,
      imageUrl,
      thumbnailUrl,
      createdAt: Timestamp.now()
    }
    
    const imagesCollection = collection(db, COLLECTION_NAME)
    const docRef = await addDoc(imagesCollection, imageData)
    
    return {
      id: docRef.id,
      ...imageData
    } as GalleryImage
  } catch (error) {
    console.error('Error uploading image:', error)
    throw new Error('Fehler beim Hochladen des Bildes')
  }
}

/**
 * Bild-Metadaten aktualisieren
 */
export const updateImage = async (id: string, imageData: Partial<GalleryImage>): Promise<void> => {
  try {
    const imageDoc = doc(db, COLLECTION_NAME, id)
    
    // ID und createdAt sollten nicht aktualisiert werden
    const { id: _, createdAt, ...updateData } = imageData
    
    await updateDoc(imageDoc, updateData)
  } catch (error) {
    console.error('Error updating image:', error)
    throw new Error('Fehler beim Aktualisieren des Bildes')
  }
}

/**
 * Bild löschen (sowohl Storage als auch Firestore)
 */
export const deleteImage = async (id: string): Promise<void> => {
  try {
    // Erst Bild-Metadaten aus Firestore laden
    const imageDoc = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(imageDoc)
    
    if (docSnap.exists()) {
      const imageData = docSnap.data() as GalleryImage
      
      // Versuche Dateien aus Storage zu löschen
      try {
        if (imageData.imageUrl) {
          const imageRef = ref(storage, imageData.imageUrl)
          await deleteObject(imageRef)
        }
        
        if (imageData.thumbnailUrl && imageData.thumbnailUrl !== imageData.imageUrl) {
          const thumbnailRef = ref(storage, imageData.thumbnailUrl)
          await deleteObject(thumbnailRef)
        }
      } catch (storageError) {
        console.warn('Error deleting files from storage:', storageError)
        // Weiter mit Firestore-Löschung auch wenn Storage-Löschung fehlschlägt
      }
    }
    
    // Metadaten aus Firestore löschen
    await deleteDoc(imageDoc)
  } catch (error) {
    console.error('Error deleting image:', error)
    throw new Error('Fehler beim Löschen des Bildes')
  }
}

/**
 * Hilfsfunktion: Thumbnail generieren
 * TODO: Implementiere mit Cloud Functions oder Client-side Canvas
 */
export const generateThumbnail = async (file: File, maxWidth = 300, maxHeight = 200): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // Berechne neue Dimensionen
      const ratio = Math.min(maxWidth / img.width, maxHeight / img.height)
      const width = img.width * ratio
      const height = img.height * ratio
      
      canvas.width = width
      canvas.height = height
      
      // Zeichne Bild auf Canvas
      ctx?.drawImage(img, 0, 0, width, height)
      
      // Konvertiere zu Blob
      canvas.toBlob((blob) => {
        if (blob) {
          const thumbnailFile = new File([blob], `thumb_${file.name}`, {
            type: 'image/jpeg',
            lastModified: Date.now()
          })
          resolve(thumbnailFile)
        } else {
          reject(new Error('Fehler beim Erstellen des Thumbnails'))
        }
      }, 'image/jpeg', 0.8)
    }
    
    img.onerror = () => reject(new Error('Fehler beim Laden des Bildes'))
    img.src = URL.createObjectURL(file)
  })
}
