<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    :title="title"
    @click="handleClick"
    :type="type"
  >
    <!-- Loading Spinner -->
    <div v-if="loading" class="tom-btn-spinner">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    </div>
    
    <!-- Icon (nur wenn kein Loading) -->
    <svg v-else-if="iconPath && !loading" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" :d="iconPath" />
    </svg>
    
    <!-- Text (basiert auf Variante und title) -->
    <span v-if="shouldShowText" class="tom-btn-text">
      <slot>{{ displayText }}</slot>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

const slots = useSlots()

// Icon Keywords mapping
const ICON_MAP = {
  // Basic Actions
  'add': 'M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  'edit': 'm16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10',
  'delete': 'm14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916C15.75 3.42 15.23 3 14.625 3h-3.25c-.604 0-1.125.42-1.125.938v.916m7.5 0a48.667 48.667 0 0 0-7.5 0',
  'save': 'M17 3v10l-5-3-5 3V3a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2z',
  'close': 'M6 18 18 6M6 6l12 12',
  'check': 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  'cancel': 'M6 18 18 6M6 6l12 12',
  'refresh': 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99',
  
  // Upload & Download
  'upload': 'M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5',
  'download': 'M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12M12 16.5V3',
  
  // Navigation
  'back': 'M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18',
  'forward': 'M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3',
  'home': 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25',
  'menu': 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5',
  
  // View Controls
  'search': 'm21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z',
  'eye': 'M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  'view-grid': 'M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h1.5a1.125 1.125 0 0 1 1.125-1.125m12.75 0a1.125 1.125 0 0 1 1.125 1.125m1.125 1.125a1.125 1.125 0 0 1-1.125 1.125M3.375 7.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 7.5h1.5a1.125 1.125 0 0 1 1.125-1.125m12.75 0a1.125 1.125 0 0 1 1.125 1.125M19.5 7.5a1.125 1.125 0 0 1-1.125 1.125M5.625 3.375a1.125 1.125 0 0 1 1.125-1.125h2.25a1.125 1.125 0 0 1 1.125 1.125v2.25a1.125 1.125 0 0 1-1.125 1.125H6.75a1.125 1.125 0 0 1-1.125-1.125V3.375ZM5.625 10.125A1.125 1.125 0 0 1 6.75 9h2.25a1.125 1.125 0 0 1 1.125 1.125v2.25A1.125 1.125 0 0 1 9 13.5H6.75a1.125 1.125 0 0 1-1.125-1.125v-2.25ZM13.125 3.375A1.125 1.125 0 0 1 14.25 2.25h2.25a1.125 1.125 0 0 1 1.125 1.125v2.25a1.125 1.125 0 0 1-1.125 1.125H14.25a1.125 1.125 0 0 1-1.125-1.125V3.375ZM13.125 10.125A1.125 1.125 0 0 1 14.25 9h2.25a1.125 1.125 0 0 1 1.125 1.125v2.25a1.125 1.125 0 0 1-1.125 1.125H14.25a1.125 1.125 0 0 1-1.125-1.125v-2.25Z',
  'view-list': 'M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z',
  
  // Folders & Files
  'folder': 'M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25H11.69l-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v6.75Z',
  'folder-new': 'M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25H11.69l-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v6.75Z',
  'image': 'm2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z',
  
  // Settings & Tools
  'settings': 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a6.759 6.759 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  'filter': 'M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z',
  'share': 'M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z',
  
  // User & Auth
  'user': 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z',
  'login': 'M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75',
  'logout': 'M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9',
  
  // Status & Feedback
  'info': 'M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z',
  'warning': 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z',
  'error': 'M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z',
  'success': 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'
} as const

type IconKeyword = keyof typeof ICON_MAP

interface Props {
  // Button Varianten
  variant?: 'primary' | 'secondary' | 'danger' | 'action' | 'action-delete' | 'action-selected'
  size?: 'small' | 'medium' | 'large'
  
  // States
  disabled?: boolean
  loading?: boolean
  
  // Content
  title?: string  // Hauptinhalt - wird als Text oder Tooltip verwendet
  icon?: IconKeyword | string
  
  // Legacy (deprecated, use title instead)
  text?: string  // Wird ignoriert wenn title vorhanden ist
  
  // Responsive Behavior
  responsive?: boolean  // Auf kleinen Screens zu Icon-only wechseln
  
  // HTML Attributes
  type?: 'button' | 'submit' | 'reset'
}

interface Emits {
  (e: 'click', event: MouseEvent): void
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'medium',
  type: 'button',
  disabled: false,
  loading: false,
  responsive: false
})

const emit = defineEmits<Emits>()

// Computed icon path - check if it's a keyword or custom path
const iconPath = computed(() => {
  if (!props.icon) return null
  
  // Check if it's a predefined keyword
  if (props.icon in ICON_MAP) {
    return ICON_MAP[props.icon as IconKeyword]
  }
  
  // Otherwise treat it as a custom SVG path
  return props.icon
})

// Determine the display text (title takes precedence over text)
const displayText = computed(() => {
  return props.title || props.text || ''
})

// Check if text should be shown based on variant
const shouldShowText = computed(() => {
  // Slot content always shows
  if (slots.default) return true
  
  // No text content available
  if (!displayText.value) return false
  
  // Action variants never show text (always icon-only)
  if (props.variant?.startsWith('action')) return false
  
  // Other variants show text
  return true
})

// Check if there's text content (for responsive classes)
const hasText = computed(() => {
  return shouldShowText.value && (!!displayText.value || !!slots.default)
})

// Check if there's an icon
const hasIcon = computed(() => {
  return !!iconPath.value
})

// Computed button classes
const buttonClasses = computed(() => {
  const classes = ['tom-btn']
  
  // Variant classes
  switch (props.variant) {
    case 'primary':
      classes.push('tom-btn-primary')
      break
    case 'secondary':
      classes.push('tom-btn-secondary')
      break
    case 'danger':
      classes.push('tom-btn-danger')
      break
    case 'action':
      classes.push('tom-btn-action')
      break
    case 'action-delete':
      classes.push('tom-btn-action', 'tom-btn-action-delete')
      break
    case 'action-selected':
      classes.push('tom-btn-action', 'tom-btn-action-selected')
      break
  }
  
  // Size classes
  switch (props.size) {
    case 'small':
      classes.push('tom-btn-small')
      break
    case 'large':
      classes.push('tom-btn-large')
      break
    default:
      classes.push('tom-btn-medium')
  }
  
  // Content-based responsive classes
  if (hasIcon.value && hasText.value) {
    classes.push('tom-btn-icon-text') // Icon + Text
    if (props.responsive) {
      classes.push('tom-btn-responsive') // Kann auf Mobile zu Icon-only werden
    }
  } else if (hasIcon.value && !hasText.value) {
    classes.push('tom-btn-icon-only') // Nur Icon
  } else if (!hasIcon.value && hasText.value) {
    classes.push('tom-btn-text-only') // Nur Text
  }
  
  // State classes
  if (props.loading) {
    classes.push('tom-btn-loading')
  }
  
  if (props.disabled) {
    classes.push('tom-btn-disabled')
  }
  
  return classes
})

// Click handler
const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
/* Base Button Styles */
.tom-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  border: none;
  border-radius: var(--radius-md);
  font-family: inherit;
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-normal);
  white-space: nowrap;
  text-decoration: none;
  outline: none;
  position: relative;
  overflow: hidden;
}

.tom-btn:focus {
  box-shadow: 0 0 0 3px rgba(83, 98, 254, 0.1);
}

/* Size Variants */
.tom-btn-small {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-sm);
  min-height: 32px;
}

.tom-btn-small svg {
  width: 16px;
  height: 16px;
}

.tom-btn-medium {
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: var(--font-size-base);
  min-height: 40px;
}

.tom-btn-medium svg {
  width: 20px;
  height: 20px;
}

.tom-btn-large {
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: var(--font-size-lg);
  min-height: 48px;
}

.tom-btn-large svg {
  width: 24px;
  height: 24px;
}

/* Color Variants */
.tom-btn-primary {
  background: var(--color-primary);
  color: var(--color-white);
  box-shadow: var(--shadow-md);
}

.tom-btn-primary:hover:not(.tom-btn-disabled):not(.tom-btn-loading) {
  background: var(--color-accent);
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.tom-btn-secondary {
  background: var(--color-white);
  color: var(--color-secondary);
  border: 1px solid var(--color-gray-300);
  box-shadow: var(--shadow-sm);
}

.tom-btn-secondary:hover:not(.tom-btn-disabled):not(.tom-btn-loading) {
  background: var(--color-gray-50);
  border-color: var(--color-gray-400);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.tom-btn-danger {
  background: var(--color-error);
  color: var(--color-white);
  box-shadow: var(--shadow-md);
}

.tom-btn-danger:hover:not(.tom-btn-disabled):not(.tom-btn-loading) {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

/* Action Button Variants (für kleine runde Buttons) */
.tom-btn-action {
  width: 40px;
  height: 40px;
  padding: 0;
  border-radius: var(--radius-md);
  background: var(--color-white);
  color: var(--color-gray-700);
  min-height: unset;
  border: 1px solid var(--color-gray-300);
  box-shadow: var(--shadow-sm);
}

.tom-btn-action:hover:not(.tom-btn-disabled):not(.tom-btn-loading) {
  background: var(--color-gray-50);
  border-color: var(--color-gray-400);
  transform: scale(1.05);
  box-shadow: var(--shadow-md);
}

.tom-btn-action:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(83, 98, 254, 0.1);
}

.tom-btn-action-selected {
  background: var(--color-primary);
  color: var(--color-white);
  border-color: var(--color-primary);
}

.tom-btn-action-selected:hover:not(.tom-btn-disabled):not(.tom-btn-loading) {
  background: var(--color-accent);
  border-color: var(--color-accent);
}

.tom-btn-action-delete {
  border-color: var(--color-red-300);
}

.tom-btn-action-delete:hover:not(.tom-btn-disabled):not(.tom-btn-loading) {
  background: var(--color-error);
  color: var(--color-white);
  border-color: var(--color-error);
  box-shadow: var(--shadow-lg);
}

/* States */
.tom-btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.tom-btn-loading {
  cursor: wait;
}

/* Loading Spinner */
.tom-btn-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.tom-btn-spinner svg {
  animation: tom-btn-spin 1s linear infinite;
}

@keyframes tom-btn-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Text Spacing */
.tom-btn-text {
  display: flex;
  align-items: center;
}

/* Content-based responsive styling */
.tom-btn-icon-only {
  /* Nur Icon - quadratisch machen */
  aspect-ratio: 1;
  padding: 0;
  gap: 0;
  justify-content: center;
}

.tom-btn-icon-only.tom-btn-small {
  width: 32px;
  height: 32px;
}

.tom-btn-icon-only.tom-btn-medium {
  width: 40px;
  height: 40px;
}

.tom-btn-icon-only.tom-btn-large {
  width: 48px;
  height: 48px;
}

.tom-btn-text-only {
  /* Nur Text - normales Padding */
  gap: 0;
}

.tom-btn-icon-text {
  /* Icon + Text - mit Gap */
  gap: var(--spacing-sm);
}

/* Action Buttons sind immer icon-only - nur Layout-Eigenschaften */
.tom-btn-action {
  gap: 0;
  aspect-ratio: 1;
  justify-content: center;
}

/* Responsive */
@media (max-width: 768px) {
  /* Auf Mobile nur Text oder kleinere Icons bei Text-Buttons */
  .tom-btn-icon-text .tom-btn-text {
    font-size: var(--font-size-sm);
  }
  
  .tom-btn-icon-text svg {
    width: 16px;
    height: 16px;
  }
  
  /* Kleinere Buttons auf Mobile */
  .tom-btn-medium:not(.tom-btn-icon-only):not(.tom-btn-action) {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--font-size-sm);
  }
  
  .tom-btn-large:not(.tom-btn-icon-only):not(.tom-btn-action) {
    padding: var(--spacing-md) var(--spacing-lg);
    font-size: var(--font-size-base);
  }
  
  /* Icon-only Buttons bleiben gleich groß auf Mobile für Touch */
  .tom-btn-icon-only.tom-btn-small {
    min-width: 36px;
    min-height: 36px;
  }
  
  .tom-btn-icon-only.tom-btn-medium {
    min-width: 44px;
    min-height: 44px;
  }
}

@media (max-width: 480px) {
  /* Auf sehr kleinen Screens können Icon+Text Buttons zu nur Icon werden */
  .tom-btn-icon-text.tom-btn-responsive .tom-btn-text {
    display: none;
  }
  
  .tom-btn-icon-text.tom-btn-responsive {
    width: 40px;
    height: 40px;
    padding: 0;
    gap: 0;
  }
}
</style>
