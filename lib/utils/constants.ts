// App-wide constants and configuration

// API endpoints
export const API_ENDPOINTS = {
  SERVICES: "/api/services",
  BOOKINGS: "/api/bookings",
  REVIEWS: "/api/reviews",
  PROFILES: "/api/profiles",
  CATEGORIES: "/api/categories",
  UPLOAD: "/api/upload",
  STRIPE: "/api/stripe",
} as const;

// Booking statuses with display info
export const BOOKING_STATUSES = {
  PENDING_CONFIRMATION: {
    label: "Pending Confirmation",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    description: "Waiting for professional to confirm",
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    description: "Booking confirmed, waiting to start",
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    description: "Service is currently being delivered",
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-green-100 text-green-800 border-green-200",
    description: "Service has been completed",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800 border-red-200",
    description: "Booking was cancelled",
  },
} as const;

// Service categories
export const CATEGORIES = [
  { id: "web-development", name: "Web Development", icon: "💻" },
  { id: "mobile-development", name: "Mobile Development", icon: "📱" },
  { id: "design", name: "Design", icon: "🎨" },
  { id: "marketing", name: "Marketing", icon: "📈" },
  { id: "writing", name: "Writing & Content", icon: "✍️" },
  { id: "consulting", name: "Business Consulting", icon: "💼" },
  { id: "data", name: "Data & Analytics", icon: "📊" },
  { id: "photography", name: "Photography", icon: "📸" },
  { id: "video", name: "Video & Animation", icon: "🎬" },
  { id: "music", name: "Music & Audio", icon: "🎵" },
  { id: "translation", name: "Translation", icon: "🌐" },
  { id: "tutoring", name: "Tutoring & Training", icon: "🎓" },
] as const;

// Service types (as array for mapping)
export const SERVICE_TYPES_ARRAY = [
  {
    value: "TIME_BASED",
    label: "Time-Based",
    description: "Hourly consultations, meetings, calls",
  },
  {
    value: "PROJECT_BASED",
    label: "Project-Based",
    description: "Fixed deliverables, design work, development",
  },
] as const;

// Service types (as object for lookup)
export const SERVICE_TYPES = {
  TIME_BASED: {
    label: "Time-Based",
    description: "Hourly consultations, meetings, calls",
  },
  PROJECT_BASED: {
    label: "Project-Based",
    description: "Fixed deliverables, design work, development",
  },
} as const;

// Pricing types
export const PRICING_TYPES = {
  FIXED: {
    label: "Fixed Price",
    description: "One-time payment for the entire service",
  },
  HOURLY: {
    label: "Hourly Rate",
    description: "Pay per hour of work",
  },
} as const;

// Delivery time units
export const DELIVERY_TIME_UNITS = {
  MINUTES: {
    label: "Minutes",
    singular: "minute",
    plural: "minutes",
  },
  HOURS: {
    label: "Hours",
    singular: "hour",
    plural: "hours",
  },
  DAYS: {
    label: "Days",
    singular: "day",
    plural: "days",
  },
} as const;

// User roles
export const USER_ROLES = {
  CLIENT: {
    label: "Client",
    description: "Book services from professionals",
  },
  PROFESSIONAL: {
    label: "Professional",
    description: "Offer services to clients",
  },
} as const;

// Sort options for search
export const SORT_OPTIONS = [
  { label: "Most Relevant", value: "relevance" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Highest Rated", value: "rating" },
  { label: "Newest First", value: "newest" },
] as const;

// Price ranges for filters
export const PRICE_RANGES = [
  { label: "Under $25", min: 0, max: 2500 },
  { label: "$25 - $50", min: 2500, max: 5000 },
  { label: "$50 - $100", min: 5000, max: 10000 },
  { label: "$100 - $250", min: 10000, max: 25000 },
  { label: "$250 - $500", min: 25000, max: 50000 },
  { label: "$500+", min: 50000, max: null },
] as const;

// Rating options
export const RATING_OPTIONS = [
  { label: "4+ stars", value: 4 },
  { label: "3+ stars", value: 3 },
  { label: "2+ stars", value: 2 },
  { label: "1+ stars", value: 1 },
] as const;

// File upload limits
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  ALLOWED_DOCUMENT_TYPES: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  DEFAULT_PAGE: 1,
} as const;

// Search limits
export const SEARCH_LIMITS = {
  MIN_QUERY_LENGTH: 2,
  MAX_QUERY_LENGTH: 100,
  DEBOUNCE_DELAY: 300,
} as const;

// Business rules
export const BUSINESS_RULES = {
  MIN_SERVICE_PRICE: 500, // $5.00 in cents
  MAX_SERVICE_PRICE: 100000000, // $1,000,000 in cents
  PLATFORM_FEE_PERCENTAGE: 0.05, // 5%
  MIN_BOOKING_DURATION: 15, // minutes
  MAX_BOOKING_DURATION: 480, // 8 hours in minutes
  CANCELLATION_WINDOW: 24, // hours before booking starts
  REVIEW_DEADLINE: 30, // days after booking completion
  MIN_PROFILE_COMPLETION: 70, // percentage for appearing in search
} as const;

// Time zones
export const COMMON_TIMEZONES = [
  { label: "Eastern Time (ET)", value: "America/New_York" },
  { label: "Central Time (CT)", value: "America/Chicago" },
  { label: "Mountain Time (MT)", value: "America/Denver" },
  { label: "Pacific Time (PT)", value: "America/Los_Angeles" },
  { label: "UTC", value: "UTC" },
] as const;

// Contact methods
export const CONTACT_METHODS = {
  EMAIL: "email",
  PHONE: "phone",
  VIDEO_CALL: "video_call",
  IN_PERSON: "in_person",
} as const;

// Notification types
export const NOTIFICATION_TYPES = {
  BOOKING_REQUEST: "booking_request",
  BOOKING_CONFIRMED: "booking_confirmed",
  BOOKING_CANCELLED: "booking_cancelled",
  BOOKING_COMPLETED: "booking_completed",
  REVIEW_RECEIVED: "review_received",
  PAYMENT_RECEIVED: "payment_received",
  MESSAGE_RECEIVED: "message_received",
} as const;

// Feature flags
export const FEATURES = {
  ENABLE_CHAT: true,
  ENABLE_VIDEO_CALLS: false,
  ENABLE_SUBSCRIPTIONS: false,
  ENABLE_ANALYTICS: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_MULTI_CURRENCY: false,
} as const;

// Social media platforms
export const SOCIAL_PLATFORMS = {
  LINKEDIN: "linkedin",
  TWITTER: "twitter",
  GITHUB: "github",
  PORTFOLIO: "portfolio",
  WEBSITE: "website",
} as const;

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: "Something went wrong. Please try again.",
  NETWORK: "Network error. Please check your connection.",
  UNAUTHORIZED: "You must be logged in to perform this action.",
  FORBIDDEN: "You do not have permission to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION: "Please check your input and try again.",
  FILE_TOO_LARGE: "File size exceeds the maximum allowed limit.",
  INVALID_FILE_TYPE: "This file type is not supported.",
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: "Profile updated successfully!",
  SERVICE_CREATED: "Service created successfully!",
  SERVICE_UPDATED: "Service updated successfully!",
  BOOKING_CREATED: "Booking request sent successfully!",
  BOOKING_CONFIRMED: "Booking confirmed successfully!",
  REVIEW_SUBMITTED: "Review submitted successfully!",
  FILE_UPLOADED: "File uploaded successfully!",
  EMAIL_SENT: "Email sent successfully!",
} as const;

// Regex patterns
export const PATTERNS = {
  USERNAME: /^[a-zA-Z0-9_-]+$/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  URL: /^https?:\/\/.+/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  THEME: "prolink-theme",
  SEARCH_HISTORY: "prolink-search-history",
  DRAFT_SERVICE: "prolink-draft-service",
  USER_PREFERENCES: "prolink-user-preferences",
} as const;

// Cookie names
export const COOKIE_NAMES = {
  AUTH_TOKEN: "prolink-auth-token",
  REFRESH_TOKEN: "prolink-refresh-token",
  SESSION_ID: "prolink-session-id",
} as const;

// External service URLs
export const EXTERNAL_URLS = {
  STRIPE_DASHBOARD: "https://dashboard.stripe.com",
  SUPPORT_EMAIL: "support@prolink.com",
  PRIVACY_POLICY: "/legal/privacy",
  TERMS_OF_SERVICE: "/legal/terms",
  HELP_CENTER: "/help",
} as const;
