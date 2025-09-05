<template>
  <div class="news-page">
    <div class="page-header">
      <div class="header-content">
        <h1>News verwalten</h1>
        <p>Erstelle und verwalte Artikel für den Alumni-Verein</p>
      </div>
      <button @click="showCreateModal = true" class="btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Neuen Artikel erstellen
      </button>
    </div>

    <!-- Filter und Suche -->
    <div class="filters-section">
      <div class="filters-grid">
        <div class="search-box">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Artikel suchen..."
          />
        </div>
        <div class="filter-controls">
          <select v-model="selectedTag" class="filter-select">
            <option value="">Alle Tags</option>
            <option v-for="tag in newsStore.allTags" :key="tag" :value="tag">
              {{ tag }}
            </option>
          </select>
          <select v-model="sortBy" class="filter-select">
            <option value="date-desc">Neueste zuerst</option>
            <option value="date-asc">Älteste zuerst</option>
            <option value="title-asc">Titel A-Z</option>
            <option value="title-desc">Titel Z-A</option>
          </select>
        </div>
      </div>
    </div>

    <!-- News Liste -->
    <div class="news-section">
      <div v-if="newsStore.loading" class="loading-state">
        <div class="spinner"></div>
        <p>Lade Artikel...</p>
      </div>

      <div v-else-if="filteredArticles.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 1 2.25 2.25h13.5M6 7.5h3v4.5H6v-4.5Z" />
          </svg>
        </div>
        <h3>Keine Artikel gefunden</h3>
        <p>{{ searchQuery || selectedTag ? 'Keine Artikel entsprechen deinen Filterkriterien.' : 'Erstelle deinen ersten Artikel für den Alumni-Verein.' }}</p>
        <button @click="showCreateModal = true" class="btn-primary">
          Neuen Artikel erstellen
        </button>
      </div>

      <div v-else class="articles-grid">
        <article 
          v-for="article in filteredArticles" 
          :key="article.id"
          class="article-card"
          :class="{ 'featured': article.coverUrl }"
        >
          <!-- Cover Bild -->
          <div v-if="article.coverUrl" class="article-cover">
            <img :src="article.coverUrl" :alt="article.title" />
            <div class="cover-overlay">
              <span class="featured-badge">Mit Bild</span>
            </div>
          </div>

          <div class="article-content">
            <!-- Header mit Datum und Aktionen -->
            <div class="article-header">
              <div class="article-meta">
                <time :datetime="article.date.toDate().toISOString()">
                  {{ formatDate(article.date.toDate()) }}
                </time>
                <span class="slug">{{ article.slug }}</span>
              </div>
              <div class="article-actions">
                <button @click="editArticle(article)" class="action-btn" title="Bearbeiten">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                </button>
                <button @click="confirmDelete(article)" class="action-btn delete" title="Löschen">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916C15.75 3.42 15.23 3 14.625 3h-3.25c-.604 0-1.125.42-1.125.938v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Titel und Excerpt -->
            <h3 class="article-title">{{ article.title }}</h3>
            <p class="article-excerpt">{{ article.excerpt }}</p>

            <!-- Tags -->
            <div v-if="article.tags?.length" class="article-tags">
              <span v-for="tag in article.tags" :key="tag" class="tag">
                {{ tag }}
              </span>
            </div>

            <!-- Footer -->
            <div class="article-footer">
              <div class="word-count">
                {{ getWordCount(article.content) }} Wörter
              </div>
              <div class="read-time">
                {{ getReadTime(article.content) }} Min. Lesezeit
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>

    <!-- News-Formular Modal -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal large" @click.stop>
        <div class="modal-header">
          <h2>{{ showEditModal ? 'Artikel bearbeiten' : 'Neuen Artikel erstellen' }}</h2>
          <button @click="closeModal" class="close-btn modern-close-btn">
            <span class="close-icon">×</span>
          </button>
        </div>

        <form @submit.prevent="submitArticle" class="modal-form">
          <div class="form-group">
            <label for="title">Titel *</label>
            <input 
              id="title"
              v-model="articleForm.title" 
              type="text" 
              required
              placeholder="z.B. Alumni-Treffen 2024 war ein voller Erfolg"
            />
          </div>

          <div class="form-group">
            <label for="slug">URL-Slug *</label>
            <div class="slug-input-group">
              <input 
                id="slug"
                v-model="articleForm.slug" 
                type="text" 
                required
                placeholder="alumni-treffen-2024-erfolg"
                pattern="[a-z0-9\\-]+"
                title="Nur Kleinbuchstaben, Zahlen und Bindestriche erlaubt"
              />
              <button 
                type="button" 
                @click="articleForm.slug = generateSlug(articleForm.title)"
                class="slug-generate-btn modern-btn"
                title="Slug aus Titel generieren"
                :disabled="!articleForm.title"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="btn-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <span class="btn-text">Erneuern</span>
              </button>
            </div>
            <small>Wird aus dem Titel automatisch generiert. Nur Kleinbuchstaben, Zahlen und Bindestriche.</small>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="date">Veröffentlichungsdatum *</label>
              <input 
                id="date"
                v-model="articleForm.date" 
                type="date" 
                required
              />
            </div>
            <div class="form-group">
              <label>Cover-Bild</label>
              <ImageUpload 
                v-model="articleForm.coverUrl"
                folder="news"
                placeholder="Cover-Bild für den Artikel hochladen"
                @upload-start="isUploadingImage = true"
                @upload-complete="onImageUploadComplete"
                @upload-error="onImageUploadError"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="excerpt">Kurzbeschreibung *</label>
            <textarea 
              id="excerpt"
              v-model="articleForm.excerpt" 
              rows="3"
              required
              placeholder="Eine kurze Zusammenfassung des Artikels..."
              maxlength="300"
            ></textarea>
            <small>{{ articleForm.excerpt.length }}/300 Zeichen</small>
          </div>

          <div class="form-group">
            <label for="content">Inhalt *</label>
            <textarea 
              id="content"
              v-model="articleForm.content" 
              rows="12"
              required
              placeholder="Der vollständige Artikel-Inhalt..."
            ></textarea>
          </div>

          <div class="form-group">
            <label for="tags">Tags</label>
            <input 
              id="tags"
              v-model="tagsInput" 
              type="text" 
              placeholder="Tag 1, Tag 2, Tag 3"
              @input="updateTags"
            />
            <small>Mehrere Tags durch Komma getrennt eingeben</small>
            <div v-if="articleForm.tags.length" class="tags-preview">
              <span v-for="tag in articleForm.tags" :key="tag" class="tag-preview">
                {{ tag }}
                <button type="button" @click="removeTag(tag)" class="tag-remove">×</button>
              </span>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-secondary">
              Abbrechen
            </button>
            <button type="submit" class="btn-primary" :disabled="isSubmitting || isUploadingImage">
              <span v-if="isSubmitting">Speichert...</span>
              <span v-else-if="isUploadingImage">Bild wird hochgeladen...</span>
              <span v-else>{{ showEditModal ? 'Aktualisieren' : 'Veröffentlichen' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Lösch-Bestätigung Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal small" @click.stop>
        <div class="modal-header">
          <h2>Artikel löschen</h2>
        </div>
        <div class="modal-body">
          <p>Möchtest du den Artikel "<strong>{{ articleToDelete?.title }}</strong>" wirklich löschen?</p>
          <p class="warning">Diese Aktion kann nicht rückgängig gemacht werden.</p>
        </div>
        <div class="modal-actions">
          <button @click="showDeleteModal = false" class="btn-secondary">
            Abbrechen
          </button>
          <button @click="deleteArticle" class="btn-danger" :disabled="isSubmitting">
            <span v-if="isSubmitting">Lösche...</span>
            <span v-else>Löschen</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Timestamp } from 'firebase/firestore'
import { useNewsStore } from '../stores/news'
import type { NewsArticle } from '../lib/types'
import ImageUpload from '../components/ImageUpload.vue'

const newsStore = useNewsStore()

// Reactive state
const searchQuery = ref('')
const selectedTag = ref('')
const sortBy = ref('date-desc')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const isSubmitting = ref(false)
const isUploadingImage = ref(false)

// Form state
const articleForm = ref({
  title: '',
  slug: '',
  date: '',
  excerpt: '',
  content: '',
  coverUrl: '',
  tags: [] as string[]
})

const tagsInput = ref('')
const editingArticle = ref<NewsArticle | null>(null)
const articleToDelete = ref<NewsArticle | null>(null)

// Computed
const filteredArticles = computed(() => {
  let articles = [...newsStore.articles]

  // Tag-Filter
  if (selectedTag.value) {
    articles = articles.filter(article => 
      article.tags?.includes(selectedTag.value)
    )
  }

  // Suche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    articles = articles.filter(article => 
      article.title.toLowerCase().includes(query) ||
      article.excerpt.toLowerCase().includes(query) ||
      article.content.toLowerCase().includes(query) ||
      article.tags?.some(tag => tag.toLowerCase().includes(query))
    )
  }

  // Sortierung
  articles.sort((a, b) => {
    switch (sortBy.value) {
      case 'date-asc':
        return a.date.toMillis() - b.date.toMillis()
      case 'title-asc':
        return a.title.localeCompare(b.title)
      case 'title-desc':
        return b.title.localeCompare(a.title)
      default: // date-desc
        return b.date.toMillis() - a.date.toMillis()
    }
  })

  return articles
})

// Methods

const updateTags = () => {
  const tags = tagsInput.value
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
  
  articleForm.value.tags = [...new Set(tags)] // Duplikate entfernen
}

const removeTag = (tagToRemove: string) => {
  articleForm.value.tags = articleForm.value.tags.filter(tag => tag !== tagToRemove)
  tagsInput.value = articleForm.value.tags.join(', ')
}

const editArticle = (article: NewsArticle) => {
  editingArticle.value = article
  const articleDate = article.date.toDate()
  
  articleForm.value = {
    title: article.title,
    slug: article.slug,
    date: articleDate.toISOString().split('T')[0],
    excerpt: article.excerpt,
    content: article.content,
    coverUrl: article.coverUrl || '',
    tags: [...(article.tags || [])]
  }
  
  tagsInput.value = articleForm.value.tags.join(', ')
  showEditModal.value = true
}

const confirmDelete = (article: NewsArticle) => {
  articleToDelete.value = article
  showDeleteModal.value = true
}

const deleteArticle = async () => {
  if (!articleToDelete.value) return
  
  isSubmitting.value = true
  try {
    await newsStore.deleteArticle(articleToDelete.value.id!)
    showDeleteModal.value = false
    articleToDelete.value = null
  } catch (error) {
    console.error('Fehler beim Löschen:', error)
  } finally {
    isSubmitting.value = false
  }
}

const submitArticle = async () => {
  isSubmitting.value = true
  
  try {
    const articleDate = new Date(articleForm.value.date)
    const timestamp = Timestamp.fromDate(articleDate)
    
    const articleData: any = {
      title: articleForm.value.title,
      slug: articleForm.value.slug,
      date: timestamp,
      excerpt: articleForm.value.excerpt,
      content: articleForm.value.content,
      createdAt: Timestamp.now()
    }
    
    // Nur definierte Werte hinzufügen
    if (articleForm.value.coverUrl && articleForm.value.coverUrl.trim()) {
      articleData.coverUrl = articleForm.value.coverUrl
    }
    
    if (articleForm.value.tags.length > 0) {
      articleData.tags = articleForm.value.tags
    }
    
    if (showEditModal.value && editingArticle.value) {
      await newsStore.updateArticle(editingArticle.value.id!, articleData)
    } else {
      await newsStore.addArticle(articleData)
    }
    
    closeModal()
  } catch (error) {
    console.error('Fehler beim Speichern:', error)
  } finally {
    isSubmitting.value = false
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingArticle.value = null
  
  // Form zurücksetzen
  articleForm.value = {
    title: '',
    slug: '',
    date: new Date().toISOString().split('T')[0],
    excerpt: '',
    content: '',
    coverUrl: '',
    tags: []
  }
  tagsInput.value = ''
}

// Helper functions
const formatDate = (date: Date) => {
  return date.toLocaleDateString('de-DE', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  })
}

const getWordCount = (content: string) => {
  return content.trim().split(/\s+/).filter(word => word.length > 0).length
}

const getReadTime = (content: string) => {
  const wordsPerMinute = 200
  const wordCount = getWordCount(content)
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
}

// Slug aus Titel generieren
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[äöü]/g, (match) => ({ 'ä': 'ae', 'ö': 'oe', 'ü': 'ue' }[match] || match))
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9\s-]/g, '') // Nur Buchstaben, Zahlen, Leerzeichen und Bindestriche
    .trim()
    .replace(/\s+/g, '-') // Leerzeichen durch Bindestriche ersetzen
    .replace(/-+/g, '-') // Mehrfache Bindestriche reduzieren
    .replace(/^-|-$/g, '') // Bindestriche am Anfang/Ende entfernen
}

// Automatische Slug-Generierung beim Titel-Update
watch(() => articleForm.value.title, (newTitle) => {
  if (newTitle && (!articleForm.value.slug || articleForm.value.slug === '')) {
    articleForm.value.slug = generateSlug(newTitle)
  }
})

// Image Upload Event Handlers
const onImageUploadComplete = (result: { url: string; fileName: string }) => {
  isUploadingImage.value = false
  console.log('Bild erfolgreich hochgeladen:', result)
}

const onImageUploadError = (error: string) => {
  isUploadingImage.value = false
  console.error('Bild-Upload fehlgeschlagen:', error)
}

onMounted(() => {
  newsStore.fetchArticles()
  
  // Standard-Datum setzen
  articleForm.value.date = new Date().toISOString().split('T')[0]
})
</script>

<style scoped>
.news-page {
  padding: var(--spacing-xl);
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-xl);
}

.header-content h1 {
  color: var(--color-secondary);
  margin-bottom: var(--spacing-sm);
}

.header-content p {
  color: var(--color-gray-600);
  margin: 0;
}

.btn-primary svg {
  width: 20px;
  height: 20px;
}

/* Filter Section */
.filters-section {
  margin-bottom: var(--spacing-xl);
}

.filters-grid {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--spacing-lg);
  align-items: center;
}

.search-box {
  position: relative;
  max-width: 400px;
}

.search-box svg {
  position: absolute;
  left: var(--spacing-md);
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: var(--color-gray-400);
}

.search-box input {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-md) var(--spacing-md) 3rem;
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
}

.filter-controls {
  display: flex;
  gap: var(--spacing-md);
}

.filter-select {
  padding: var(--spacing-md) var(--spacing-lg);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  background: var(--color-white);
  font-size: var(--font-size-base);
}

/* Loading & Empty States */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-gray-200);
  border-top: 3px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-lg);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  color: var(--color-gray-300);
  margin-bottom: var(--spacing-lg);
}

.empty-icon svg {
  width: 100%;
  height: 100%;
}

.empty-state h3 {
  color: var(--color-secondary);
  margin-bottom: var(--spacing-md);
}

.empty-state p {
  color: var(--color-gray-600);
  margin-bottom: var(--spacing-xl);
  max-width: 400px;
}

/* Articles Grid */
.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: var(--spacing-xl);
}

.article-card {
  background: var(--color-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  border: 2px solid transparent;
}

.article-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.article-card.featured {
  border-color: var(--color-primary);
}

.article-cover {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.article-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-normal);
}

.article-card:hover .article-cover img {
  transform: scale(1.05);
}

.cover-overlay {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
}

.featured-badge {
  background: var(--color-primary);
  color: var(--color-white);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.article-content {
  padding: var(--spacing-xl);
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-lg);
}

.article-meta time {
  color: var(--color-gray-600);
  font-size: var(--font-size-sm);
  display: block;
  margin-bottom: var(--spacing-xs);
}

.slug {
  color: var(--color-gray-400);
  font-size: var(--font-size-xs);
  font-family: monospace;
}

.article-actions {
  display: flex;
  gap: var(--spacing-sm);

}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-gray-100);
  color: var(--color-gray-600);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-btn:hover {
  background: var(--color-gray-200);
  color: var(--color-gray-800);
}

.action-btn.delete:hover {
  background: var(--color-error);
  color: var(--color-white);
}

.action-btn svg {
  width: 18px;
  height: 18px;
}

.article-title {
  color: var(--color-secondary);
  margin-bottom: var(--spacing-md);
  line-height: var(--line-height-tight);
}

.article-excerpt {
  color: var(--color-gray-600);
  margin-bottom: var(--spacing-lg);
  line-height: var(--line-height-relaxed);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.tag {
  background: var(--color-gray-100);
  color: var(--color-gray-700);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-gray-200);
  color: var(--color-gray-500);
  font-size: var(--font-size-sm);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-lg);
}

.modal {
  background: var(--color-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal.large {
  max-width: 800px;
}

.modal.small {
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--color-gray-200);
}

.modal-header h2 {
  color: var(--color-secondary);
  margin: 0;
}

/* Modern Close Button */
.close-btn.modern-close-btn {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: var(--radius-full);
  background: var(--color-gray-200);
  color: var(--color-gray-700);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
  border: 1px solid var(--color-gray-300);
}

.close-btn.modern-close-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-red-500);
  opacity: 0;
  transition: opacity var(--transition-fast);
  border-radius: var(--radius-full);
}

.close-btn.modern-close-btn:hover {
  background: var(--color-red-50);
  color: var(--color-red-600);
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
}

.close-btn.modern-close-btn:hover::before {
  opacity: 0.1;
}

.close-btn.modern-close-btn:active {
  transform: scale(0.95);
}

.close-btn.modern-close-btn .close-icon {
  font-size: 24px;
  font-weight: 300;
  line-height: 1;
  position: relative;
  z-index: 1;
  transition: transform var(--transition-fast);
  user-select: none;
}

.close-btn.modern-close-btn:hover .close-icon {
  transform: rotate(90deg);
}

.modal-form {
  padding: var(--spacing-xl);
}

.modal-body {
  padding: var(--spacing-xl);
}

.modal-body .warning {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-md);
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-secondary);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(83, 98, 254, 0.1);
}

.form-group small {
  display: block;
  margin-top: var(--spacing-xs);
  color: var(--color-gray-500);
  font-size: var(--font-size-sm);
}

.slug-input-group {
  display: flex;
  gap: var(--spacing-xs);
}

.slug-input-group input {
  flex: 1;
}

/* Modern Slug Generate Button */
.slug-generate-btn.modern-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  height: 44px;
  background: linear-gradient(135deg, var(--color-blue-500) 0%, var(--color-blue-600) 100%);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

.slug-generate-btn.modern-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  background: linear-gradient(135deg, var(--color-blue-600) 0%, var(--color-blue-700) 100%);
}

.slug-generate-btn.modern-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

.slug-generate-btn.modern-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  background: var(--color-gray-400);
  box-shadow: none;
}

.slug-generate-btn .btn-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.slug-generate-btn .btn-text {
  white-space: nowrap;
}

/* Responsive: Hide text on small screens */
@media (max-width: 640px) {
  .slug-generate-btn .btn-text {
    display: none;
  }
  
  .slug-generate-btn.modern-btn {
    padding: var(--spacing-sm);
    width: 44px;
    justify-content: center;
  }
}

.tags-preview {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.tag-preview {
  background: var(--color-primary);
  color: var(--color-white);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.tag-remove {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: var(--font-size-lg);
  line-height: 1;
  padding: 0;
  margin-left: var(--spacing-xs);
}

.modal-actions {
  display: flex;
  gap: var(--spacing-lg);
  justify-content: flex-end;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-gray-200);
  margin-top: var(--spacing-lg);
}

.btn-danger {
  background-color: var(--color-error);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-lg);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.btn-danger:hover {
  background-color: #dc2626;
}

.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .news-page {
    padding: var(--spacing-lg);
  }
  
  .page-header {
    flex-direction: column;
    gap: var(--spacing-lg);
    align-items: stretch;
  }
  
  .filters-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-controls {
    flex-direction: column;
  }
  
  .articles-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal {
    margin: var(--spacing-md);
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>

