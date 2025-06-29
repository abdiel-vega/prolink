import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { ServiceForm } from '@/app/dashboard/services/ServiceForm'
import { formatCurrency, getDeliveryTimeString } from '@/lib/utils/formatting'
import { deleteService } from '@/app/dashboard/services/actions'
import { Database } from '@/lib/supabase/database.types'
import { Plus, Edit, Trash2, Eye, DollarSign, Clock, Package } from 'lucide-react'

type ServiceWithCategory = Database['public']['Tables']['services']['Row'] & {
  category: Pick<Database['public']['Tables']['categories']['Row'], 'name'> | null
}

interface ServiceCardProps {
  service: ServiceWithCategory
}

function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Card className="card-surface">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-foreground">{service.title}</h3>
              <Badge variant={service.is_active ? 'default' : 'secondary'}>
                {service.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {service.description}
            </p>
            {service.category && (
              <Badge variant="outline" className="mb-3">
                {service.category.name}
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-foreground">
                {formatCurrency(service.price_in_cents)}
                {service.pricing_type === 'HOURLY' && '/hr'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {getDeliveryTimeString(service.delivery_time_value, service.delivery_time_unit)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {service.service_type.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {service.pricing_type}
              </Badge>
            </div>
          </div>

          <div className="flex space-x-2 pt-4 border-t border-border">
            <Button variant="outline" size="sm" asChild>
              <a href={`/services/${service.id}`} target="_blank">
                <Eye className="w-4 h-4 mr-1" />
                View
              </a>
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Edit Service</DialogTitle>
                </DialogHeader>
                <ServiceForm service={service} />
              </DialogContent>
            </Dialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Service</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{service.title}"? This action cannot be undone.
                    All related bookings will also be affected.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      const formData = new FormData()
                      formData.append('serviceId', service.id)
                      await deleteService(formData)
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Service
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default async function ServicesPage() {
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

  // Check if user is a professional
  if (profile.role !== 'PROFESSIONAL') {
    redirect('/dashboard')
  }

  // Fetch professional's services
  const { data: services } = await supabase
    .from('services')
    .select(`
      *,
      category:categories (
        name
      )
    `)
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })

  const activeServices = services?.filter(s => s.is_active).length || 0
  const totalServices = services?.length || 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">My Services</h1>
          <p className="text-muted-foreground">
            Manage your service offerings and track their performance
          </p>
          <div className="flex items-center space-x-4 mt-2">
            <span className="text-sm text-muted-foreground">
              {totalServices} total services
            </span>
            <span className="text-sm text-muted-foreground">
              {activeServices} active
            </span>
          </div>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create New Service
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Service</DialogTitle>
            </DialogHeader>
            <ServiceForm />
          </DialogContent>
        </Dialog>
      </div>

      {services && services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service as ServiceWithCategory} />
          ))}
        </div>
      ) : (
        <Card className="card-surface">
          <CardContent className="p-12 text-center">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No services yet
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create your first service to start accepting bookings from clients. 
              You can offer time-based consultations or project-based work.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Service
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Service</DialogTitle>
                </DialogHeader>
                <ServiceForm />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
