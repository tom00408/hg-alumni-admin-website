import { 
  collection, 
  addDoc, 
  Timestamp 
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { MembershipApplication } from '../lib/types'

const COLLECTION_NAME = 'membershipApplications'

/**
 * Neue Mitgliedschaftsanfrage erstellen
 */
export const createMembershipApplication = async (
  applicationData: Omit<MembershipApplication, 'id' | 'createdAt' | 'status'>
): Promise<MembershipApplication> => {
  try {
    const applicationsCollection = collection(db, COLLECTION_NAME)
    
    const applicationWithMetadata = {
      ...applicationData,
      status: 'pending' as const,
      createdAt: Timestamp.now()
    }
    
    const docRef = await addDoc(applicationsCollection, applicationWithMetadata)
    
    const createdApplication: MembershipApplication = {
      id: docRef.id,
      ...applicationWithMetadata
    }
    
    // Optional: E-Mail-Benachrichtigung senden
    await sendApplicationNotification(createdApplication)
    
    return createdApplication
  } catch (error) {
    console.error('Error creating membership application:', error)
    throw new Error('Fehler beim Einreichen der Mitgliedschaftsanfrage')
  }
}

/**
 * E-Mail-Benachrichtigung für neue Anträge senden
 * (Placeholder - würde normalerweise mit Firebase Functions implementiert)
 */
const sendApplicationNotification = async (application: MembershipApplication): Promise<void> => {
  try {
    // TODO: Implementiere E-Mail-Versendung mit Firebase Functions
    // Beispiel-Implementierung mit Cloud Functions:
    
    console.log('Sending notification for new membership application:', application.id)
    
    // Mock notification
    // In einer echten Implementierung würde hier eine Cloud Function aufgerufen
    // oder ein E-Mail-Service wie SendGrid/Mailgun verwendet werden
    
  } catch (error) {
    console.error('Error sending notification:', error)
    // Fehler beim E-Mail-Versand sollten die Antragsstellung nicht blockieren
  }
}

/**
 * Validierung der Antragsdaten
 */
export const validateMembershipApplication = (
  data: Omit<MembershipApplication, 'id' | 'createdAt' | 'status'>
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  // Name validieren
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name muss mindestens 2 Zeichen lang sein')
  }
  
  // E-Mail validieren
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!data.email || !emailRegex.test(data.email)) {
    errors.push('Bitte geben Sie eine gültige E-Mail-Adresse ein')
  }
  
  // Abschlussjahr validieren (optional, aber wenn angegeben, muss es gültig sein)
  if (data.graduationYear !== undefined) {
    const currentYear = new Date().getFullYear()
    const minYear = 1950
    const maxYear = currentYear + 10
    
    if (data.graduationYear < minYear || data.graduationYear > maxYear) {
      errors.push(`Abschlussjahr muss zwischen ${minYear} und ${maxYear} liegen`)
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Hilfsfunktion zum Formatieren der Anwendungsdaten für E-Mails
 */
export const formatApplicationForEmail = (application: MembershipApplication): string => {
  const formatDate = (timestamp: any) => {
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    return 'Unbekannt'
  }
  
  return `
Neue Mitgliedschaftsanfrage

Name: ${application.name}
E-Mail: ${application.email}
Abschlussjahr: ${application.graduationYear || 'Nicht angegeben'}
Beziehung zur Schule: ${application.relation || 'Nicht angegeben'}
Nachricht: ${application.message || 'Keine Nachricht'}

Eingereicht am: ${formatDate(application.createdAt)}
Status: ${application.status}
  `.trim()
}
