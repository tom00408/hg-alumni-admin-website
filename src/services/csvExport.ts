import type { Member } from '../lib/types'
import { Timestamp } from 'firebase/firestore'

interface ExportConfig {
  fields: Record<string, boolean>
  format: string
  csvSeparator: string
  includeHeaders: boolean
  members: Member[]
}

interface FieldDefinition {
  key: keyof Member
  label: string
  formatter?: (value: any) => string
}

/**
 * Verfügbare Felder für den Export mit deutschen Labels
 */
const EXPORT_FIELDS: FieldDefinition[] = [
  { key: 'salutation', label: 'Anrede' },
  { key: 'firstName', label: 'Vorname' },
  { key: 'lastName', label: 'Nachname' },
  { 
    key: 'birthDate', 
    label: 'Geburtsdatum',
    formatter: (value: string) => formatDateGerman(value)
  },
  { key: 'occupation', label: 'Beruf' },
  { key: 'email', label: 'E-Mail' },
  { key: 'address', label: 'Adresse' },
  { key: 'postalCode', label: 'PLZ' },
  { key: 'city', label: 'Stadt' },
  { 
    key: 'schoolFrom', 
    label: 'Schulzeit von',
    formatter: (value: string) => formatDateGerman(value)
  },
  { 
    key: 'schoolTo', 
    label: 'Schulzeit bis',
    formatter: (value: string) => formatDateGerman(value)
  },
  { key: 'iban', label: 'IBAN' },
  { key: 'bic', label: 'BIC' },
  { key: 'membershipNumber', label: 'Mitgliedsnummer' },
  { 
    key: 'memberSince', 
    label: 'Mitglied seit',
    formatter: (value: Timestamp) => formatTimestampGerman(value)
  },
  { 
    key: 'status', 
    label: 'Status',
    formatter: (value: string) => formatStatus(value)
  }
]

/**
 * Formatiert ein Datum im deutschen Format
 */
function formatDateGerman(dateString: string): string {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch {
    return dateString
  }
}

/**
 * Formatiert einen Firestore Timestamp im deutschen Format
 */
function formatTimestampGerman(timestamp: Timestamp): string {
  if (!timestamp) return ''
  
  try {
    return timestamp.toDate().toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch {
    return ''
  }
}

/**
 * Formatiert den Status in deutscher Sprache
 */
function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'active': 'Aktiv',
    'inactive': 'Inaktiv',
    'suspended': 'Gesperrt'
  }
  
  return statusMap[status] || status
}

/**
 * Escaped einen Wert für CSV (fügt Anführungszeichen hinzu wenn nötig)
 */
function escapeCsvValue(value: string, separator: string): string {
  if (!value) return ''
  
  const stringValue = String(value)
  
  // Wenn der Wert den Separator, Anführungszeichen oder Zeilenumbrüche enthält,
  // muss er in Anführungszeichen gesetzt werden
  if (stringValue.includes(separator) || 
      stringValue.includes('"') || 
      stringValue.includes('\n') || 
      stringValue.includes('\r')) {
    
    // Anführungszeichen im Wert müssen verdoppelt werden
    const escapedValue = stringValue.replace(/"/g, '""')
    return `"${escapedValue}"`
  }
  
  return stringValue
}

/**
 * Generiert CSV-Daten aus den ausgewählten Mitgliedern
 */
function generateCsvData(config: ExportConfig): string {
  const { fields, csvSeparator, includeHeaders, members } = config
  
  // Filtere die Felder basierend auf der Auswahl
  const selectedFields = EXPORT_FIELDS.filter(field => fields[field.key])
  
  if (selectedFields.length === 0) {
    throw new Error('Keine Felder für den Export ausgewählt')
  }
  
  const lines: string[] = []
  
  // Header-Zeile hinzufügen wenn gewünscht
  if (includeHeaders) {
    const headers = selectedFields.map(field => 
      escapeCsvValue(field.label, csvSeparator)
    )
    lines.push(headers.join(csvSeparator))
  }
  
  // Datenzeilen hinzufügen
  members.forEach(member => {
    const row = selectedFields.map(field => {
      const value = member[field.key]
      
      // Verwende Formatter wenn vorhanden
      const formattedValue = field.formatter 
        ? field.formatter(value)
        : String(value || '')
      
      return escapeCsvValue(formattedValue, csvSeparator)
    })
    
    lines.push(row.join(csvSeparator))
  })
  
  return lines.join('\n')
}

/**
 * Generiert einen Dateinamen für den Export
 */
function generateFileName(memberCount: number): string {
  const now = new Date()
  const dateString = now.toISOString().split('T')[0] // YYYY-MM-DD
  const timeString = now.toTimeString().split(' ')[0].replace(/:/g, '-') // HH-MM-SS
  
  return `mitglieder-export-${memberCount}-${dateString}-${timeString}.csv`
}

/**
 * Startet den Download einer CSV-Datei
 */
function downloadCsvFile(csvData: string, filename: string): void {
  // BOM für UTF-8 hinzufügen, damit Excel die Umlaute korrekt anzeigt
  const BOM = '\uFEFF'
  const csvWithBom = BOM + csvData
  
  // Blob erstellen
  const blob = new Blob([csvWithBom], { 
    type: 'text/csv;charset=utf-8;' 
  })
  
  // Download-Link erstellen und klicken
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // URL freigeben
  URL.revokeObjectURL(url)
}

/**
 * Hauptfunktion für den CSV-Export
 */
export function exportMembersToCSV(config: ExportConfig): void {
  try {
    if (!config.members || config.members.length === 0) {
      throw new Error('Keine Mitglieder zum Exportieren ausgewählt')
    }
    
    // CSV-Daten generieren
    const csvData = generateCsvData(config)
    
    // Dateiname generieren
    const filename = generateFileName(config.members.length)
    
    // Download starten
    downloadCsvFile(csvData, filename)
    
    console.log(`CSV-Export erfolgreich: ${config.members.length} Mitglieder exportiert`)
    
  } catch (error) {
    console.error('Fehler beim CSV-Export:', error)
    throw new Error(`Export fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`)
  }
}

/**
 * Validiert die Export-Konfiguration
 */
export function validateExportConfig(config: ExportConfig): string[] {
  const errors: string[] = []
  
  if (!config.members || config.members.length === 0) {
    errors.push('Keine Mitglieder ausgewählt')
  }
  
  const hasSelectedFields = Object.values(config.fields).some(selected => selected)
  if (!hasSelectedFields) {
    errors.push('Keine Felder für den Export ausgewählt')
  }
  
  if (!config.csvSeparator) {
    errors.push('Kein CSV-Trennzeichen ausgewählt')
  }
  
  return errors
}

/**
 * Hilfsfunktion um eine Vorschau der ersten Zeilen zu generieren
 */
export function generateExportPreview(config: ExportConfig, maxRows: number = 3): string {
  try {
    const previewConfig = {
      ...config,
      members: config.members.slice(0, maxRows)
    }
    
    return generateCsvData(previewConfig)
  } catch (error) {
    return `Fehler bei der Vorschau: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`
  }
}
