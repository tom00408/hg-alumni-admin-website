<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">Mitglieder exportieren</h2>
        <button @click="closeModal" class="close-button" aria-label="Schließen">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <div class="export-info">
          <p><strong>{{ selectedCount }}</strong> Mitglied(er) ausgewählt</p>
          <p class="info-text">Wählen Sie die Felder aus, die exportiert werden sollen:</p>
        </div>

        <div class="field-selection">
          <div class="field-group">
            <h3>Persönliche Daten</h3>
            <div class="field-options">
              <label class="field-option">
                <input
                  type="checkbox"
                  v-model="selectedFields.salutation"
                  @change="updateFieldSelection"
                />
                <span>Anrede</span>
              </label>
              <label class="field-option">
                <input
                  type="checkbox"
                  v-model="selectedFields.firstName"
                  @change="updateFieldSelection"
                />
                <span>Vorname</span>
              </label>
              <label class="field-option">
                <input
                  type="checkbox"
                  v-model="selectedFields.lastName"
                  @change="updateFieldSelection"
                />
                <span>Nachname</span>
              </label>
              <label class="field-option">
                <input
                  type="checkbox"
                  v-model="selectedFields.birthDate"
                  @change="updateFieldSelection"
                />
                <span>Geburtsdatum</span>
              </label>
              <label class="field-option">
                <input
                  type="checkbox"
                  v-model="selectedFields.occupation"
                  @change="updateFieldSelection"
                />
                <span>Beruf</span>
              </label>
            </div>
          </div>

          <div class="field-group">
            <h3>Kontaktdaten</h3>
            <div class="field-options">
              <label class="field-option">
                <input
                  type="checkbox"
                  v-model="selectedFields.email"
                  @change="updateFieldSelection"
                />
                <span>E-Mail</span>
              </label>
              <label class="field-option">
                <input
                  type="checkbox"
                  v-model="selectedFields.address"
                  @change="updateFieldSelection"
                />
                <span>Adresse</span>
              </label>
              <label class="field-option">
                <input
                  type="checkbox"
                  v-model="selectedFields.postalCode"
                  @change="updateFieldSelection"
                />
                <span>PLZ</span>
              </label>
              <label class="field-option">
                <input
                  type="checkbox"
                  v-model="selectedFields.city"
                  @change="updateFieldSelection"
                />
                <span>Stadt</span>
              </label>
            </div>
          </div>

          <div class="field-group">
            <h3>Schulzeit</h3>
            <div class="field-options">
              <label class="field-option">
                <input
                  type="checkbox"
                  v-model="selectedFields.schoolFrom"
                  @change="updateFieldSelection"
                />
                <span>Schulzeit von</span>
              </label>
              <label class="field-option">
                <input
                  type="checkbox"
                  v-model="selectedFields.schoolTo"
                  @change="updateFieldSelection"
                />
                <span>Schulzeit bis</span>
              </label>
            </div>
          </div>

          <div class="field-group">
            <h3>Bankdaten</h3>
            <div class="field-options">
              <label class="field-option">
                <input
                  type="checkbox"
                  v-model="selectedFields.iban"
                  @change="updateFieldSelection"
                />
                <span>IBAN</span>
              </label>
              <label class="field-option">
                <input
                  type="checkbox"
                  v-model="selectedFields.bic"
                  @change="updateFieldSelection"
                />
                <span>BIC</span>
              </label>
            </div>
          </div>

          <div class="field-group">
            <h3>Mitgliedschaft</h3>
            <div class="field-options">
              <label class="field-option">
                <input
                  type="checkbox"
                  v-model="selectedFields.membershipNumber"
                  @change="updateFieldSelection"
                />
                <span>Mitgliedsnummer</span>
              </label>
              <label class="field-option">
                <input
                  type="checkbox"
                  v-model="selectedFields.memberSince"
                  @change="updateFieldSelection"
                />
                <span>Mitglied seit</span>
              </label>
              <label class="field-option">
                <input
                  type="checkbox"
                  v-model="selectedFields.status"
                  @change="updateFieldSelection"
                />
                <span>Status</span>
              </label>
            </div>
          </div>
        </div>

        <div class="selection-actions">
          <button @click="selectAllFields" class="action-button secondary">
            Alle auswählen
          </button>
          <button @click="selectNoneFields" class="action-button secondary">
            Alle abwählen
          </button>
          <button @click="selectDefaultFields" class="action-button secondary">
            Standard auswählen
          </button>
        </div>

        <div class="export-format">
          <h3>Export-Format</h3>
          <div class="format-options">
            <label class="format-option">
              <input
                type="radio"
                v-model="exportFormat"
                value="csv"
              />
              <span>CSV (Excel-kompatibel)</span>
            </label>
            <label class="format-option">
              <input
                type="radio"
                v-model="exportFormat"
                value="xlsx"
                disabled
              />
              <span>XLSX (Excel) - Bald verfügbar</span>
            </label>
          </div>
        </div>

        <div class="csv-options" v-if="exportFormat === 'csv'">
          <h3>CSV-Optionen</h3>
          <div class="csv-settings">
            <label class="csv-option">
              <span>Trennzeichen:</span>
              <select v-model="csvSeparator">
                <option value=";">Semikolon (;)</option>
                <option value=",">Komma (,)</option>
                <option value="\t">Tab</option>
              </select>
            </label>
            <label class="csv-option">
              <input
                type="checkbox"
                v-model="includeHeaders"
              />
              <span>Spaltenüberschriften einschließen</span>
            </label>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="closeModal" class="cancel-button">
          Abbrechen
        </button>
        <button 
          @click="startExport" 
          class="export-button"
          :disabled="!hasSelectedFields || isExporting"
        >
          <span v-if="isExporting">Exportiere...</span>
          <span v-else>Exportieren</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Member } from '../../lib/types'

interface Props {
  isOpen: boolean
  selectedMembers: Member[]
}

interface ExportField {
  key: keyof Member
  label: string
  defaultSelected: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  export: [config: ExportConfig]
}>()

interface SelectedFields {
  salutation: boolean
  firstName: boolean
  lastName: boolean
  birthDate: boolean
  occupation: boolean
  email: boolean
  address: boolean
  postalCode: boolean
  city: boolean
  schoolFrom: boolean
  schoolTo: boolean
  iban: boolean
  bic: boolean
  membershipNumber: boolean
  memberSince: boolean
  status: boolean
}

interface ExportConfig {
  fields: SelectedFields
  format: string
  csvSeparator: string
  includeHeaders: boolean
  members: Member[]
}

const selectedFields = ref<SelectedFields>({
  salutation: false,
  firstName: true,
  lastName: true,
  birthDate: false,
  occupation: false,
  email: true,
  address: false,
  postalCode: false,
  city: false,
  schoolFrom: false,
  schoolTo: false,
  iban: false,
  bic: false,
  membershipNumber: true,
  memberSince: true,
  status: true
})

const exportFormat = ref('csv')
const csvSeparator = ref(';')
const includeHeaders = ref(true)
const isExporting = ref(false)

const selectedCount = computed(() => props.selectedMembers.length)

const hasSelectedFields = computed(() => {
  return Object.values(selectedFields.value).some(selected => selected)
})

const closeModal = () => {
  emit('close')
}

const updateFieldSelection = () => {
  // Reaktive Aktualisierung wird automatisch durch v-model getriggert
}

const selectAllFields = () => {
  Object.keys(selectedFields.value).forEach(key => {
    (selectedFields.value as any)[key] = true
  })
}

const selectNoneFields = () => {
  Object.keys(selectedFields.value).forEach(key => {
    (selectedFields.value as any)[key] = false
  })
}

const selectDefaultFields = () => {
  selectedFields.value = {
    salutation: false,
    firstName: true,
    lastName: true,
    birthDate: false,
    occupation: false,
    email: true,
    address: false,
    postalCode: false,
    city: false,
    schoolFrom: false,
    schoolTo: false,
    iban: false,
    bic: false,
    membershipNumber: true,
    memberSince: true,
    status: true
  }
}

const startExport = () => {
  if (!hasSelectedFields.value) return
  
  isExporting.value = true
  
  const config: ExportConfig = {
    fields: { ...selectedFields.value },
    format: exportFormat.value,
    csvSeparator: csvSeparator.value,
    includeHeaders: includeHeaders.value,
    members: props.selectedMembers
  }
  
  emit('export', config)
  
  // Reset nach kurzer Verzögerung
  setTimeout(() => {
    isExporting.value = false
    closeModal()
  }, 1000)
}

// Modal schließen mit Escape-Taste
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    document.addEventListener('keydown', handleEscape)
  } else {
    document.removeEventListener('keydown', handleEscape)
  }
})

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeModal()
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
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  color: #6b7280;
  transition: all 0.2s;
}

.close-button:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.export-info {
  margin-bottom: 32px;
}

.export-info p {
  margin: 0 0 8px 0;
}

.info-text {
  color: #6b7280;
  font-size: 0.875rem;
}

.field-selection {
  margin-bottom: 32px;
}

.field-group {
  margin-bottom: 24px;
}

.field-group h3 {
  margin: 0 0 12px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.field-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.field-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.field-option:hover {
  background: #f9fafb;
}

.field-option input[type="checkbox"] {
  margin: 0;
}

.field-option span {
  font-size: 0.875rem;
  color: #374151;
}

.selection-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.action-button {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.action-button:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.action-button.secondary {
  background: #f9fafb;
}

.export-format {
  margin-bottom: 24px;
}

.export-format h3 {
  margin: 0 0 12px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.format-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.format-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.format-option:hover {
  background: #f9fafb;
}

.format-option input[type="radio"] {
  margin: 0;
}

.format-option span {
  font-size: 0.875rem;
  color: #374151;
}

.format-option input:disabled + span {
  color: #9ca3af;
}

.csv-options {
  margin-bottom: 24px;
}

.csv-options h3 {
  margin: 0 0 12px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.csv-settings {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.csv-option {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.875rem;
}

.csv-option span {
  color: #374151;
  min-width: 120px;
}

.csv-option select {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
}

.csv-option input[type="checkbox"] {
  margin: 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.cancel-button {
  padding: 10px 20px;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.cancel-button:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.export-button {
  padding: 10px 20px;
  border: none;
  background: #3b82f6;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.export-button:hover:not(:disabled) {
  background: #2563eb;
}

.export-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .modal-content {
    margin: 10px;
    max-height: calc(100vh - 20px);
  }
  
  .field-options {
    grid-template-columns: 1fr;
  }
  
  .selection-actions {
    flex-direction: column;
  }
  
  .action-button {
    width: 100%;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .cancel-button,
  .export-button {
    width: 100%;
  }
}
</style>
