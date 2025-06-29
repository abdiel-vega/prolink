import type { Database } from "@/lib/supabase/database.types";

// Database table types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Service = Database["public"]["Tables"]["services"]["Row"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Skill = Database["public"]["Tables"]["skills"]["Row"];
export type PortfolioProject =
  Database["public"]["Tables"]["portfolio_projects"]["Row"];
export type WorkExperience =
  Database["public"]["Tables"]["work_experience"]["Row"];

// Enum types
export type UserRole = "CLIENT" | "PROFESSIONAL";
export type BookingStatus =
  | "PENDING_CONFIRMATION"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "DECLINED";
export type ServiceType = "TIME_BASED" | "PROJECT_BASED";
export type PricingType = "FIXED" | "HOURLY";
export type DeliveryTimeUnit = "MINUTES" | "HOURS" | "DAYS";

// Extended types with joins
export type ServiceWithProfile = Service & {
  profile: Pick<
    Profile,
    "username" | "full_name" | "avatar_url" | "title" | "location"
  >;
  category?: Pick<Category, "id" | "name">;
  cover_image_url?: string | null;
  _count?: {
    reviews: number;
  };
  average_rating?: number;
};

export type BookingWithDetails = Booking & {
  service: Pick<
    Service,
    "title" | "description" | "service_type" | "pricing_type"
  >;
  professional: Pick<Profile, "username" | "full_name" | "avatar_url">;
  client: Pick<Profile, "username" | "full_name" | "avatar_url">;
};

export type ProfessionalWithDetails = Profile & {
  services: ServiceWithProfile[];
  portfolio_projects: PortfolioProject[];
  work_experience: WorkExperience[];
  skills: { skill: Skill }[];
  _count?: {
    services: number;
    reviews: number;
  };
  average_rating?: number;
};

export type ReviewWithDetails = Review & {
  client: Pick<Profile, "username" | "full_name" | "avatar_url">;
  professional: Pick<Profile, "username" | "full_name" | "avatar_url">;
  service: Pick<Service, "title">;
};

// Form types
export type ServiceFormData = {
  title: string;
  description: string;
  price_in_cents: number;
  category_id: string;
  service_type: ServiceType;
  pricing_type: PricingType;
  delivery_time_value: number;
  delivery_time_unit: DeliveryTimeUnit;
  cover_image_url?: string;
  is_active: boolean;
};

export type BookingFormData = {
  service_id: string;
  booking_start_time: string;
  duration_minutes?: number;
  notes?: string;
};

export type ReviewFormData = {
  booking_id: string;
  rating: number;
  comment: string;
};

export type ProfileFormData = {
  username: string;
  full_name: string;
  title?: string;
  bio?: string;
  location?: string;
  phone?: string;
  avatar_url?: string;
  header_image_url?: string;
};

// Search and filter types
export type SearchFilters = {
  query?: string;
  category_id?: string;
  location?: string;
  price_min?: number;
  price_max?: number;
  service_type?: ServiceType;
  rating_min?: number;
  sort_by?: "relevance" | "price_asc" | "price_desc" | "rating" | "newest";
};

export type SortOption = {
  label: string;
  value: SearchFilters["sort_by"];
};

// Component prop types
export interface ServiceCardProps {
  service: ServiceWithProfile;
  onBook?: (serviceId: string) => void;
  onFavorite?: (serviceId: string) => void;
  showProfessional?: boolean;
  className?: string;
}

export interface BookingCardProps {
  booking: BookingWithDetails;
  userRole: UserRole;
  onAction?: (action: string, bookingId: string) => void;
  className?: string;
}

export interface ProfessionalCardProps {
  professional: Pick<
    Profile,
    "id" | "username" | "full_name" | "avatar_url" | "title" | "location"
  >;
  rating?: number;
  reviewCount?: number;
  servicesCount?: number;
  className?: string;
}

// Modal/Dialog props
export interface ServiceFormProps {
  service?: Service;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (service: Service) => void;
  onError?: (error: string) => void;
}

export interface BookingFormProps {
  service: ServiceWithProfile;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (booking: Booking) => void;
}

export interface ReviewFormProps {
  booking: BookingWithDetails;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (review: Review) => void;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// State management types
export interface AuthState {
  user: any | null; // Replace with proper Supabase User type
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

export interface SearchState {
  query: string;
  filters: SearchFilters;
  results: ServiceWithProfile[];
  loading: boolean;
  hasMore: boolean;
  setQuery: (query: string) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  loadServices: (reset?: boolean) => Promise<void>;
  loadMoreServices: () => Promise<void>;
  loadMore: () => Promise<void>;
  clearResults: () => void;
}

export interface BookingState {
  currentBooking: Partial<BookingFormData> | null;
  step: "service" | "details" | "payment" | "confirmation";
  loading: boolean;
  setBookingData: (data: Partial<BookingFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}
