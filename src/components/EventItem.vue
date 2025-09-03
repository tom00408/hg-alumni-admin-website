<template>
  <HgCard 
    :hover="true"
    class="event-item"
    :class="{ 'event-item--featured': event.isFeatured }"
  >
    <template #header>
      <div class="event-item__date">
        <div class="date-circle">
          <span class="date-day">{{ formatDay(event.date) }}</span>
          <span class="date-month">{{ formatMonth(event.date) }}</span>
        </div>
        <div class="date-year">{{ formatYear(event.date) }}</div>
      </div>
    </template>

    <div class="event-item__content">
      <h3 class="event-item__title">{{ event.title }}</h3>
      
      <div v-if="event.location" class="event-item__location">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        <span>{{ event.location }}</span>
      </div>

      <p v-if="event.description" class="event-item__description">
        {{ event.description }}
      </p>
    </div>

    <template #footer>
      <div class="event-item__actions">
        <button 
          class="btn-primary"
          @click="$emit('view-details', event)"
        >
          Details ansehen
        </button>
      </div>
    </template>
  </HgCard>
</template>

<script setup lang="ts">
import { Timestamp } from 'firebase/firestore'
import HgCard from './HgCard.vue'
import type { Event } from '../lib/types'

interface Props {
  event: Event
}

defineProps<Props>()

defineEmits<{
  'view-details': [event: Event]
}>()

const formatDay = (timestamp: Timestamp) => {
  return timestamp.toDate().toLocaleDateString('de-DE', { day: '2-digit' })
}

const formatMonth = (timestamp: Timestamp) => {
  return timestamp.toDate().toLocaleDateString('de-DE', { month: 'short' })
}

const formatYear = (timestamp: Timestamp) => {
  return timestamp.toDate().toLocaleDateString('de-DE', { year: 'numeric' })
}
</script>

<style scoped>
.event-item {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.event-item--featured {
  border: 2px solid var(--color-primary);
  background: linear-gradient(135deg, var(--color-white) 0%, rgba(83, 98, 254, 0.05) 100%);
}

.event-item__date {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.date-circle {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-white);
  flex-shrink: 0;
}

.date-day {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  line-height: 1;
}

.date-month {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1;
}

.date-year {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  font-weight: var(--font-weight-medium);
}

.event-item__content {
  flex: 1;
}

.event-item__title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-secondary);
  margin: 0 0 var(--spacing-md) 0;
  line-height: var(--line-height-tight);
}

.event-item__location {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--color-gray-600);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-md);
}

.event-item__location svg {
  flex-shrink: 0;
  color: var(--color-accent);
}

.event-item__description {
  color: var(--color-text);
  line-height: var(--line-height-relaxed);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.event-item__actions {
  display: flex;
  justify-content: flex-start;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-gray-100);
}

/* Featured Event Hervorhebung */
.event-item--featured .date-circle {
  background: linear-gradient(135deg, var(--color-accent), var(--color-info));
  animation: pulse 2s infinite;
}

.event-item--featured .event-item__title {
  color: var(--color-primary);
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* Mobile Anpassungen */
@media (max-width: 480px) {
  .date-circle {
    width: 50px;
    height: 50px;
  }
  
  .date-day {
    font-size: var(--font-size-base);
  }
  
  .event-item__title {
    font-size: var(--font-size-lg);
  }
}
</style>
