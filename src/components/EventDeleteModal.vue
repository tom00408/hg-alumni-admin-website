<template>
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="modal small" @click.stop>
      <div class="modal-header">
        <h2>Termin löschen</h2>
      </div>
      <div class="modal-body">
        <p>Möchtest du den Termin "<strong>{{ eventToDelete?.title }}</strong>" wirklich löschen?</p>
        <p class="warning">Diese Aktion kann nicht rückgängig gemacht werden.</p>
      </div>
      <div class="modal-actions">
        <TomButton 
          @click="closeModal" 
          title="Abbrechen"
          variant="secondary"
        />
        <TomButton 
          @click="confirmDelete" 
          :title="isSubmitting ? 'Lösche...' : 'Löschen'"
          icon="delete"
          variant="danger" 
          :disabled="isSubmitting"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Event } from '../lib/types'
import TomButton from '../tomponents/TomButton.vue'

interface Props {
  isVisible: boolean
  eventToDelete: Event | null
  isSubmitting?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'confirm'): void
}

const props = withDefaults(defineProps<Props>(), {
  isSubmitting: false
})

const emit = defineEmits<Emits>()

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
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-gray-200);
  margin-top: var(--spacing-lg);
}

/* Responsive */
@media (max-width: 768px) {
  .modal {
    margin: var(--spacing-md);
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>
