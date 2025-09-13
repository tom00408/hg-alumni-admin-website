import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Member } from '../lib/types'

export const useMembersStore = defineStore('members', () => {
  // State
  const members = ref<Member[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const activeMembers = computed(() => {
    return members.value.filter(member => member.status === 'active')
  })

  const inactiveMembers = computed(() => {
    return members.value.filter(member => member.status === 'inactive')
  })

  const suspendedMembers = computed(() => {
    return members.value.filter(member => member.status === 'suspended')
  })

  const recentMembers = computed(() => {
    return members.value
      .sort((a, b) => {
        if (!a.memberSince || !b.memberSince) return 0
        return b.memberSince.toMillis() - a.memberSince.toMillis()
      })
      .slice(0, 5)
  })

  const totalMembers = computed(() => members.value.length)

  // Actions
  const fetchMembers = async () => {
    loading.value = true
    error.value = null
    
    try {
      const { getAllMembers } = await import('../services/membership')
      members.value = await getAllMembers()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Laden der Mitglieder'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateMemberStatus = async (id: string, status: 'active' | 'inactive' | 'suspended') => {
    try {
      const { updateMemberStatus: updateFirebaseStatus } = await import('../services/membership')
      await updateFirebaseStatus(id, status)
      
      const index = members.value.findIndex(member => member.id === id)
      if (index !== -1) {
        members.value[index].status = status
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Aktualisieren des Mitgliedsstatus'
      throw err
    }
  }

  const updateMember = async (id: string, data: Partial<Member>) => {
    try {
      const { updateMember: updateFirebaseMember } = await import('../services/membership')
      await updateFirebaseMember(id, data)
      
      const index = members.value.findIndex(member => member.id === id)
      if (index !== -1) {
        members.value[index] = { ...members.value[index], ...data }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Aktualisieren des Mitglieds'
      throw err
    }
  }

  const deleteMember = async (id: string) => {
    try {
      const { deleteMember: deleteFirebaseMember } = await import('../services/membership')
      await deleteFirebaseMember(id)
      members.value = members.value.filter(member => member.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Löschen des Mitglieds'
      throw err
    }
  }

  const getMemberById = (id: string) => {
    return members.value.find(member => member.id === id)
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    members,
    loading,
    error,
    
    // Getters
    activeMembers,
    inactiveMembers,
    suspendedMembers,
    recentMembers,
    totalMembers,
    
    // Actions
    fetchMembers,
    updateMemberStatus,
    updateMember,
    deleteMember,
    getMemberById,
    clearError
  }
})
