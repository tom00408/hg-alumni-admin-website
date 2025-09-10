<template>
  <div class="termine-page">
    <div class="page-header">
      <div class="header-content">
        <h1>Termine verwalten</h1>
        <p>Erstelle und verwalte Events für den Alumni-Verein</p>
      </div>
      <TomButton 
        @click="showCreateModal = true" 
        title="Neuen Termin erstellen"
        icon="add"
        variant="primary"
      />
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
            placeholder="Termine suchen..."
          />
        </div>
        <select v-model="selectedFilter" class="filter-select">
          <option value="all">Alle Termine</option>
          <option value="upcoming">Kommende Termine</option>
          <option value="past">Vergangene Termine</option>
          <option value="featured">Hervorgehobene Termine</option>
        </select>
      </div>
    </div>

    <!-- Termine Liste -->
    <div class="events-section">
      <div v-if="eventsStore.loading" class="loading-state">
        <div class="spinner"></div>
        <p>Lade Termine...</p>
      </div>

      <div v-else-if="filteredEvents.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5" />
          </svg>
        </div>
        <h3>Keine Termine gefunden</h3>
        <p>{{ searchQuery ? 'Keine Termine entsprechen deiner Suche.' : 'Erstelle deinen ersten Termin für den Alumni-Verein.' }}</p>
        <TomButton 
          @click="showCreateModal = true" 
          title="Neuen Termin erstellen"
          icon="add"
          variant="primary"
        />
      </div>

      <div v-else class="events-grid">
        <div 
          v-for="event in filteredEvents" 
          :key="event.id"
          class="event-card"
          :class="{ 'featured': event.isFeatured, 'past': isPastEvent(event) }"
        >
          <div class="event-header">
            <div class="event-date-badge">
              <span class="day">{{ formatDay(event.date.toDate()) }}</span>
              <span class="month">{{ formatMonth(event.date.toDate()) }}</span>
              <span class="year">{{ event.date.toDate().getFullYear() }}</span>
            </div>
            <div class="event-actions">
              <!-- Desktop: Separate Buttons -->
              <div class="action-buttons">
                <TomButton 
                  @click="editEvent(event)" 
                  title="Event bearbeiten"
                  icon="edit"
                  variant="action"
                />
                <TomButton 
                  @click="confirmDelete(event)" 
                  title="Event löschen"
                  icon="delete"
                  variant="action-delete"
                />
              </div>

              <!-- Mobile: Dropdown Menu -->
              <div class="mobile-dropdown" :class="{ 'active': activeDropdown === event.id }">
                <TomButton 
                  @click="toggleDropdown(event.id!)" 
                  title="Aktionen"
                  icon="menu"
                  variant="action"
                />
                <div class="dropdown-menu">
                  <TomButton 
                    @click="editEvent(event); closeDropdown()" 
                    title="Bearbeiten"
                    icon="edit"
                    variant="action"
                    size="small"
                  />
                  <TomButton 
                    @click="confirmDelete(event); closeDropdown()" 
                    title="Löschen"
                    icon="delete"
                    variant="action-delete"
                    size="small"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="event-content">
            <div class="event-meta">
              <span class="event-time">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                {{ formatTime(event.date.toDate()) }}
              </span>
              <span v-if="event.location" class="event-location">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                {{ event.location }}
              </span>
            </div>

            <h3>{{ event.title }}</h3>
            
            <p v-if="event.description" class="event-description">
              {{ event.description }}
            </p>

            <div class="event-footer">
              <div class="event-badges">
                <span v-if="event.isFeatured" class="badge featured">Hervorgehoben</span>
                <span v-if="isPastEvent(event)" class="badge past">Vergangen</span>
                <span v-else class="badge upcoming">Kommend</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Event-Formular Modal -->
    <EventFormModal
      :is-visible="showCreateModal || showEditModal"
      :is-edit-mode="showEditModal"
      :editing-event="editingEvent"
      :is-submitting="isSubmitting"
      @close="closeModal"
      @submit="handleEventSubmit"
    />

    <!-- Lösch-Bestätigung Modal -->
    <EventDeleteModal
      :is-visible="showDeleteModal"
      :event-to-delete="eventToDelete"
      :is-submitting="isSubmitting"
      @close="showDeleteModal = false"
      @confirm="deleteEvent"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useEventsStore } from '../stores/events'
import type { Event } from '../lib/types'
import TomButton from '../tomponents/TomButton.vue'
import EventFormModal from '../components/EventFormModal.vue'
import EventDeleteModal from '../components/EventDeleteModal.vue'

const eventsStore = useEventsStore()

// Reactive state
const searchQuery = ref('')
const selectedFilter = ref('all')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const isSubmitting = ref(false)

// Event form removed - now handled by EventFormModal component

const editingEvent = ref<Event | null>(null)
const eventToDelete = ref<Event | null>(null)
const activeDropdown = ref<string | null>(null)

// Computed
const filteredEvents = computed(() => {
  let events = eventsStore.events

  // Filter anwenden
  switch (selectedFilter.value) {
    case 'upcoming':
      events = eventsStore.upcomingEvents
      break
    case 'past':
      events = eventsStore.pastEvents
      break
    case 'featured':
      events = eventsStore.featuredEvents
      break
    default:
      events = eventsStore.events
  }

  // Suche anwenden
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    events = events.filter(event => 
      event.title.toLowerCase().includes(query) ||
      event.location?.toLowerCase().includes(query) ||
      event.description?.toLowerCase().includes(query)
    )
  }

  return events
})

// Event handlers
const editEvent = (event: Event) => {
  editingEvent.value = event
  showEditModal.value = true
}

const confirmDelete = (event: Event) => {
  eventToDelete.value = event
  showDeleteModal.value = true
}

const deleteEvent = async () => {
  if (!eventToDelete.value) return
  
  isSubmitting.value = true
  try {
    await eventsStore.deleteEvent(eventToDelete.value.id!)
    showDeleteModal.value = false
    eventToDelete.value = null
  } catch (error) {
    console.error('Fehler beim Löschen:', error)
  } finally {
    isSubmitting.value = false
  }
}

const handleEventSubmit = async (eventData: any) => {
  isSubmitting.value = true
  
  try {
    if (showEditModal.value && editingEvent.value) {
      await eventsStore.updateEvent(editingEvent.value.id!, eventData)
    } else {
      await eventsStore.addEvent(eventData)
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
  editingEvent.value = null
}

// Helper functions
const isPastEvent = (event: Event) => {
  return event.date.toDate() < new Date()
}

const formatDay = (date: Date) => {
  return date.getDate().toString().padStart(2, '0')
}

const formatMonth = (date: Date) => {
  return date.toLocaleDateString('de-DE', { month: 'short' })
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

// Dropdown-Funktionen
const toggleDropdown = (eventId: string) => {
  if (activeDropdown.value === eventId) {
    activeDropdown.value = null
  } else {
    activeDropdown.value = eventId
  }
}

const closeDropdown = () => {
  activeDropdown.value = null
}

onMounted(() => {
  eventsStore.fetchEvents()
  
  // Dropdown schließen bei Klick außerhalb
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.mobile-dropdown')) {
      activeDropdown.value = null
    }
  })
})
</script>

<style scoped>
.termine-page {
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

/* Events Grid */
.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--spacing-xl);
}

.event-card {
  background: var(--color-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  border: 2px solid transparent;
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.event-card.featured {
  border-color: var(--color-primary);
}

.event-card.past {
  opacity: 0.7;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
}

.event-date-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-md);
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  color: var(--color-white);
  border-radius: var(--radius-lg);
  text-align: center;
  min-width: 70px;
}

.event-date-badge .day {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  line-height: 1;
}

.event-date-badge .month {
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  margin-top: var(--spacing-xs);
}

.event-date-badge .year {
  font-size: var(--font-size-xs);
  opacity: 0.9;
}

.event-actions {
  display: flex;
  gap: var(--spacing-sm);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.event-card:hover .event-actions {
  opacity: 1;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  min-height: 32px;
}

.action-btn svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.btn-text {
  display: none;
}

/* Edit Button */
.edit-btn {
  background: var(--color-blue-50);
  color: var(--color-blue-600);
  border: 1px solid var(--color-blue-200);
}

.edit-btn:hover {
  background: var(--color-blue-100);
  color: var(--color-blue-700);
  border-color: var(--color-blue-300);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.15);
}

.edit-btn:active {
  transform: translateY(0);
}

/* Delete Button */
.delete-btn {
  background: var(--color-red-50);
  color: var(--color-red-600);
  border: 1px solid var(--color-red-200);
}

.delete-btn:hover {
  background: var(--color-red-500);
  color: var(--color-white);
  border-color: var(--color-red-500);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.25);
}

.delete-btn:active {
  transform: translateY(0);
}

/* Desktop: Text anzeigen */
@media (min-width: 768px) {
  .btn-text {
    display: inline;
  }
  
  .action-btn {
    padding: var(--spacing-sm) var(--spacing-md);
  }
  
  .event-actions {
    opacity: 0.7;
  }
  
  .event-card:hover .event-actions {
    opacity: 1;
  }
}

/* Mobile Dropdown Styles */
.mobile-dropdown {
  position: relative;
  display: none;
}

.dropdown-trigger {
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

.dropdown-trigger:hover {
  background: var(--color-gray-200);
  color: var(--color-gray-800);
}

.dropdown-trigger svg {
  width: 20px;
  height: 20px;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 50;
  min-width: 140px;
  overflow: hidden;
  opacity: 0;
  transform: translateY(-10px);
  pointer-events: none;
  transition: all var(--transition-fast);
}

.mobile-dropdown.active .dropdown-menu {
  opacity: 1;
  transform: translateY(0);
  pointer-events: all;
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  transition: background-color var(--transition-fast);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.dropdown-item svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.dropdown-item.edit-item {
  color: var(--color-blue-600);
}

.dropdown-item.edit-item:hover {
  background: var(--color-blue-50);
  color: var(--color-blue-700);
}

.dropdown-item.delete-item {
  color: var(--color-red-600);
}

.dropdown-item.delete-item:hover {
  background: var(--color-red-50);
  color: var(--color-red-700);
}

/* Responsive Behavior */
@media (min-width: 768px) {
  .action-buttons {
    display: flex;
    gap: var(--spacing-sm);
  }
  
  .mobile-dropdown {
    display: none;
  }
  
  .btn-text {
    display: inline;
  }
  
  .action-btn {
    padding: var(--spacing-sm) var(--spacing-md);
  }
  
  .event-actions {
    opacity: 0.7;
  }
  
  .event-card:hover .event-actions {
    opacity: 1;
  }
}

@media (max-width: 767px) {
  .action-buttons {
    display: none;
  }
  
  .mobile-dropdown {
    display: block;
  }
  
  .event-actions {
    opacity: 1;
  }
}

.event-content {
  padding: 0 var(--spacing-xl) var(--spacing-xl);
}

.event-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  color: var(--color-gray-600);
  font-size: var(--font-size-sm);
}

.event-time,
.event-location {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.event-time svg,
.event-location svg {
  width: 16px;
  height: 16px;
}

.event-content h3 {
  color: var(--color-secondary);
  margin-bottom: var(--spacing-md);
}

.event-description {
  color: var(--color-gray-600);
  margin-bottom: var(--spacing-lg);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.event-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.event-badges {
  display: flex;
  gap: var(--spacing-sm);
}

.badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.badge.featured {
  background: var(--color-primary);
  color: var(--color-white);
}

.badge.upcoming {
  background: var(--color-success);
  color: var(--color-white);
}

.badge.past {
  background: var(--color-gray-300);
  color: var(--color-gray-700);
}

/* Modal styles moved to separate components */

/* Responsive */
@media (max-width: 768px) {
  .termine-page {
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
  
  .events-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
