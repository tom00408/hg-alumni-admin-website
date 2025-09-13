import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MembershipApplication } from '../lib/types'


export const useMembershipStore = defineStore('membership', () => {
  // State
  const applications = ref<MembershipApplication[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const newApplications = computed(() => {
    return applications.value.filter(app => app.status === 'new')
  })

  const inProgressApplications = computed(() => {
    return applications.value.filter(app => app.status === 'in_progress')
  })

  const approvedApplications = computed(() => {
    return applications.value.filter(app => app.status === 'approved')
  })

  const rejectedApplications = computed(() => {
    return applications.value.filter(app => app.status === 'rejected')
  })

  const recentApplications = computed(() => {
    return applications.value
      .sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0))
      .slice(0, 5)
  })

  // Actions
  const fetchApplications = async () => {
    loading.value = true
    error.value = null

    try {
      const { getAllApplications } = await import('../services/membership')
      applications.value = await getAllApplications()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Laden der Mitgliedsanträge'
      console.error('Error fetching applications:', err)
      // Fallback: leere Liste für Development
      applications.value = []
    } finally {
      loading.value = false
    }
  }

  const updateApplicationStatus = async (id: string, status: 'new' | 'in_progress' | 'approved' | 'rejected') => {
    try {
      const { updateApplicationStatus: updateFirebaseStatus } = await import('../services/membership')
      await updateFirebaseStatus(id, status)
      
      const index = applications.value.findIndex(app => app.id === id)
      if (index !== -1) {
        applications.value[index].status = status
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Aktualisieren des Antrags'
      throw err
    }
  }

  const updateApplication = async (id: string, data: Partial<MembershipApplication>) => {
    try {
      const { updateApplication: updateFirebaseApplication } = await import('../services/membership')
      await updateFirebaseApplication(id, data)
      
      const index = applications.value.findIndex(app => app.id === id)
      if (index !== -1) {
        applications.value[index] = { ...applications.value[index], ...data }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Aktualisieren des Antrags'
      throw err
    }
  }

  const deleteApplication = async (id: string) => {
    try {
      const { deleteApplication: deleteFirebaseApplication } = await import('../services/membership')
      await deleteFirebaseApplication(id)
      applications.value = applications.value.filter(app => app.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Löschen des Antrags'
      throw err
    }
  }

  const getApplicationById = (id: string) => {
    return applications.value.find(app => app.id === id)
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    applications,
    loading,
    error,
    
    // Getters
    newApplications,
    inProgressApplications,
    approvedApplications,
    rejectedApplications,
    recentApplications,
    
    // Actions
    fetchApplications,
    updateApplicationStatus,
    updateApplication,
    deleteApplication,
    getApplicationById,
    clearError
  }
})
