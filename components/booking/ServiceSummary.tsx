import { Clock, DollarSign, Calendar, User, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import type { ServiceWithProfile } from "@/types";

interface ServiceSummaryProps {
  service: ServiceWithProfile;
  className?: string;
}

export function ServiceSummary({ service, className = "" }: ServiceSummaryProps) {
  const formatPrice = (priceInCents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(priceInCents / 100);
  };

  const formatDeliveryTime = (value: number, unit: string) => {
    const unitMap = {
      MINUTES: value === 1 ? 'minute' : 'minutes',
      HOURS: value === 1 ? 'hour' : 'hours',
      DAYS: value === 1 ? 'day' : 'days',
      WEEKS: value === 1 ? 'week' : 'weeks',
      MONTHS: value === 1 ? 'month' : 'months',
    };
    
    return `${value} ${unitMap[unit as keyof typeof unitMap] || unit.toLowerCase()}`;
  };

  const getServiceTypeLabel = (type: string) => {
    return type === "PROJECT_BASED" ? "Project Based" : "Time Based";
  };

  const getServiceTypeColor = (type: string) => {
    return type === "PROJECT_BASED" ? "status-success" : "status-neutral";
  };

  return (
    <Card className={`card-secondary ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg">Service Details</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Service Info */}
        <div>
          <h3 className="font-semibold text-foreground mb-2">{service.title}</h3>
          
          <div className="flex items-center gap-2 mb-3">
            <Badge className={getServiceTypeColor(service.service_type)}>
              {getServiceTypeLabel(service.service_type)}
            </Badge>
            {service.pricing_type === "HOURLY" && (
              <Badge variant="outline">Per Hour</Badge>
            )}
          </div>
          
          {service.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {service.description}
            </p>
          )}
        </div>

        {/* Professional Info */}
        <div className="border-t border-border pt-4">
          <div className="flex items-center gap-3 mb-3">
            <UserAvatar
              src={service.profile.avatar_url}
              alt={service.profile.full_name || service.profile.username || "Professional"}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground truncate">
                {service.profile.full_name || service.profile.username}
              </h4>
              {service.profile.title && (
                <p className="text-sm text-muted-foreground truncate">
                  {service.profile.title}
                </p>
              )}
            </div>
          </div>
          
          {service.profile.location && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{service.profile.location}</span>
            </div>
          )}
        </div>

        {/* Service Details */}
        <div className="border-t border-border pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Delivery Time</span>
            </div>
            <span className="text-sm font-medium text-foreground">
              {formatDeliveryTime(service.delivery_time_value, service.delivery_time_unit)}
            </span>
          </div>
          
          {service.service_type === "TIME_BASED" && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Session Type</span>
              </div>
              <span className="text-sm font-medium text-foreground">
                Live Session
              </span>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>Service Type</span>
            </div>
            <span className="text-sm font-medium text-foreground">
              {getServiceTypeLabel(service.service_type)}
            </span>
          </div>
        </div>

        {/* Pricing */}
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Service Price:</span>
            <span className="text-lg font-bold text-foreground">
              {formatPrice(service.price_in_cents)}
              {service.pricing_type === "HOURLY" && (
                <span className="text-sm font-normal text-muted-foreground">/hour</span>
              )}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Platform Fee:</span>
            <span className="text-foreground">Free</span>
          </div>
          
          <div className="border-t border-border mt-3 pt-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">Total:</span>
              <span className="text-xl font-bold text-primary">
                {formatPrice(service.price_in_cents)}
              </span>
            </div>
          </div>
        </div>

        {/* Cancellation Policy */}
        <div className="border-t border-border pt-4">
          <h4 className="font-medium text-foreground mb-2">Cancellation Policy</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {service.service_type === "TIME_BASED" 
              ? "Free cancellation up to 24 hours before the scheduled session. Cancellations within 24 hours may be subject to a fee."
              : "Free cancellation within 24 hours of booking if work hasn't started. After work begins, cancellation terms may vary."
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
