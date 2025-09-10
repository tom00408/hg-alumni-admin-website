<template>
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h2>{{ isEditMode ? 'Termin bearbeiten' : 'Neuen Termin erstellen' }}</h2>
        <TomButton 
          @click="closeModal" 
          title="Schließen"
          icon="close"
          variant="action"
        />
      </div>

      <form @submit.prevent="submitEvent" class="modal-form">
        <div class="form-group">
          <label for="title">Titel *</label>
          <input 
            id="title"
            v-model="eventForm.title" 
            type="text" 
            required
            placeholder="z.B. Alumni-Jahrestreffen 2024"
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="date">Datum *</label>
            <input 
              id="date"
              v-model="eventForm.date" 
              type="date" 
              required
            />
          </div>
          <div class="form-group">
            <label for="time">Uhrzeit *</label>
            <input 
              id="time"
              v-model="eventForm.time" 
              type="time" 
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="location">Ort</label>
          <input 
            id="location"
            v-model="eventForm.location" 
            type="text" 
            placeholder="z.B. Hainberg-Gymnasium, Aula"
          />
        </div>

        <div class="form-group">
          <label for="description">Beschreibung</label>
          <textarea 
            id="description"
            v-model="eventForm.description" 
            rows="4"
            placeholder="Weitere Details zum Termin..."
          ></textarea>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input 
              v-model="eventForm.isFeatured" 
              type="checkbox"
            />
            <span class="checkmark"></span>
            Als hervorgehobenen Termin markieren
          </label>
        </div>

        <div class="modal-actions">
          <TomButton 
            @click="closeModal" 
            title="Abbrechen"
            variant="secondary"
          />
          <TomButton 
            type="submit" 
            :title="isSubmitting ? 'Speichert...' : isEditMode ? 'Aktualisieren' : 'Erstellen'"
            icon="save"
            variant="primary" 
            :disabled="isSubmitting"
          />
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Timestamp } from 'firebase/firestore'
import type { Event } from '../../lib/types'
import TomButton from '../../tomponents/TomButton.vue'

interface Props {
  isVisible: boolean
  isEditMode: boolean
  editingEvent?: Event | null
  isSubmitting?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'submit', eventData: any): void
}

const props = withDefaults(defineProps<Props>(), {
  editingEvent: null,
  isSubmitting: false
})

const emit = defineEmits<Emits>()

// Event form
const eventForm = ref({
  title: '',
  date: '',
  time: '',
  location: '',
  description: '',
  isFeatured: false
})

// Helper function to reset form
const resetForm = () => {
  eventForm.value = {
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    isFeatured: false
  }
}

// Watch for editing event changes
watch(() => props.editingEvent, (newEvent) => {
  if (newEvent) {
    const eventDate = newEvent.date.toDate()
    eventForm.value = {
      title: newEvent.title,
      date: eventDate.toISOString().split('T')[0],
      time: eventDate.toTimeString().slice(0, 5),
      location: newEvent.location || '',
      description: newEvent.description || '',
      isFeatured: newEvent.isFeatured || false
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// Watch for modal visibility changes
watch(() => props.isVisible, (isVisible) => {
  if (!isVisible) {
    resetForm()
  }
})

const closeModal = () => {
  emit('close')
}

const submitEvent = () => {
  // Datum und Zeit kombinieren
  const datetime = new Date(`${eventForm.value.date}T${eventForm.value.time}`)
  const timestamp = Timestamp.fromDate(datetime)
  
  const eventData = {
    title: eventForm.value.title,
    date: timestamp,
    location: eventForm.value.location || undefined,
    description: eventForm.value.description || undefined,
    isFeatured: eventForm.value.isFeatured,
    createdAt: Timestamp.now()
  }
  
  emit('submit', eventData)
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

.modal-form {
  padding: var(--spacing-xl);
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
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
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(83, 98, 254, 0.1);
}

.checkbox-label {
  display: flex !important;
  align-items: center;
  gap: var(--spacing-md);
  cursor: pointer;
  margin-bottom: 0 !important;
}

.checkbox-label input[type="checkbox"] {
  width: auto !important;
  margin: 0;
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
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
