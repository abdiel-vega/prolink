import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils/formatting'
import { updateBookingStatus } from './actions'
import { Database } from '@/lib/supabase/database.types'
import { Calendar, Clock, DollarSign, User } from 'lucide-react'

type BookingWithDetails = Database['public']['Tables']['bookings']['Row'] & {
  service: Pick<Database['public']['Tables']['services']['Row'], 'title' | 'description' | 'service_type'>
  professional: Pick<Database['public']['Tables']['profiles']['Row'], 'full_name' | 'username' | 'avatar_url' | 'title'>
  client: Pick<Database['public']['Tables']['profiles']['Row'], 'full_name' | 'username' | 'avatar_url'>
}

interface BookingCardProps {
  booking: BookingWithDetails
  userRole: 'CLIENT' | 'PROFESSIONAL'
  userId: string
}

function BookingCard({ booking, userRole, userId }: BookingCardProps) {
  const isProfessional = userRole === 'PROFESSIONAL'
  const otherUser = isProfessional ? booking.client : booking.professional
  const canUpdate = booking.status === 'PENDING_CONFIRMATION'
  
  return (
    <Card className="card-surface">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <UserAvatar
              src={otherUser.avatar_url}
              fallback={otherUser.full_name || otherUser.username || 'User'}
              size="md"
            />
            <div>
              <h3 className="font-semibold text-foreground">
                {otherUser.full_name || otherUser.username}
              </h3>
              {isProfessional && booking.professional.title && (
                <p className="text-sm text-muted-foreground">{booking.professional.title}</p>
              )}
            </div>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-foreground">{booking.service.title}</h4>
            <p className="text-sm text-muted-foreground">{booking.service.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {formatDate(booking.booking_start_time, 'long')}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {formatTime(booking.booking_start_time)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-foreground">
                {formatCurrency(booking.amount_paid_in_cents)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {booking.service.service_type.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          {booking.notes && (
            <div className="pt-2 border-t border-border">
              <p className="text-sm text-muted-foreground">
                <strong>Notes:</strong> {booking.notes}
              </p>
            </div>
          )}

          {canUpdate && (
            <div className="flex space-x-2 pt-4 border-t border-border">
              {isProfessional ? (
                <>
                  <form action={updateBookingStatus}>
                    <input type="hidden" name="bookingId" value={booking.id} />
                    <input type="hidden" name="status" value="CONFIRMED" />
                    <Button type="submit" size="sm">
                      Accept
                    </Button>
                  </form>
                  <form action={updateBookingStatus}>
                    <input type="hidden" name="bookingId" value={booking.id} />
                    <input type="hidden" name="status" value="DECLINED" />
                    <Button type="submit" variant="outline" size="sm">
                      Decline
                    </Button>
                  </form>
                </>
              ) : (
                <form action={updateBookingStatus}>
                  <input type="hidden" name="bookingId" value={booking.id} />
                  <input type="hidden" name="status" value="CANCELLED" />
                  <Button type="submit" variant="outline" size="sm">
                    Cancel Booking
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default async function BookingsPage() {
  const supabase = await createClient()
  
  // Get user session and profile
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/auth/setup')
  }

  // Fetch bookings based on user role
  const query = supabase
    .from('bookings')
    .select(`
      *,
      service:services!service_id (
        title,
        description,
        service_type
      ),
      professional:profiles!professional_profile_id (
        full_name,
        username,
        avatar_url,
        title
      ),
      client:profiles!client_id (
        full_name,
        username,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })

  const { data: bookings } = profile.role === 'CLIENT'
    ? await query.eq('client_id', user.id)
    : await query.eq('professional_profile_id', user.id)

  const bookingsByStatus = {
    PENDING_CONFIRMATION: bookings?.filter(b => b.status === 'PENDING_CONFIRMATION') || [],
    CONFIRMED: bookings?.filter(b => b.status === 'CONFIRMED') || [],
    COMPLETED: bookings?.filter(b => b.status === 'COMPLETED') || [],
    CANCELLED: bookings?.filter(b => b.status === 'CANCELLED') || [],
    DECLINED: bookings?.filter(b => b.status === 'DECLINED') || []
  }

  const statusCounts = Object.entries(bookingsByStatus).reduce((acc, [status, bookings]) => {
    acc[status] = bookings.length
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Bookings</h1>
        <p className="text-muted-foreground">
          {profile.role === 'CLIENT' 
            ? 'Manage your service bookings and track their progress'
            : 'Review and manage client bookings for your services'
          }
        </p>
      </div>

      <Tabs defaultValue="PENDING_CONFIRMATION" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="PENDING_CONFIRMATION" className="flex items-center space-x-2">
            <span>Pending</span>
            {statusCounts.PENDING_CONFIRMATION > 0 && (
              <Badge variant="secondary" className="ml-1">
                {statusCounts.PENDING_CONFIRMATION}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="CONFIRMED" className="flex items-center space-x-2">
            <span>Confirmed</span>
            {statusCounts.CONFIRMED > 0 && (
              <Badge variant="secondary" className="ml-1">
                {statusCounts.CONFIRMED}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="COMPLETED" className="flex items-center space-x-2">
            <span>Completed</span>
            {statusCounts.COMPLETED > 0 && (
              <Badge variant="secondary" className="ml-1">
                {statusCounts.COMPLETED}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="CANCELLED" className="flex items-center space-x-2">
            <span>Cancelled</span>
            {statusCounts.CANCELLED > 0 && (
              <Badge variant="secondary" className="ml-1">
                {statusCounts.CANCELLED}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="DECLINED" className="flex items-center space-x-2">
            <span>Declined</span>
            {statusCounts.DECLINED > 0 && (
              <Badge variant="secondary" className="ml-1">
                {statusCounts.DECLINED}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {Object.entries(bookingsByStatus).map(([status, statusBookings]) => (
          <TabsContent key={status} value={status}>
            {statusBookings.length === 0 ? (
              <Card className="card-surface">
                <CardContent className="p-12 text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No {status.toLowerCase().replace('_', ' ')} bookings
                  </h3>
                  <p className="text-muted-foreground">
                    {status === 'PENDING_CONFIRMATION' 
                      ? 'New booking requests will appear here'
                      : `No bookings with ${status.toLowerCase().replace('_', ' ')} status`
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {statusBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking as BookingWithDetails}
                    userRole={profile.role}
                    userId={user.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
