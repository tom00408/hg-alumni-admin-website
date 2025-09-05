import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../lib/firebase'

export interface UploadResult {
  url: string
  fileName: string
}

export interface UploadProgress {
  fileName: string
  progress: number
  isComplete: boolean
  error?: string
}

class ImageUploadService {
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  /**
   * Einzelnes Bild hochladen
   */
  async uploadImage(
    file: File, 
    folder: string = 'news',
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      // Validierung
      this.validateFile(file)
      
      // Dateiname generieren
      const fileName = this.generateFileName(file)
      const fullPath = `${folder}/${fileName}`
      
      // Progress callback
      if (onProgress) {
        onProgress({
          fileName: file.name,
          progress: 0,
          isComplete: false
        })
      }
      
      // Upload zu Firebase Storage
      const fileRef = storageRef(storage, fullPath)
      
      if (onProgress) {
        onProgress({
          fileName: file.name,
          progress: 50,
          isComplete: false
        })
      }
      
      const snapshot = await uploadBytes(fileRef, file)
      
      if (onProgress) {
        onProgress({
          fileName: file.name,
          progress: 90,
          isComplete: false
        })
      }
      
      // Download URL abrufen
      const downloadURL = await getDownloadURL(snapshot.ref)
      
      if (onProgress) {
        onProgress({
          fileName: file.name,
          progress: 100,
          isComplete: true
        })
      }
      
      return {
        url: downloadURL,
        fileName: fileName
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload fehlgeschlagen'
      
      if (onProgress) {
        onProgress({
          fileName: file.name,
          progress: 0,
          isComplete: false,
          error: errorMessage
        })
      }
      
      throw new Error(`Bild-Upload fehlgeschlagen: ${errorMessage}`)
    }
  }

  /**
   * Mehrere Bilder gleichzeitig hochladen
   */
  async uploadMultipleImages(
    files: File[],
    folder: string = 'gallery',
    onProgress?: (fileName: string, progress: UploadProgress) => void
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map(file => 
      this.uploadImage(file, folder, onProgress ? (progress) => onProgress(file.name, progress) : undefined)
    )
    
    return Promise.all(uploadPromises)
  }

  /**
   * Bild löschen
   */
  async deleteImage(url: string): Promise<void> {
    try {
      // URL zu Storage Reference konvertieren
      const fileRef = storageRef(storage, url)
      await deleteObject(fileRef)
    } catch (error) {
      console.error('Fehler beim Löschen des Bildes:', error)
      throw new Error('Bild konnte nicht gelöscht werden')
    }
  }

  /**
   * Datei validieren
   */
  private validateFile(file: File): void {
    // Dateigröße prüfen
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`Datei ist zu groß. Maximum: ${this.MAX_FILE_SIZE / 1024 / 1024}MB`)
    }
    
    // Dateityp prüfen
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      throw new Error(`Dateityp nicht unterstützt. Erlaubt: ${this.ALLOWED_TYPES.join(', ')}`)
    }
  }

  /**
   * Eindeutigen Dateinamen generieren
   */
  private generateFileName(file: File): string {
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split('.').pop()?.toLowerCase()
    
    // Bereinigter Originalname (nur Buchstaben und Zahlen)
    const cleanName = file.name
      .replace(/\.[^/.]+$/, '') // Extension entfernen
      .replace(/[^a-zA-Z0-9]/g, '_') // Sonderzeichen ersetzen
      .toLowerCase()
      .substring(0, 20) // Länge begrenzen
    
    return `${timestamp}_${randomId}_${cleanName}.${extension}`
  }

  /**
   * Bild-URL aus Firebase Storage extrahieren
   */
  getStoragePathFromUrl(url: string): string {
    try {
      const urlParts = url.split('/o/')
      if (urlParts.length < 2) return ''
      
      const pathPart = urlParts[1].split('?')[0]
      return decodeURIComponent(pathPart)
    } catch {
      return ''
    }
  }

  /**
   * Bild-Vorschau für File generieren
   */
  generatePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        resolve(e.target?.result as string)
      }
      
      reader.onerror = () => {
        reject(new Error('Vorschau konnte nicht erstellt werden'))
      }
      
      reader.readAsDataURL(file)
    })
  }

  /**
   * Dateigröße formatieren
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

export const imageUploadService = new ImageUploadService()
