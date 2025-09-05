<template>
  <header class="header">
    <div class="header__content">
      <!-- Mobile Menu Button -->
      <button 
        class="menu-button"
        :class="{ 'menu-button--active': sidebarOpen }"
        @click="$emit('toggle-sidebar')"
        :aria-label="sidebarOpen ? 'Menü schließen' : 'Menü öffnen'"
      >
        <span class="hamburger" :class="{ 'hamburger--active': sidebarOpen }">
          <span class="hamburger__line"></span>
          <span class="hamburger__line"></span>
          <span class="hamburger__line"></span>
        </span>
      </button>

      <!-- Mobile Logo -->
      <div class="header__logo">
        <div class="logo-circle">
          <span class="logo-text">HG</span>
        </div>
        <span class="header__title">ADMIN</span>
      </div>

      <!-- User Actions -->
      <div class="header__actions">
        <div v-if="authStore.isAuthenticated" class="user-menu">
          <div class="user-info">
            <span class="user-name">{{ authStore.userName }}</span>
          </div>
          <button 
            class="logout-button"
            @click="handleLogout"
            :disabled="authStore.isLoading"
            title="Abmelden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth'

interface Props {
  sidebarOpen?: boolean
}

withDefaults(defineProps<Props>(), {
  sidebarOpen: false
})

defineEmits<{
  'toggle-sidebar': []
}>()

const authStore = useAuthStore()

const handleLogout = async (): Promise<void> => {
  try {
    await authStore.signOut()
    // Nach Abmeldung wird automatisch die Login-Seite angezeigt (durch App.vue)
  } catch (error) {
    console.error('Logout fehlgeschlagen:', error)
  }
}
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-height);
  background-color: var(--color-white);
  border-bottom: 1px solid var(--color-gray-200);
  z-index: 998;
  display: block;
}

.header__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 var(--spacing-lg);
}

.menu-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  background: none;
  cursor: pointer;
  padding: 0;
  border-radius: var(--radius-md);
  transition: background-color var(--transition-fast);
}

.menu-button:hover {
  background-color: var(--color-gray-100);
}

.menu-button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.hamburger {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 20px;
  height: 16px;
}

.hamburger__line {
  width: 100%;
  height: 2px;
  background-color: var(--color-secondary);
  border-radius: 1px;
  transition: all var(--transition-fast);
}

.header__logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
  justify-content: center;
  margin-left: -44px; /* Kompensiert den Menu-Button für echte Zentrierung */
}

.logo-circle {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-text {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
  color: var(--color-white);
}

.header__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-secondary);
}

.header__actions {
  min-width: 44px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.user-info {
  display: none;
}

.user-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-secondary);
}

.logout-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}

.logout-button:hover {
  background-color: var(--color-red-50);
  color: var(--color-red-600);
}

.logout-button:focus-visible {
  outline: 2px solid var(--color-red-500);
  outline-offset: 2px;
}

.logout-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Desktop: Mehr Platz für User Info */
@media (min-width: 480px) {
  .user-info {
    display: block;
  }
  
  .header__actions {
    min-width: auto;
  }
}

/* Desktop: Header verstecken */
@media (min-width: 1024px) {
  .header {
    display: none;
  }
}

/* Animationen für den Hamburger */
.menu-button:hover .hamburger__line:nth-child(1):not(.hamburger--active .hamburger__line) {
  transform: translateY(-1px);
}

.menu-button:hover .hamburger__line:nth-child(3):not(.hamburger--active .hamburger__line) {
  transform: translateY(1px);
}

.menu-button:active .hamburger__line {
  transform: scale(0.9);
}

/* Burger-Menü aktiver Zustand */
.hamburger--active .hamburger__line:nth-child(1) {
  transform: translateY(6px) rotate(45deg);
}

.hamburger--active .hamburger__line:nth-child(2) {
  opacity: 0;
  transform: scaleX(0);
}

.hamburger--active .hamburger__line:nth-child(3) {
  transform: translateY(-6px) rotate(-45deg);
}

.menu-button--active {
  background-color: var(--color-gray-100);
}
</style>
