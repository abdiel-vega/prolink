"use client";

import { useState } from "react";
import { Calendar, Clock, DollarSign, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Service } from "@/types";

interface BookingWidgetProps {
  services: Service[];
  professionalName: string;
  averageRating?: number;
  totalReviews?: number;
  onBookService: (service: Service) => void;
  className?: string;
}

export function BookingWidget({
  services,
  professionalName,
  averageRating,
  totalReviews,
  onBookService,
  className = ""
}: BookingWidgetProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    services.length > 0 ? services[0].id : ""
  );

  const selectedService = services.find(s => s.id === selectedServiceId);

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
    return type === "PROJECT_BASED" ? "Project" : "Session";
  };

  if (services.length === 0) {
    return (
      <Card className={`card-secondary ${className}`}>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">No services available</p>
          <p className="text-sm text-muted-foreground">
            This professional hasn't created any services yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`card-secondary ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg">Book with {professionalName}</CardTitle>
        {averageRating && totalReviews && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{averageRating.toFixed(1)}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Service Selection */}
        {services.length > 1 && (
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Select Service
            </label>
            <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate mr-2">{service.title}</span>
                      <span className="font-medium">
                        {formatPrice(service.price_in_cents)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Selected Service Details */}
        {selectedService && (
          <div className="space-y-3">
            <div className="border-t border-border pt-3">
              <h4 className="font-medium text-foreground mb-2">{selectedService.title}</h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="w-4 h-4" />
                    <span>Price</span>
                  </div>
                  <span className="font-medium text-foreground">
                    {formatPrice(selectedService.price_in_cents)}
                    {selectedService.pricing_type === "HOURLY" && (
                      <span className="text-muted-foreground">/hour</span>
                    )}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Delivery</span>
                  </div>
                  <span className="font-medium text-foreground">
                    {formatDeliveryTime(selectedService.delivery_time_value, selectedService.delivery_time_unit)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Type</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {getServiceTypeLabel(selectedService.service_type)}
                  </Badge>
                </div>
              </div>
              
              {selectedService.description && (
                <p className="text-xs text-muted-foreground mt-3 line-clamp-2">
                  {selectedService.description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Book Button */}
        <Button
          onClick={() => selectedService && onBookService(selectedService)}
          disabled={!selectedService}
          className="w-full bg-white text-gray-900 hover:bg-gray-100 font-semibold"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Book Now - {selectedService ? formatPrice(selectedService.price_in_cents) : 'Select Service'}
        </Button>

        {/* Additional Info */}
        <div className="text-xs text-muted-foreground text-center pt-3 border-t border-border">
          <p>💳 Secure payment • 🔒 Money-back guarantee</p>
          <p className="mt-1">
            {selectedService?.service_type === "TIME_BASED" 
              ? "Free cancellation up to 24 hours before session"
              : "Free cancellation within 24 hours if work hasn't started"
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
