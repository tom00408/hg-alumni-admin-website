import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit, 
  where,
  Timestamp 
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Event } from '../lib/types'

const COLLECTION_NAME = 'events'

/**
 * Alle Events aus Firestore laden
 */
export const getAllEvents = async (): Promise<Event[]> => {
  try {
    const eventsCollection = collection(db, COLLECTION_NAME)
    const q = query(eventsCollection, orderBy('date', 'asc'))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Event[]
  } catch (error) {
    console.error('Error fetching events:', error)
    throw new Error('Fehler beim Laden der Events')
  }
}

/**
 * Kommende Events laden
 */
export const getUpcomingEvents = async (limitCount = 10): Promise<Event[]> => {
  try {
    const eventsCollection = collection(db, COLLECTION_NAME)
    const now = Timestamp.now()
    
    const q = query(
      eventsCollection,
      where('date', '>=', now),
      orderBy('date', 'asc'),
      limit(limitCount)
    )
    
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Event[]
  } catch (error) {
    console.error('Error fetching upcoming events:', error)
    throw new Error('Fehler beim Laden der kommenden Events')
  }
}

/**
 * Vergangene Events laden
 */
export const getPastEvents = async (limitCount = 10): Promise<Event[]> => {
  try {
    const eventsCollection = collection(db, COLLECTION_NAME)
    const now = Timestamp.now()
    
    const q = query(
      eventsCollection,
      where('date', '<', now),
      orderBy('date', 'desc'),
      limit(limitCount)
    )
    
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Event[]
  } catch (error) {
    console.error('Error fetching past events:', error)
    throw new Error('Fehler beim Laden der vergangenen Events')
  }
}

/**
 * Featured Events laden
 */
export const getFeaturedEvents = async (): Promise<Event[]> => {
  try {
    const eventsCollection = collection(db, COLLECTION_NAME)
    const now = Timestamp.now()
    
    const q = query(
      eventsCollection,
      where('isFeatured', '==', true),
      where('date', '>=', now),
      orderBy('date', 'asc')
    )
    
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Event[]
  } catch (error) {
    console.error('Error fetching featured events:', error)
    throw new Error('Fehler beim Laden der hervorgehobenen Events')
  }
}

/**
 * Event by ID laden
 */
export const getEventById = async (id: string): Promise<Event | null> => {
  try {
    const eventDoc = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(eventDoc)
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Event
    } else {
      return null
    }
  } catch (error) {
    console.error('Error fetching event by ID:', error)
    throw new Error('Fehler beim Laden des Events')
  }
}

/**
 * Neues Event erstellen
 */
export const createEvent = async (eventData: Omit<Event, 'id'>): Promise<Event> => {
  try {
    const eventsCollection = collection(db, COLLECTION_NAME)
    
    const eventWithTimestamp = {
      ...eventData,
      createdAt: Timestamp.now()
    }
    
    const docRef = await addDoc(eventsCollection, eventWithTimestamp)
    
    return {
      id: docRef.id,
      ...eventWithTimestamp
    } as Event
  } catch (error) {
    console.error('Error creating event:', error)
    throw new Error('Fehler beim Erstellen des Events')
  }
}

/**
 * Event aktualisieren
 */
export const updateEvent = async (id: string, eventData: Partial<Event>): Promise<void> => {
  try {
    const eventDoc = doc(db, COLLECTION_NAME, id)
    
    // ID und createdAt sollten nicht aktualisiert werden
    const { id: _, createdAt, ...updateData } = eventData
    
    await updateDoc(eventDoc, updateData)
  } catch (error) {
    console.error('Error updating event:', error)
    throw new Error('Fehler beim Aktualisieren des Events')
  }
}

/**
 * Event löschen
 */
export const deleteEvent = async (id: string): Promise<void> => {
  try {
    const eventDoc = doc(db, COLLECTION_NAME, id)
    await deleteDoc(eventDoc)
  } catch (error) {
    console.error('Error deleting event:', error)
    throw new Error('Fehler beim Löschen des Events')
  }
}
