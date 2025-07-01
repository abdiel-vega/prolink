'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ServiceCard } from '@/components/shared/ServiceCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { useAuthStore } from '@/lib/stores/authStore'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/supabase/database.types'
import { formatCurrency, formatDate } from '@/lib/utils/formatting'
import { 
  Plus, 
  DollarSign, 
  Calendar, 
  Star, 
  Users, 
  TrendingUp,
  Settings,
  Edit,
  Eye,
  Trash2
} from 'lucide-react'
import Link from 'next/link'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient<Database>(supabaseUrl, supabaseKey)

export default function ProfessionalDashboard() {
  const { user, profile } = useAuthStore()
  const [services, setServices] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalEarnings: 0,
    activeServices: 0,
    pendingBookings: 0,
    averageRating: 0,
    totalReviews: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      if (!profile?.id) {
        setLoading(false)
        return
      }

      // Load services
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false })

      // Load recent bookings
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`
          *,
          service:services!service_id(title),
          client:profiles!client_id(full_name, username, avatar_url)
        `)
        .eq('professional_profile_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(10)

      // Calculate stats
      const activeServices = servicesData?.filter(s => s.is_active).length || 0
      const pendingBookings = bookingsData?.filter(b => b.status === 'PENDING_CONFIRMATION').length || 0
      
      // Calculate total earnings from completed bookings
      const completedBookings = bookingsData?.filter(b => b.status === 'COMPLETED') || []
      const totalEarnings = completedBookings.reduce((sum, booking) => sum + booking.amount_paid_in_cents, 0)

      setServices(servicesData || [])
      setBookings(bookingsData || [])
      setStats({
        totalEarnings,
        activeServices,
        pendingBookings,
        averageRating: 4.8, // TODO: Calculate from reviews
        totalReviews: 24 // TODO: Calculate from reviews
      })

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">Please log in to view your dashboard.</p>
            <Link href="/auth/login">
              <Button>Log In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-background rounded-xl">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <UserAvatar 
              src={profile.avatar_url}
              fallback={profile.full_name || profile.username || 'User'}
              size="lg"
            />
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Welcome back, {profile.full_name || profile.username}!
              </h1>
              <p className="text-muted-foreground">
                Manage your services and track your business
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {profile.role === 'PROFESSIONAL' && (
              <a
                href={`/professional/${profile.username || profile.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  View Public Profile
                </Button>
              </a>
            )}
            <Link href="/dashboard/services/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Service
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(stats.totalEarnings)}
                  </p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Services</p>
                  <p className="text-2xl font-bold text-foreground">{stats.activeServices}</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Bookings</p>
                  <p className="text-2xl font-bold text-foreground">{stats.pendingBookings}</p>
                </div>
                <div className="p-3 bg-yellow-500/10 rounded-full">
                  <Calendar className="w-6 h-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rating</p>
                  <div className="flex items-center space-x-1">
                    <p className="text-2xl font-bold text-foreground">{stats.averageRating}</p>
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  </div>
                  <p className="text-xs text-muted-foreground">{stats.totalReviews} reviews</p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-full">
                  <TrendingUp className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Bookings</CardTitle>
                <Link href="/dashboard/bookings">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-foreground">No bookings yet</p>
                    <p className="text-sm text-muted-foreground">
                      Your bookings will appear here once clients start booking your services
                    </p>
                  </div>
                ) : (
                  bookings.slice(0, 5).map((booking: any) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <UserAvatar 
                          src={booking.client.avatar_url}
                          fallback={booking.client.full_name || booking.client.username || 'User'}
                          size="sm" 
                        />
                        <div>
                          <p className="font-medium text-foreground">
                            {booking.client.full_name || booking.client.username}
                          </p>
                          <p className="text-sm text-muted-foreground">{booking.service.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(booking.booking_start_time)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <StatusBadge status={booking.status} />
                        <p className="text-sm font-medium text-foreground mt-1">
                          {formatCurrency(booking.amount_paid_in_cents)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* My Services */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>My Services</CardTitle>
                <Link href="/dashboard/services">
                  <Button variant="outline" size="sm">Manage All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.length === 0 ? (
                  <div className="text-center py-8">
                    <Plus className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-foreground">No services created yet</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create your first service to start accepting bookings
                    </p>
                    <Link href="/dashboard/services/new">
                      <Button size="sm">Create Service</Button>
                    </Link>
                  </div>
                ) : (
                  services.slice(0, 3).map((service: any) => (
                    <div key={service.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <h4 className="font-medium text-foreground">{service.title}</h4>
                        <p className="text-sm text-muted-foreground truncate">{service.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant={service.is_active ? 'default' : 'secondary'}>
                            {service.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <span className="text-sm font-medium text-foreground">
                            {formatCurrency(service.price_in_cents)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link href={`/services/${service.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={`/dashboard/services/${service.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
