<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal small" @click.stop>
      <div class="modal-header">
        <h2>{{ title }}</h2>
      </div>
      <div class="modal-body">
        <p>{{ message }}</p>
        <p class="warning">{{ warning }}</p>
      </div>
      <div class="modal-actions">
        <TomButton 
          @click="closeModal" 
          variant="secondary" 
          title="Abbrechen"
          icon="close"
        />
        <button @click="confirmDelete" class="btn-danger" :disabled="isSubmitting">
          <span v-if="isSubmitting">{{ submittingText }}</span>
          <span v-else>{{ confirmText }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TomButton from '../tomponents/TomButton.vue'

// Props
interface Props {
  show: boolean
  title: string
  message: string
  warning?: string
  confirmText?: string
  submittingText?: string
  isSubmitting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  warning: 'Diese Aktion kann nicht rückgängig gemacht werden.',
  confirmText: 'Löschen',
  submittingText: 'Lösche...',
  isSubmitting: false
})

// Emits
const emit = defineEmits<{
  'close': []
  'confirm': []
}>()

// Methods
const closeModal = () => {
  emit('close')
}

const confirmDelete = () => {
  emit('confirm')
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

.modal.small {
  max-width: 400px;
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

.modal-body .warning {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-md);
}

.modal-actions {
  display: flex;
  gap: var(--spacing-lg);
  justify-content: flex-end;
  padding: var(--spacing-xl);
  border-top: 1px solid var(--color-gray-200);
}

/* Button Styles */
.btn-danger {
  background-color: var(--color-error);
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

.btn-danger:hover:not(:disabled) {
  background-color: #dc2626;
  transform: translateY(-1px);
}

.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-danger svg {
  width: 20px;
  height: 20px;
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
