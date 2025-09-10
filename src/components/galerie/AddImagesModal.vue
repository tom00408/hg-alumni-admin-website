<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal large" @click.stop>
      <div class="modal-header">
        <h2>Bilder zu "{{ folderName }}" hinzufügen</h2>
        <TomButton 
          @click="closeModal" 
          variant="action" 
          title="Schließen"
          icon="close"
        />
      </div>

      <div class="modal-body">
        <!-- Suchfeld für verfügbare Bilder -->
        <div class="add-images-search">
          <div class="search-box">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Verfügbare Bilder suchen..."
            />
          </div>
        </div>

        <!-- Statistiken -->
        <div class="add-images-stats">
          <span class="stat">{{ availableImages.length }} verfügbare Bilder</span>
          <span class="stat">{{ selectedImages.length }} ausgewählt</span>
        </div>

        <!-- Verfügbare Bilder Grid -->
        <div class="add-images-content">
          <div v-if="filteredImages.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </div>
            <h3>Keine verfügbaren Bilder</h3>
            <p>Alle Bilder sind bereits in Ordnern organisiert oder befinden sich bereits in diesem Ordner.</p>
          </div>

          <div v-else class="add-images-grid">
            <div 
              v-for="image in filteredImages" 
              :key="image.id"
              class="add-image-item"
              :class="{ 'selected': selectedImages.includes(image.id!) }"
              @click="toggleImageSelection(image.id!)"
            >
              <div class="add-image-checkbox">
                <input 
                  type="checkbox" 
                  :checked="selectedImages.includes(image.id!)"
                  @click.stop
                />
              </div>
              <img 
                :src="image.thumbnailUrl || image.imageUrl" 
                :alt="image.title || 'Bild'"
                class="add-image-thumbnail"
              />
              <div class="add-image-info">
                <h4>{{ image.title || 'Unbenanntes Bild' }}</h4>
                <p class="add-image-date">{{ formatDate(image.createdAt?.toDate()) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <TomButton 
          @click="closeModal" 
          variant="secondary" 
          title="Abbrechen"
          icon="close"
        />
        <button 
          @click="addSelectedImages" 
          class="btn-primary" 
          :disabled="selectedImages.length === 0 || isSubmitting"
        >
          <span v-if="isSubmitting">Füge hinzu...</span>
          <span v-else>{{ selectedImages.length }} {{ selectedImages.length === 1 ? 'Bild' : 'Bilder' }} hinzufügen</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { GalleryImage } from '../../lib/types'
import TomButton from '../../tomponents/TomButton.vue'

// Props
interface Props {
  show: boolean
  folderName: string
  availableImages: GalleryImage[]
  isSubmitting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isSubmitting: false
})

// Emits
const emit = defineEmits<{
  'close': []
  'add-images': [imageIds: string[]]
}>()

// Reactive state
const searchQuery = ref('')
const selectedImages = ref<string[]>([])

// Computed
const filteredImages = computed(() => {
  let images = [...props.availableImages]

  // Suche anwenden
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    images = images.filter(image => 
      image.title?.toLowerCase().includes(query) ||
      image.imageUrl.toLowerCase().includes(query)
    )
  }

  // Nach Datum sortieren (neueste zuerst)
  images.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0))

  return images
})

// Watch for modal show/hide to reset state
watch(() => props.show, (newValue) => {
  if (!newValue) {
    resetState()
  }
})

// Methods
const closeModal = () => {
  emit('close')
}

const resetState = () => {
  searchQuery.value = ''
  selectedImages.value = []
}

const toggleImageSelection = (imageId: string) => {
  const index = selectedImages.value.indexOf(imageId)
  if (index > -1) {
    selectedImages.value.splice(index, 1)
  } else {
    selectedImages.value.push(imageId)
  }
}

const addSelectedImages = () => {
  if (selectedImages.value.length > 0) {
    emit('add-images', selectedImages.value)
  }
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
</script>

<style scoped>
/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-lg);
}

.modal {
  background: var(--color-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal.large {
  max-width: 900px;
  max-height: 95vh;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--color-gray-200);
}

.modal-header h2 {
  color: var(--color-secondary);
  margin: 0;
}

.modal-body {
  padding: var(--spacing-xl);
}

.modal-actions {
  display: flex;
  gap: var(--spacing-lg);
  justify-content: flex-end;
  padding: var(--spacing-xl);
  border-top: 1px solid var(--color-gray-200);
}

/* Search */
.add-images-search {
  margin-bottom: var(--spacing-lg);
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

/* Stats */
.add-images-stats {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background: var(--color-gray-50);
  border-radius: var(--radius-md);
}

.add-images-stats .stat {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  font-weight: var(--font-weight-medium);
}

/* Content */
.add-images-content {
  max-height: 400px;
  overflow-y: auto;
}

.add-images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.add-image-item {
  border: 2px solid transparent;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-white);
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
}

.add-image-item:hover {
  border-color: var(--color-gray-300);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.add-image-item.selected {
  border-color: var(--color-primary);
  background: rgba(83, 98, 254, 0.05);
}

.add-image-checkbox {
  position: absolute;
  top: var(--spacing-sm);
  left: var(--spacing-sm);
  z-index: 1;
}

.add-image-checkbox input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.add-image-thumbnail {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.add-image-info {
  padding: var(--spacing-md);
}

.add-image-info h4 {
  color: var(--color-secondary);
  margin-bottom: var(--spacing-xs);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.add-image-date {
  color: var(--color-gray-500);
  font-size: var(--font-size-xs);
  margin: 0;
}

/* Empty State */
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

/* Button Styles */
.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-lg);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal {
    margin: var(--spacing-md);
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .add-images-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .add-images-stats {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
}
</style>
