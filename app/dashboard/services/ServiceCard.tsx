'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { ServiceForm } from '@/app/dashboard/services/ServiceForm'
import { formatCurrency, getDeliveryTimeString } from '@/lib/utils/formatting'
import { deleteService } from '@/app/dashboard/services/actions'
import { Database } from '@/lib/supabase/database.types'
import { Edit, Trash2, Eye, DollarSign, Clock, Package, Timer } from 'lucide-react'

type ServiceWithCategory = Database['public']['Tables']['services']['Row'] & {
  category: Pick<Database['public']['Tables']['categories']['Row'], 'name'> | null
}

interface ServiceCardProps {
  service: ServiceWithCategory
}

export function ServiceCard({ service }: ServiceCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const handleEditSuccess = () => {
    setEditDialogOpen(false)
    window.location.reload()
  }

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false)
    window.location.reload()
  }

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
              <DollarSign className="w-4 h-4 text-foreground" />
              <span className="font-medium text-foreground">
                {formatCurrency(service.price_in_cents).replace('$', '')}
                {service.pricing_type === 'HOURLY' && '/hr'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {service.pricing_type}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              {service.service_type === 'PROJECT_BASED' ? (
                <Package className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Clock className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-muted-foreground">
                {service.service_type.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Timer className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {getDeliveryTimeString(service.delivery_time_value, service.delivery_time_unit)}
              </span>
            </div>
          </div>

          <div className="flex space-x-2 pt-4 border-t border-border">
            <Button variant="outline" size="sm" asChild>
              <a href={`/services/${service.id}`} target="_blank">
                <Eye className="w-4 h-4 mr-1" />
                View
              </a>
            </Button>
            
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
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
                <ServiceForm service={service} onSuccess={handleEditSuccess} />
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
