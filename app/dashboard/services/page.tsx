import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ServiceCard } from '@/app/dashboard/services/ServiceCard'
import { CreateServiceDialog } from '@/app/dashboard/services/CreateServiceDialog'
import { Database } from '@/lib/supabase/database.types'
import { Plus, Package } from 'lucide-react'

type ServiceWithCategory = Database['public']['Tables']['services']['Row'] & {
  category: Pick<Database['public']['Tables']['categories']['Row'], 'name'> | null
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

  // Fetch professional's services with categories
  // Using manual join since foreign key relationship may not be set up yet
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })

  let servicesWithCategories: ServiceWithCategory[] = []
  
  if (services && services.length > 0) {
    const categoryIds = services
      .map(s => s.category_id)
      .filter(Boolean) as string[]
    
    let categoriesMap: Record<string, { name: string }> = {}
    
    if (categoryIds.length > 0) {
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name')
        .in('id', categoryIds)
      
      if (categories) {
        categoriesMap = Object.fromEntries(
          categories.map(cat => [cat.id, { name: cat.name }])
        )
      }
    }

    servicesWithCategories = services.map(service => ({
      ...service,
      category: service.category_id ? categoriesMap[service.category_id] || null : null
    }))
  }

  const activeServices = servicesWithCategories?.filter(s => s.is_active).length || 0
  const totalServices = servicesWithCategories?.length || 0

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
        
        <CreateServiceDialog>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create New Service
          </Button>
        </CreateServiceDialog>
      </div>

      {servicesWithCategories && servicesWithCategories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicesWithCategories.map((service) => (
            <ServiceCard key={service.id} service={service} />
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
            <CreateServiceDialog>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Service
              </Button>
            </CreateServiceDialog>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
