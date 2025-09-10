<template>
  <div v-if="show" class="modal-overlay image-modal" @click="closeModal">
    <div class="image-modal-content" @click.stop>
      <TomButton 
        @click="closeModal" 
        variant="action" 
        title="Schließen"
        icon="close"
        class="image-modal-close"
      />
      <img :src="viewingImage?.imageUrl" :alt="viewingImage?.title || 'Bild'" />
      <div v-if="viewingImage?.title" class="image-modal-title">
        {{ viewingImage.title }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GalleryImage } from '../lib/types'
import TomButton from '../tomponents/TomButton.vue'

// Props
interface Props {
  show: boolean
  viewingImage?: GalleryImage | null
}

const props = withDefaults(defineProps<Props>(), {
  viewingImage: null
})

// Emits
const emit = defineEmits<{
  'close': []
}>()

// Methods
const closeModal = () => {
  emit('close')
}
</script>

<style scoped>
/* Image View Modal */
.modal-overlay.image-modal {
  background: rgba(0, 0, 0, 0.9);
}

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
  z-index: 1;
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

/* Responsive Design */
@media (max-width: 768px) {
  .image-modal-content {
    max-width: 95vw;
    max-height: 95vh;
  }
  
  .image-modal-content img {
    max-height: calc(95vh - 80px);
  }
  
  .image-modal-close {
    top: var(--spacing-md);
    right: var(--spacing-md);
  }
}
</style>
