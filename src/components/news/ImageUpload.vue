<template>
  <div class="image-upload">
    <div class="upload-area" :class="{ 'dragover': isDragOver, 'has-image': previewUrl }">
      <!-- Vorhandenes Bild anzeigen -->
      <div v-if="previewUrl && !isUploading" class="image-preview">
        <img :src="previewUrl" :alt="fileName || 'Vorschau'" />
        <div class="image-overlay">
          <TomButton 
            type="button"
            @click="removeImage" 
            title="Bild entfernen"
            icon="delete"
            variant="action-delete"
            size="small"
          />
          <TomButton 
            type="button"
            @click="triggerUpload" 
            title="Bild ersetzen"
            icon="upload"
            variant="action"
            size="small"
          />
        </div>
      </div>

      <!-- Upload-Bereich -->
      <div 
        v-else
        class="upload-zone"
        @click="triggerUpload"
        @dragover.prevent="isDragOver = true"
        @dragleave.prevent="isDragOver = false"
        @drop.prevent="handleDrop"
      >
        <div v-if="isUploading" class="upload-progress">
          <div class="progress-spinner"></div>
          <p class="progress-text">{{ uploadProgress }}% hochgeladen...</p>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
          </div>
        </div>
        
        <div v-else class="upload-content">
          <svg class="upload-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17,8 12,3 7,8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <h3>{{ dragText }}</h3>
          <p>oder klicken zum Auswählen</p>
          <span class="upload-hint">JPG, PNG, WebP • Max. 5MB</span>
        </div>
      </div>

      <!-- Versteckter File Input -->
      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        @change="handleFileSelect"
        style="display: none"
      />
    </div>

    <!-- Fehleranzeige -->
    <div v-if="error" class="error-message">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { imageUploadService } from '../../services/imageUpload'
import TomButton from '../../tomponents/TomButton.vue'

interface Props {
  modelValue?: string
  folder?: string
  placeholder?: string
  disabled?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'upload-start'): void
  (e: 'upload-complete', result: { url: string; fileName: string }): void
  (e: 'upload-error', error: string): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  folder: 'news',
  placeholder: 'Bild hierher ziehen',
  disabled: false
})

const emit = defineEmits<Emits>()

// Reactive state
const fileInput = ref<HTMLInputElement>()
const isDragOver = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const error = ref('')
const previewUrl = ref(props.modelValue)
const fileName = ref('')

// Computed
const dragText = computed(() => {
  return isDragOver.value ? 'Bild hier ablegen' : props.placeholder
})

// Watch für externe Änderungen
watch(() => props.modelValue, (newValue) => {
  previewUrl.value = newValue
  if (!newValue) {
    fileName.value = ''
  }
})

// Methods
const triggerUpload = (): void => {
  if (props.disabled || isUploading.value) return
  fileInput.value?.click()
}

const handleFileSelect = (event: Event): void => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    uploadFile(file)
  }
}

const handleDrop = (event: DragEvent): void => {
  isDragOver.value = false
  
  if (props.disabled || isUploading.value) return
  
  const files = Array.from(event.dataTransfer?.files || [])
  const imageFile = files.find(file => file.type.startsWith('image/'))
  
  if (imageFile) {
    uploadFile(imageFile)
  }
}

const uploadFile = async (file: File): Promise<void> => {
  try {
    error.value = ''
    isUploading.value = true
    uploadProgress.value = 0
    emit('upload-start')

    // Vorschau generieren
    const preview = await imageUploadService.generatePreview(file)
    previewUrl.value = preview
    fileName.value = file.name

    // Upload starten
    const result = await imageUploadService.uploadImage(
      file,
      props.folder,
      (progress) => {
        uploadProgress.value = progress.progress
        if (progress.error) {
          throw new Error(progress.error)
        }
      }
    )

    // Erfolg
    previewUrl.value = result.url
    fileName.value = result.fileName
    emit('update:modelValue', result.url)
    emit('upload-complete', result)

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Upload fehlgeschlagen'
    error.value = errorMessage
    previewUrl.value = ''
    fileName.value = ''
    emit('upload-error', errorMessage)
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
  }
}

const removeImage = (): void => {
  if (props.disabled) return
  
  previewUrl.value = ''
  fileName.value = ''
  error.value = ''
  emit('update:modelValue', '')
  
  // File Input zurücksetzen
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<style scoped>
.image-upload {
  width: 100%;
}

.upload-area {
  position: relative;
  border: 2px dashed var(--color-gray-300);
  border-radius: var(--radius-lg);
  background: var(--color-gray-50);
  transition: all var(--transition-fast);
  overflow: hidden;
}

.upload-area.dragover {
  border-color: var(--color-primary);
  background: rgba(83, 98, 254, 0.05);
}

.upload-area.has-image {
  border: none;
  background: transparent;
}

.upload-zone {
  padding: var(--spacing-xl);
  text-align: center;
  cursor: pointer;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.upload-icon {
  width: 48px;
  height: 48px;
  color: var(--color-gray-400);
  margin-bottom: var(--spacing-sm);
}

.upload-content h3 {
  margin: 0;
  color: var(--color-text);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
}

.upload-content p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

.upload-hint {
  font-size: var(--font-size-sm);
  color: var(--color-gray-500);
  margin-top: var(--spacing-sm);
}

.upload-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
}

.progress-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-gray-200);
  border-top: 3px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.progress-text {
  margin: 0;
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
}

.progress-bar {
  width: 200px;
  height: 4px;
  background: var(--color-gray-200);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width var(--transition-fast);
  border-radius: 2px;
}

.image-preview {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: var(--radius-lg);
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.image-preview:hover .image-overlay {
  opacity: 1;
}

.remove-btn,
.replace-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: var(--color-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.remove-btn:hover {
  background: var(--color-red-500);
  color: white;
}

.replace-btn:hover {
  background: var(--color-primary);
  color: white;
}

.error-message {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-red-50);
  border: 1px solid var(--color-red-200);
  border-radius: var(--radius-md);
  color: var(--color-red-700);
  font-size: var(--font-size-sm);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .upload-zone {
    padding: var(--spacing-lg);
    min-height: 150px;
  }
  
  .upload-icon {
    width: 36px;
    height: 36px;
  }
  
  .image-preview {
    height: 150px;
  }
  
  .progress-bar {
    width: 150px;
  }
}
</style>
