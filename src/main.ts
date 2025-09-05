import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './styles/style.css'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

const app = createApp(App)

// Pinia für State Management
const pinia = createPinia()
app.use(pinia)

// Vue Router
app.use(router)

// Auth Store initialisieren und Auth State Listener einrichten
const authStore = useAuthStore()
authStore.setupAuthListener()

app.mount('#app')
