"use client";

import { useState } from "react";
import { Clock, DollarSign, Calendar, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Service, ServiceType } from "@/types";

interface ServiceGridProps {
  services: Service[];
  onBookService: (service: Service) => void;
  className?: string;
}

export function ServiceGrid({ services, onBookService, className = "" }: ServiceGridProps) {
  const [filterType, setFilterType] = useState<ServiceType | "ALL">("ALL");
  const [sortBy, setSortBy] = useState<"price_asc" | "price_desc" | "newest">("newest");

  const filteredServices = services
    .filter(service => filterType === "ALL" || service.service_type === filterType)
    .sort((a, b) => {
      switch (sortBy) {
        case "price_asc":
          return a.price_in_cents - b.price_in_cents;
        case "price_desc":
          return b.price_in_cents - a.price_in_cents;
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

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

  const getServiceTypeLabel = (type: ServiceType) => {
    return type === "PROJECT_BASED" ? "Project" : "Hourly";
  };

  const getServiceTypeColor = (type: ServiceType) => {
    return type === "PROJECT_BASED" ? "status-success" : "status-neutral";
  };

  if (services.length === 0) {
    return (
      <Card className="card-surface text-center py-12">
        <CardContent>
          <p className="text-muted-foreground mb-4">No services available</p>
          <p className="text-sm text-muted-foreground">
            This professional hasn't created any services yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter & Sort</span>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Select value={filterType} onValueChange={(value) => setFilterType(value as ServiceType | "ALL")}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Service Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="PROJECT_BASED">Project Based</SelectItem>
              <SelectItem value="TIME_BASED">Time Based</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as "price_asc" | "price_desc" | "newest")}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredServices.map((service) => (
          <Card key={service.id} className="card-secondary group hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
                    {service.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={getServiceTypeColor(service.service_type)}>
                      {getServiceTypeLabel(service.service_type)}
                    </Badge>
                    {service.pricing_type === "HOURLY" && (
                      <Badge variant="outline">
                        Per Hour
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-foreground">
                    {formatPrice(service.price_in_cents)}
                  </div>
                  {service.pricing_type === "HOURLY" && (
                    <div className="text-xs text-muted-foreground">/hour</div>
                  )}
                </div>
              </div>
              
              {service.description && (
                <CardDescription className="line-clamp-3">
                  {service.description}
                </CardDescription>
              )}
            </CardHeader>
            
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>
                      {formatDeliveryTime(service.delivery_time_value, service.delivery_time_unit)}
                    </span>
                  </div>
                  
                  {service.service_type === "TIME_BASED" && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Available today</span>
                    </div>
                  )}
                </div>
              </div>
              
              <Button 
                onClick={() => onBookService(service)}
                className="w-full font-semibold shadow-md bg-muted text-foreground hover:bg-foreground hover:text-background"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Book Now - {formatPrice(service.price_in_cents)}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredServices.length === 0 && filterType !== "ALL" && (
        <Card className="card-surface text-center py-8">
          <CardContent>
            <p className="text-muted-foreground mb-2">No services found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters to see more services.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
