'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { useSearchStore } from '@/lib/stores/searchStore'
import { SERVICE_TYPES_ARRAY, PRICING_TYPES } from '@/lib/utils/constants'
import { formatCurrency } from '@/lib/utils/formatting'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/supabase/database.types'
// import { Slider } from '@/components/ui/slider'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select'

type Category = Database['public']['Tables']['categories']['Row']

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating_desc', label: 'Highest Rated' },
  { value: 'created_desc', label: 'Newest First' }
]

export function SearchFilters() {
  const { filters, setFilters, loadServices } = useSearchStore()
  const [categories, setCategories] = useState<Category[]>([])
  const [priceRange, setPriceRange] = useState([
    filters.price_min || 0,
    filters.price_max || 50000
  ])
  const supabase = createClientComponentClient<Database>()

  // Load categories from database
  useEffect(() => {
    const loadCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      
      if (data && !error) {
        setCategories(data)
      }
    }

    loadCategories()
  }, [supabase])

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value)
  }

  const handleApplyPriceFilter = () => {
    setFilters({
      ...filters,
      price_min: priceRange[0],
      price_max: priceRange[1]
    })
    loadServices()
  }

  const handleCategoryToggle = (categoryId: string) => {
    setFilters({
      ...filters,
      category_id: filters.category_id === categoryId ? undefined : categoryId
    })
    loadServices()
  }

  const handleServiceTypeChange = (serviceType: string) => {
    setFilters({
      ...filters,
      service_type: serviceType === 'all' ? undefined : serviceType as any
    })
    loadServices()
  }

  const handleSortChange = (sortBy: string) => {
    setFilters({
      ...filters,
      sort_by: sortBy as any
    })
    loadServices()
  }

  const clearFilters = () => {
    setFilters({
      query: filters.query,
      category_id: undefined,
      price_min: undefined,
      price_max: undefined,
      service_type: undefined,
      sort_by: 'relevance'
    })
    setPriceRange([0, 50000])
    loadServices()
  }

  return (
    <div className="space-y-6">
      {/* Sort */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Sort By</CardTitle>
        </CardHeader>
        <CardContent>
          <Select 
            value={filters.sort_by || 'relevance'} 
            onValueChange={handleSortChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Price Range */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Price Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              placeholder="Min"
              value={priceRange[0] / 100}
              onChange={(e) => setPriceRange([parseInt(e.target.value || '0') * 100, priceRange[1]])}
              className="w-full"
            />
            <span className="text-gray-500">-</span>
            <Input
              type="number"
              placeholder="Max"
              value={priceRange[1] / 100}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value || '0') * 100])}
              className="w-full"
            />
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{formatCurrency(priceRange[0])}</span>
            <span>{formatCurrency(priceRange[1])}</span>
          </div>
          <Button 
            onClick={handleApplyPriceFilter}
            size="sm" 
            variant="outline" 
            className="w-full"
          >
            Apply Price Filter
          </Button>
        </CardContent>
      </Card>

      {/* Service Type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Service Type</CardTitle>
        </CardHeader>
        <CardContent>
          <Select 
            value={filters.service_type || 'all'} 
            onValueChange={handleServiceTypeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {SERVICE_TYPES_ARRAY.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={category.id}
                checked={filters.category_id === category.id}
                onCheckedChange={() => handleCategoryToggle(category.id)}
              />
              <Label
                htmlFor={category.id}
                className="text-sm font-normal cursor-pointer"
              >
                {category.name}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Clear Filters */}
      <Button 
        onClick={clearFilters}
        variant="outline" 
        className="w-full"
      >
        Clear All Filters
      </Button>
    </div>
  )
}
