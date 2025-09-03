<template>
  <div class="not-found">
    <div class="not-found-container">
      <HgCard class="not-found-card">
        <div class="not-found-content">
          <!-- 404 Illustration -->
          <div class="error-illustration">
            <div class="error-code">404</div>
            <div class="error-icon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
          </div>

          <!-- Error Message -->
          <div class="error-message">
            <h1 class="error-title">Seite nicht gefunden</h1>
            <p class="error-description">
              Die von Ihnen gesuchte Seite existiert nicht oder wurde verschoben. 
              Möglicherweise haben Sie eine veraltete URL verwendet oder sich vertippt.
            </p>
          </div>

          <!-- Suggestions -->
          <div class="suggestions">
            <h2 class="suggestions-title">Das könnten Sie stattdessen tun:</h2>
            <div class="suggestions-grid">
              <router-link 
                v-for="suggestion in suggestions" 
                :key="suggestion.id"
                :to="suggestion.route"
                class="suggestion-link"
              >
                <HgCard hover compact class="suggestion-card">
                  <div class="suggestion-icon" v-html="suggestion.icon"></div>
                  <h3 class="suggestion-title">{{ suggestion.title }}</h3>
                  <p class="suggestion-description">{{ suggestion.description }}</p>
                </HgCard>
              </router-link>
            </div>
          </div>

          <!-- Actions -->
          <div class="error-actions">
            <router-link to="/" class="btn-primary btn-large">
              Zur Startseite
            </router-link>
            <button @click="goBack" class="btn-secondary">
              Zurück
            </button>
          </div>

          <!-- Search -->
          <div class="search-section">
            <h3 class="search-title">Oder suchen Sie nach etwas Bestimmtem?</h3>
            <div class="search-input-group">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Suchbegriff eingeben..."
                class="search-input"
                @keyup.enter="performSearch"
              />
              <button @click="performSearch" class="search-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </HgCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import HgCard from '../components/HgCard.vue'

const router = useRouter()
const searchQuery = ref('')

const suggestions = [
  {
    id: 1,
    title: 'Startseite',
    description: 'Zurück zur Hauptseite unserer Alumni-Website',
    route: '/',
    icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
    </svg>`
  },
  {
    id: 2,
    title: 'Termine',
    description: 'Aktuelle Veranstaltungen und wichtige Termine',
    route: '/termine',
    icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
    </svg>`
  },
  {
    id: 3,
    title: 'Neues im Verein',
    description: 'Aktuelle Nachrichten und Berichte',
    route: '/news',
    icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>`
  },
  {
    id: 4,
    title: 'Mitglied werden',
    description: 'Treten Sie unserem Alumni-Netzwerk bei',
    route: '/mitglied-werden',
    icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>`
  }
]

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}

const performSearch = () => {
  if (searchQuery.value.trim()) {
    // TODO: Implementiere Suchfunktionalität
    console.log('Searching for:', searchQuery.value)
    // Beispiel: router.push(`/search?q=${encodeURIComponent(searchQuery.value)}`)
    
    // Vorläufig zur Startseite weiterleiten
    router.push('/')
  }
}
</script>

<style scoped>
.not-found {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.not-found-container {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.not-found-card {
  text-align: center;
}

.not-found-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl);
}

/* Error Illustration */
.error-illustration {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.error-code {
  font-size: 6rem;
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  line-height: 1;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.error-icon {
  color: var(--color-gray-400);
  opacity: 0.7;
}

/* Error Message */
.error-message {
  max-width: 500px;
  margin: 0 auto;
}

.error-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-secondary);
  margin-bottom: var(--spacing-lg);
}

.error-description {
  font-size: var(--font-size-lg);
  color: var(--color-gray-600);
  line-height: var(--line-height-relaxed);
  margin: 0;
}

/* Suggestions */
.suggestions {
  text-align: left;
}

.suggestions-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-secondary);
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
}

.suggestion-link {
  text-decoration: none;
  color: inherit;
}

.suggestion-card {
  height: 100%;
  text-align: center;
  transition: transform var(--transition-normal);
}

.suggestion-card:hover {
  transform: translateY(-2px);
}

.suggestion-icon {
  color: var(--color-primary);
  margin-bottom: var(--spacing-md);
  display: flex;
  justify-content: center;
}

.suggestion-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-secondary);
  margin-bottom: var(--spacing-sm);
}

.suggestion-description {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  line-height: var(--line-height-relaxed);
  margin: 0;
}

/* Actions */
.error-actions {
  display: flex;
  gap: var(--spacing-lg);
  justify-content: center;
  flex-wrap: wrap;
}

.btn-large {
  padding: var(--spacing-lg) var(--spacing-2xl);
  font-size: var(--font-size-lg);
}

/* Search */
.search-section {
  max-width: 400px;
  margin: 0 auto;
}

.search-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.search-input-group {
  display: flex;
  border: 2px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: border-color var(--transition-fast);
}

.search-input-group:focus-within {
  border-color: var(--color-primary);
}

.search-input {
  flex: 1;
  padding: var(--spacing-md);
  border: none;
  outline: none;
  font-size: var(--font-size-base);
  background-color: var(--color-white);
}

.search-button {
  padding: var(--spacing-md);
  background-color: var(--color-primary);
  color: var(--color-white);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--transition-fast);
}

.search-button:hover {
  background-color: var(--color-accent);
}

/* Mobile Anpassungen */
@media (max-width: 768px) {
  .error-code {
    font-size: 4rem;
  }
  
  .error-title {
    font-size: var(--font-size-2xl);
  }
  
  .error-description {
    font-size: var(--font-size-base);
  }
  
  .suggestions-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .error-code {
    font-size: 3rem;
  }
  
  .error-title {
    font-size: var(--font-size-xl);
  }
  
  .not-found-content {
    gap: var(--spacing-xl);
  }
  
  .search-input-group {
    flex-direction: column;
  }
  
  .search-button {
    padding: var(--spacing-md);
    border-radius: 0 0 var(--radius-md) var(--radius-md);
  }
}

/* Animation */
.not-found-card {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-code {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}
</style>
