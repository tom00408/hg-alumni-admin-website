<template>
  <div 
    class="hg-card"
    :class="{
      'hg-card--hover': hover,
      'hg-card--compact': compact,
      [`hg-card--${variant}`]: variant
    }"
  >
    <!-- Header Slot -->
    <header 
      v-if="$slots.header"
      class="hg-card__header"
    >
      <slot name="header" />
    </header>

    <!-- Main Content -->
    <div class="hg-card__content">
      <slot />
    </div>

    <!-- Footer Slot -->
    <footer 
      v-if="$slots.footer"
      class="hg-card__footer"
    >
      <slot name="footer" />
    </footer>
  </div>
</template>

<script setup lang="ts">
interface Props {
  hover?: boolean
  compact?: boolean
  variant?: 'default' | 'primary' | 'secondary' | 'accent'
}

withDefaults(defineProps<Props>(), {
  hover: false,
  compact: false,
  variant: 'default'
})
</script>

<style scoped>
.hg-card {
  background-color: var(--color-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: all var(--transition-normal);
  border: 1px solid var(--color-gray-100);
}

.hg-card--hover:hover {
  box-shadow: var(--shadow-xl);
  transform: translateY(-2px);
}

.hg-card--compact {
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.hg-card--compact:hover {
  box-shadow: var(--shadow-md);
}

/* Variants */
.hg-card--primary {
  border-color: var(--color-primary);
  background: linear-gradient(135deg, var(--color-white) 0%, rgba(83, 98, 254, 0.02) 100%);
}

.hg-card--secondary {
  border-color: var(--color-secondary);
  background: linear-gradient(135deg, var(--color-white) 0%, rgba(7, 72, 143, 0.02) 100%);
}

.hg-card--accent {
  border-color: var(--color-accent);
  background: linear-gradient(135deg, var(--color-white) 0%, rgba(72, 109, 185, 0.02) 100%);
}

.hg-card__header {
  padding: var(--spacing-xl) var(--spacing-xl) 0;
}

.hg-card--compact .hg-card__header {
  padding: var(--spacing-lg) var(--spacing-lg) 0;
}

.hg-card__content {
  padding: var(--spacing-xl);
}

.hg-card--compact .hg-card__content {
  padding: var(--spacing-lg);
}

.hg-card__footer {
  padding: 0 var(--spacing-xl) var(--spacing-xl);
  margin-top: auto;
}

.hg-card--compact .hg-card__footer {
  padding: 0 var(--spacing-lg) var(--spacing-lg);
}

/* Wenn sowohl Header als auch Content vorhanden sind */
.hg-card__header + .hg-card__content {
  padding-top: var(--spacing-lg);
}

.hg-card--compact .hg-card__header + .hg-card__content {
  padding-top: var(--spacing-md);
}

/* Focus-Styles für Links/Buttons in Cards */
.hg-card:focus-within {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Mobile Anpassungen */
@media (max-width: 768px) {
  .hg-card__content,
  .hg-card__header,
  .hg-card__footer {
    padding-left: var(--spacing-lg);
    padding-right: var(--spacing-lg);
  }
  
  .hg-card--compact .hg-card__content,
  .hg-card--compact .hg-card__header,
  .hg-card--compact .hg-card__footer {
    padding-left: var(--spacing-md);
    padding-right: var(--spacing-md);
  }
}
</style>
