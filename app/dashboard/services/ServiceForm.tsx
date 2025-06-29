'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { createService, updateService } from './actions'
import { Database } from '@/lib/supabase/database.types'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { DialogClose } from '@/components/ui/dialog'

const serviceFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().min(20, 'Description must be at least 20 characters').max(1000),
  price_in_dollars: z.number().min(5, 'Minimum price is $5.00'), // Changed to dollars for better UX
  category_id: z.string().optional(),
  service_type: z.enum(['TIME_BASED', 'PROJECT_BASED']),
  pricing_type: z.enum(['FIXED', 'HOURLY']),
  delivery_time_value: z.number().min(1),
  delivery_time_unit: z.enum(['MINUTES', 'HOURS', 'DAYS', 'WEEKS', 'MONTHS']),
  is_active: z.boolean()
})

type ServiceFormData = z.infer<typeof serviceFormSchema>

type Service = Database['public']['Tables']['services']['Row']
type Category = Database['public']['Tables']['categories']['Row']

interface ServiceFormProps {
  service?: Service
  onSuccess?: () => void
}

export function ServiceForm({ service, onSuccess }: ServiceFormProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const supabase = createClientComponentClient<Database>()

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      title: service?.title || '',
      description: service?.description || '',
      price_in_dollars: service ? service.price_in_cents / 100 : 5, // Convert to dollars for display
      category_id: service?.category_id || undefined,
      service_type: service?.service_type || 'TIME_BASED',
      pricing_type: service?.pricing_type || 'FIXED',
      delivery_time_value: service?.delivery_time_value || 1,
      delivery_time_unit: service?.delivery_time_unit || 'HOURS',
      is_active: service?.is_active ?? true
    }
  })

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      
      if (data) {
        setCategories(data)
      }
    }

    loadCategories()
  }, [supabase])

  const onSubmit = async (data: ServiceFormData) => {
    try {
      setLoading(true)
      
      const formData = new FormData()
      // Convert price from dollars to cents before submitting
      const dataWithCents = {
        ...data,
        price_in_cents: Math.round(data.price_in_dollars * 100)
      }
      
      // Remove the dollar field and add all other fields
      Object.entries(dataWithCents).forEach(([key, value]) => {
        if (key !== 'price_in_dollars' && value !== undefined) {
          formData.append(key, value.toString())
        }
      })

      if (service) {
        formData.append('serviceId', service.id)
        await updateService(formData)
      } else {
        await createService(formData)
      }

      // Close the modal and refresh the page
      onSuccess?.()
      
    } catch (error) {
      console.error('Error submitting form:', error)
      // Handle error (you might want to add toast notifications)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {/* Title */}
        <div>
          <Label htmlFor="title">Service Title *</Label>
          <Input
            id="title"
            {...form.register('title')}
            placeholder="e.g., Full-Stack Web Development"
            className="mt-1"
          />
          {form.formState.errors.title && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.title.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            {...form.register('description')}
            placeholder="Describe what you'll deliver and how you work with clients..."
            rows={4}
            className="mt-1"
          />
          {form.formState.errors.description && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.description.message}
            </p>
          )}
        </div>

        {/* Category and Service Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={form.watch('category_id') || 'none'}
              onValueChange={(value) => form.setValue('category_id', value === 'none' ? undefined : value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No category</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="service_type">Service Type *</Label>
            <Select
              value={form.watch('service_type')}
              onValueChange={(value) => form.setValue('service_type', value as 'TIME_BASED' | 'PROJECT_BASED')}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TIME_BASED">Time-Based</SelectItem>
                <SelectItem value="PROJECT_BASED">Project-Based</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Price and Pricing Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">Price (USD) *</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="5"
                {...form.register('price_in_dollars', {
                  valueAsNumber: true
                })}
                placeholder="5.00"
                className="pl-7"
              />
            </div>
            {form.formState.errors.price_in_dollars && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.price_in_dollars.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="pricing_type">Pricing Type *</Label>
            <Select
              value={form.watch('pricing_type')}
              onValueChange={(value) => form.setValue('pricing_type', value as 'FIXED' | 'HOURLY')}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FIXED">Fixed Price</SelectItem>
                <SelectItem value="HOURLY">Hourly Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Delivery Time */}
        <div>
          <Label htmlFor="delivery_time">Session / Delivery Time *</Label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <Input
              type="number"
              min="1"
              {...form.register('delivery_time_value', { valueAsNumber: true })}
              placeholder="1"
            />
            <Select
              value={form.watch('delivery_time_unit')}
              onValueChange={(value) => form.setValue('delivery_time_unit', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MINUTES">Minutes</SelectItem>
                <SelectItem value="HOURS">Hours</SelectItem>
                <SelectItem value="DAYS">Days</SelectItem>
                <SelectItem value="WEEKS">Weeks</SelectItem>
                <SelectItem value="MONTHS">Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {form.formState.errors.delivery_time_value && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.delivery_time_value.message}
            </p>
          )}
        </div>

        {/* Active Status */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_active"
            checked={form.watch('is_active')}
            onCheckedChange={(checked: boolean) => form.setValue('is_active', checked)}
          />
          <Label htmlFor="is_active">Make this service active and available for booking</Label>
        </div>
      </div>

      <div className="flex space-x-3 pt-4 border-t border-border">
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={loading}>
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : service ? 'Update Service' : 'Create Service'}
        </Button>
      </div>
    </form>
  )
}
