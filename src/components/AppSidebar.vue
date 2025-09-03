<template>
  <aside 
    class="sidebar"
    :class="{ 'sidebar--open': isOpen }"
  >
    <!-- Logo und Titel -->
    <div class="sidebar__header">
      <div class="sidebar__logo">
        <div class="logo-circle">
          <span class="logo-text">HG</span>
        </div>
        <div class="sidebar__title">
          <h2>Alumni Verein</h2>
          <p>Hainberg-Gymnasium</p>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="sidebar__nav">
      <ul class="nav-list">
        <li 
          v-for="item in navigationItems" 
          :key="item.id"
          class="nav-item"
        >
          <router-link 
            :to="item.route"
            class="nav-link"
            :class="{ 'nav-link--active': $route.name === item.id }"
            @click="$emit('close')"
          >
            <span class="nav-icon" v-html="item.icon"></span>
            <span class="nav-label">{{ item.label }}</span>
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- Footer -->
    <div class="sidebar__footer">
      <p class="footer-text">© 2024 HG Alumni</p>
      <p class="footer-text">{{ version }}</p>
    </div>
  </aside>

  <!-- Overlay für mobile -->
  <div 
    v-if="isOpen" 
    class="sidebar-overlay"
    @click="$emit('close')"
  >
    <!-- Mobile Navigation im Overlay -->
    <div class="mobile-nav-overlay" @click.stop>
      <div class="mobile-nav-header">
        <div class="mobile-logo">
          <div class="logo-circle">
            <span class="logo-text">HG</span>
          </div>
          <span class="mobile-title">Alumni Verein</span>
        </div>
        <button 
          class="mobile-close-btn"
          @click="$emit('close')"
          aria-label="Menü schließen"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
      
      <nav class="mobile-nav">
        <ul class="mobile-nav-list">
          <li 
            v-for="item in navigationItems" 
            :key="item.id"
            class="mobile-nav-item"
          >
            <router-link 
              :to="item.route"
              class="mobile-nav-link"
              :class="{ 'mobile-nav-link--active': $route.name === item.id }"
              @click="$emit('close')"
            >
              <span class="mobile-nav-icon" v-html="item.icon"></span>
              <span class="mobile-nav-label">{{ item.label }}</span>
              <svg class="mobile-nav-arrow" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </router-link>
          </li>
        </ul>
      </nav>
      
      <div class="mobile-nav-footer">
        <p>© 2024 HG Alumni • {{ version}}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isOpen?: boolean
}

withDefaults(defineProps<Props>(), {
  isOpen: false
})

defineEmits<{
  close: []
}>()

const version = import.meta.env.VITE_VERSION


const navigationItems = [
  {
    id: 'startseite',
    label: 'Startseite',
    route: '/',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
    </svg>`
  },
  {
    id: 'termine',
    label: 'Termine',
    route: '/termine',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
    </svg>`
  },
  {
    id: 'news',
    label: 'Neues im Verein',
    route: '/news',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>`
  },
  {
    id: 'galerie',
    label: 'Galerie',
    route: '/galerie',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
    </svg>`
  },
  {
    id: 'mitglied-werden',
    label: 'Mitglied werden',
    route: '/mitglied-werden',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>`
  },
  {
    id: 'impressum',
    label: 'Impressum',
    route: '/impressum',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
    </svg>`
  }
]
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: var(--sidebar-width);
  height: 100vh;
  background-color: var(--color-secondary);
  color: var(--color-white);
  z-index: 1000;
  transform: translateX(-100%);
  transition: transform var(--transition-normal);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  box-shadow: var(--shadow-xl);
}

.sidebar--open {
  transform: translateX(0);
}

.sidebar__header {
  padding: var(--spacing-xl) var(--spacing-lg);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar__logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.logo-circle {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-text {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
  color: var(--color-white);
}

.sidebar__title h2 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-white);
  margin: 0;
  line-height: 1.2;
}

.sidebar__title p {
  font-size: var(--font-size-sm);
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  margin-top: 2px;
}

.sidebar__nav {
  flex: 1;
  padding: var(--spacing-lg) 0;
  min-height: 200px;
  overflow-y: auto;
}

.nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
}

.nav-item {
  margin-bottom: var(--spacing-xs);
  width: 100%;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
  border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
  margin-right: var(--spacing-lg);
  position: relative;
  min-height: 48px;
  width: 100%;
  box-sizing: border-box;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--color-white);
  transform: translateX(4px);
}

.nav-link--active {
  background-color: rgba(255, 255, 255, 0.15);
  color: var(--color-white);
  font-weight: var(--font-weight-semibold);
}

.nav-link--active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  border-radius: 0 2px 2px 0;
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-label {
  font-size: var(--font-size-base);
}

.sidebar__footer {
  padding: var(--spacing-lg);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-text {
  font-size: var(--font-size-xs);
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  margin: 0;
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: 0;
  animation: fadeIn var(--transition-normal) forwards;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
}

/* Mobile Navigation Overlay */
.mobile-nav-overlay {
  background: var(--color-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
  animation: slideInUp var(--transition-normal) ease-out;
  display: flex;
  flex-direction: column;
}

.mobile-nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-gray-200);
}

.mobile-logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.mobile-logo .logo-circle {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-logo .logo-text {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
  color: var(--color-white);
}

.mobile-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-secondary);
}

.mobile-close-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: var(--color-gray-100);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-gray-600);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.mobile-close-btn:hover {
  background: var(--color-gray-200);
  color: var(--color-gray-800);
}

.mobile-nav {
  flex: 1;
  padding: var(--spacing-md) 0;
}

.mobile-nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.mobile-nav-item {
  margin-bottom: var(--spacing-xs);
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  color: var(--color-text);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
  border-radius: var(--radius-lg);
  margin: 0 var(--spacing-md);
  position: relative;
}

.mobile-nav-link:hover {
  background-color: var(--color-gray-50);
  transform: translateX(4px);
}

.mobile-nav-link--active {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.mobile-nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
}

.mobile-nav-label {
  flex: 1;
  font-size: var(--font-size-base);
}

.mobile-nav-arrow {
  color: var(--color-gray-400);
  transition: transform var(--transition-fast);
}

.mobile-nav-link:hover .mobile-nav-arrow {
  transform: translateX(2px);
}

.mobile-nav-footer {
  padding: var(--spacing-lg);
  border-top: 1px solid var(--color-gray-200);
  text-align: center;
}

.mobile-nav-footer p {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  margin: 0;
}

/* Slide-in Animation */
@keyframes slideInUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .sidebar {
    position: fixed;
    transform: translateX(0);
    height: 100vh;
    z-index: 100;
  }
  
  .sidebar--open {
    transform: translateX(0);
  }
  
  .sidebar-overlay {
    display: none;
  }
}

/* Tablet und Mobile */
@media (max-width: 1023px) {
  .sidebar {
    z-index: 1001;
    width: min(var(--sidebar-width), 80vw);
  }
  
  .sidebar-overlay {
    z-index: 1000;
  }
}

/* Sehr kleine Bildschirme */
@media (max-width: 480px) {
  .sidebar {
    width: min(var(--sidebar-width), 90vw);
  }
  
  .sidebar__header {
    padding: var(--spacing-lg);
  }
  
  .logo-circle {
    width: 40px;
    height: 40px;
  }
  
  .sidebar__title h2 {
    font-size: var(--font-size-base);
  }
  
  .sidebar__title p {
    font-size: var(--font-size-xs);
  }
  
  /* Mobile Nav Overlay Anpassungen */
  .mobile-nav-overlay {
    max-width: 95vw;
    max-height: 85vh;
    margin: var(--spacing-sm);
  }
  
  .mobile-nav-header {
    padding: var(--spacing-md);
  }
  
  .mobile-title {
    font-size: var(--font-size-base);
  }
  
  .mobile-nav-link {
    padding: var(--spacing-sm) var(--spacing-md);
    margin: 0 var(--spacing-sm);
  }
}

/* Scroll-Styling für Webkit-Browser */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
