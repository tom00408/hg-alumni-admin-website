<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h2>Bilder hochladen</h2>
        <TomButton 
          @click="closeModal" 
          variant="action" 
          title="Schließen"
          icon="close"
        />
      </div>

      <div class="modal-body">
        <div 
          class="upload-area"
          :class="{ 'dragover': isDragOver }"
          @drop="handleDrop"
          @dragover.prevent="isDragOver = true"
          @dragleave="isDragOver = false"
        >
          <div class="upload-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <h3>Bilder hierher ziehen oder klicken zum Auswählen</h3>
          <p>Unterstützte Formate: JPG, PNG, GIF (max. 10MB pro Bild)</p>
          <input 
            ref="fileInput"
            type="file" 
            multiple 
            accept="image/*"
            @change="handleFileSelect"
            style="display: none;"
          />
          <TomButton 
            @click="fileInput?.click()" 
            variant="primary" 
            title="Dateien auswählen"
            icon="upload"
          />
        </div>

        <div v-if="uploadQueue.length > 0" class="upload-queue">
          <h4>Hochzuladende Bilder ({{ uploadQueue.length }})</h4>
          <div class="queue-list">
            <div v-for="(file, index) in uploadQueue" :key="index" class="queue-item">
              <img :src="file.preview" :alt="file.name" class="queue-thumbnail" />
              <div class="queue-info">
                <div class="queue-name-input">
                  <label :for="`title-${index}`" class="queue-label">Titel:</label>
                  <input 
                    :id="`title-${index}`"
                    v-model="uploadQueue[index].title"
                    type="text" 
                    class="queue-title-input"
                    placeholder="Bildtitel..."
                  />
                </div>
                <p class="queue-meta">{{ file.name }} • {{ formatFileSize(file.size) }}</p>
              </div>

              <TomButton 
                @click="removeFromQueue(index)" 
                variant="action" 
                title="Entfernen"
                icon="delete"
              />
            </div>
          </div>
        </div>

        <div v-if="uploadProgress.length > 0" class="upload-progress">
          <h4>Upload-Fortschritt</h4>
          <div class="progress-list">
            <div v-for="progress in uploadProgress" :key="progress.name" class="progress-item" :class="progress.status">
              <div class="progress-info">
                <span class="progress-name">{{ progress.name }}</span>
                <div class="progress-status">
                  <svg v-if="progress.status === 'uploading'" class="progress-icon uploading" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                  </svg>
                  <svg v-else-if="progress.status === 'completed'" class="progress-icon completed" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <svg v-else-if="progress.status === 'error'" class="progress-icon error" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>
                  <span class="progress-percent">{{ progress.percent }}%</span>
                </div>
              </div>
              <div v-if="progress.status !== 'error'" class="progress-bar">
                <div class="progress-fill" :style="{ width: progress.percent + '%' }" :class="progress.status"></div>
              </div>
              <div v-if="progress.error" class="progress-error">
                {{ progress.error }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <TomButton 
          @click="closeModal" 
          variant="secondary" 
          title="Abbrechen"
          icon="close"
        />
        <button 
          @click="startUpload" 
          class="btn-primary" 
          :disabled="uploadQueue.length === 0 || isUploading"
        >
          <span v-if="isUploading">Lade hoch...</span>
          <span v-else>{{ uploadQueue.length }} {{ uploadQueue.length === 1 ? 'Bild' : 'Bilder' }} hochladen</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import TomButton from '../tomponents/TomButton.vue'

// Props
interface Props {
  show: boolean
  currentFolder?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  currentFolder: null
})

// Emits
const emit = defineEmits<{
  'close': []
  'upload-complete': []
}>()

// Reactive state
const uploadQueue = ref<Array<{ file: File; name: string; size: number; preview: string; title: string }>>([])
const uploadProgress = ref<Array<{ name: string; percent: number; status: 'pending' | 'uploading' | 'completed' | 'error'; error?: string }>>([])
const isUploading = ref(false)
const isDragOver = ref(false)

// File input ref
const fileInput = ref<HTMLInputElement>()

// Watch for modal close to reset state
watch(() => props.show, (newValue) => {
  if (!newValue) {
    resetState()
  }
})

// Methods
const closeModal = () => {
  emit('close')
}

const resetState = () => {
  uploadQueue.value = []
  uploadProgress.value = []
  isDragOver.value = false
  isUploading.value = false
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    addFilesToQueue(Array.from(target.files))
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
  
  if (event.dataTransfer?.files) {
    addFilesToQueue(Array.from(event.dataTransfer.files))
  }
}

const addFilesToQueue = async (files: File[]) => {
  for (const file of files) {
    if (file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024) { // 10MB limit
      try {
        // Komprimiere das Bild wenn es zu groß ist
        const processedFile = await processImageFile(file)
        const reader = new FileReader()
        
        reader.onload = (e) => {
          const defaultTitle = file.name.replace(/\.[^/.]+$/, '') // Dateiname ohne Extension
          uploadQueue.value.push({
            file: processedFile,
            name: processedFile.name,
            size: processedFile.size,
            preview: e.target?.result as string,
            title: defaultTitle
          })
        }
        reader.readAsDataURL(processedFile)
      } catch (error) {
        console.error('Fehler beim Verarbeiten der Datei:', file.name, error)
      }
    }
  }
}

// Bildverarbeitung und Komprimierung
const processImageFile = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const maxSize = 800 // Maximale Breite/Höhe
    const quality = 0.8 // JPEG Qualität
    const maxFileSize = 1024 * 1024 // 1MB
    
    // Wenn die Datei bereits klein genug ist, direkt zurückgeben
    if (file.size <= maxFileSize) {
      resolve(file)
      return
    }
    
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // Berechne neue Dimensionen
      let { width, height } = img
      
      if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      
      canvas.width = width
      canvas.height = height
      
      // Zeichne das Bild
      ctx?.drawImage(img, 0, 0, width, height)
      
      // Konvertiere zu Blob
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          })
          resolve(compressedFile)
        } else {
          reject(new Error('Komprimierung fehlgeschlagen'))
        }
      }, 'image/jpeg', quality)
    }
    
    img.onerror = () => reject(new Error('Fehler beim Laden des Bildes'))
    img.src = URL.createObjectURL(file)
  })
}

const removeFromQueue = (index: number) => {
  uploadQueue.value.splice(index, 1)
}

const startUpload = async () => {
  if (uploadQueue.value.length === 0) return
  
  isUploading.value = true
  uploadProgress.value = uploadQueue.value.map(item => ({
    name: item.name,
    percent: 0,
    status: 'pending' as const
  }))

  try {
    // Emit upload event with queue data
    emit('upload-start', {
      queue: uploadQueue.value,
      currentFolder: props.currentFolder,
      onProgress: (index: number, progress: number, status: 'uploading' | 'completed' | 'error', error?: string) => {
        if (uploadProgress.value[index]) {
          uploadProgress.value[index].percent = progress
          uploadProgress.value[index].status = status
          if (error) {
            uploadProgress.value[index].error = error
          }
        }
      }
    })
  } catch (error) {
    console.error('Upload-Prozess fehlgeschlagen:', error)
  } finally {
    isUploading.value = false
  }
}

// Helper functions
const formatFileSize = (bytes: number) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}
</script>

<style scoped>
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

.modal {
  background: var(--color-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
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

.modal-body {
  padding: var(--spacing-xl);
}

.modal-actions {
  display: flex;
  gap: var(--spacing-lg);
  justify-content: flex-end;
  padding: var(--spacing-xl);
  border-top: 1px solid var(--color-gray-200);
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

/* Button Styles */
.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-lg);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal {
    margin: var(--spacing-md);
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .queue-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .queue-thumbnail {
    width: 100%;
    height: 100px;
  }
}
</style>
