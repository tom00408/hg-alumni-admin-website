<template>
  <div class="gallery-page">
    <div class="page-header">
      <div class="header-content">
        <h1>Galerie verwalten</h1>
        <p>Lade Bilder hoch und verwalte die Fotogalerie des Alumni-Vereins</p>
        <!-- Breadcrumb -->
        <div v-if="galleryStore.currentFolderData" class="breadcrumb">
          <button @click="galleryStore.setCurrentFolder(null)" class="breadcrumb-btn">
            Galerie
          </button>
          <span class="breadcrumb-separator">/</span>
          <div v-if="renamingFolder === galleryStore.currentFolderData.id" class="breadcrumb-rename">
            <input 
              ref="breadcrumbRenameInput"
              v-model="renameValue" 
              type="text"
              class="breadcrumb-rename-input"
              @blur="cancelRename"
              @keyup.enter="confirmRename"
              @keyup.escape="cancelRename"
            />
            <button @click="confirmRename" class="breadcrumb-rename-btn confirm" title="Bestätigen">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span>Bestätigen</span>
            </button>
            <button @click="cancelRename" class="breadcrumb-rename-btn cancel" title="Abbrechen">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Abbrechen</span>
            </button>
          </div>
          <span v-else class="breadcrumb-current">
            {{ galleryStore.currentFolderData.name }}
          </span>
        </div>
      </div>
      <div class="header-actions">
        <!-- Neuer Ordner nur in Hauptgalerie -->
        <button v-if="!galleryStore.currentFolder" @click="showFolderModal = true" class="btn-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25H11.69l-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v6.75Z" />
          </svg>
          Neuer Ordner
        </button>
        
        <!-- Ordner umbenennen nur wenn IN Ordner -->
        <button v-if="galleryStore.currentFolder" @click="startRename(galleryStore.currentFolderData!)" class="btn-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 0 3.75 18v-1.5M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
          Ordner umbenennen
        </button>
        
        <!-- Bilder hinzufügen nur wenn IN Ordner -->
        <button v-if="galleryStore.currentFolder" @click="showAddImagesModal = true" class="btn-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          Bilder hinzufügen
        </button>
        
        <!-- Ordner löschen nur wenn IN Ordner -->
        <button v-if="galleryStore.currentFolder" @click="confirmDeleteCurrentFolder" class="btn-danger">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916C15.75 3.42 15.23 3 14.625 3h-3.25c-.604 0-1.125.42-1.125.938v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
          Ordner löschen
        </button>
        
        <!-- Bilder hochladen immer verfügbar -->
        <button @click="showUploadModal = true" class="btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
          </svg>
          Bilder hochladen
        </button>
      </div>
    </div>

    <!-- Ordner-Navigation -->
    <div v-if="!galleryStore.currentFolder && galleryStore.folders.length > 0" class="folders-section">
      <h2>Ordner</h2>
      <div class="folders-grid">
        <div 
          v-for="folder in galleryStore.folders" 
          :key="folder.id"
          class="folder-card"
          @click="galleryStore.setCurrentFolder(folder.id!)"
        >
          <div class="folder-icon">
            <img 
              v-if="folder.coverImageId && getCoverImage(folder.coverImageId)"
              :src="getCoverImage(folder.coverImageId)?.thumbnailUrl || getCoverImage(folder.coverImageId)?.imageUrl"
              :alt="folder.name"
              class="folder-cover"
            />
            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25H11.69l-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v6.75Z" />
            </svg>
          </div>
          <div class="folder-info">
            <div v-if="renamingFolder === folder.id" class="folder-rename" @click.stop>
              <input 
                ref="renameInput"
                v-model="renameValue" 
                type="text"
                class="folder-rename-input"
                @blur="cancelRename"
                @keyup.enter="confirmRename"
                @keyup.escape="cancelRename"
              />
              <div class="folder-rename-actions">
                <button @click="confirmRename" class="rename-btn confirm" title="Bestätigen">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span>Bestätigen</span>
                </button>
                <button @click="cancelRename" class="rename-btn cancel" title="Abbrechen">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Abbrechen</span>
                </button>
              </div>
            </div>
            <div v-else>
              <h3>{{ folder.name }}</h3>
              <p v-if="folder.description">{{ folder.description }}</p>
              <span class="folder-count">{{ getImagesInFolderCount(folder.id!) }} Bilder</span>
            </div>
          </div>
          <div class="folder-actions visible" @click.stop>
            <button @click="confirmDeleteFolder(folder)" class="action-btn delete prominent" title="Ordner löschen">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916C15.75 3.42 15.23 3 14.625 3h-3.25c-.604 0-1.125.42-1.125.938v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
            <button @click="editFolder(folder)" class="action-btn secondary" title="Ordner bearbeiten">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            </button>
          </div>
        </div>
      </div>
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
          <span class="stat-number">{{ galleryStore.currentFolder ? galleryStore.filteredImages.length : galleryStore.images.length }}</span>
          <span class="stat-label">{{ galleryStore.currentFolder ? 'Bilder im Ordner' : 'Bilder gesamt' }}</span>
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
            <button @click="fileInput?.click()" class="btn-primary">
              Dateien auswählen
            </button>
          </div>

          <div v-if="uploadQueue.length > 0" class="upload-queue">
            <h4>Hochzuladende Bilder ({{ uploadQueue.length }})</h4>
            <div class="queue-list">
              <div v-for="(file, index) in uploadQueue" :key="index" class="queue-item">
                <img :src="file.preview" :alt="file.name" class="queue-thumbnail" />
                <div class="queue-info">
                  <div class="queue-name-input">
                    <label :for="`title-${index}`" class="queue-label">Titel:</label>
                    <input 
                      :id="`title-${index}`"
                      v-model="uploadQueue[index].title"
                      type="text" 
                      class="queue-title-input"
                      placeholder="Bildtitel..."
                    />
                  </div>
                  <p class="queue-meta">{{ file.name }} • {{ formatFileSize(file.size) }}</p>
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
              <div v-for="progress in uploadProgress" :key="progress.name" class="progress-item" :class="progress.status">
                <div class="progress-info">
                  <span class="progress-name">{{ progress.name }}</span>
                  <div class="progress-status">
                    <svg v-if="progress.status === 'uploading'" class="progress-icon uploading" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                    <svg v-else-if="progress.status === 'completed'" class="progress-icon completed" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <svg v-else-if="progress.status === 'error'" class="progress-icon error" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                    </svg>
                    <span class="progress-percent">{{ progress.percent }}%</span>
                  </div>
                </div>
                <div v-if="progress.status !== 'error'" class="progress-bar">
                  <div class="progress-fill" :style="{ width: progress.percent + '%' }" :class="progress.status"></div>
                </div>
                <div v-if="progress.error" class="progress-error">
                  {{ progress.error }}
                </div>
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

    <!-- Folder Modal -->
    <div v-if="showFolderModal" class="modal-overlay" @click="closeFolderModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>{{ editingFolder ? 'Ordner bearbeiten' : 'Neuen Ordner erstellen' }}</h2>
          <button @click="closeFolderModal" class="close-btn">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="submitFolder" class="modal-form">
          <div class="form-group">
            <label for="folderName">Name *</label>
            <input 
              id="folderName"
              v-model="folderForm.name" 
              type="text" 
              placeholder="Ordnername"
              required
            />
          </div>

          <div class="form-group">
            <label for="folderDescription">Beschreibung</label>
            <textarea 
              id="folderDescription"
              v-model="folderForm.description" 
              placeholder="Optionale Beschreibung des Ordners"
              rows="3"
            ></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeFolderModal" class="btn-secondary">
              Abbrechen
            </button>
            <button type="submit" class="btn-primary" :disabled="isSubmitting || !folderForm.name.trim()">
              <span v-if="isSubmitting">{{ editingFolder ? 'Aktualisiert...' : 'Erstellt...' }}</span>
              <span v-else>{{ editingFolder ? 'Aktualisieren' : 'Erstellen' }}</span>
            </button>
          </div>
        </form>
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

    <!-- Add Images to Folder Modal -->
    <div v-if="showAddImagesModal" class="modal-overlay" @click="closeAddImagesModal">
      <div class="modal large" @click.stop>
        <div class="modal-header">
          <h2>Bilder zu "{{ galleryStore.currentFolderData?.name }}" hinzufügen</h2>
          <button @click="closeAddImagesModal" class="close-btn">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <!-- Suchfeld für verfügbare Bilder -->
          <div class="add-images-search">
            <div class="search-box">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input 
                v-model="addImagesSearchQuery" 
                type="text" 
                placeholder="Verfügbare Bilder suchen..."
              />
            </div>
          </div>

          <!-- Statistiken -->
          <div class="add-images-stats">
            <span class="stat">{{ availableImages.length }} verfügbare Bilder</span>
            <span class="stat">{{ selectedImagesToAdd.length }} ausgewählt</span>
          </div>

          <!-- Verfügbare Bilder Grid -->
          <div class="add-images-content">
            <div v-if="availableImages.length === 0" class="empty-state">
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
                v-for="image in filteredAvailableImages" 
                :key="image.id"
                class="add-image-item"
                :class="{ 'selected': selectedImagesToAdd.includes(image.id!) }"
                @click="toggleImageSelection(image.id!)"
              >
                <div class="add-image-checkbox">
                  <input 
                    type="checkbox" 
                    :checked="selectedImagesToAdd.includes(image.id!)"
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
          <button @click="closeAddImagesModal" class="btn-secondary">
            Abbrechen
          </button>
          <button 
            @click="addSelectedImagesToFolder" 
            class="btn-primary" 
            :disabled="selectedImagesToAdd.length === 0 || isSubmitting"
          >
            <span v-if="isSubmitting">Füge hinzu...</span>
            <span v-else>{{ selectedImagesToAdd.length }} {{ selectedImagesToAdd.length === 1 ? 'Bild' : 'Bilder' }} hinzufügen</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Folder Confirmation Modal -->
    <div v-if="showDeleteFolderModal" class="modal-overlay" @click="showDeleteFolderModal = false">
      <div class="modal small" @click.stop>
        <div class="modal-header">
          <h2>Ordner löschen</h2>
        </div>
        <div class="modal-body">
          <p>
            Möchtest du den Ordner "{{ folderToDelete?.name }}" wirklich löschen?
          </p>
          <p class="warning">Alle Bilder im Ordner werden in die Hauptgalerie verschoben. Diese Aktion kann nicht rückgängig gemacht werden.</p>
        </div>
        <div class="modal-actions">
          <button @click="showDeleteFolderModal = false" class="btn-secondary">
            Abbrechen
          </button>
          <button @click="deleteFolderConfirmed" class="btn-danger" :disabled="isSubmitting">
            <span v-if="isSubmitting">Lösche...</span>
            <span v-else>Ordner löschen</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { Timestamp } from 'firebase/firestore'
import { useGalleryStore } from '../stores/gallery'
import type { GalleryImage, GalleryFolder } from '../lib/types'

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
const showFolderModal = ref(false)
const showDeleteFolderModal = ref(false)
const showAddImagesModal = ref(false)

// Upload state
const uploadQueue = ref<Array<{ file: File; name: string; size: number; preview: string; title: string }>>([])
const uploadProgress = ref<Array<{ name: string; percent: number; status: 'pending' | 'uploading' | 'completed' | 'error'; error?: string }>>([])
const isUploading = ref(false)
const isDragOver = ref(false)

// Edit state
const editingImage = ref<GalleryImage | null>(null)
const viewingImage = ref<GalleryImage | null>(null)
const imagesToDelete = ref<string[]>([])
const editingFolder = ref<GalleryFolder | null>(null)
const folderToDelete = ref<GalleryFolder | null>(null)
const isSubmitting = ref(false)

const imageForm = ref({
  title: ''
})

const folderForm = ref({
  name: '',
  description: ''
})

// Add images to folder state
const addImagesSearchQuery = ref('')
const selectedImagesToAdd = ref<string[]>([])

// Inline rename state
const renamingFolder = ref<string | null>(null)
const renameValue = ref('')
const renameInput = ref<HTMLInputElement>()
const breadcrumbRenameInput = ref<HTMLInputElement>()

// File input ref
const fileInput = ref<HTMLInputElement>()

// Computed
const filteredImages = computed(() => {
  let images = [...galleryStore.filteredImages] // Verwende den Store's filteredImages

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

// Computed für Add Images Modal
const availableImages = computed(() => {
  // Zeige alle Bilder die NICHT im aktuellen Ordner sind
  return galleryStore.images.filter(image => {
    return image.folderId !== galleryStore.currentFolder
  })
})

const filteredAvailableImages = computed(() => {
  let images = [...availableImages.value]

  // Suche anwenden
  if (addImagesSearchQuery.value) {
    const query = addImagesSearchQuery.value.toLowerCase()
    images = images.filter(image => 
      image.title?.toLowerCase().includes(query) ||
      image.imageUrl.toLowerCase().includes(query)
    )
  }

  // Nach Datum sortieren (neueste zuerst)
  images.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0))

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

const addFilesToQueue = async (files: File[]) => {
  for (const file of files) {
    if (file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024) { // 10MB limit
      try {
        // Komprimiere das Bild wenn es zu groß ist
        const processedFile = await processImageFile(file)
        const reader = new FileReader()
        
        reader.onload = (e) => {
          const defaultTitle = file.name.replace(/\.[^/.]+$/, '') // Dateiname ohne Extension
          uploadQueue.value.push({
            file: processedFile,
            name: processedFile.name,
            size: processedFile.size,
            preview: e.target?.result as string,
            title: defaultTitle
          })
        }
        reader.readAsDataURL(processedFile)
      } catch (error) {
        console.error('Fehler beim Verarbeiten der Datei:', file.name, error)
      }
    }
  }
}

// Bildverarbeitung und Komprimierung
const processImageFile = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const maxSize = 800 // Maximale Breite/Höhe
    const quality = 0.8 // JPEG Qualität
    const maxFileSize = 1024 * 1024 // 1MB
    
    // Wenn die Datei bereits klein genug ist, direkt zurückgeben
    if (file.size <= maxFileSize) {
      resolve(file)
      return
    }
    
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // Berechne neue Dimensionen
      let { width, height } = img
      
      if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      
      canvas.width = width
      canvas.height = height
      
      // Zeichne das Bild
      ctx?.drawImage(img, 0, 0, width, height)
      
      // Konvertiere zu Blob
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          })
          resolve(compressedFile)
        } else {
          reject(new Error('Komprimierung fehlgeschlagen'))
        }
      }, 'image/jpeg', quality)
    }
    
    img.onerror = () => reject(new Error('Fehler beim Laden des Bildes'))
    img.src = URL.createObjectURL(file)
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
    percent: 0,
    status: 'pending' as const
  }))

  try {
    for (let i = 0; i < uploadQueue.value.length; i++) {
      const item = uploadQueue.value[i]
      const progressItem = uploadProgress.value[i]
      
      try {
        progressItem.status = 'uploading'
        progressItem.percent = 10
        
        // Echtes Firebase Upload über den Gallery Store (mit aktuellem Ordner falls vorhanden)
        await galleryStore.uploadImage(item.file, item.title, galleryStore.currentFolder || undefined)
        
        progressItem.percent = 100
        progressItem.status = 'completed'
      } catch (error) {
        console.error(`Upload fehlgeschlagen für ${item.name}:`, error)
        progressItem.status = 'error'
        progressItem.error = error instanceof Error ? error.message : 'Unbekannter Fehler'
      }
    }

    // Prüfe ob alle erfolgreich waren
    const allCompleted = uploadProgress.value.every(p => p.status === 'completed')
    const hasErrors = uploadProgress.value.some(p => p.status === 'error')
    
    if (allCompleted) {
      // Alle erfolgreich - Modal schließen
      setTimeout(() => {
        uploadQueue.value = []
        uploadProgress.value = []
        closeUploadModal()
      }, 1000)
    } else if (hasErrors) {
      // Einige Fehler - Benutzer über Ergebnisse informieren
      const errorCount = uploadProgress.value.filter(p => p.status === 'error').length
      const successCount = uploadProgress.value.filter(p => p.status === 'completed').length
      
      console.log(`Upload abgeschlossen: ${successCount} erfolgreich, ${errorCount} Fehler`)
      
      // Nach 3 Sekunden nur die erfolgreichen aus der Queue entfernen
      setTimeout(() => {
        uploadQueue.value = uploadQueue.value.filter((_, index) => 
          uploadProgress.value[index].status === 'error'
        )
        uploadProgress.value = uploadProgress.value.filter(p => p.status === 'error')
      }, 3000)
    }
  } catch (error) {
    console.error('Upload-Prozess fehlgeschlagen:', error)
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

// Folder helpers
const getCoverImage = (imageId: string) => {
  return galleryStore.images.find(image => image.id === imageId)
}

const getImagesInFolderCount = (folderId: string) => {
  return galleryStore.images.filter(image => image.folderId === folderId).length
}

// Folder methods
const editFolder = (folder: GalleryFolder) => {
  editingFolder.value = folder
  folderForm.value.name = folder.name
  folderForm.value.description = folder.description || ''
  showFolderModal.value = true
}

const submitFolder = async () => {
  if (!folderForm.value.name.trim()) return
  
  isSubmitting.value = true
  try {
    if (editingFolder.value) {
      // Update existing folder
      const updateData: Partial<GalleryFolder> = {
        name: folderForm.value.name.trim()
      }
      
      if (folderForm.value.description.trim()) {
        updateData.description = folderForm.value.description.trim()
      } else {
        updateData.description = ''  // Leerer String statt undefined
      }
      
      await galleryStore.updateFolder(editingFolder.value.id!, updateData)
    } else {
      // Create new folder
      const folderData: Omit<GalleryFolder, 'id'> = {
        name: folderForm.value.name.trim()
      }
      
      if (folderForm.value.description.trim()) {
        folderData.description = folderForm.value.description.trim()
      }
      
      await galleryStore.createFolder(folderData)
    }
    closeFolderModal()
  } catch (error) {
    console.error('Fehler beim Speichern des Ordners:', error)
  } finally {
    isSubmitting.value = false
  }
}

const confirmDeleteFolder = (folder: GalleryFolder) => {
  folderToDelete.value = folder
  showDeleteFolderModal.value = true
}

const confirmDeleteCurrentFolder = () => {
  if (galleryStore.currentFolderData) {
    confirmDeleteFolder(galleryStore.currentFolderData)
  }
}

const deleteFolderConfirmed = async () => {
  if (!folderToDelete.value) return
  
  isSubmitting.value = true
  try {
    await galleryStore.deleteFolder(folderToDelete.value.id!)
    showDeleteFolderModal.value = false
    folderToDelete.value = null
  } catch (error) {
    console.error('Fehler beim Löschen des Ordners:', error)
  } finally {
    isSubmitting.value = false
  }
}

const closeFolderModal = () => {
  showFolderModal.value = false
  editingFolder.value = null
  folderForm.value.name = ''
  folderForm.value.description = ''
}

// Add Images to Folder methods
const toggleImageSelection = (imageId: string) => {
  const index = selectedImagesToAdd.value.indexOf(imageId)
  if (index > -1) {
    selectedImagesToAdd.value.splice(index, 1)
  } else {
    selectedImagesToAdd.value.push(imageId)
  }
}

const addSelectedImagesToFolder = async () => {
  if (!galleryStore.currentFolder || selectedImagesToAdd.value.length === 0) return
  
  isSubmitting.value = true
  try {
    // Verschiebe alle ausgewählten Bilder in den aktuellen Ordner
    await galleryStore.moveImagesBetweenFolders(
      selectedImagesToAdd.value,
      null, // von unorganisiert oder anderen Ordnern
      galleryStore.currentFolder
    )
    
    closeAddImagesModal()
  } catch (error) {
    console.error('Fehler beim Hinzufügen der Bilder zum Ordner:', error)
  } finally {
    isSubmitting.value = false
  }
}

const closeAddImagesModal = () => {
  showAddImagesModal.value = false
  selectedImagesToAdd.value = []
  addImagesSearchQuery.value = ''
}

// Inline rename methods
const startRename = (folder: GalleryFolder) => {
  renamingFolder.value = folder.id!
  renameValue.value = folder.name
  
  // Focus das Input-Feld nach dem nächsten DOM-Update
  nextTick(() => {
    const input = renameInput.value || breadcrumbRenameInput.value
    if (input) {
      input.focus()
      input.select()
    }
  })
}

const confirmRename = async () => {
  if (!renamingFolder.value || !renameValue.value.trim()) {
    cancelRename()
    return
  }
  
  const newName = renameValue.value.trim()
  const folderId = renamingFolder.value
  
  // Prüfe ob sich der Name geändert hat
  const currentFolder = galleryStore.folders.find(f => f.id === folderId)
  if (currentFolder && currentFolder.name === newName) {
    cancelRename()
    return
  }
  
  try {
    await galleryStore.updateFolder(folderId, { name: newName })
    cancelRename()
  } catch (error) {
    console.error('Fehler beim Umbenennen des Ordners:', error)
    // Bei Fehler den Rename-Modus beibehalten
  }
}

const cancelRename = () => {
  renamingFolder.value = null
  renameValue.value = ''
}

onMounted(() => {
  galleryStore.fetchImages()
  galleryStore.fetchFolders()
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
  flex-wrap: wrap;
  gap: var(--spacing-lg);
}

.header-actions {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
  align-items: center;
  min-width: 0; /* Allows shrinking */
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
  font-size: var(--font-size-sm);
}

.breadcrumb-btn {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  text-decoration: underline;
}

.breadcrumb-separator {
  color: var(--color-gray-400);
}

.breadcrumb-current {
  color: var(--color-gray-600);
  font-weight: var(--font-weight-medium);
}

.breadcrumb-rename {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.breadcrumb-rename-input {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  min-width: 120px;
}

.breadcrumb-rename-input:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(83, 98, 254, 0.1);
}

.breadcrumb-rename-btn {
  height: 32px;
  padding: 0 var(--spacing-sm);
  border: none;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-left: var(--spacing-xs);
  white-space: nowrap;
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.breadcrumb-rename-btn.confirm {
  background: var(--color-green-500);
  color: var(--color-white);
  border: 2px solid var(--color-green-600);
}

.breadcrumb-rename-btn.confirm:hover {
  background: var(--color-green-600);
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(34, 197, 94, 0.3);
}

.breadcrumb-rename-btn.cancel {
  background: var(--color-gray-400);
  color: var(--color-white);
  border: 2px solid var(--color-gray-500);
}

.breadcrumb-rename-btn.cancel:hover {
  background: var(--color-gray-500);
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(107, 114, 128, 0.3);
}

.breadcrumb-rename-btn svg {
  width: 16px;
  height: 16px;
  stroke-width: 2;
  flex-shrink: 0;
}

.breadcrumb-rename-btn span {
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.header-content h1 {
  color: var(--color-secondary);
  margin-bottom: var(--spacing-sm);
}

.header-content p {
  color: var(--color-gray-600);
  margin: 0;
}

.btn-primary svg,
.btn-secondary svg {
  width: 20px;
  height: 20px;
}

/* Folders Section */
.folders-section {
  margin-bottom: var(--spacing-xl);
}

.folders-section h2 {
  color: var(--color-secondary);
  margin-bottom: var(--spacing-lg);
}

.folders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.folder-card {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
  cursor: pointer;
  border: 2px solid transparent;
  position: relative;
}

.folder-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary);
}

.folder-icon {
  width: 60px;
  height: 60px;
  margin-bottom: var(--spacing-md);
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
}

.folder-icon svg {
  width: 100%;
  height: 100%;
  color: var(--color-primary);
}

.folder-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.folder-info h3 {
  color: var(--color-secondary);
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-lg);
}

.folder-rename {
  margin-bottom: var(--spacing-sm);
}

.folder-rename-input {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--color-secondary);
  margin-bottom: var(--spacing-sm);
}

.folder-rename-input:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(83, 98, 254, 0.1);
}

.folder-rename-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.rename-btn {
  height: 36px;
  padding: 0 var(--spacing-md);
  border: none;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.rename-btn.confirm {
  background: var(--color-green-500);
  color: var(--color-white);
  border: 2px solid var(--color-green-600);
}

.rename-btn.confirm:hover {
  background: var(--color-green-600);
  transform: scale(1.08);
  box-shadow: 0 6px 12px rgba(34, 197, 94, 0.4);
}

.rename-btn.cancel {
  background: var(--color-gray-400);
  color: var(--color-white);
  border: 2px solid var(--color-gray-500);
}

.rename-btn.cancel:hover {
  background: var(--color-gray-500);
  transform: scale(1.08);
  box-shadow: 0 6px 12px rgba(107, 114, 128, 0.4);
}

.rename-btn svg {
  width: 18px;
  height: 18px;
  stroke-width: 2.5;
  flex-shrink: 0;
}

.rename-btn span {
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.folder-info p {
  color: var(--color-gray-600);
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-sm);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.folder-count {
  color: var(--color-gray-500);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.folder-actions {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  display: flex;
  gap: var(--spacing-xs);
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.folder-actions.visible {
  opacity: 1;
}

.folder-card:hover .folder-actions {
  opacity: 1;
}

.action-btn.prominent {
  background: var(--color-red-500);
  color: var(--color-white);
  box-shadow: var(--shadow-md);
}

.action-btn.prominent:hover {
  background: var(--color-red-600);
  transform: scale(1.1);
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.7);
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

.queue-name-input {
  margin-bottom: var(--spacing-sm);
}

.queue-label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-secondary);
  margin-bottom: var(--spacing-xs);
}

.queue-title-input {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  transition: border-color var(--transition-fast);
}

.queue-title-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(83, 98, 254, 0.1);
}

.queue-meta {
  color: var(--color-gray-500);
  font-size: var(--font-size-xs);
  margin: 0;
  font-family: monospace;
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
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.progress-item.uploading {
  border-color: var(--color-primary);
  background: rgba(83, 98, 254, 0.02);
}

.progress-item.completed {
  border-color: var(--color-green-400);
  background: rgba(34, 197, 94, 0.02);
}

.progress-item.error {
  border-color: var(--color-red-400);
  background: rgba(239, 68, 68, 0.02);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.progress-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.progress-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.progress-icon {
  width: 16px;
  height: 16px;
}

.progress-icon.uploading {
  color: var(--color-primary);
  animation: pulse 2s infinite;
}

.progress-icon.completed {
  color: var(--color-green-500);
}

.progress-icon.error {
  color: var(--color-red-500);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.progress-bar {
  height: 6px;
  background: var(--color-gray-200);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width var(--transition-fast);
  border-radius: var(--radius-sm);
}

.progress-fill.pending {
  background: var(--color-gray-400);
}

.progress-fill.uploading {
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
}

.progress-fill.completed {
  background: var(--color-green-500);
}

.progress-percent {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-600);
}

.progress-error {
  margin-top: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: var(--color-red-50);
  color: var(--color-red-700);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  border: 1px solid var(--color-red-200);
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

.form-group input,
.form-group textarea {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-family: inherit;
  resize: vertical;
}

.form-group input:focus,
.form-group textarea:focus {
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

.btn-danger svg {
  width: 20px;
  height: 20px;
}

/* Add Images Modal */
.add-images-search {
  margin-bottom: var(--spacing-lg);
}

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

/* Medium screens - Tablets */
@media (max-width: 1024px) {
  .header-actions {
    gap: var(--spacing-sm);
    flex-wrap: wrap;
  }
  
  .header-actions .btn-primary,
  .header-actions .btn-secondary,
  .header-actions .btn-danger {
    font-size: var(--font-size-sm);
    padding: var(--spacing-sm) var(--spacing-lg);
    white-space: nowrap;
  }
  
  .header-actions svg {
    width: 16px;
    height: 16px;
  }
}

/* Tablet portrait and small desktop */
@media (max-width: 900px) {
  .header-actions {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }
  
  .header-actions .btn-primary,
  .header-actions .btn-secondary,
  .header-actions .btn-danger {
    width: 100%;
    justify-content: center;
  }
}

/* Small screens - Mobile */
@media (max-width: 768px) {
  .gallery-page {
    padding: var(--spacing-lg);
  }
  
  .page-header {
    flex-direction: column;
    gap: var(--spacing-lg);
    align-items: stretch;
  }
  
  .header-actions {
    flex-direction: column;
    gap: var(--spacing-sm);
    width: 100%;
  }
  
  .header-actions .btn-primary,
  .header-actions .btn-secondary,
  .header-actions .btn-danger {
    width: 100%;
    justify-content: center;
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
  
  .add-images-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .add-images-stats {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
}

/* Extra small screens */
@media (max-width: 480px) {
  .header-actions {
    flex-direction: column;
    gap: var(--spacing-sm);
    width: 100%;
  }
  
  .header-actions .btn-primary,
  .header-actions .btn-secondary,
  .header-actions .btn-danger {
    width: 100%;
    justify-content: center;
    font-size: var(--font-size-sm);
    padding: var(--spacing-md);
  }
  
  .header-content h1 {
    font-size: var(--font-size-xl);
  }
  
  .breadcrumb {
    flex-wrap: wrap;
    font-size: var(--font-size-sm);
  }
}
</style>
