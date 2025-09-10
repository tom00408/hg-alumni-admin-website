<template>
  <div class="image-grid-section">
    <!-- Filter und Suche -->
    <div class="filters-section">
      <div class="filters-grid">
        <div class="search-box">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Bilder suchen..."
          />
        </div>
        <div class="view-controls">
          <select v-model="sortBy" class="filter-select">
            <option value="date-desc">Neueste zuerst</option>
            <option value="date-asc">Älteste zuerst</option>
            <option value="title-asc">Titel A-Z</option>
            <option value="title-desc">Titel Z-A</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-number">{{ totalImages }}</span>
          <span class="stat-label">{{ statLabel }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ filteredImages.length }}</span>
          <span class="stat-label">Gefilterte Bilder</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ selectedImages.length }}</span>
          <span class="stat-label">Ausgewählt</span>
        </div>
      </div>
      <div v-if="selectedImages.length > 0" class="bulk-actions">
        <TomButton 
          @click="$emit('bulk-delete')" 
          :title="`${selectedImages.length} ${selectedImages.length === 1 ? 'Bild' : 'Bilder'} löschen`"
          icon="delete"
          variant="danger"
        />
        <TomButton 
          @click="clearSelection" 
          title="Auswahl aufheben"
          variant="secondary"
        />
      </div>
    </div>

    <!-- Galerie -->
    <div class="gallery-section">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Lade Bilder...</p>
      </div>

      <div v-else-if="filteredImages.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
        </div>
        <h3>Keine Bilder gefunden</h3>
        <p>{{ searchQuery ? 'Keine Bilder entsprechen deiner Suche.' : 'Lade deine ersten Bilder in die Galerie hoch.' }}</p>
        <TomButton 
          @click="$emit('upload-images')" 
          title="Bilder hochladen"
          icon="upload"
          variant="primary"
        />
      </div>

      <!-- Grid View -->
      <div class="images-grid">
        <div 
          v-for="image in filteredImages" 
          :key="image.id"
          class="image-card"
          :class="{ 'selected': selectedImages.includes(image.id!) }"
        >
          <div class="image-container">
            <img 
              :src="image.thumbnailUrl || image.imageUrl" 
              :alt="image.title || 'Galerie Bild'"
              @click="$emit('open-image', image)"
              loading="lazy"
            />
            <div class="image-overlay">
              <div class="image-actions">
                <TomButton 
                  @click="toggleSelection(image.id!)" 
                  :variant="selectedImages.includes(image.id!) ? 'action-selected' : 'action'"
                  title="Auswählen"
                  icon="check"
                />
                <TomButton 
                  @click="$emit('edit-image', image)" 
                  title="Bearbeiten"
                  icon="edit"
                  variant="action"
                />
                <TomButton 
                  v-if="currentFolderId"
                  @click="$emit('set-cover', image)" 
                  title="Als Cover setzen"
                  icon="image"
                  variant="action"
                />
                <TomButton 
                  @click="$emit('delete-image', image)" 
                  title="Löschen"
                  icon="delete"
                  variant="action-delete"
                />
              </div>
            </div>
          </div>
          <div v-if="image.title" class="image-info">
            <h4>{{ image.title }}</h4>
            <p class="image-date">{{ formatDate(image.createdAt?.toDate()) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { GalleryImage } from '../lib/types'
import TomButton from '../tomponents/TomButton.vue'

// Props
interface Props {
  images: GalleryImage[]
  loading?: boolean
  totalImages: number
  statLabel: string
  currentFolderId?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  currentFolderId: null
})

// Emits
const emit = defineEmits<{
  'bulk-delete': []
  'upload-images': []
  'open-image': [image: GalleryImage]
  'edit-image': [image: GalleryImage]
  'delete-image': [image: GalleryImage]
  'set-cover': [image: GalleryImage]
}>()

// Reactive state
const searchQuery = ref('')
const sortBy = ref('date-desc')
const selectedImages = ref<string[]>([])

// Computed
const filteredImages = computed(() => {
  let images = [...props.images]

  // Suche anwenden
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    images = images.filter(image => 
      image.title?.toLowerCase().includes(query) ||
      image.imageUrl.toLowerCase().includes(query)
    )
  }

  // Sortierung anwenden
  images.sort((a, b) => {
    switch (sortBy.value) {
      case 'date-asc':
        return (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0)
      case 'title-asc':
        return (a.title || '').localeCompare(b.title || '')
      case 'title-desc':
        return (b.title || '').localeCompare(a.title || '')
      default: // date-desc
        return (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)
    }
  })

  return images
})

// Methods
const toggleSelection = (imageId: string) => {
  const index = selectedImages.value.indexOf(imageId)
  if (index > -1) {
    selectedImages.value.splice(index, 1)
  } else {
    selectedImages.value.push(imageId)
  }
}

const clearSelection = () => {
  selectedImages.value = []
}

// Helper functions
const formatDate = (date?: Date) => {
  if (!date) return 'Unbekannt'
  return date.toLocaleDateString('de-DE', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  })
}

// Expose methods for parent component
defineExpose({
  selectedImages,
  clearSelection
})
</script>

<style scoped>
.image-grid-section {
  width: 100%;
}

/* Filter Section */
.filters-section {
  margin-bottom: var(--spacing-xl);
}

.filters-grid {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--spacing-lg);
  align-items: center;
}

.search-box {
  position: relative;
  max-width: 400px;
}

.search-box svg {
  position: absolute;
  left: var(--spacing-md);
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: var(--color-gray-400);
}

.search-box input {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-md) var(--spacing-md) 3rem;
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
}

.view-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.filter-select {
  padding: var(--spacing-md) var(--spacing-lg);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  background: var(--color-white);
  font-size: var(--font-size-base);
}

/* Stats Section */
.stats-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: var(--color-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.stats-grid {
  display: flex;
  gap: var(--spacing-xl);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-number {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
}

.bulk-actions {
  display: flex;
  gap: var(--spacing-md);
}

/* Loading & Empty States */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-gray-200);
  border-top: 3px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-lg);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  color: var(--color-gray-300);
  margin-bottom: var(--spacing-lg);
}

.empty-icon svg {
  width: 100%;
  height: 100%;
}

.empty-state h3 {
  color: var(--color-secondary);
  margin-bottom: var(--spacing-md);
}

.empty-state p {
  color: var(--color-gray-600);
  margin-bottom: var(--spacing-xl);
  max-width: 400px;
}

/* Grid View */
.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--spacing-lg);
}

.image-card {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
  border: 2px solid transparent;
}

.image-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.image-card.selected {
  border-color: var(--color-primary);
}

.image-container {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
  transition: transform var(--transition-normal);
}

.image-card:hover .image-container img {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.image-card:hover .image-overlay {
  opacity: 1;
}

.image-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.image-info {
  padding: var(--spacing-md);
}

.image-info h4 {
  color: var(--color-secondary);
  margin-bottom: var(--spacing-xs);
  font-size: var(--font-size-sm);
}

.image-date {
  color: var(--color-gray-500);
  font-size: var(--font-size-xs);
  margin: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }
  
  .view-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .stats-section {
    flex-direction: column;
    gap: var(--spacing-lg);
  }
  
  .stats-grid {
    justify-content: center;
  }
  
  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
  
  .bulk-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>
