import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import type { Admin, LoginCredentials } from '../lib/types'

class AuthService {
  /**
   * Benutzer anmelden
   */
  async signIn(credentials: LoginCredentials): Promise<Admin> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        credentials.email, 
        credentials.password
      )
      
      const admin = await this.createAdminFromFirebaseUser(userCredential.user)
      
      if (!admin.isAdmin) {
        await this.signOut()
        throw new Error('Zugriff verweigert. Sie haben keine Administrator-Berechtigung.')
      }
      
      return admin
    } catch (error) {
      console.error('Anmeldefehler:', error)
      if (error instanceof Error) {
        throw new Error(this.getGermanErrorMessage(error.message))
      }
      throw new Error('Ein unbekannter Fehler ist aufgetreten.')
    }
  }

  /**
   * Benutzer abmelden
   */
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      console.error('Abmeldefehler:', error)
      throw new Error('Fehler beim Abmelden')
    }
  }

  /**
   * Aktuellen Benutzer abrufen
   */
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser
  }

  /**
   * Auth State Changes überwachen
   */
  onAuthStateChanged(callback: (admin: Admin | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const admin = await this.createAdminFromFirebaseUser(firebaseUser)
          callback(admin)
        } catch (error) {
          console.error('Fehler beim Laden der Admin-Daten:', error)
          callback(null)
        }
      } else {
        callback(null)
      }
    })
  }

  /**
   * Admin-Objekt aus Firebase User erstellen
   */
  private async createAdminFromFirebaseUser(firebaseUser: FirebaseUser): Promise<Admin> {
    try {
      // Admin-Status aus Firestore abrufen
      const userDoc = await getDoc(doc(db, 'admins', firebaseUser.uid))
      const isAdmin = userDoc.exists() && userDoc.data()?.isAdmin === true

      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        isAdmin,
        displayName: firebaseUser.displayName || undefined,
        photoURL: firebaseUser.photoURL || undefined
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Admin-Berechtigung:', error)
      
      // Fallback: Benutzer ist nicht Admin wenn Firestore-Zugriff fehlschlägt
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        isAdmin: false,
        displayName: firebaseUser.displayName || undefined,
        photoURL: firebaseUser.photoURL || undefined
      }
    }
  }

  /**
   * Überprüfen ob Benutzer Admin ist
   */
  async checkAdminStatus(uid: string): Promise<boolean> {
    try {
      const userDoc = await getDoc(doc(db, 'admins', uid))
      return userDoc.exists() && userDoc.data()?.isAdmin === true
    } catch (error) {
      console.error('Fehler beim Überprüfen des Admin-Status:', error)
      // Bei Firestore-Fehlern ist der Benutzer standardmäßig kein Admin
      return false
    }
  }

  /**
   * Deutsche Fehlermeldungen
   */
  private getGermanErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, string> = {
      'auth/user-not-found': 'Benutzer nicht gefunden.',
      'auth/wrong-password': 'Falsches Passwort.',
      'auth/invalid-email': 'Ungültige E-Mail-Adresse.',
      'auth/user-disabled': 'Benutzerkonto wurde deaktiviert.',
      'auth/too-many-requests': 'Zu viele fehlgeschlagene Anmeldeversuche. Versuchen Sie es später erneut.',
      'auth/network-request-failed': 'Netzwerkfehler. Überprüfen Sie Ihre Internetverbindung.',
      'auth/invalid-credential': 'Ungültige Anmeldedaten.'
    }

    // Überprüfe ob der Error Code in unserer Liste ist
    for (const [code, message] of Object.entries(errorMessages)) {
      if (errorCode.includes(code)) {
        return message
      }
    }

    return 'Anmeldefehler. Überprüfen Sie Ihre Angaben und versuchen Sie es erneut.'
  }
}

export const authService = new AuthService()
