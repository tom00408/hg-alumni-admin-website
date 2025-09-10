<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h2>{{ editingFolder ? 'Ordner bearbeiten' : 'Neuen Ordner erstellen' }}</h2>
        <TomButton 
          @click="closeModal" 
          variant="action" 
          title="Schließen"
          icon="close"
        />
      </div>

      <form @submit.prevent="submitFolder" class="modal-form">
        <div class="form-group">
          <label for="folderName">Name *</label>
          <input 
            id="folderName"
            v-model="folderForm.name" 
            type="text" 
            placeholder="Ordnername"
            required
          />
        </div>

        <div class="form-group">
          <label for="folderDescription">Beschreibung</label>
          <textarea 
            id="folderDescription"
            v-model="folderForm.description" 
            placeholder="Optionale Beschreibung des Ordners"
            rows="3"
          ></textarea>
        </div>

        <!-- Cover Image Selection -->
        <div v-if="editingFolder" class="form-group">
          <label for="coverImage">Cover-Bild</label>
          <div class="cover-image-selection">
            <div class="current-cover" v-if="currentCoverImage">
              <img :src="currentCoverImage.thumbnailUrl || currentCoverImage.imageUrl" :alt="currentCoverImage.title" />
              <span class="cover-label">Aktuelles Cover</span>
            </div>
            
            <!-- Keine Bilder im Ordner -->
            <div v-if="folderImages.length === 0" class="no-images-message">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <p>Keine Bilder im Ordner verfügbar</p>
              <small>Laden Sie zuerst Bilder in diesen Ordner hoch, um ein Cover-Bild zu setzen.</small>
            </div>
            
            <!-- Bilder verfügbar -->
            <div v-else class="cover-options">
              <div class="cover-option" 
                   :class="{ selected: folderForm.coverImageId === null }"
                   @click="selectCoverImage(null)">
                <div class="no-cover-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25H11.69l-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v6.75Z" />
                  </svg>
                </div>
                <span>Kein Cover</span>
              </div>
              <div v-for="image in folderImages.slice(0, 8)" 
                   :key="image.id"
                   class="cover-option"
                   :class="{ selected: folderForm.coverImageId === image.id }"
                   @click="selectCoverImage(image.id!)">
                <img :src="image.thumbnailUrl || image.imageUrl" :alt="image.title" />
                <span>{{ image.title || 'Unbenannt' }}</span>
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
          <button type="submit" class="btn-primary" :disabled="isSubmitting || !folderForm.name.trim()">
            <span v-if="isSubmitting">{{ editingFolder ? 'Aktualisiert...' : 'Erstellt...' }}</span>
            <span v-else>{{ editingFolder ? 'Aktualisieren' : 'Erstellen' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { GalleryFolder, GalleryImage } from '../lib/types'
import TomButton from '../tomponents/TomButton.vue'

// Props
interface Props {
  show: boolean
  editingFolder?: GalleryFolder | null
  isSubmitting?: boolean
  availableImages?: GalleryImage[]
}

const props = withDefaults(defineProps<Props>(), {
  editingFolder: null,
  isSubmitting: false,
  availableImages: () => []
})

// Emits
const emit = defineEmits<{
  'close': []
  'submit': [data: { name: string; description: string; coverImageId?: string | null }]
}>()

// Reactive state
const folderForm = ref({
  name: '',
  description: '',
  coverImageId: null as string | null
})

// Computed für Bilder im aktuellen Ordner
const folderImages = computed(() => {
  if (!props.editingFolder?.id) return []
  return props.availableImages.filter(img => img.folderId === props.editingFolder?.id)
})

// Computed für aktuelles Cover-Bild
const currentCoverImage = computed(() => {
  if (!folderForm.value.coverImageId) return null
  return folderImages.value.find(img => img.id === folderForm.value.coverImageId) || null
})

// Watch for editing folder changes
watch(() => props.editingFolder, (newFolder) => {
  if (newFolder) {
    folderForm.value.name = newFolder.name
    folderForm.value.description = newFolder.description || ''
    folderForm.value.coverImageId = newFolder.coverImageId || null
  } else {
    resetForm()
  }
})

// Watch for modal show/hide to reset form
watch(() => props.show, (newValue) => {
  if (!newValue) {
    resetForm()
  }
})

// Methods
const closeModal = () => {
  emit('close')
}

const resetForm = () => {
  folderForm.value = {
    name: '',
    description: '',
    coverImageId: null
  }
}

const selectCoverImage = (imageId: string | null) => {
  folderForm.value.coverImageId = imageId
}

const submitFolder = () => {
  if (!folderForm.value.name.trim()) return
  
  emit('submit', {
    name: folderForm.value.name.trim(),
    description: folderForm.value.description.trim(),
    coverImageId: folderForm.value.coverImageId
  })
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
  max-width: 500px;
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

.modal-form {
  padding: var(--spacing-xl);
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

.modal-actions {
  display: flex;
  gap: var(--spacing-lg);
  justify-content: flex-end;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-gray-200);
  margin-top: var(--spacing-lg);
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

/* Cover Image Selection Styles */
.cover-image-selection {
  margin-top: var(--spacing-md);
}

.no-images-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  background: var(--color-gray-50);
  border-radius: var(--radius-md);
  border: 2px dashed var(--color-gray-300);
  text-align: center;
  color: var(--color-gray-600);
}

.no-images-message svg {
  width: 48px;
  height: 48px;
  margin-bottom: var(--spacing-md);
  color: var(--color-gray-400);
}

.no-images-message p {
  margin: 0 0 var(--spacing-sm) 0;
  font-weight: var(--font-weight-medium);
  color: var(--color-secondary);
}

.no-images-message small {
  color: var(--color-gray-500);
  font-size: var(--font-size-sm);
}

.current-cover {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background: var(--color-gray-50);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-gray-200);
}

.current-cover img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: var(--radius-sm);
}

.cover-label {
  font-weight: var(--font-weight-medium);
  color: var(--color-secondary);
}

.cover-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--spacing-md);
}

.cover-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border: 2px solid var(--color-gray-200);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  background: var(--color-white);
}

.cover-option:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.cover-option.selected {
  border-color: var(--color-primary);
  background: rgba(83, 98, 254, 0.05);
}

.cover-option img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: var(--radius-sm);
}

.no-cover-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-gray-100);
  border-radius: var(--radius-sm);
  color: var(--color-gray-400);
}

.no-cover-icon svg {
  width: 30px;
  height: 30px;
}

.cover-option span {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-secondary);
  text-align: center;
  word-break: break-word;
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal {
    margin: var(--spacing-md);
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .cover-options {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
  
  .cover-option img,
  .no-cover-icon {
    width: 50px;
    height: 50px;
  }
  
  .no-cover-icon svg {
    width: 25px;
    height: 25px;
  }
}
</style>
