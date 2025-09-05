<script setup lang="ts">
import DefaultLayout from './layouts/DefaultLayout.vue'
import Login from './pages/Login.vue'
import { useAuthStore } from './stores/auth'
import { onMounted } from 'vue'

const authStore = useAuthStore()

onMounted(async () => {
  await authStore.initializeAuth()
})
</script>

<template>
  <!-- Loading während Auth-Check -->
  <div v-if="authStore.isLoading" class="auth-loading">
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p>Authentifizierung wird geladen...</p>
    </div>
  </div>
  
  <!-- Ihre ursprüngliche Logik -->
  <div v-else-if="authStore.isAuthenticated">
    <DefaultLayout />
  </div>
  <div v-else>
    <Login />
  </div>
</template>

<style scoped>
.auth-loading {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.loading-container {
  text-align: center;
  color: white;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
