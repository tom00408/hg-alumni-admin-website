<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="header-content">
          <h2 class="modal-title">Antragsdetails</h2>
          
        </div>
        <div class="header-actions">
          <TomButton
            v-if="!isEditMode && application?.status !== 'approved' && application?.status !== 'rejected'"
            @click="startEdit"
            title="Bearbeiten"
            icon="edit"
            variant="primary"
          />
          <TomButton
            @click="closeModal"
            title="Schließen"
            icon="close"
            variant="secondary"
          />
        </div>
      </div>

      <!-- Modal Content -->
      <div class="modal-content">
        <div v-if="!application" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Lade Antragsdetails...</p>
        </div>

        <div v-else class="application-details">
          <!-- Personal Information -->
          <div class="detail-section">
            <h3 class="section-title">
              <svg class="section-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              Persönliche Informationen
            </h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label class="detail-label">Anrede</label>
                <p v-if="!isEditMode" class="detail-value">{{ application.salutation }}</p>
                <select v-else v-model="editedData!.salutation" class="edit-input">
                  <option value="">Bitte wählen</option>
                  <option value="Herr">Herr</option>
                  <option value="Frau">Frau</option>
                  <option value="Divers">Divers</option>
                </select>
              </div>
              <div class="detail-item">
                <label class="detail-label">Vorname</label>
                <p v-if="!isEditMode" class="detail-value">{{ application.firstName }}</p>
                <input v-else v-model="editedData!.firstName" class="edit-input" type="text" placeholder="Vorname eingeben">
              </div>
              <div class="detail-item">
                <label class="detail-label">Nachname</label>
                <p v-if="!isEditMode" class="detail-value">{{ application.lastName }}</p>
                <input v-else v-model="editedData!.lastName" class="edit-input" type="text" placeholder="Nachname eingeben">
              </div>
              <div class="detail-item">
                <label class="detail-label">E-Mail</label>
                <p v-if="!isEditMode" class="detail-value">
                  <a :href="`mailto:${application.email}`" class="email-link">
                    {{ application.email }}
                  </a>
                </p>
                <input v-else v-model="editedData!.email" class="edit-input" type="email" placeholder="E-Mail eingeben">
              </div>
              <div class="detail-item">
                <label class="detail-label">Geburtsdatum</label>
                <p v-if="!isEditMode" class="detail-value">{{ formatDateGerman(application.birthDate) }}</p>
                <input v-else v-model="editedData!.birthDate" class="edit-input" type="date">
              </div>
              <div class="detail-item detail-item--full">
                <label class="detail-label">Adresse</label>
                <p v-if="!isEditMode" class="detail-value">{{ application.address }}</p>
                <input v-else v-model="editedData!.address" class="edit-input" type="text" placeholder="Adresse eingeben">
              </div>
              <div class="detail-item">
                <label class="detail-label">Stadt</label>
                <p v-if="!isEditMode" class="detail-value">{{ application.city }}</p>
                <input v-else v-model="editedData!.city" class="edit-input" type="text" placeholder="Stadt eingeben">
              </div>
              <div class="detail-item">
                <label class="detail-label">Postleitzahl</label>
                <p v-if="!isEditMode" class="detail-value">{{ application.postalCode }}</p>
                <input v-else v-model="editedData!.postalCode" class="edit-input" type="text" placeholder="PLZ eingeben">
              </div>
              <div class="detail-item">
                <label class="detail-label">Beruf</label>
                <p v-if="!isEditMode" class="detail-value">{{ application.occupation || 'Nicht angegeben' }}</p>
                <input v-else v-model="editedData!.occupation" class="edit-input" type="text" placeholder="Beruf eingeben">
              </div>
            </div>
          </div>

          <!-- School Information -->
          <div class="detail-section">
            <h3 class="section-title">
              <svg class="section-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
              </svg>
              Schuldaten
            </h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label class="detail-label">Schulzeit von</label>
                <p v-if="!isEditMode" class="detail-value">{{ formatDateGerman(application.schoolFrom || '') }}</p>
                <input v-else v-model="editedData!.schoolFrom" class="edit-input" type="date">
              </div>
              <div class="detail-item">
                <label class="detail-label">Schulzeit bis</label>
                <p v-if="!isEditMode" class="detail-value">{{ formatDateGerman(application.schoolTo || '') }}</p>
                <input v-else v-model="editedData!.schoolTo" class="edit-input" type="date">
              </div>
            </div>
          </div>

          <!-- Banking Information -->
          <div class="detail-section">
            <h3 class="section-title">
              <svg class="section-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
              </svg>
              Bankdaten
            </h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label class="detail-label">IBAN</label>
                <p v-if="!isEditMode" class="detail-value">{{ application.iban }}</p>
                <input v-else v-model="editedData!.iban" class="edit-input" type="text" placeholder="IBAN eingeben">
              </div>
              <div class="detail-item">
                <label class="detail-label">BIC</label>
                <p v-if="!isEditMode" class="detail-value">{{ application.bic }}</p>
                <input v-else v-model="editedData!.bic" class="edit-input" type="text" placeholder="BIC eingeben">
              </div>
            </div>
          </div>

          <!-- Application Information -->
          <div class="detail-section">
            <h3 class="section-title">
              <svg class="section-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
              Antragsinformationen
            </h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label class="detail-label">Eingereicht am</label>
                <p class="detail-value">{{ formatDate(application.createdAt) }}</p>
              </div>
              <div class="detail-item">
                <label class="detail-label">Status</label>
                <div class="status-container">
                  <span class="status-badge" :class="`status--${application.status}`">
                    {{ getStatusLabel(application.status) }}
                  </span>
                </div>
              </div>
              <div class="detail-item">
                <label class="detail-label">Ort und Datum</label>
                <p v-if="!isEditMode" class="detail-value">{{ application.placeDate }}</p>
                <input v-else v-model="editedData!.placeDate" class="edit-input" type="text" placeholder="Ort und Datum eingeben">
              </div>
              <div class="detail-item detail-item--full">
                <label class="detail-label">Unterschrift</label>
                <p v-if="!isEditMode" class="detail-value">{{ application.signature }}</p>
                <input v-else v-model="editedData!.signature" class="edit-input" type="text" placeholder="Unterschrift eingeben">
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <div class="footer-actions">
          <!-- Edit Mode Actions -->
          <template v-if="isEditMode">
            <TomButton
              @click="saveEdit"
              title="Änderungen speichern"
              icon="check"
              variant="primary"
              :loading="isProcessing"
            />
            <TomButton
              @click="cancelEdit"
              title="Abbrechen"
              icon="close"
              variant="secondary"
            />
          </template>
          
          <!-- Normal Mode Actions -->
          <template v-else>
            <TomButton
              v-if="application?.status === 'new'"
              @click="handleInProgress"
              title="In Bearbeitung setzen"
              icon="edit"
              variant="primary"
              :loading="isProcessing"
            />
            <TomButton
              v-if="application?.status === 'new' || application?.status === 'in_progress'"
              @click="handleApprove"
              title="Antrag genehmigen"
              icon="check"
              variant="secondary"
              :loading="isProcessing"
            />
            <TomButton
              v-if="application?.status === 'new' || application?.status === 'in_progress'"
              @click="handleReject"
              title="Antrag ablehnen"
              icon="close"
              variant="danger"
              :loading="isProcessing"
            />
            <TomButton
              @click="handleDelete"
              title="Antrag löschen"
              icon="delete"
              variant="secondary"
              :loading="isProcessing"
            />
            <TomButton
              @click="closeModal"
              title="Schließen"
              icon="close"
              variant="secondary"
            />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import TomButton from '../../tomponents/TomButton.vue'
import type { MembershipApplication } from '../../lib/types'

interface Props {
  isOpen: boolean
  application: MembershipApplication
  isProcessing?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isProcessing: false
})

// Edit mode state
const isEditMode = ref(false)
const editedData = ref<MembershipApplication | null>(null)

const emit = defineEmits<{
  close: []
  approve: [id: string]
  reject: [id: string]
  inProgress: [id: string]
  delete: [id: string]
  update: [id: string, data: Partial<MembershipApplication>]
}>()

// Methods
const closeModal = () => {
  emit('close')
}

const handleApprove = () => {
  if (props.application?.id) {
    emit('approve', props.application.id)
  }
}

const handleReject = () => {
  if (props.application?.id) {
    if (confirm('Sind Sie sicher, dass Sie diesen Antrag ablehnen möchten? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      emit('reject', props.application.id)
    }
  }
}

const handleInProgress = () => {
  if (props.application?.id) {
    emit('inProgress', props.application.id)
  }
}

const handleDelete = () => {
  if (props.application?.id) {
    if (confirm('Sind Sie sicher, dass Sie diesen Antrag löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      emit('delete', props.application.id)
    }
  }
}

const startEdit = () => {
  isEditMode.value = true
  editedData.value = { ...props.application }
}

const cancelEdit = () => {
  isEditMode.value = false
  editedData.value = null
}

const saveEdit = () => {
  if (editedData.value && props.application?.id) {
    emit('update', props.application.id, editedData.value)
    isEditMode.value = false
    editedData.value = null
  }
}

const getStatusLabel = (status?: string): string => {
  switch (status) {
    case 'new':
      return 'Neu'
    case 'in_progress':
      return 'In Bearbeitung'
    case 'approved':
      return 'Genehmigt'
    case 'rejected':
      return 'Abgelehnt'
    default:
      return 'Unbekannt'
  }
}

const formatDate = (timestamp: any): string => {
  if (!timestamp) return 'Unbekannt'
  
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  if (timestamp instanceof Date) {
    return timestamp.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  return 'Unbekannt'
}

const formatDateGerman = (dateString: string): string => {
  if (!dateString) return 'Nicht angegeben'
  
  try {
    // Versuche verschiedene Datumsformate zu parsen
    let date: Date
    
    // Prüfe ob es bereits im deutschen Format ist (dd.mm.yyyy)
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateString)) {
      return dateString
    }
    
    // Prüfe ISO Format (yyyy-mm-dd)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      date = new Date(dateString)
    } else {
      // Versuche das Datum zu parsen
      date = new Date(dateString)
    }
    
    // Prüfe ob das Datum gültig ist
    if (isNaN(date.getTime())) {
      return dateString // Fallback: Original-String zurückgeben
    }
    
    // Formatiere im deutschen Format (dd.mm.yyyy)
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch (error) {
    return dateString // Fallback: Original-String zurückgeben
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-lg);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease-out;
}

.modal-container {
  background: var(--color-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideInUp 0.3s ease-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--color-gray-200);
  background: var(--color-gray-50);
}

.header-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.modal-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin: 0;
}

.status-badge {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  padding: 6px 12px;
  border-radius: var(--radius-lg);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status--new {
  background: rgba(59, 130, 246, 0.1);
  color: var(--color-primary);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.status--in_progress {
  background: rgba(245, 158, 11, 0.1);
  color: var(--color-warning);
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.status--approved {
  background: rgba(34, 197, 94, 0.1);
  color: var(--color-success);
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.status--rejected {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-danger);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.close-button {
  width: 40px;
  height: 40px;
  border: none;
  background: var(--color-gray-100);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-gray-600);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.close-button:hover {
  background: var(--color-gray-200);
  color: var(--color-gray-800);
  transform: scale(1.05);
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-xl);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xxl);
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-gray-200);
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-lg);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.application-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.detail-section {
  background: var(--color-gray-50);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  border: 1px solid var(--color-gray-200);
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin: 0 0 var(--spacing-lg) 0;
}

.section-icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.detail-item--full {
  grid-column: 1 / -1;
}

.detail-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: var(--font-size-base);
  color: var(--color-text);
  margin: 0;
  word-break: break-word;
}

.email-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
}

.email-link:hover {
  text-decoration: underline;
}

.status-container {
  display: flex;
  align-items: center;
}

.message-content {
  background: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  font-size: var(--font-size-base);
  line-height: 1.6;
  color: var(--color-text);
  white-space: pre-wrap;
  word-break: break-word;
}

.modal-footer {
  padding: var(--spacing-xl);
  border-top: 1px solid var(--color-gray-200);
  background: var(--color-gray-50);
}

.footer-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  flex-wrap: wrap;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-overlay {
    padding: var(--spacing-sm);
    align-items: flex-start;
    padding-top: var(--spacing-lg);
  }
  
  .modal-container {
    max-height: 95vh;
    width: 100%;
    max-width: none;
    margin: 0;
    border-radius: var(--radius-lg);
  }
  
  .modal-header {
    padding: var(--spacing-md);
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }
  
  .modal-title {
    font-size: var(--font-size-lg);
  }
  
  .modal-content {
    padding: var(--spacing-md);
    max-height: 60vh;
    overflow-y: auto;
  }
  
  .modal-footer {
    padding: var(--spacing-md);
    position: sticky;
    bottom: 0;
    background: var(--color-white);
    border-top: 1px solid var(--color-gray-200);
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }
  
  .detail-section {
    padding: var(--spacing-md);
  }
  
  .section-title {
    font-size: var(--font-size-base);
    margin-bottom: var(--spacing-md);
  }
  
  .detail-item {
    margin-bottom: var(--spacing-sm);
  }
  
  .detail-label {
    font-size: var(--font-size-xs);
    margin-bottom: 2px;
  }
  
  .detail-value {
    font-size: var(--font-size-sm);
    line-height: 1.4;
  }
  
  .footer-actions {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }
  
  .footer-actions .tom-button {
    width: 100%;
    justify-content: center;
  }
  
  .status-badge {
    font-size: var(--font-size-xs);
    padding: 4px 8px;
  }
  
  .message-content {
    font-size: var(--font-size-sm);
    padding: var(--spacing-sm);
  }
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: var(--spacing-xs);
    padding-top: var(--spacing-md);
  }
  
  .modal-container {
    max-height: 98vh;
    border-radius: var(--radius-md);
  }
  
  .modal-header {
    padding: var(--spacing-sm);
    gap: var(--spacing-xs);
  }
  
  .modal-content {
    padding: var(--spacing-sm);
    max-height: 65vh;
  }
  
  .modal-footer {
    padding: var(--spacing-sm);
  }
  
  .modal-title {
    font-size: var(--font-size-base);
  }
  
  .detail-section {
    padding: var(--spacing-sm);
    margin-bottom: var(--spacing-sm);
  }
  
  .section-title {
    font-size: var(--font-size-sm);
    margin-bottom: var(--spacing-sm);
  }
  
  .detail-label {
    font-size: 10px;
  }
  
  .detail-value {
    font-size: var(--font-size-xs);
  }
  
  .footer-actions {
    gap: var(--spacing-xs);
  }
  
  .close-button {
    width: 32px;
    height: 32px;
  }
  
  .status-badge {
    font-size: 10px;
    padding: 2px 6px;
  }
}

/* Edit Mode Styles */
.header-actions {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.edit-input {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  background: var(--color-background);
  color: var(--color-text);
  transition: border-color 0.2s ease;
}

.edit-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.edit-input::placeholder {
  color: var(--color-text-muted);
}

/* Mobile Edit Input Styles */
@media (max-width: 480px) {
  .edit-input {
    padding: var(--spacing-sm);
    font-size: var(--font-size-sm);
  }
}
</style>
