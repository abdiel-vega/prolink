'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ServiceCard } from '@/components/shared/ServiceCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useSearchStore } from '@/lib/stores/searchStore'
import { Search, Loader2, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  
  const { 
    query, 
    filters,
    results, 
    loading, 
    hasMore,
    setQuery, 
    setFilters, 
    loadServices, 
    loadMore 
  } = useSearchStore()

  // Initialize search from URL params
  useEffect(() => {
    const urlQuery = searchParams.get('q') || ''
    const category = searchParams.get('category') || ''
    
    setQuery(urlQuery)
    if (category) {
      setFilters({
        ...filters,
        category_id: category
      })
    }

    // Load initial results
    loadServices(true)
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadServices(true)
  }

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadMore()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search for services..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Search'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile filter toggle */}
          <div className="lg:hidden">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full mb-4"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Simple Filters Sidebar */}
          <aside className={cn(
            "lg:w-80 space-y-6",
            showFilters ? "block" : "hidden lg:block"
          )}>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Quick Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <select 
                    className="w-full mt-1 p-2 border rounded-md"
                    value={filters.category_id || ''}
                    onChange={(e) => {
                      setFilters({
                        ...filters,
                        category_id: e.target.value || undefined
                      })
                      loadServices(true)
                    }}
                  >
                    <option value="">All Categories</option>
                    <option value="web-development">Web Development</option>
                    <option value="mobile-development">Mobile Development</option>
                    <option value="design">Design</option>
                    <option value="marketing">Marketing</option>
                    <option value="writing">Writing & Content</option>
                    <option value="consulting">Business Consulting</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Service Type</label>
                  <select 
                    className="w-full mt-1 p-2 border rounded-md"
                    value={filters.service_type || ''}
                    onChange={(e) => {
                      setFilters({
                        ...filters,
                        service_type: e.target.value as any || undefined
                      })
                      loadServices(true)
                    }}
                  >
                    <option value="">All Types</option>
                    <option value="TIME_BASED">Time-Based</option>
                    <option value="PROJECT_BASED">Project-Based</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Sort By</label>
                  <select 
                    className="w-full mt-1 p-2 border rounded-md"
                    value={filters.sort_by || 'relevance'}
                    onChange={(e) => {
                      setFilters({
                        ...filters,
                        sort_by: e.target.value as any
                      })
                      loadServices(true)
                    }}
                  >
                    <option value="relevance">Most Relevant</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>

                <Button 
                  onClick={() => {
                    setFilters({})
                    loadServices(true)
                  }}
                  variant="outline" 
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </aside>

          {/* Search Results */}
          <main className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {query ? `Results for "${query}"` : 'All Services'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {loading && results.length === 0 
                    ? 'Searching...' 
                    : results.length === 0 
                      ? 'No services found' 
                      : `${results.length} service${results.length === 1 ? '' : 's'} found`
                  }
                </p>
              </div>
            </div>

            {/* Results Grid or Empty State */}
            {loading && results.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                        <div className="flex items-center justify-between">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : results.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No services found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search criteria or filters to find what you're looking for.
                  </p>
                  <Button 
                    onClick={() => {
                      setQuery('')
                      setFilters({})
                      loadServices(true)
                    }} 
                    variant="outline"
                  >
                    Browse All Services
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      showProfessional={true}
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="text-center mt-8">
                    <Button
                      onClick={handleLoadMore}
                      disabled={loading}
                      variant="outline"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Loading more...
                        </>
                      ) : (
                        'Load More Services'
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
