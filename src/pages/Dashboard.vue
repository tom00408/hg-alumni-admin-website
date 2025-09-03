<template>
  <div class="dashboard">
    <div class="dashboard-header mb-8">
      <h1>Dashboard</h1>
      <p class="text-lg text-gray-600">Willkommen zurück! Hier ist eine Übersicht über deinen Alumni-Verein.</p>
    </div>

    <!-- Statistiken Cards -->
    <div class="stats-grid mb-8">
      <div class="stat-card">
        <div class="stat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5" />
          </svg>
        </div>
        <div class="stat-content">
          <h3>{{ eventsStore.upcomingEvents.length }}</h3>
          <p>Kommende Termine</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 1 2.25 2.25h13.5M6 7.5h3v4.5H6v-4.5Z" />
          </svg>
        </div>
        <div class="stat-content">
          <h3>{{ newsStore.articles.length }}</h3>
          <p>Veröffentlichte News</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
        </div>
        <div class="stat-content">
          <h3>{{ galleryStore.images.length }}</h3>
          <p>Bilder in Galerie</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
          </svg>
        </div>
        <div class="stat-content">
          <h3>{{ membershipStore.applications.length }}</h3>
          <p>Mitgliedsanträge</p>
        </div>
      </div>
    </div>

    <!-- Schnellaktionen -->
    <div class="quick-actions mb-8">
      <h2 class="mb-4">Schnellaktionen</h2>
      <div class="actions-grid">
        <router-link to="/termine" class="action-card">
          <div class="action-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <h3>Neuen Termin erstellen</h3>
          <p>Füge einen neuen Event zum Kalender hinzu</p>
        </router-link>

        <router-link to="/news" class="action-card">
          <div class="action-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <h3>News-Artikel verfassen</h3>
          <p>Schreibe einen neuen Artikel für die Community</p>
        </router-link>

        <router-link to="/galerie" class="action-card">
          <div class="action-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <h3>Bilder hochladen</h3>
          <p>Füge neue Bilder zur Galerie hinzu</p>
        </router-link>
      </div>
    </div>

    <!-- Aktuelle Aktivitäten -->
    <div class="activity-section">
      <div class="activity-grid">
        <!-- Nächste Events -->
        <div class="activity-card">
          <div class="activity-header">
            <h3>Nächste Termine</h3>
            <router-link to="/termine" class="view-all-link">Alle anzeigen</router-link>
          </div>
          <div class="activity-content">
            <div v-if="eventsStore.loading" class="loading">
              Lade Termine...
            </div>
            <div v-else-if="eventsStore.nextUpcomingEvents.length === 0" class="empty-state">
              <p>Keine kommenden Termine</p>
              <router-link to="/termine" class="btn-primary">Termin erstellen</router-link>
            </div>
            <div v-else class="events-list">
              <div 
                v-for="event in eventsStore.nextUpcomingEvents" 
                :key="event.id"
                class="event-item"
              >
                <div class="event-date">
                  <span class="day">{{ formatDay(event.date.toDate()) }}</span>
                  <span class="month">{{ formatMonth(event.date.toDate()) }}</span>
                </div>
                <div class="event-details">
                  <h4>{{ event.title }}</h4>
                  <p v-if="event.location">{{ event.location }}</p>
                  <span class="event-time">{{ formatTime(event.date.toDate()) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Neueste News -->
        <div class="activity-card">
          <div class="activity-header">
            <h3>Neueste Artikel</h3>
            <router-link to="/news" class="view-all-link">Alle anzeigen</router-link>
          </div>
          <div class="activity-content">
            <div v-if="newsStore.loading" class="loading">
              Lade Artikel...
            </div>
            <div v-else-if="newsStore.latestArticles.length === 0" class="empty-state">
              <p>Keine Artikel vorhanden</p>
              <router-link to="/news" class="btn-primary">Artikel erstellen</router-link>
            </div>
            <div v-else class="news-list">
              <div 
                v-for="article in newsStore.latestArticles" 
                :key="article.id"
                class="news-item"
              >
                <div class="news-date">
                  {{ formatDate(article.date.toDate()) }}
                </div>
                <h4>{{ article.title }}</h4>
                <p>{{ article.excerpt }}</p>
                <div v-if="article.tags?.length" class="news-tags">
                  <span v-for="tag in article.tags.slice(0, 2)" :key="tag" class="tag">
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useEventsStore } from '../stores/events'
import { useNewsStore } from '../stores/news'
import { useGalleryStore } from '../stores/gallery'
import { useMembershipStore } from '../stores/membership'

const eventsStore = useEventsStore()
const newsStore = useNewsStore()
const galleryStore = useGalleryStore()
const membershipStore = useMembershipStore()

onMounted(async () => {
  // Daten laden für Dashboard-Statistiken
  await Promise.all([
    eventsStore.fetchEvents(),
    newsStore.fetchArticles(),
    galleryStore.fetchImages(),
    membershipStore.fetchApplications()
  ])
})

// Hilfsfunktionen für Datumsformatierung
const formatDay = (date: Date) => {
  return date.getDate().toString()
}

const formatMonth = (date: Date) => {
  return date.toLocaleDateString('de-DE', { month: 'short' })
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('de-DE', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  })
}
</script>

<style scoped>
.dashboard {
  padding: var(--spacing-xl);
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header h1 {
  color: var(--color-secondary);
  margin-bottom: var(--spacing-sm);
}

/* Statistiken */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
}

.stat-card {
  background: var(--color-white);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white);
}

.stat-icon svg {
  width: 24px;
  height: 24px;
}

.stat-content h3 {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-secondary);
  margin-bottom: var(--spacing-xs);
}

.stat-content p {
  color: var(--color-gray-600);
  margin: 0;
}

/* Schnellaktionen */
.quick-actions h2 {
  color: var(--color-secondary);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
}

.action-card {
  background: var(--color-white);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
  text-decoration: none;
  color: inherit;
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  border: 2px solid transparent;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary);
}

.action-icon {
  width: 40px;
  height: 40px;
  background: var(--color-gray-100);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  margin-bottom: var(--spacing-md);
}

.action-icon svg {
  width: 20px;
  height: 20px;
}

.action-card h3 {
  color: var(--color-secondary);
  margin-bottom: var(--spacing-sm);
}

.action-card p {
  color: var(--color-gray-600);
  margin: 0;
}

/* Aktivitäten */
.activity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: var(--spacing-xl);
}

.activity-card {
  background: var(--color-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.activity-header {
  padding: var(--spacing-lg) var(--spacing-xl);
  border-bottom: 1px solid var(--color-gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-header h3 {
  color: var(--color-secondary);
  margin: 0;
}

.view-all-link {
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.activity-content {
  padding: var(--spacing-xl);
}

.loading {
  text-align: center;
  color: var(--color-gray-500);
  padding: var(--spacing-xl);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xl);
}

.empty-state p {
  color: var(--color-gray-500);
  margin-bottom: var(--spacing-lg);
}

/* Events Liste */
.events-list {
  space-y: var(--spacing-lg);
}

.event-item {
  display: flex;
  gap: var(--spacing-lg);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  transition: background-color var(--transition-fast);
}

.event-item:hover {
  background-color: var(--color-gray-50);
}

.event-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 50px;
  padding: var(--spacing-sm);
  background: var(--color-primary);
  color: var(--color-white);
  border-radius: var(--radius-md);
  text-align: center;
}

.event-date .day {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  line-height: 1;
}

.event-date .month {
  font-size: var(--font-size-xs);
  text-transform: uppercase;
}

.event-details h4 {
  color: var(--color-secondary);
  margin-bottom: var(--spacing-xs);
}

.event-details p {
  color: var(--color-gray-600);
  margin: 0;
  font-size: var(--font-size-sm);
}

.event-time {
  color: var(--color-gray-500);
  font-size: var(--font-size-xs);
}

/* News Liste */
.news-list {
  space-y: var(--spacing-lg);
}

.news-item {
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  transition: background-color var(--transition-fast);
}

.news-item:hover {
  background-color: var(--color-gray-50);
}

.news-date {
  color: var(--color-gray-500);
  font-size: var(--font-size-xs);
  margin-bottom: var(--spacing-xs);
}

.news-item h4 {
  color: var(--color-secondary);
  margin-bottom: var(--spacing-sm);
}

.news-item p {
  color: var(--color-gray-600);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-sm);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-tags {
  display: flex;
  gap: var(--spacing-xs);
}

.tag {
  background: var(--color-gray-100);
  color: var(--color-gray-600);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard {
    padding: var(--spacing-lg);
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .activity-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-md);
  }
}
</style>
