import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "apiKey",
  authDomain: "authDomain",
  projectId: "projectId",
  storageBucket: "storageBucket",
  messagingSenderId: "messagingSenderId",
  appId: "appId"
}

// Firebase App initialisieren
export const app = initializeApp(firebaseConfig)

// Firestore Database
export const db = getFirestore(app)

// Storage
export const storage = getStorage(app)

// Authentication
export const auth = getAuth(app)
