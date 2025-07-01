import { MapPin, Star, Calendar, CheckCircle, Clock, MessageCircle, Calendar as CalendarIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/UserAvatar";
import type { ProfessionalHeader } from "@/types";

interface ProfessionalHeaderProps {
  professional: ProfessionalHeader;
  onBookService?: () => void;
  onMessage?: () => void;
}

export function ProfessionalHeader({ 
  professional, 
  onBookService, 
  onMessage 
}: ProfessionalHeaderProps) {
  const formatJoinDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const displayName = professional.full_name || professional.username || "Professional";

  return (
    <div className="relative">
      {/* Header Background with Fallback */}
      <div className="relative h-48 md:h-64 w-full overflow-hidden">
        {professional.header_image_url ? (
          <img
            src={professional.header_image_url}
            alt={`${displayName}'s cover image`}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              // Fallback to gradient if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.classList.add('bg-gradient-to-br', 'from-primary/20', 'to-primary/5');
              }
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-primary/30 via-primary/10 to-background" />
        )}
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
      </div>
      
      {/* Main Content Card */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative -mt-16 md:-mt-20 z-10">
        <Card className="card-surface shadow-xl border-0 bg-background/95 backdrop-blur-sm">
          <div className="p-6 md:p-8">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left Section - Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                  {/* Avatar with Online Status */}
                  <div className="relative flex-shrink-0">
                    <UserAvatar
                      src={professional.avatar_url}
                      alt={`${displayName}'s profile picture`}
                      size="xl"
                      className="ring-4 ring-background shadow-lg"
                    />
                    {professional.isOnline && (
                      <div 
                        className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-background shadow-sm"
                        aria-label="Currently online"
                      />
                    )}
                  </div>
                  
                  {/* Name and Status */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                        {displayName}
                      </h1>
                      {professional.isOnline && (
                        <Badge variant="outline" className="status-success w-fit ml-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                          Available now
                        </Badge>
                      )}
                    </div>
                    
                    {professional.title && (
                      <p className="text-lg md:text-xl text-muted-foreground font-medium mb-3">
                        {professional.title}
                      </p>
                    )}
                    
                    {/* Bio */}
                    {professional.bio && (
                      <p className="text-muted-foreground leading-relaxed mb-4 max-w-2xl">
                        {professional.bio}
                      </p>
                    )}
                    
                    {/* Meta Information */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      {professional.location && (
                        <div className="flex items-center gap-1.5" aria-label={`Located in ${professional.location}`}>
                          <MapPin className="w-4 h-4 text-primary" />
                          <span>{professional.location}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1.5" aria-label={`Member since ${formatJoinDate(professional.joinedDate)}`}>
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>Joined {formatJoinDate(professional.joinedDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-xl border">
                  <div className="text-center" role="group" aria-labelledby="rating-label">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                      <span className="text-lg font-bold text-foreground" id="rating-label">
                        {professional.rating > 0 ? professional.rating.toFixed(1) : 'New'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {professional.totalReviews} {professional.totalReviews === 1 ? 'review' : 'reviews'}
                    </p>
                  </div>
                  
                  <div className="text-center" role="group" aria-labelledby="completed-label">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <CheckCircle className="w-4 h-4 text-green-500" aria-hidden="true" />
                      <span className="text-lg font-bold text-foreground" id="completed-label">
                        {professional.totalCompletedBookings}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">completed</p>
                  </div>
                  
                  <div className="text-center" role="group" aria-labelledby="response-label">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Clock className="w-4 h-4 text-blue-500" aria-hidden="true" />
                      <span className="text-lg font-bold text-foreground" id="response-label">
                        &lt; 1hr
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">response time</p>
                  </div>
                  
                  <div className="text-center" role="group" aria-labelledby="completion-label">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <span className="text-lg font-bold text-green-500" id="completion-label">
                        98%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">completion rate</p>
                  </div>
                </div>
              </div>
              
              {/* Right Section - Action Buttons (Desktop) */}
              <div className="hidden lg:flex flex-col gap-3 min-w-[240px]">
                <Button 
                  onClick={onBookService}
                  size="lg"
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                  aria-label={`Book a service with ${displayName}`}
                >
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  Book Service
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={onMessage}
                  size="lg"
                  className="w-full h-12 border-2 hover:bg-muted/50 font-medium transition-all duration-200"
                  aria-label={`Send message to ${displayName}`}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Send Message
                </Button>
                
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Mobile Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t border-border z-50 shadow-lg">
        <div className="flex gap-3 max-w-md mx-auto">
          <Button 
            variant="outline" 
            onClick={onMessage}
            className="flex-1 h-12 border-2 font-medium"
            aria-label={`Send message to ${displayName}`}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Message
          </Button>
          <Button 
            onClick={onBookService}
            className="flex-2 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md"
            aria-label={`Book a service with ${displayName}`}
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            Book Service
          </Button>
        </div>
      </div>
    </div>
  );
}
