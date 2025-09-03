import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './styles/style.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// Pinia für State Management
app.use(createPinia())

// Vue Router
app.use(router)

app.mount('#app')
