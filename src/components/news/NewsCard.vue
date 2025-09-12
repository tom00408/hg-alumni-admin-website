<template>
  <HgCard 
    :hover="true"
    class="news-card"
  >
    <!-- Cover Image -->
    <div v-if="article.coverUrl" class="news-card__image">
      <img 
        :src="article.coverUrl" 
        :alt="article.title"
        loading="lazy"
      />
    </div>

    <div class="news-card__content">
      <!-- Meta Information -->
      <div class="news-card__meta">
        <time class="news-card__date">
          {{ formatDate(article.date) }}
        </time>
        <div v-if="article.tags?.length" class="news-card__tags">
          <span 
            v-for="tag in article.tags.slice(0, 2)" 
            :key="tag"
            class="tag"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- Title -->
      <h3 class="news-card__title">
        {{ article.title }}
      </h3>

      <!-- Excerpt -->
      <p class="news-card__excerpt">
        {{ article.excerpt }}
      </p>
    </div>

    <div class="news-card__actions">
      <TomButton 
        @click="$emit('read-more', article)"
        title="Mehr lesen"
        variant="primary"
      />
      <TomButton 
        @click="$emit('share', article)"
        title="Artikel teilen"
        icon="share"
        variant="action"
      />
    </div>
  </HgCard>
</template>

<script setup lang="ts">
import { Timestamp } from 'firebase/firestore'
import HgCard from './HgCard.vue'
import type { NewsArticle } from '../../lib/types'
import TomButton from '../tomponents/TomButton.vue'

interface Props {
  article: NewsArticle
}

defineProps<Props>()

defineEmits<{
  'read-more': [article: NewsArticle]
  'share': [article: NewsArticle]
}>()

const formatDate = (timestamp: Timestamp) => {
  return timestamp.toDate().toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}
</script>

<style scoped>
.news-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.news-card__image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background-color: var(--color-gray-100);
}

.news-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-normal);
}

.news-card:hover .news-card__image img {
  transform: scale(1.05);
}

.news-card__content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.news-card__meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
  gap: var(--spacing-md);
}

.news-card__date {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  font-weight: var(--font-weight-medium);
  flex-shrink: 0;
}

.news-card__tags {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.tag {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--color-primary);
  color: var(--color-white);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.news-card__title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-secondary);
  margin: 0 0 var(--spacing-md) 0;
  line-height: var(--line-height-tight);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-card__excerpt {
  color: var(--color-text);
  line-height: var(--line-height-relaxed);
  margin: 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-card__actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-gray-100);
}



/* Wenn kein Bild vorhanden ist */
.news-card:not(:has(.news-card__image)) .news-card__content {
  padding-top: 0;
}

/* Mobile Anpassungen */
@media (max-width: 768px) {
  .news-card__image {
    height: 160px;
  }
  
  .news-card__title {
    font-size: var(--font-size-lg);
  }
  
  .news-card__meta {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
}

@media (max-width: 480px) {
  .news-card__actions {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: stretch;
  }
  

}
</style>
