import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { NewsArticle } from '../lib/types'
import { useMockData } from '../lib/firebase'

export const useNewsStore = defineStore('news', () => {
  // State
  const articles = ref<NewsArticle[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const hasMore = ref(true)
  const pageSize = 6

  // Getters
  const latestArticles = computed(() => {
    return articles.value
      .sort((a, b) => b.date.toMillis() - a.date.toMillis())
      .slice(0, 3)
  })

  const articlesByTag = computed(() => {
    const tagMap = new Map<string, NewsArticle[]>()
    
    articles.value.forEach(article => {
      article.tags?.forEach(tag => {
        if (!tagMap.has(tag)) {
          tagMap.set(tag, [])
        }
        tagMap.get(tag)!.push(article)
      })
    })
    
    return tagMap
  })

  const allTags = computed(() => {
    const tags = new Set<string>()
    articles.value.forEach(article => {
      article.tags?.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  })

  const featuredArticles = computed(() => {
    // Artikel mit Cover-Bild als "featured" betrachten
    return articles.value
      .filter(article => article.coverUrl)
      .sort((a, b) => b.date.toMillis() - a.date.toMillis())
      .slice(0, 2)
  })

  // Actions
  const fetchArticles = async (page = 1, reset = false) => {
    if (page === 1) {
      loading.value = true
    }
    error.value = null

    try {
      if (useMockData) {
        // Mock-Daten verwenden
        const { getMockNews } = await import('../lib/mockData')
        const mockNews = getMockNews()
        
        if (reset || page === 1) {
          articles.value = mockNews
          currentPage.value = 1
        } else {
          // Simuliere Paginierung
          articles.value.push(...mockNews)
        }
        
        // Mock: Keine weitere Paginierung
        hasMore.value = false
      } else {
        // TODO: Echte Firebase-Daten laden mit Paginierung
        const { getArticles } = await import('../services/news')
        const { articles: newArticles, hasMore: moreAvailable } = await getArticles(page, pageSize)
        
        if (reset || page === 1) {
          articles.value = newArticles
        } else {
          articles.value.push(...newArticles)
        }
        
        hasMore.value = moreAvailable
        currentPage.value = page
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Laden der Nachrichten'
      console.error('Error fetching articles:', err)
    } finally {
      loading.value = false
    }
  }

  const loadMore = async () => {
    if (!hasMore.value || loading.value) return
    
    const nextPage = currentPage.value + 1
    await fetchArticles(nextPage, false)
  }

  const addArticle = async (articleData: Omit<NewsArticle, 'id'>) => {
    try {
      if (useMockData) {
        // Mock: Einfach zur lokalen Liste hinzufügen
        const newArticle: NewsArticle = {
          ...articleData,
          id: `mock-${Date.now()}`
        }
        articles.value.unshift(newArticle) // Am Anfang hinzufügen
        return newArticle
      } else {
        // TODO: Artikel zu Firebase hinzufügen
        const { createArticle } = await import('../services/news')
        const newArticle = await createArticle(articleData)
        articles.value.unshift(newArticle)
        return newArticle
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Erstellen des Artikels'
      throw err
    }
  }

  const updateArticle = async (id: string, articleData: Partial<NewsArticle>) => {
    try {
      if (useMockData) {
        // Mock: Artikel in lokaler Liste aktualisieren
        const index = articles.value.findIndex(article => article.id === id)
        if (index !== -1) {
          articles.value[index] = { ...articles.value[index], ...articleData }
        }
      } else {
        // TODO: Artikel in Firebase aktualisieren
        const { updateArticle: updateFirebaseArticle } = await import('../services/news')
        await updateFirebaseArticle(id, articleData)
        
        const index = articles.value.findIndex(article => article.id === id)
        if (index !== -1) {
          articles.value[index] = { ...articles.value[index], ...articleData }
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Aktualisieren des Artikels'
      throw err
    }
  }

  const deleteArticle = async (id: string) => {
    try {
      if (useMockData) {
        // Mock: Artikel aus lokaler Liste entfernen
        articles.value = articles.value.filter(article => article.id !== id)
      } else {
        // TODO: Artikel aus Firebase löschen
        const { deleteArticle: deleteFirebaseArticle } = await import('../services/news')
        await deleteFirebaseArticle(id)
        articles.value = articles.value.filter(article => article.id !== id)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Löschen des Artikels'
      throw err
    }
  }

  const getArticleById = (id: string) => {
    return articles.value.find(article => article.id === id)
  }

  const getArticleBySlug = (slug: string) => {
    return articles.value.find(article => article.slug === slug)
  }

  const getArticlesByTag = (tag: string) => {
    return articles.value
      .filter(article => article.tags?.includes(tag))
      .sort((a, b) => b.date.toMillis() - a.date.toMillis())
  }

  const searchArticles = (query: string) => {
    const lowercaseQuery = query.toLowerCase()
    return articles.value.filter(article => 
      article.title.toLowerCase().includes(lowercaseQuery) ||
      article.excerpt.toLowerCase().includes(lowercaseQuery) ||
      article.content.toLowerCase().includes(lowercaseQuery) ||
      article.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    ).sort((a, b) => b.date.toMillis() - a.date.toMillis())
  }

  const clearError = () => {
    error.value = null
  }

  const reset = () => {
    articles.value = []
    currentPage.value = 1
    hasMore.value = true
    error.value = null
  }

  return {
    // State
    articles,
    loading,
    error,
    currentPage,
    hasMore,
    pageSize,
    
    // Getters
    latestArticles,
    articlesByTag,
    allTags,
    featuredArticles,
    
    // Actions
    fetchArticles,
    loadMore,
    addArticle,
    updateArticle,
    deleteArticle,
    getArticleById,
    getArticleBySlug,
    getArticlesByTag,
    searchArticles,
    clearError,
    reset
  }
})
