import { Timestamp } from 'firebase/firestore'

// Event Types
export interface Event {
  id?: string
  title: string
  date: Timestamp
  location?: string
  description?: string
  isFeatured?: boolean
  createdAt?: Timestamp
}

// News Types
export interface NewsArticle {
  id?: string
  title: string
  slug: string
  date: Timestamp
  excerpt: string
  content: string
  coverUrl?: string
  tags?: string[]
  createdAt?: Timestamp
}

// Gallery Types
export interface GalleryImage {
  id?: string
  title?: string
  imageUrl: string
  thumbnailUrl?: string
  createdAt?: Timestamp
}

// Membership Application Types
export interface MembershipApplication {
  id?: string
  name: string
  email: string
  graduationYear?: number
  relation?: string
  message?: string
  createdAt?: Timestamp
  status?: 'pending' | 'approved' | 'rejected'
}

// Navigation Types
export interface NavItem {
  id: string
  label: string
  route: string
  icon: string
  external?: boolean
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  success: boolean
  error?: string
}

// Loading States
export interface LoadingState {
  loading: boolean
  error: string | null
}

// Form Validation
export interface ValidationError {
  field: string
  message: string
}
