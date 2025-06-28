import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { formatCurrency, getDeliveryTimeString, truncateText } from '@/lib/utils/formatting'
import { cn } from '@/lib/utils'
import { Heart, Star, Clock } from 'lucide-react'
import type { ServiceCardProps } from '@/types'

export function ServiceCard({ 
  service, 
  onBook, 
  onFavorite, 
  showProfessional = true, 
  className 
}: ServiceCardProps) {
  const handleBookClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onBook?.(service.id)
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onFavorite?.(service.id)
  }

  return (
    <Card className={cn('group hover:shadow-lg transition-all duration-200 overflow-hidden', className)}>
      <Link href={`/services/${service.id}`} className="block">
        {/* Service Image */}
        <div className="relative aspect-video bg-muted">
          {service.cover_image_url ? (
            <Image
              src={service.cover_image_url}
              alt={service.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <span className="text-sm">No image</span>
            </div>
          )}
          
          {/* Favorite Button */}
          {onFavorite && (
            <button
              onClick={handleFavoriteClick}
              className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-sm transition-colors"
              aria-label="Add to favorites"
            >
              <Heart className="h-4 w-4 text-gray-600" />
            </button>
          )}
        </div>

        <CardContent className="p-4">
          {/* Service Type Badge */}
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="text-xs">
              {service.service_type === 'TIME_BASED' ? 'Time-Based' : 'Project-Based'}
            </Badge>
            
            {service.average_rating && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{service.average_rating}</span>
                {service._count?.reviews && (
                  <span>({service._count.reviews})</span>
                )}
              </div>
            )}
          </div>

          {/* Service Title */}
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {service.title}
          </h3>

          {/* Service Description */}
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {truncateText(service.description || '', 120)}
          </p>

          {/* Professional Info */}
          {showProfessional && service.profile && (
            <div className="flex items-center gap-2 mb-3">
              <UserAvatar
                src={service.profile.avatar_url}
                fallback={service.profile.full_name ?? undefined}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {service.profile.full_name}
                </p>
                {service.profile.title && (
                  <p className="text-xs text-muted-foreground truncate">
                    {service.profile.title}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Delivery Time */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
            <Clock className="h-3 w-3" />
            <span>
              {getDeliveryTimeString(service.delivery_time_value, service.delivery_time_unit)}
              {service.service_type === 'TIME_BASED' ? ' session' : ' delivery'}
            </span>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          {/* Price */}
          <div className="flex flex-col">
            <span className="text-lg font-bold text-primary">
              {formatCurrency(service.price_in_cents)}
            </span>
            <span className="text-xs text-muted-foreground">
              {service.pricing_type === 'HOURLY' ? 'per hour' : 'fixed price'}
            </span>
          </div>

          {/* Book Button */}
          {onBook && (
            <Button
              onClick={handleBookClick}
              size="sm"
              className="ml-auto"
            >
              Book Now
            </Button>
          )}
        </CardFooter>
      </Link>
    </Card>
  )
}

export default ServiceCard
