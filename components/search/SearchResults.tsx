'use client'

import { ServiceCard } from '@/components/shared/ServiceCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useSearchStore } from '@/lib/stores/searchStore'
import { ServiceWithProfile } from '@/types'
import { Search, Loader2, AlertCircle } from 'lucide-react'

interface SearchResultsProps {
  results: ServiceWithProfile[]
  loading: boolean
  error: string | null
  hasMore: boolean
  onLoadMore: () => void
}

export function SearchResults({ 
  results, 
  loading, 
  error, 
  hasMore, 
  onLoadMore 
}: SearchResultsProps) {
  const { query, setQuery, loadServices } = useSearchStore()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadServices()
  }

  if (loading && results.length === 0) {
    return (
      <div className="space-y-6">
        {/* Search Bar */}
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

        {/* Loading Skeleton */}
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
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        {/* Search Bar */}
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

        {/* Error State */}
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Something went wrong
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => loadServices()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
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

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {query ? `Results for "${query}"` : 'All Services'}
          </h2>
          <p className="text-gray-600 mt-1">
            {results.length === 0 
              ? 'No services found' 
              : `${results.length} service${results.length === 1 ? '' : 's'} found`
            }
          </p>
        </div>
      </div>

      {/* Results Grid */}
      {results.length === 0 ? (
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
                loadServices()
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
            <div className="text-center">
              <Button
                onClick={onLoadMore}
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
    </div>
  )
}
