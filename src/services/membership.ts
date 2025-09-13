import { 
  collection, 
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc, 
  query,
  orderBy,
  Timestamp 
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { MembershipApplication } from '../lib/types'

const APPLICATION_COLLECTION_NAME = 'applications';
const MEMBER_COLLECTION_NAME = 'members';

export const getAllApplications = async (): Promise<MembershipApplication[]> => {
  try {
    const applicationsCollection = collection(db, APPLICATION_COLLECTION_NAME)
    const q = query(applicationsCollection, orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MembershipApplication[]
  } catch (error) {
    console.error('Error fetching all applications:', error)
    throw new Error('Fehler beim Laden der Mitgliedsanträge')
  }
}

/**
 * Status eines Mitgliedsantrags aktualisieren
 */
export const updateApplicationStatus = async (id: string, status: 'new' | 'in_progress' | 'approved' | 'rejected'): Promise<void> => {
  try {
    const applicationDoc = doc(db, APPLICATION_COLLECTION_NAME, id)
    await updateDoc(applicationDoc, { status })
  } catch (error) {
    console.error('Error updating application status:', error)
    throw new Error('Fehler beim Aktualisieren des Antragsstatus')
  }
}

/**
 * Mitgliedsantrag aktualisieren
 */
export const updateApplication = async (id: string, data: Partial<MembershipApplication>): Promise<void> => {
  try {
    const applicationDoc = doc(db, APPLICATION_COLLECTION_NAME, id)
    await updateDoc(applicationDoc, data as any)
  } catch (error) {
    console.error('Error updating application:', error)
    throw new Error('Fehler beim Aktualisieren des Antrags')
  }
}

/**
 * Mitgliedsantrag löschen
 */
export const deleteApplication = async (id: string): Promise<void> => {
  try {
    const applicationDoc = doc(db, APPLICATION_COLLECTION_NAME, id)
    await deleteDoc(applicationDoc)
  } catch (error) {
    console.error('Error deleting application:', error)
    throw new Error('Fehler beim Löschen des Antrags')
  }
}
