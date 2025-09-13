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
import type { MembershipApplication, Member } from '../lib/types'

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

/**
 * Mitglied erstellen aus genehmigtem Antrag
 */
export const createMemberFromApplication = async (application: MembershipApplication): Promise<Member> => {
  try {
    // Mitgliedsnummer generieren (z.B. ALU-2024-001)
    const year = new Date().getFullYear()
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    const membershipNumber = `ALU-${year}-${randomNum}`
    
    const memberData: Omit<Member, 'id'> = {
      salutation: application.salutation,
      firstName: application.firstName,
      lastName: application.lastName,
      address: application.address,
      postalCode: application.postalCode,
      city: application.city,
      birthDate: application.birthDate,
      occupation: application.occupation,
      email: application.email,
      iban: application.iban,
      bic: application.bic,
      schoolFrom: application.schoolFrom,
      schoolTo: application.schoolTo,
      memberSince: Timestamp.now(),
      membershipNumber,
      status: 'active',
      applicationId: application.id
    }
    
    const membersCollection = collection(db, MEMBER_COLLECTION_NAME)
    const docRef = await addDoc(membersCollection, memberData)
    
    return {
      id: docRef.id,
      ...memberData
    }
  } catch (error) {
    console.error('Error creating member from application:', error)
    throw new Error('Fehler beim Erstellen des Mitglieds')
  }
}

/**
 * Alle Mitglieder abrufen
 */
export const getAllMembers = async (): Promise<Member[]> => {
  try {
    const membersCollection = collection(db, MEMBER_COLLECTION_NAME)
    const q = query(membersCollection, orderBy('memberSince', 'desc'))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Member[]
  } catch (error) {
    console.error('Error fetching all members:', error)
    throw new Error('Fehler beim Laden der Mitglieder')
  }
}

/**
 * Mitglied-Status aktualisieren
 */
export const updateMemberStatus = async (id: string, status: 'active' | 'inactive' | 'suspended'): Promise<void> => {
  try {
    const memberDoc = doc(db, MEMBER_COLLECTION_NAME, id)
    await updateDoc(memberDoc, { status })
  } catch (error) {
    console.error('Error updating member status:', error)
    throw new Error('Fehler beim Aktualisieren des Mitgliedsstatus')
  }
}

/**
 * Mitglied aktualisieren
 */
export const updateMember = async (id: string, data: Partial<Member>): Promise<void> => {
  try {
    const memberDoc = doc(db, MEMBER_COLLECTION_NAME, id)
    await updateDoc(memberDoc, data as any)
  } catch (error) {
    console.error('Error updating member:', error)
    throw new Error('Fehler beim Aktualisieren des Mitglieds')
  }
}

/**
 * Mitglied löschen
 */
export const deleteMember = async (id: string): Promise<void> => {
  try {
    const memberDoc = doc(db, MEMBER_COLLECTION_NAME, id)
    await deleteDoc(memberDoc)
  } catch (error) {
    console.error('Error deleting member:', error)
    throw new Error('Fehler beim Löschen des Mitglieds')
  }
}
