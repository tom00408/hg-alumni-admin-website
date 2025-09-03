<template>
  <div class="layout">
    <!-- Mobile Header -->
    <AppHeader 
      :sidebar-open="sidebarOpen" 
      @toggle-sidebar="toggleSidebar" 
    />
    
    <!-- Sidebar -->
    <AppSidebar 
      :is-open="sidebarOpen" 
      @close="closeSidebar" 
    />
    
    <!-- Main Content -->
    <main class="main-content">
      <div class="content-wrapper">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import AppSidebar from '../components/AppSidebar.vue'

const sidebarOpen = ref(false)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

// Sidebar auf Desktop automatisch schließen/öffnen basierend auf Bildschirmgröße
const handleResize = () => {
  if (window.innerWidth >= 1024) {
    sidebarOpen.value = false
  }
}

// Keyboard Support - ESC zum Schließen
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && sidebarOpen.value) {
    closeSidebar()
  }
}

// Body Scroll verhindern wenn Sidebar offen ist
const updateBodyScroll = () => {
  if (sidebarOpen.value && window.innerWidth < 1024) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

// Watch für sidebarOpen um Body Scroll zu kontrollieren
watch(sidebarOpen, updateBodyScroll)

onMounted(() => {
  window.addEventListener('resize', handleResize)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('keydown', handleKeydown)
  // Sicherstellen, dass Body Scroll zurückgesetzt wird
  document.body.style.overflow = ''
})
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-bg) 0%, var(--color-white) 100%);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  margin-left: 0;
  padding-top: var(--header-height);
}

.content-wrapper {
  flex: 1;
  padding: var(--spacing-lg);
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* Desktop Layout */
@media (min-width: 1024px) {
  .main-content {
    margin-left: var(--sidebar-width);
    padding-top: 0;
  }
  
  .content-wrapper {
    padding: var(--spacing-2xl);
  }
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  .content-wrapper {
    padding: var(--spacing-xl);
  }
}

/* Mobile Kleinere Bildschirme */
@media (max-width: 480px) {
  .content-wrapper {
    padding: var(--spacing-md);
  }
}
</style>
