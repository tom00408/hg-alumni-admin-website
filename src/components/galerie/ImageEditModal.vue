<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h2>Bild bearbeiten</h2>
        <TomButton 
          @click="closeModal" 
          variant="action" 
          title="Schließen"
          icon="close"
        />
      </div>

      <form @submit.prevent="submitEdit" class="modal-form">
        <div class="image-preview">
          <img :src="editingImage?.imageUrl" :alt="editingImage?.title || 'Bild'" />
        </div>

        <div class="form-group">
          <label for="imageTitle">Titel</label>
          <input 
            id="imageTitle"
            v-model="imageForm.title" 
            type="text" 
            placeholder="Optionaler Titel für das Bild"
          />
        </div>

        <div class="modal-actions">
          <TomButton 
            @click="closeModal" 
            variant="secondary" 
            title="Abbrechen"
            icon="close"
          />
          <button type="submit" class="btn-primary" :disabled="isSubmitting">
            <span v-if="isSubmitting">Speichert...</span>
            <span v-else>Aktualisieren</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { GalleryImage } from '../../lib/types'
import TomButton from '../../tomponents/TomButton.vue'

// Props
interface Props {
  show: boolean
  editingImage?: GalleryImage | null
  isSubmitting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  editingImage: null,
  isSubmitting: false
})

// Emits
const emit = defineEmits<{
  'close': []
  'submit': [data: { title: string }]
}>()

// Reactive state
const imageForm = ref({
  title: ''
})

// Watch for editing image changes
watch(() => props.editingImage, (newImage) => {
  if (newImage) {
    imageForm.value.title = newImage.title || ''
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
  imageForm.value = {
    title: ''
  }
}

const submitEdit = () => {
  emit('submit', {
    title: imageForm.value.title.trim()
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

.form-group input {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-family: inherit;
}

.form-group input:focus {
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

/* Responsive Design */
@media (max-width: 768px) {
  .modal {
    margin: var(--spacing-md);
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>
