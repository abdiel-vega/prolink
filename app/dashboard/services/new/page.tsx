'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuthStore } from '@/lib/stores/authStore'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/supabase/database.types'
import { CATEGORIES, SERVICE_TYPES_ARRAY } from '@/lib/utils/constants'
import { formatCurrency } from '@/lib/utils/formatting'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient<Database>(supabaseUrl, supabaseKey)

export default function CreateServicePage() {
  const router = useRouter()
  const { user, profile } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '25.00',
    category_id: '',
    service_type: 'PROJECT_BASED' as const,
    pricing_type: 'FIXED' as string,
    delivery_time_value: '1',
    delivery_time_unit: 'DAYS' as const
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title || formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters'
    }
    if (!formData.description || formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters'
    }
    if (!formData.category_id) {
      newErrors.category_id = 'Please select a category'
    }
    if (!formData.price || parseFloat(formData.price) < 5) {
      newErrors.price = 'Minimum price is $5.00'
    }
    if (!formData.delivery_time_value || parseInt(formData.delivery_time_value) < 1) {
      newErrors.delivery_time_value = 'Delivery time must be at least 1'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !profile) {
      setError('You must be logged in to create a service')
      return
    }

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      const priceInCents = Math.round(parseFloat(formData.price) * 100)

      const serviceData = {
        title: formData.title,
        description: formData.description,
        price_in_cents: priceInCents,
        category_id: formData.category_id,
        service_type: formData.service_type as 'TIME_BASED' | 'PROJECT_BASED',
        pricing_type: formData.pricing_type as 'FIXED' | 'HOURLY',
        delivery_time_value: parseInt(formData.delivery_time_value),
        delivery_time_unit: formData.delivery_time_unit as 'MINUTES' | 'HOURS' | 'DAYS',
        profile_id: profile.id,
        is_active: true
      }

      const { data: service, error: serviceError } = await supabase
        .from('services')
        .insert(serviceData)
        .select()
        .single()

      if (serviceError) throw serviceError

      // Redirect to the dashboard
      router.push('/dashboard')
      
    } catch (err) {
      console.error('Error creating service:', err)
      const message = err instanceof Error ? err.message : 'Failed to create service'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">Please log in to create a service.</p>
            <Link href="/auth/login">
              <Button>Log In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Service</h1>
            <p className="text-gray-600">
              Add a new service to start receiving bookings from clients
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                {/* Service Title */}
                <div>
                  <Label htmlFor="title">Service Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Custom Website Development"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="mt-1"
                  />
                  {errors.title && (
                    <p className="text-red-600 text-sm mt-1">{errors.title}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your service in detail. What will clients receive? What's included?"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="mt-1"
                  />
                  {errors.description && (
                    <p className="text-red-600 text-sm mt-1">{errors.description}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <Label htmlFor="category_id">Category *</Label>
                  <select
                    id="category_id"
                    value={formData.category_id}
                    onChange={(e) => handleInputChange('category_id', e.target.value)}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category_id && (
                    <p className="text-red-600 text-sm mt-1">{errors.category_id}</p>
                  )}
                </div>

                {/* Service Type */}
                <div>
                  <Label htmlFor="service_type">Service Type *</Label>
                  <select
                    id="service_type"
                    value={formData.service_type}
                    onChange={(e) => handleInputChange('service_type', e.target.value)}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {SERVICE_TYPES_ARRAY.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label} - {type.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pricing Type */}
                <div>
                  <Label htmlFor="pricing_type">Pricing Type *</Label>
                  <select
                    id="pricing_type"
                    value={formData.pricing_type}
                    onChange={(e) => handleInputChange('pricing_type', e.target.value)}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="FIXED">Fixed Price - One-time payment</option>
                    <option value="HOURLY">Hourly Rate - Pay per hour</option>
                  </select>
                </div>

                {/* Price */}
                <div>
                  <Label htmlFor="price">
                    Price ({formData.pricing_type === 'HOURLY' ? 'per hour' : 'total'}) *
                  </Label>
                  <div className="mt-1 relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="5.00"
                      max="100000.00"
                      placeholder="25.00"
                      className="pl-8"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Current price: {formatCurrency(Math.round(parseFloat(formData.price || '0') * 100))}
                  </p>
                  {errors.price && (
                    <p className="text-red-600 text-sm mt-1">{errors.price}</p>
                  )}
                </div>

                {/* Delivery Time */}
                <div>
                  <Label>Delivery Time *</Label>
                  <div className="flex space-x-2 mt-1">
                    <Input
                      type="number"
                      min="1"
                      placeholder="1"
                      value={formData.delivery_time_value}
                      onChange={(e) => handleInputChange('delivery_time_value', e.target.value)}
                      className="flex-1"
                    />
                    <select
                      value={formData.delivery_time_unit}
                      onChange={(e) => handleInputChange('delivery_time_unit', e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="MINUTES">Minutes</option>
                      <option value="HOURS">Hours</option>
                      <option value="DAYS">Days</option>
                    </select>
                  </div>
                  {errors.delivery_time_value && (
                    <p className="text-red-600 text-sm mt-1">{errors.delivery_time_value}</p>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-3 pt-6">
                  <Link href="/dashboard">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      'Create Service'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
