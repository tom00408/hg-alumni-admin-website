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
  // startAfter,
  Timestamp 
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { NewsArticle } from '../lib/types'

const COLLECTION_NAME = 'news'

/**
 * Artikel mit Paginierung laden
 */
export const getArticles = async (_page = 1, pageSize = 6): Promise<{
  articles: NewsArticle[]
  hasMore: boolean
}> => {
  try {
    const articlesCollection = collection(db, COLLECTION_NAME)
    
    let q = query(
      articlesCollection,
      orderBy('date', 'desc'),
      limit(pageSize + 1) // Ein Extra laden um zu prüfen ob mehr vorhanden
    )
    
    // TODO: Implementiere Cursor-basierte Paginierung für bessere Performance
    // if (page > 1) {
    //   const lastDoc = await getLastDocumentFromPreviousPage(page - 1, pageSize)
    //   q = query(q, startAfter(lastDoc))
    // }
    
    const querySnapshot = await getDocs(q)
    const articles = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as NewsArticle[]
    
    const hasMore = articles.length > pageSize
    if (hasMore) {
      articles.pop() // Entferne das Extra-Element
    }
    
    return { articles, hasMore }
  } catch (error) {
    console.error('Error fetching articles:', error)
    throw new Error('Fehler beim Laden der Artikel')
  }
}

/**
 * Alle Artikel laden
 */
export const getAllArticles = async (): Promise<NewsArticle[]> => {
  try {
    const articlesCollection = collection(db, COLLECTION_NAME)
    const q = query(articlesCollection, orderBy('date', 'desc'))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as NewsArticle[]
  } catch (error) {
    console.error('Error fetching all articles:', error)
    throw new Error('Fehler beim Laden der Artikel')
  }
}

/**
 * Artikel by ID laden
 */
export const getArticleById = async (id: string): Promise<NewsArticle | null> => {
  try {
    const articleDoc = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(articleDoc)
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as NewsArticle
    } else {
      return null
    }
  } catch (error) {
    console.error('Error fetching article by ID:', error)
    throw new Error('Fehler beim Laden des Artikels')
  }
}

/**
 * Artikel by Slug laden
 */
export const getArticleBySlug = async (_slug: string): Promise<NewsArticle | null> => {
  try {
    const articlesCollection = collection(db, COLLECTION_NAME)
    const q = query(articlesCollection, limit(1))
    // TODO: Implementiere korrekte Slug-Suche mit where() statt orderBy()
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      return {
        id: doc.id,
        ...doc.data()
      } as NewsArticle
    } else {
      return null
    }
  } catch (error) {
    console.error('Error fetching article by slug:', error)
    throw new Error('Fehler beim Laden des Artikels')
  }
}

/**
 * Neuen Artikel erstellen
 */
export const createArticle = async (articleData: Omit<NewsArticle, 'id'>): Promise<NewsArticle> => {
  try {
    const articlesCollection = collection(db, COLLECTION_NAME)
    
    const articleWithTimestamp = {
      ...articleData,
      createdAt: Timestamp.now()
    }
    
    const docRef = await addDoc(articlesCollection, articleWithTimestamp)
    
    return {
      id: docRef.id,
      ...articleWithTimestamp
    } as NewsArticle
  } catch (error) {
    console.error('Error creating article:', error)
    throw new Error('Fehler beim Erstellen des Artikels')
  }
}

/**
 * Artikel aktualisieren
 */
export const updateArticle = async (id: string, articleData: Partial<NewsArticle>): Promise<void> => {
  try {
    const articleDoc = doc(db, COLLECTION_NAME, id)
    
    // ID und createdAt sollten nicht aktualisiert werden
    const { id: _, createdAt, ...updateData } = articleData
    
    await updateDoc(articleDoc, updateData)
  } catch (error) {
    console.error('Error updating article:', error)
    throw new Error('Fehler beim Aktualisieren des Artikels')
  }
}

/**
 * Artikel löschen
 */
export const deleteArticle = async (id: string): Promise<void> => {
  try {
    const articleDoc = doc(db, COLLECTION_NAME, id)
    await deleteDoc(articleDoc)
  } catch (error) {
    console.error('Error deleting article:', error)
    throw new Error('Fehler beim Löschen des Artikels')
  }
}
