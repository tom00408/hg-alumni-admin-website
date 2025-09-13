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
export interface GalleryFolder {
  id?: string
  name: string
  description?: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
  coverImageId?: string // ID des Bildes, das als Cover verwendet wird
}

export interface GalleryImage {
  id?: string
  title?: string
  imageUrl: string
  thumbnailUrl?: string
  folderId?: string // Zugehörigkeit zu einem Ordner (optional)
  createdAt?: Timestamp
}

// Membership Application Types
export interface MembershipApplication {
  id?: string
  salutation: string
  firstName: string
  lastName: string
  address: string
  postalCode: string
  city: string
  birthDate: string
  occupation?: string
  email: string
  schoolFrom?: string
  schoolTo?: string
  iban: string
  bic: string
  placeDate: string
  signature: string
  createdAt?: Timestamp
  status?: 'new' | 'in_progress' | 'approved' | 'rejected'
}

export interface Member {
  id?: string
  salutation: string
  firstName: string
  lastName: string
  address: string
  postalCode: string
  city: string
  birthDate: string
  occupation?: string
  email: string
  iban: string
  bic: string
  schoolFrom?: string
  schoolTo?: string
  memberSince: Timestamp
  membershipNumber: string
  status: 'active' | 'inactive' | 'suspended'
  applicationId?: string // Referenz zum ursprünglichen Antrag
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

// Authentication Types
export interface User {
  uid: string
  email: string
  isAdmin: boolean
  displayName?: string
  photoURL?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}
