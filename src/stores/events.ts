import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Event } from '../lib/types'
import { useMockData } from '../lib/firebase'

export const useEventsStore = defineStore('events', () => {
  // State
  const events = ref<Event[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const upcomingEvents = computed(() => {
    const now = new Date()
    return events.value
      .filter(event => event.date.toDate() >= now)
      .sort((a, b) => a.date.toMillis() - b.date.toMillis())
  })

  const pastEvents = computed(() => {
    const now = new Date()
    return events.value
      .filter(event => event.date.toDate() < now)
      .sort((a, b) => b.date.toMillis() - a.date.toMillis())
  })

  const featuredEvents = computed(() => {
    return upcomingEvents.value.filter(event => event.isFeatured)
  })

  const nextUpcomingEvents = computed(() => {
    return upcomingEvents.value.slice(0, 3)
  })

  // Actions
  const fetchEvents = async () => {
    loading.value = true
    error.value = null

    try {
      if (useMockData) {
        // Mock-Daten verwenden
        const { getMockEvents } = await import('../lib/mockData')
        events.value = getMockEvents()
      } else {
        // TODO: Echte Firebase-Daten laden
        const { getAllEvents } = await import('../services/events')
        events.value = await getAllEvents()
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Laden der Termine'
      console.error('Error fetching events:', err)
    } finally {
      loading.value = false
    }
  }

  const addEvent = async (eventData: Omit<Event, 'id'>) => {
    try {
      if (useMockData) {
        // Mock: Einfach zur lokalen Liste hinzufügen
        const newEvent: Event = {
          ...eventData,
          id: `mock-${Date.now()}`
        }
        events.value.push(newEvent)
        return newEvent
      } else {
        // TODO: Event zu Firebase hinzufügen
        const { createEvent } = await import('../services/events')
        const newEvent = await createEvent(eventData)
        events.value.push(newEvent)
        return newEvent
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Erstellen des Termins'
      throw err
    }
  }

  const updateEvent = async (id: string, eventData: Partial<Event>) => {
    try {
      if (useMockData) {
        // Mock: Event in lokaler Liste aktualisieren
        const index = events.value.findIndex(event => event.id === id)
        if (index !== -1) {
          events.value[index] = { ...events.value[index], ...eventData }
        }
      } else {
        // TODO: Event in Firebase aktualisieren
        const { updateEvent: updateFirebaseEvent } = await import('../services/events')
        await updateFirebaseEvent(id, eventData)
        
        const index = events.value.findIndex(event => event.id === id)
        if (index !== -1) {
          events.value[index] = { ...events.value[index], ...eventData }
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Aktualisieren des Termins'
      throw err
    }
  }

  const deleteEvent = async (id: string) => {
    try {
      if (useMockData) {
        // Mock: Event aus lokaler Liste entfernen
        events.value = events.value.filter(event => event.id !== id)
      } else {
        // TODO: Event aus Firebase löschen
        const { deleteEvent: deleteFirebaseEvent } = await import('../services/events')
        await deleteFirebaseEvent(id)
        events.value = events.value.filter(event => event.id !== id)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Löschen des Termins'
      throw err
    }
  }

  const getEventById = (id: string) => {
    return events.value.find(event => event.id === id)
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    events,
    loading,
    error,
    
    // Getters
    upcomingEvents,
    pastEvents,
    featuredEvents,
    nextUpcomingEvents,
    
    // Actions
    fetchEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventById,
    clearError
  }
})
