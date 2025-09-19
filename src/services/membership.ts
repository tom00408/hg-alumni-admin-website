import { 
  collection, 
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc, 
  query,
  orderBy,
  where,
  Timestamp,
  getDoc 
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { User, MembershipApplication, Member } from '../lib/types'
import { httpsCallable, getFunctions } from 'firebase/functions'
import { functions } from '../lib/firebase'

const USERS_COLLECTION_NAME = 'users';



/**
 * Alle User abrufen
 */
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const usersCollection = collection(db, USERS_COLLECTION_NAME)
    const q = query(usersCollection, orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    })) as User[]
  } catch (error) {
    console.error('Error fetching all users:', error)
    throw new Error('Fehler beim Laden der Benutzer')
  }
}

/**
 * User mit Antragsstatus abrufen (neue Anträge, in Bearbeitung, etc.)
 */
export const getUsersWithApplicationStatus = async (status?: 'new' | 'in_progress' | 'approved' | 'rejected'): Promise<User[]> => {
  try {
    const usersCollection = collection(db, USERS_COLLECTION_NAME)
    let q = query(usersCollection, orderBy('applicationCreatedAt', 'desc'))
    
    if (status) {
      q = query(usersCollection, where('applicationStatus', '==', status), orderBy('applicationCreatedAt', 'desc'))
    }
    
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    })) as User[]
  } catch (error) {
    console.error('Error fetching users with application status:', error)
    throw new Error('Fehler beim Laden der Benutzer mit Antragsstatus')
  }
}

/**
 * User mit Mitgliedschaftsstatus abrufen
 */
export const getUsersWithMembershipStatus = async (status?: 'pending' | 'active' | 'inactive' | 'suspended'): Promise<User[]> => {
  try {
    const usersCollection = collection(db, USERS_COLLECTION_NAME)
    let q = query(usersCollection, orderBy('memberSince', 'desc'))
    
    if (status) {
      q = query(usersCollection, where('membershipStatus', '==', status), orderBy('memberSince', 'desc'))
    }
    
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    })) as User[]
  } catch (error) {
    console.error('Error fetching users with membership status:', error)
    throw new Error('Fehler beim Laden der Benutzer mit Mitgliedschaftsstatus')
  }
}

/**
 * Angenommen E-Mail über Cloud Function senden
 */
export const sendAprovedNotification = async (email : string, firstName : string, lastName : string, membershipNumber : string, status : string): Promise<void> => {

  const data = {
    email: email,
    firstName: firstName,
    lastName: lastName,
    membershipNumber: membershipNumber,
    status: status
  }
	

  const aufnahmeBestaetigung = httpsCallable(functions, "aufnahmeBestaetigung");

  try {
    const result = await aufnahmeBestaetigung({ aufnahmeEmailData: data });
    //console.log("✅✅✅✅✅✅Mail gesendet:", result.data);
  } catch (err) {
    //console.error("❌❌❌❌❌❌Fehler beim Senden:", err);
    throw err;
  }

}


/**
 * User-Antragsstatus aktualisieren
 */
export const updateUserApplicationStatus = async (uid: string, status: 'new' | 'in_progress' | 'approved' | 'rejected'): Promise<void> => {
  try {
    // Zuerst die aktuellen User-Daten abrufen für E-Mail-Versand
    const userDocRef = doc(db, USERS_COLLECTION_NAME, uid)
    const userSnapshot = await getDoc(userDocRef)
    
    if (!userSnapshot.exists()) {
      throw new Error('Benutzer nicht gefunden')
    }
    
    const userData = userSnapshot.data() as User
    
    const updateData: any = { 
      applicationStatus: status,
      updatedAt: Timestamp.now()
    }
    
    let membershipNumber = ''
    
    // Bei Genehmigung automatisch Mitgliedschaftsdaten setzen
    if (status === 'approved') {
      const year = new Date().getFullYear()
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
      membershipNumber = `ALU-${year}-${randomNum}`
      
      updateData.memberSince = Timestamp.now()
      updateData.membershipNumber = membershipNumber
      updateData.membershipStatus = 'active'
    }
    
    // Firestore-Update durchführen
    await updateDoc(userDocRef, updateData)
    
    // E-Mail-Bestätigung senden (nur bei approved/rejected)
    if (status === 'approved' || status === 'rejected') {
      try {
        await sendAprovedNotification(userData.email, userData.firstName, userData.lastName, membershipNumber, status)
      } catch (emailError) {
        console.warn('E-Mail-Versand fehlgeschlagen, aber Statusupdate war erfolgreich:', emailError)
      }
    }
    
  } catch (error) {
    console.error('Error updating user application status:', error)
    throw new Error('Fehler beim Aktualisieren des Antragsstatus')
  }
}

/**
 * User-Mitgliedschaftsstatus aktualisieren
 */
export const updateUserMembershipStatus = async (uid: string, status: 'pending' | 'active' | 'inactive' | 'suspended'): Promise<void> => {
  try {
    const userDoc = doc(db, USERS_COLLECTION_NAME, uid)
    await updateDoc(userDoc, { 
      membershipStatus: status,
      updatedAt: Timestamp.now()
    })
  } catch (error) {
    console.error('Error updating user membership status:', error)
    throw new Error('Fehler beim Aktualisieren des Mitgliedschaftsstatus')
  }
}

/**
 * User aktualisieren
 */
export const updateUser = async (uid: string, data: Partial<User>): Promise<void> => {
  try {
    const userDoc = doc(db, USERS_COLLECTION_NAME, uid)
    await updateDoc(userDoc, { 
      ...data,
      updatedAt: Timestamp.now()
    } as any)
  } catch (error) {
    console.error('Error updating user:', error)
    throw new Error('Fehler beim Aktualisieren des Benutzers')
  }
}

/**
 * User löschen
 */
export const deleteUser = async (uid: string): Promise<void> => {
  try {
    const userDoc = doc(db, USERS_COLLECTION_NAME, uid)
    await deleteDoc(userDoc)
  } catch (error) {
    console.error('Error deleting user:', error)
    throw new Error('Fehler beim Löschen des Benutzers')
  }
}

export const getAllApplications = async (): Promise<MembershipApplication[]> => {
  try {
    // Verwende neue User-basierte Funktion und konvertiere zu Legacy-Format
    const users = await getUsersWithApplicationStatus()
    return users.map(user => ({
      id: user.uid,
      salutation: user.salutation,
      firstName: user.firstName,
      lastName: user.lastName,
      address: user.address,
      postalCode: user.postalCode,
      city: user.city,
      birthDate: user.birthDate,
      occupation: user.occupation,
      email: user.email,
      schoolFrom: user.schoolFrom,
      schoolTo: user.schoolTo,
      iban: user.iban,
      bic: user.bic,
      placeDate: user.placeDate || '',
      signature: user.signature || '',
      createdAt: user.applicationCreatedAt || user.createdAt,
      status: user.applicationStatus
    })) as MembershipApplication[]
  } catch (error) {
    console.error('Error fetching all applications:', error)
    throw new Error('Fehler beim Laden der Mitgliedsanträge')
  }
}

/**
 * Status eines Mitgliedsantrags aktualisieren (Legacy - delegiert an neue User-Funktion)
 */
export const updateApplicationStatus = async (id: string, status: 'new' | 'in_progress' | 'approved' | 'rejected'): Promise<void> => {
  try {
    await updateUserApplicationStatus(id, status)
  } catch (error) {
    console.error('Error updating application status:', error)
    throw new Error('Fehler beim Aktualisieren des Antragsstatus')
  }
}

/**
 * Mitgliedsantrag aktualisieren (Legacy - delegiert an neue User-Funktion)
 */
export const updateApplication = async (id: string, data: Partial<MembershipApplication>): Promise<void> => {
  try {
    // Konvertiere Legacy-Daten zu User-Format
    const userData: Partial<User> = {
      salutation: data.salutation,
      firstName: data.firstName,
      lastName: data.lastName,
      address: data.address,
      postalCode: data.postalCode,
      city: data.city,
      birthDate: data.birthDate,
      occupation: data.occupation,
      email: data.email,
      schoolFrom: data.schoolFrom,
      schoolTo: data.schoolTo,
      iban: data.iban,
      bic: data.bic,
      placeDate: data.placeDate,
      signature: data.signature,
      applicationStatus: data.status
    }
    
    await updateUser(id, userData)
  } catch (error) {
    console.error('Error updating application:', error)
    throw new Error('Fehler beim Aktualisieren des Antrags')
  }
}

/**
 * Mitgliedsantrag löschen (Legacy - delegiert an neue User-Funktion)
 */
export const deleteApplication = async (id: string): Promise<void> => {
  try {
    await deleteUser(id)
  } catch (error) {
    console.error('Error deleting application:', error)
    throw new Error('Fehler beim Löschen des Antrags')
  }
}

/**
 * Mitglied erstellen aus genehmigtem Antrag (Legacy - wird jetzt automatisch bei Genehmigung gemacht)
 */
export const createMemberFromApplication = async (application: MembershipApplication): Promise<Member> => {
  try {
    // Diese Funktion ist jetzt obsolet, da die Mitgliedschaft automatisch bei Genehmigung gesetzt wird
    // Aber wir behalten sie für Kompatibilität
    console.warn('createMemberFromApplication ist veraltet - Mitgliedschaft wird automatisch bei Genehmigung gesetzt')
    
    return {
      id: application.id,
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
      membershipNumber: `ALU-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      status: 'active',
      applicationId: application.id
    }
  } catch (error) {
    console.error('Error creating member from application:', error)
    throw new Error('Fehler beim Erstellen des Mitglieds')
  }
}

/**
 * Alle Mitglieder abrufen (Legacy - delegiert an neue User-Funktion)
 */
export const getAllMembers = async (): Promise<Member[]> => {
  try {
    // Verwende neue User-basierte Funktion und konvertiere zu Legacy-Format
    const users = await getUsersWithMembershipStatus()
    return users
      .filter(user => user.memberSince) // Nur User mit Mitgliedschaft
      .map(user => ({
        id: user.uid,
        salutation: user.salutation,
        firstName: user.firstName,
        lastName: user.lastName,
        address: user.address,
        postalCode: user.postalCode,
        city: user.city,
        birthDate: user.birthDate,
        occupation: user.occupation,
        email: user.email,
        iban: user.iban,
        bic: user.bic,
        schoolFrom: user.schoolFrom,
        schoolTo: user.schoolTo,
        memberSince: user.memberSince!,
        membershipNumber: user.membershipNumber!,
        status: user.membershipStatus === 'active' ? 'active' : 
                user.membershipStatus === 'inactive' ? 'inactive' : 'suspended',
        applicationId: user.uid // In der neuen Struktur ist die UID sowohl User- als auch Application-ID
      })) as Member[]
  } catch (error) {
    console.error('Error fetching all members:', error)
    throw new Error('Fehler beim Laden der Mitglieder')
  }
}

/**
 * Mitglied-Status aktualisieren (Legacy - delegiert an neue User-Funktion)
 */
export const updateMemberStatus = async (id: string, status: 'active' | 'inactive' | 'suspended'): Promise<void> => {
  try {
    await updateUserMembershipStatus(id, status)
  } catch (error) {
    console.error('Error updating member status:', error)
    throw new Error('Fehler beim Aktualisieren des Mitgliedsstatus')
  }
}

/**
 * Mitglied aktualisieren (Legacy - delegiert an neue User-Funktion)
 */
export const updateMember = async (id: string, data: Partial<Member>): Promise<void> => {
  try {
    // Konvertiere Legacy-Member-Daten zu User-Format
    const userData: Partial<User> = {
      salutation: data.salutation,
      firstName: data.firstName,
      lastName: data.lastName,
      address: data.address,
      postalCode: data.postalCode,
      city: data.city,
      birthDate: data.birthDate,
      occupation: data.occupation,
      email: data.email,
      iban: data.iban,
      bic: data.bic,
      schoolFrom: data.schoolFrom,
      schoolTo: data.schoolTo,
      memberSince: data.memberSince,
      membershipNumber: data.membershipNumber,
      membershipStatus: data.status === 'active' ? 'active' : 
                       data.status === 'inactive' ? 'inactive' : 'suspended'
    }
    
    await updateUser(id, userData)
  } catch (error) {
    console.error('Error updating member:', error)
    throw new Error('Fehler beim Aktualisieren des Mitglieds')
  }
}

/**
 * Mitglied löschen (Legacy - delegiert an neue User-Funktion)
 */
export const deleteMember = async (id: string): Promise<void> => {
  try {
    await deleteUser(id)
  } catch (error) {
    console.error('Error deleting member:', error)
    throw new Error('Fehler beim Löschen des Mitglieds')
  }
}
