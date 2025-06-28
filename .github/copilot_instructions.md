# Enhanced GitHub Copilot Instructions - Service Marketplace: ProLink

## Project Context & Domain Knowledge

You are building a **professional service marketplace** similar to Upwork/Fiverr where:
- **Professionals** offer time-based or project-based services
- **Clients** book and pay for services securely
- **Bookings** have real-time status updates and require confirmation
- **Payments** are processed through Stripe with platform fees
- **Reviews** are tied to completed bookings for quality assurance

### Business Logic Patterns

#### Booking Lifecycle
```typescript
PENDING_CONFIRMATION → CONFIRMED → IN_PROGRESS → COMPLETED
                   ↘ CANCELLED ↙
```

#### Price Handling
- All prices stored in cents (e.g., $50.00 = 5000 cents)
- Display prices with proper currency formatting
- Calculate platform fees (suggested 5-10%)
- Handle tax calculations for different regions

#### Service Types
- **TIME_BASED**: Hourly consultations, meetings (delivery_time = session duration)
- **PROJECT_BASED**: Fixed deliverables, design work (delivery_time = completion estimate)

## Code Generation Patterns

### Always Include These Imports
```typescript
// For any Supabase interaction
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/supabase/types'

// For forms and validation
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

// For UI components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// For state management
import { useAuthStore } from '@/lib/stores/authStore'

// For utilities
import { cn } from '@/lib/utils'
import { formatCurrency, formatDate } from '@/lib/utils/formatting'
```

### Database Type Patterns
```typescript
// Always use these type aliases from the generated types
type Profile = Database['public']['Tables']['profiles']['Row']
type Service = Database['public']['Tables']['services']['Row']
type Booking = Database['public']['Tables']['bookings']['Row']
type Review = Database['public']['Tables']['reviews']['Row']

// For joins, use intersection types
type ServiceWithProfile = Service & {
  profile: Pick<Profile, 'username' | 'full_name' | 'avatar_url'>
}

type BookingWithDetails = Booking & {
  service: Pick<Service, 'title' | 'description'>
  professional: Pick<Profile, 'full_name' | 'username' | 'avatar_url'>
  client: Pick<Profile, 'full_name' | 'username' | 'avatar_url'>
}
```

### Form Validation Schemas
```typescript
// Always create zod schemas for forms
const serviceFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  price_in_cents: z.number().min(500, 'Minimum price is $5.00'),
  category_id: z.string().uuid('Please select a category'),
  service_type: z.enum(['TIME_BASED', 'PROJECT_BASED']),
  pricing_type: z.enum(['FIXED', 'HOURLY']),
  delivery_time_value: z.number().min(1),
  delivery_time_unit: z.enum(['MINUTES', 'HOURS', 'DAYS'])
})

type ServiceFormData = z.infer<typeof serviceFormSchema>
```

### Error Handling Patterns
```typescript
// Always wrap async operations in try-catch
try {
  const { data, error } = await supabase
    .from('services')
    .insert(serviceData)
    .select()
    .single()
  
  if (error) throw error
  
  // Success handling
  toast.success('Service created successfully!')
  onSuccess?.(data)
  
} catch (error) {
  console.error('Error creating service:', error)
  const message = error instanceof Error ? error.message : 'An unexpected error occurred'
  toast.error(`Failed to create service: ${message}`)
  setError(message)
}
```

### Component Prop Patterns
```typescript
// Always use these interface patterns for components

// For cards displaying data
interface ServiceCardProps {
  service: ServiceWithProfile
  onBook?: (serviceId: string) => void
  onFavorite?: (serviceId: string) => void
  showProfessional?: boolean
  className?: string
}

// For forms
interface ServiceFormProps {
  service?: Service // undefined for create mode
  onClose: () => void
  onSuccess?: (service: Service) => void
  onError?: (error: string) => void
}

// For modal/dialog components
interface BookingConfirmationProps {
  booking: BookingWithDetails
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  loading?: boolean
}
```

## Supabase Query Patterns

### Always Use These Query Patterns
```typescript
// Fetching with joins (select specific fields)
const services = await supabase
  .from('services')
  .select(`
    id, title, description, price_in_cents, service_type, pricing_type,
    delivery_time_value, delivery_time_unit, created_at,
    profile:profiles!profile_id (
      username, full_name, avatar_url, title, location
    ),
    category:categories!category_id (
      id, name
    )
  `)
  .eq('is_active', true)
  .order('created_at', { ascending: false })

// Pagination pattern
const { data, error, count } = await supabase
  .from('services')
  .select('*, profile:profiles!profile_id(*)', { count: 'exact' })
  .range(offset, offset + limit - 1)

// Real-time subscriptions
const subscription = supabase
  .channel('bookings')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'bookings',
    filter: `client_id=eq.${userId}`
  }, (payload) => {
    // Handle real-time updates
  })
  .subscribe()

// Cleanup in useEffect
return () => {
  subscription.unsubscribe()
}
```

### RLS Policy Considerations
```typescript
// Always check user permissions before mutations
const { data: { user } } = await supabase.auth.getUser()
if (!user) throw new Error('Authentication required')

// For service operations, ensure ownership
const { data: service } = await supabase
  .from('services')
  .select('profile_id')
  .eq('id', serviceId)
  .single()

if (service?.profile_id !== user.id) {
  throw new Error('Unauthorized: You can only edit your own services')
}
```

## UI Component Patterns

### Loading States
```typescript
// Always implement loading states
const [loading, setLoading] = useState(false)
const [data, setData] = useState<ServiceWithProfile[]>([])

// Skeleton components for loading
if (loading) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-4">
            <div className="h-4 bg-gray-200 rounded mb-2" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

### Responsive Grid Patterns
```typescript
// Always use these responsive patterns
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {/* Cards */}
</div>

// For dashboards
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">{/* Main content */}</div>
  <div className="lg:col-span-1">{/* Sidebar */}</div>
</div>
```

### Form Component Pattern
```typescript
function ServiceForm({ service, onClose, onSuccess }: ServiceFormProps) {
  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      title: service?.title || '',
      description: service?.description || '',
      price_in_cents: service?.price_in_cents || 0,
      // ... other defaults
    }
  })

  async function onSubmit(data: ServiceFormData) {
    try {
      setLoading(true)
      // Mutation logic
    } catch (error) {
      // Error handling
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{service ? 'Edit Service' : 'Create New Service'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Form fields */}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : service ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

## Utility Function Patterns

### Always Include These Utility Functions
```typescript
// lib/utils/formatting.ts
export function formatCurrency(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}

export function formatDate(date: string | Date, format: 'short' | 'long' = 'short'): string {
  const d = new Date(date)
  return format === 'short' 
    ? d.toLocaleDateString()
    : d.toLocaleDateString(undefined, { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

export function getDeliveryTimeString(value: number, unit: string): string {
  const unitText = value === 1 ? unit.slice(0, -1).toLowerCase() : unit.toLowerCase()
  return `${value} ${unitText}`
}

export function calculatePlatformFee(amount: number, feePercentage = 0.05): number {
  return Math.round(amount * feePercentage)
}
```

### Status Badge Patterns
```typescript
// Always use these status color patterns
const statusConfig = {
  PENDING_CONFIRMATION: { 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock 
  },
  CONFIRMED: { 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: CheckCircle 
  },
  IN_PROGRESS: { 
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Play 
  },
  COMPLETED: { 
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: Check 
  },
  CANCELLED: { 
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: X 
  }
}
```

## Hook Patterns

### Custom Hooks for Data Fetching
```typescript
// lib/hooks/useServices.ts
export function useServices(filters?: ServiceFilters) {
  const [services, setServices] = useState<ServiceWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)

  const loadServices = useCallback(async (reset = false) => {
    try {
      setLoading(true)
      setError(null)
      
      const offset = reset ? 0 : services.length
      const { data, error, count } = await supabase
        .from('services')
        .select(/* query */)
        .range(offset, offset + 19)
      
      if (error) throw error
      
      setServices(prev => reset ? data : [...prev, ...data])
      setHasMore(data.length === 20)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load services')
    } finally {
      setLoading(false)
    }
  }, [filters, services.length])

  useEffect(() => {
    loadServices(true)
  }, [filters])

  return { services, loading, error, hasMore, loadMore: () => loadServices(false) }
}
```

### Authentication Hooks
```typescript
// lib/hooks/useAuth.ts
export function useAuth() {
  const { user, profile, loading } = useAuthStore()
  
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }
  
  const signOut = async () => {
    await supabase.auth.signOut()
    // Clear client-side state
  }
  
  const requireAuth = () => {
    if (!user) {
      throw new Error('Authentication required')
    }
    return user
  }
  
  const requireRole = (role: 'CLIENT' | 'PROFESSIONAL') => {
    const currentUser = requireAuth()
    if (profile?.role !== role) {
      throw new Error(`${role} access required`)
    }
    return currentUser
  }
  
  return { user, profile, loading, signIn, signOut, requireAuth, requireRole }
}
```

## Performance Optimization Patterns

### Image Optimization
```typescript
// Always use Next.js Image component
import Image from 'next/image'

function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Card>
      <div className="relative aspect-video">
        <Image
          src={service.cover_image_url || '/placeholder-service.jpg'}
          alt={service.title}
          fill
          className="object-cover rounded-t-lg"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    </Card>
  )
}
```

### Debounced Search
```typescript
// Always debounce search inputs
import { useDebouncedCallback } from 'use-debounce'

const debouncedSearch = useDebouncedCallback(
  (query: string) => {
    setSearchQuery(query)
  },
  500
)
```

### Optimistic Updates
```typescript
// Always implement optimistic updates for user actions
const toggleFavorite = async (serviceId: string) => {
  // Optimistic update
  setFavorites(prev => 
    prev.includes(serviceId) 
      ? prev.filter(id => id !== serviceId)
      : [...prev, serviceId]
  )
  
  try {
    // Actual API call
    const { error } = await supabase
      .from('favorites')
      .upsert({ user_id: user.id, service_id: serviceId })
    
    if (error) throw error
    
  } catch (error) {
    // Revert optimistic update on error
    setFavorites(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
    toast.error('Failed to update favorite')
  }
}
```

## API Route Patterns

### Always Use This Structure
```typescript
// app/api/bookings/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const createBookingSchema = z.object({
  serviceId: z.string().uuid(),
  startTime: z.string().datetime(),
  notes: z.string().max(500).optional()
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Validate authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Validate request body
    const body = await request.json()
    const { serviceId, startTime, notes } = createBookingSchema.parse(body)
    
    // Business logic
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('*, profile:profiles!profile_id(*)')
      .eq('id', serviceId)
      .single()
    
    if (serviceError || !service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }
    
    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        client_id: user.id,
        professional_profile_id: service.profile_id,
        service_id: serviceId,
        booking_start_time: startTime,
        amount_paid_in_cents: service.price_in_cents,
        notes
      })
      .select()
      .single()
    
    if (bookingError) throw bookingError
    
    return NextResponse.json({ booking })
    
  } catch (error) {
    console.error('Booking creation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## Testing Patterns

### Component Testing Template
```typescript
// __tests__/components/ServiceCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ServiceCard } from '@/components/shared/ServiceCard'

const mockService = {
  id: '123',
  title: 'Web Development',
  description: 'Full-stack development services',
  price_in_cents: 5000,
  profile: {
    username: 'johndoe',
    full_name: 'John Doe',
    avatar_url: null
  }
}

describe('ServiceCard', () => {
  it('displays service information correctly', () => {
    render(<ServiceCard service={mockService} />)
    
    expect(screen.getByText('Web Development')).toBeInTheDocument()
    expect(screen.getByText('$50.00')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })
  
  it('calls onBook when book button is clicked', () => {
    const onBook = jest.fn()
    render(<ServiceCard service={mockService} onBook={onBook} />)
    
    fireEvent.click(screen.getByText('Book Now'))
    expect(onBook).toHaveBeenCalledWith('123')
  })
})
```

## Security Considerations

### Always Validate User Input
```typescript
// Client-side validation
const form = useForm({
  resolver: zodResolver(schema),
  mode: 'onBlur'
})

// Server-side validation
const validatedData = schema.parse(requestBody)

// Sanitize user content
import DOMPurify from 'isomorphic-dompurify'
const sanitizedDescription = DOMPurify.sanitize(description)
```

### Rate Limiting Pattern
```typescript
// lib/utils/rateLimiting.ts
const attempts = new Map<string, number[]>()

export function checkRateLimit(identifier: string, limit = 5, window = 60000): boolean {
  const now = Date.now()
  const userAttempts = attempts.get(identifier) || []
  
  // Remove attempts outside the window
  const recentAttempts = userAttempts.filter(time => now - time < window)
  
  if (recentAttempts.length >= limit) {
    return false
  }
  
  recentAttempts.push(now)
  attempts.set(identifier, recentAttempts)
  return true
}
```

Remember: Always prioritize **type safety**, **user experience**, **performance**, and **security** in that order. Generate production-ready code that handles edge cases and provides clear user feedback.