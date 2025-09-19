import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '../services/auth'
import type { Admin, LoginCredentials, AuthState } from '../lib/types'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<Admin | null>(null)
  const isLoading = ref(true)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.isAdmin ?? false)
  const userEmail = computed(() => user.value?.email ?? '')
  const userName = computed(() => user.value?.displayName || user.value?.email?.split('@')[0] || 'Benutzer')

  // Auth State Objekt für Template Verwendung
  const authState = computed<AuthState>(() => ({
    user: user.value,
    isAuthenticated: isAuthenticated.value,
    isLoading: isLoading.value,
    error: error.value
  }))

  // Actions
  const signIn = async (credentials: LoginCredentials): Promise<void> => {
    try {
      error.value = null
      isLoading.value = true

      const authenticatedAdmin = await authService.signIn(credentials)
      user.value = authenticatedAdmin
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Anmeldefehler'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      await authService.signOut()
      user.value = null
      error.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Abmeldefehler'
      throw err
    }
  }

  const initializeAuth = (): Promise<void> => {
    return new Promise((resolve) => {
      const unsubscribe = authService.onAuthStateChanged((authenticatedAdmin) => {
        user.value = authenticatedAdmin
        isLoading.value = false
        unsubscribe() // Nur beim ersten Mal auflösen
        resolve()
      })
    })
  }

  const clearError = (): void => {
    error.value = null
  }

  const refreshUser = async (): Promise<void> => {
    if (user.value) {
      try {
        const isAdmin = await authService.checkAdminStatus(user.value.uid)
        user.value = { ...user.value, isAdmin }
      } catch (err) {
        console.error('Fehler beim Aktualisieren der Benutzerdaten:', err)
      }
    }
  }

  // Auth State Listener für kontinuierliche Updates
  const setupAuthListener = (): (() => void) => {
    return authService.onAuthStateChanged((authenticatedAdmin) => {
      user.value = authenticatedAdmin
      if (!authenticatedAdmin) {
        error.value = null
      }
    })
  }

  return {
    // State
    user,
    isLoading,
    error,
    
    // Getters
    isAuthenticated,
    isAdmin,
    userEmail,
    userName,
    authState,
    
    // Actions
    signIn,
    signOut,
    initializeAuth,
    clearError,
    refreshUser,
    setupAuthListener
  }
})
