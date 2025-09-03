<template>
  <div class="gallery-page">
    <div class="page-header">
      <div class="header-content">
        <h1>Galerie verwalten</h1>
        <p>Lade Bilder hoch und verwalte die Fotogalerie des Alumni-Vereins</p>
      </div>
      <button @click="showUploadModal = true" class="btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
        </svg>
        Bilder hochladen
      </button>
    </div>

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
          <div class="view-toggle">
            <button 
              @click="viewMode = 'grid'" 
              :class="{ active: viewMode === 'grid' }"
              class="view-btn"
              title="Gitteransicht"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h1.5a1.125 1.125 0 0 1 1.125-1.125m12.75 0a1.125 1.125 0 0 1 1.125 1.125m1.125 1.125a1.125 1.125 0 0 1-1.125 1.125M3.375 7.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 7.5h1.5a1.125 1.125 0 0 1 1.125-1.125m12.75 0a1.125 1.125 0 0 1 1.125 1.125M19.5 7.5a1.125 1.125 0 0 1-1.125 1.125M5.625 3.375a1.125 1.125 0 0 1 1.125-1.125h2.25a1.125 1.125 0 0 1 1.125 1.125v2.25a1.125 1.125 0 0 1-1.125 1.125H6.75a1.125 1.125 0 0 1-1.125-1.125V3.375ZM5.625 10.125A1.125 1.125 0 0 1 6.75 9h2.25a1.125 1.125 0 0 1 1.125 1.125v2.25A1.125 1.125 0 0 1 9 13.5H6.75a1.125 1.125 0 0 1-1.125-1.125v-2.25ZM13.125 3.375A1.125 1.125 0 0 1 14.25 2.25h2.25a1.125 1.125 0 0 1 1.125 1.125v2.25a1.125 1.125 0 0 1-1.125 1.125H14.25a1.125 1.125 0 0 1-1.125-1.125V3.375ZM13.125 10.125A1.125 1.125 0 0 1 14.25 9h2.25a1.125 1.125 0 0 1 1.125 1.125v2.25a1.125 1.125 0 0 1-1.125 1.125H14.25a1.125 1.125 0 0 1-1.125-1.125v-2.25Z" />
              </svg>
            </button>
            <button 
              @click="viewMode = 'list'" 
              :class="{ active: viewMode === 'list' }"
              class="view-btn"
              title="Listenansicht"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-number">{{ galleryStore.images.length }}</span>
          <span class="stat-label">Bilder gesamt</span>
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
        <button @click="confirmBulkDelete" class="btn-danger">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916C15.75 3.42 15.23 3 14.625 3h-3.25c-.604 0-1.125.42-1.125.938v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
          {{ selectedImages.length }} {{ selectedImages.length === 1 ? 'Bild' : 'Bilder' }} löschen
        </button>
        <button @click="clearSelection" class="btn-secondary">
          Auswahl aufheben
        </button>
      </div>
    </div>

    <!-- Galerie -->
    <div class="gallery-section">
      <div v-if="galleryStore.loading" class="loading-state">
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
        <button @click="showUploadModal = true" class="btn-primary">
          Bilder hochladen
        </button>
      </div>

      <!-- Grid View -->
      <div v-else-if="viewMode === 'grid'" class="images-grid">
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
              @click="openImageModal(image)"
              loading="lazy"
            />
            <div class="image-overlay">
              <div class="image-actions">
                <button 
                  @click="toggleSelection(image.id!)" 
                  class="action-btn"
                  :class="{ 'selected': selectedImages.includes(image.id!) }"
                  title="Auswählen"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </button>
                <button @click="editImage(image)" class="action-btn" title="Bearbeiten">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                </button>
                <button @click="confirmDelete(image)" class="action-btn delete" title="Löschen">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916C15.75 3.42 15.23 3 14.625 3h-3.25c-.604 0-1.125.42-1.125.938v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div v-if="image.title" class="image-info">
            <h4>{{ image.title }}</h4>
            <p class="image-date">{{ formatDate(image.createdAt?.toDate()) }}</p>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-else class="images-list">
        <div 
          v-for="image in filteredImages" 
          :key="image.id"
          class="image-list-item"
          :class="{ 'selected': selectedImages.includes(image.id!) }"
        >
          <div class="list-checkbox">
            <input 
              type="checkbox" 
              :checked="selectedImages.includes(image.id!)"
              @change="toggleSelection(image.id!)"
            />
          </div>
          <div class="list-thumbnail">
            <img 
              :src="image.thumbnailUrl || image.imageUrl" 
              :alt="image.title || 'Galerie Bild'"
              @click="openImageModal(image)"
            />
          </div>
          <div class="list-content">
            <h4>{{ image.title || 'Unbenanntes Bild' }}</h4>
            <p class="image-url">{{ getFileName(image.imageUrl) }}</p>
            <p class="image-date">Hochgeladen am {{ formatDate(image.createdAt?.toDate()) }}</p>
          </div>
          <div class="list-actions">
            <button @click="editImage(image)" class="action-btn" title="Bearbeiten">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            </button>
            <button @click="confirmDelete(image)" class="action-btn delete" title="Löschen">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916C15.75 3.42 15.23 3 14.625 3h-3.25c-.604 0-1.125.42-1.125.938v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <div v-if="showUploadModal" class="modal-overlay" @click="closeUploadModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>Bilder hochladen</h2>
          <button @click="closeUploadModal" class="close-btn">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div 
            class="upload-area"
            :class="{ 'dragover': isDragOver }"
            @drop="handleDrop"
            @dragover.prevent="isDragOver = true"
            @dragleave="isDragOver = false"
          >
            <div class="upload-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <h3>Bilder hierher ziehen oder klicken zum Auswählen</h3>
            <p>Unterstützte Formate: JPG, PNG, GIF (max. 10MB pro Bild)</p>
            <input 
              ref="fileInput"
              type="file" 
              multiple 
              accept="image/*"
              @change="handleFileSelect"
              style="display: none;"
            />
            <button @click="$refs.fileInput.click()" class="btn-primary">
              Dateien auswählen
            </button>
          </div>

          <div v-if="uploadQueue.length > 0" class="upload-queue">
            <h4>Hochzuladende Bilder ({{ uploadQueue.length }})</h4>
            <div class="queue-list">
              <div v-for="(file, index) in uploadQueue" :key="index" class="queue-item">
                <img :src="file.preview" :alt="file.name" class="queue-thumbnail" />
                <div class="queue-info">
                  <p class="queue-name">{{ file.name }}</p>
                  <p class="queue-size">{{ formatFileSize(file.size) }}</p>
                </div>
                <button @click="removeFromQueue(index)" class="queue-remove">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div v-if="uploadProgress.length > 0" class="upload-progress">
            <h4>Upload-Fortschritt</h4>
            <div class="progress-list">
              <div v-for="progress in uploadProgress" :key="progress.name" class="progress-item">
                <span class="progress-name">{{ progress.name }}</span>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: progress.percent + '%' }"></div>
                </div>
                <span class="progress-percent">{{ progress.percent }}%</span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button @click="closeUploadModal" class="btn-secondary">
            Abbrechen
          </button>
          <button 
            @click="startUpload" 
            class="btn-primary" 
            :disabled="uploadQueue.length === 0 || isUploading"
          >
            <span v-if="isUploading">Lade hoch...</span>
            <span v-else>{{ uploadQueue.length }} {{ uploadQueue.length === 1 ? 'Bild' : 'Bilder' }} hochladen</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Image Edit Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>Bild bearbeiten</h2>
          <button @click="closeEditModal" class="close-btn">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="submitImageEdit" class="modal-form">
          <div class="image-preview">
            <img :src="editingImage?.imageUrl" :alt="editingImage?.title || 'Bild'" />
          </div>

          <div class="form-group">
            <label for="imageTitle">Titel</label>
            <input 
              id="imageTitle"
              v-model="imageForm.title" 
              type="text" 
              placeholder="Optionaler Titel für das Bild"
            />
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeEditModal" class="btn-secondary">
              Abbrechen
            </button>
            <button type="submit" class="btn-primary" :disabled="isSubmitting">
              <span v-if="isSubmitting">Speichert...</span>
              <span v-else>Aktualisieren</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Image View Modal -->
    <div v-if="showImageModal" class="modal-overlay image-modal" @click="closeImageModal">
      <div class="image-modal-content" @click.stop>
        <button @click="closeImageModal" class="image-modal-close">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
        <img :src="viewingImage?.imageUrl" :alt="viewingImage?.title || 'Bild'" />
        <div v-if="viewingImage?.title" class="image-modal-title">
          {{ viewingImage.title }}
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal small" @click.stop>
        <div class="modal-header">
          <h2>{{ imagesToDelete.length > 1 ? 'Bilder löschen' : 'Bild löschen' }}</h2>
        </div>
        <div class="modal-body">
          <p v-if="imagesToDelete.length === 1">
            Möchtest du das Bild wirklich löschen?
          </p>
          <p v-else>
            Möchtest du wirklich {{ imagesToDelete.length }} Bilder löschen?
          </p>
          <p class="warning">Diese Aktion kann nicht rückgängig gemacht werden.</p>
        </div>
        <div class="modal-actions">
          <button @click="showDeleteModal = false" class="btn-secondary">
            Abbrechen
          </button>
          <button @click="deleteImages" class="btn-danger" :disabled="isSubmitting">
            <span v-if="isSubmitting">Lösche...</span>
            <span v-else>Löschen</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Timestamp } from 'firebase/firestore'
import { useGalleryStore } from '../stores/gallery'
import type { GalleryImage } from '../lib/types'

const galleryStore = useGalleryStore()

// Reactive state
const searchQuery = ref('')
const sortBy = ref('date-desc')
const viewMode = ref<'grid' | 'list'>('grid')
const selectedImages = ref<string[]>([])

// Modals
const showUploadModal = ref(false)
const showEditModal = ref(false)
const showImageModal = ref(false)
const showDeleteModal = ref(false)

// Upload state
const uploadQueue = ref<Array<{ file: File; name: string; size: number; preview: string }>>([])
const uploadProgress = ref<Array<{ name: string; percent: number }>>([])
const isUploading = ref(false)
const isDragOver = ref(false)

// Edit state
const editingImage = ref<GalleryImage | null>(null)
const viewingImage = ref<GalleryImage | null>(null)
const imagesToDelete = ref<string[]>([])
const isSubmitting = ref(false)

const imageForm = ref({
  title: ''
})

// Computed
const filteredImages = computed(() => {
  let images = [...galleryStore.images]

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

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    addFilesToQueue(Array.from(target.files))
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
  
  if (event.dataTransfer?.files) {
    addFilesToQueue(Array.from(event.dataTransfer.files))
  }
}

const addFilesToQueue = (files: File[]) => {
  files.forEach(file => {
    if (file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024) { // 10MB limit
      const reader = new FileReader()
      reader.onload = (e) => {
        uploadQueue.value.push({
          file,
          name: file.name,
          size: file.size,
          preview: e.target?.result as string
        })
      }
      reader.readAsDataURL(file)
    }
  })
}

const removeFromQueue = (index: number) => {
  uploadQueue.value.splice(index, 1)
}

const startUpload = async () => {
  if (uploadQueue.value.length === 0) return
  
  isUploading.value = true
  uploadProgress.value = uploadQueue.value.map(item => ({
    name: item.name,
    percent: 0
  }))

  try {
    for (let i = 0; i < uploadQueue.value.length; i++) {
      const item = uploadQueue.value[i]
      
      // Simuliere Upload-Progress (in echter App würde hier Firebase Storage verwendet)
      const progressItem = uploadProgress.value[i]
      
      // Mock upload mit Progress
      for (let progress = 0; progress <= 100; progress += 10) {
        progressItem.percent = progress
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Mock: Erstelle Image-URL (in echter App würde die URL von Firebase Storage kommen)
      const imageUrl = item.preview // Verwende Preview als Mock-URL
      
      const imageData: Omit<GalleryImage, 'id'> = {
        imageUrl,
        thumbnailUrl: imageUrl, // Mock: Verwende gleiche URL für Thumbnail
        title: item.name.replace(/\.[^/.]+$/, ''), // Dateiname ohne Extension als Titel
        createdAt: Timestamp.now()
      }

      await galleryStore.addImage(imageData)
    }

    // Upload erfolgreich abgeschlossen
    uploadQueue.value = []
    uploadProgress.value = []
    closeUploadModal()
  } catch (error) {
    console.error('Upload fehlgeschlagen:', error)
  } finally {
    isUploading.value = false
  }
}

const editImage = (image: GalleryImage) => {
  editingImage.value = image
  imageForm.value.title = image.title || ''
  showEditModal.value = true
}

const submitImageEdit = async () => {
  if (!editingImage.value) return
  
  isSubmitting.value = true
  try {
    await galleryStore.updateImage(editingImage.value.id!, {
      title: imageForm.value.title || undefined
    })
    closeEditModal()
  } catch (error) {
    console.error('Fehler beim Bearbeiten:', error)
  } finally {
    isSubmitting.value = false
  }
}

const openImageModal = (image: GalleryImage) => {
  viewingImage.value = image
  showImageModal.value = true
}

const confirmDelete = (image: GalleryImage) => {
  imagesToDelete.value = [image.id!]
  showDeleteModal.value = true
}

const confirmBulkDelete = () => {
  imagesToDelete.value = [...selectedImages.value]
  showDeleteModal.value = true
}

const deleteImages = async () => {
  isSubmitting.value = true
  try {
    for (const imageId of imagesToDelete.value) {
      await galleryStore.deleteImage(imageId)
    }
    
    // Entferne gelöschte Bilder aus Auswahl
    selectedImages.value = selectedImages.value.filter(id => 
      !imagesToDelete.value.includes(id)
    )
    
    showDeleteModal.value = false
    imagesToDelete.value = []
  } catch (error) {
    console.error('Fehler beim Löschen:', error)
  } finally {
    isSubmitting.value = false
  }
}

const closeUploadModal = () => {
  showUploadModal.value = false
  uploadQueue.value = []
  uploadProgress.value = []
  isDragOver.value = false
}

const closeEditModal = () => {
  showEditModal.value = false
  editingImage.value = null
  imageForm.value.title = ''
}

const closeImageModal = () => {
  showImageModal.value = false
  viewingImage.value = null
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

const formatFileSize = (bytes: number) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

const getFileName = (url: string) => {
  return url.split('/').pop() || url
}

onMounted(() => {
  galleryStore.fetchImages()
})
</script>

<style scoped>
.gallery-page {
  padding: var(--spacing-xl);
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-xl);
}

.header-content h1 {
  color: var(--color-secondary);
  margin-bottom: var(--spacing-sm);
}

.header-content p {
  color: var(--color-gray-600);
  margin: 0;
}

.btn-primary svg {
  width: 20px;
  height: 20px;
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

.view-toggle {
  display: flex;
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.view-btn {
  padding: var(--spacing-md);
  border: none;
  background: var(--color-white);
  color: var(--color-gray-600);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.view-btn:hover {
  background: var(--color-gray-100);
}

.view-btn.active {
  background: var(--color-primary);
  color: var(--color-white);
}

.view-btn svg {
  width: 20px;
  height: 20px;
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

.btn-danger svg {
  width: 16px;
  height: 16px;
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

.action-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.9);
  color: var(--color-gray-700);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-btn:hover {
  background: var(--color-white);
  transform: scale(1.1);
}

.action-btn.selected {
  background: var(--color-primary);
  color: var(--color-white);
}

.action-btn.delete:hover {
  background: var(--color-error);
  color: var(--color-white);
}

.action-btn svg {
  width: 20px;
  height: 20px;
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

/* List View */
.images-list {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.image-list-item {
  display: grid;
  grid-template-columns: auto 80px 1fr auto;
  gap: var(--spacing-lg);
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-gray-200);
  transition: background-color var(--transition-fast);
}

.image-list-item:last-child {
  border-bottom: none;
}

.image-list-item:hover {
  background: var(--color-gray-50);
}

.image-list-item.selected {
  background: rgba(83, 98, 254, 0.05);
  border-color: var(--color-primary);
}

.list-thumbnail {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-md);
  overflow: hidden;
}

.list-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
}

.list-content h4 {
  color: var(--color-secondary);
  margin-bottom: var(--spacing-xs);
}

.image-url {
  color: var(--color-gray-500);
  font-size: var(--font-size-sm);
  font-family: monospace;
  margin: 0;
}

.list-actions {
  display: flex;
  gap: var(--spacing-sm);
}

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

.modal-overlay.image-modal {
  background: rgba(0, 0, 0, 0.9);
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

.modal.small {
  max-width: 400px;
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

.close-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-gray-100);
  color: var(--color-gray-600);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.close-btn:hover {
  background: var(--color-gray-200);
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.modal-body {
  padding: var(--spacing-xl);
}

.modal-form {
  padding: var(--spacing-xl);
}

.modal-body .warning {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-md);
}

/* Upload Area */
.upload-area {
  border: 2px dashed var(--color-gray-300);
  border-radius: var(--radius-lg);
  padding: var(--spacing-2xl);
  text-align: center;
  transition: all var(--transition-normal);
  cursor: pointer;
}

.upload-area.dragover {
  border-color: var(--color-primary);
  background: rgba(83, 98, 254, 0.05);
}

.upload-icon {
  width: 60px;
  height: 60px;
  color: var(--color-gray-400);
  margin: 0 auto var(--spacing-lg);
}

.upload-icon svg {
  width: 100%;
  height: 100%;
}

.upload-area h3 {
  color: var(--color-secondary);
  margin-bottom: var(--spacing-md);
}

.upload-area p {
  color: var(--color-gray-600);
  margin-bottom: var(--spacing-lg);
}

/* Upload Queue */
.upload-queue {
  margin-top: var(--spacing-xl);
}

.upload-queue h4 {
  color: var(--color-secondary);
  margin-bottom: var(--spacing-lg);
}

.queue-list {
  max-height: 300px;
  overflow-y: auto;
}

.queue-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
}

.queue-thumbnail {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: var(--radius-sm);
}

.queue-info {
  flex: 1;
}

.queue-name {
  font-weight: var(--font-weight-medium);
  margin: 0 0 var(--spacing-xs) 0;
}

.queue-size {
  color: var(--color-gray-500);
  font-size: var(--font-size-sm);
  margin: 0;
}

.queue-remove {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--color-gray-100);
  color: var(--color-gray-600);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.queue-remove:hover {
  background: var(--color-error);
  color: var(--color-white);
}

.queue-remove svg {
  width: 16px;
  height: 16px;
}

/* Upload Progress */
.upload-progress {
  margin-top: var(--spacing-xl);
}

.upload-progress h4 {
  color: var(--color-secondary);
  margin-bottom: var(--spacing-lg);
}

.progress-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.progress-name {
  min-width: 150px;
  font-size: var(--font-size-sm);
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: var(--color-gray-200);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width var(--transition-fast);
}

.progress-percent {
  min-width: 40px;
  font-size: var(--font-size-sm);
  text-align: right;
}

/* Image Edit Modal */
.image-preview {
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.image-preview img {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: var(--radius-md);
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-secondary);
}

.form-group input {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(83, 98, 254, 0.1);
}

/* Image View Modal */
.image-modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-modal-close {
  position: absolute;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  width: 40px;
  height: 40px;
  border: none;
  border-radius: var(--radius-md);
  background: rgba(0, 0, 0, 0.5);
  color: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  z-index: 1;
}

.image-modal-close:hover {
  background: rgba(0, 0, 0, 0.7);
}

.image-modal-close svg {
  width: 24px;
  height: 24px;
}

.image-modal-content img {
  max-width: 100%;
  max-height: calc(90vh - 100px);
  object-fit: contain;
  border-radius: var(--radius-lg);
}

.image-modal-title {
  color: var(--color-white);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  margin-top: var(--spacing-lg);
  text-align: center;
}

.modal-actions {
  display: flex;
  gap: var(--spacing-lg);
  justify-content: flex-end;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-gray-200);
  margin-top: var(--spacing-lg);
}

.btn-danger {
  background-color: var(--color-error);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-lg);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.btn-danger:hover {
  background-color: #dc2626;
}

.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .gallery-page {
    padding: var(--spacing-lg);
  }
  
  .page-header {
    flex-direction: column;
    gap: var(--spacing-lg);
    align-items: stretch;
  }
  
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
  
  .image-list-item {
    grid-template-columns: auto 60px 1fr;
    gap: var(--spacing-md);
  }
  
  .list-actions {
    grid-column: 1 / -1;
    justify-content: flex-end;
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--color-gray-200);
  }
  
  .modal {
    margin: var(--spacing-md);
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .bulk-actions {
    flex-direction: column;
  }
}
</style>
