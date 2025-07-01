import { Building, Calendar, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { WorkExperience } from "@/types";

interface ExperienceTimelineProps {
  experiences: WorkExperience[];
  className?: string;
}

export function ExperienceTimeline({ experiences, className = "" }: ExperienceTimelineProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  const calculateDuration = (startDate: string, endDate?: string | null) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffMonths / 12);
    
    if (diffYears > 0) {
      const remainingMonths = diffMonths % 12;
      if (remainingMonths === 0) {
        return `${diffYears} ${diffYears === 1 ? 'year' : 'years'}`;
      }
      return `${diffYears} ${diffYears === 1 ? 'year' : 'years'}, ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
    }
    
    if (diffMonths > 0) {
      return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'}`;
    }
    
    return '< 1 month';
  };

  const sortedExperiences = [...experiences].sort((a, b) => {
    // Sort by start date, most recent first
    return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
  });

  if (experiences.length === 0) {
    return (
      <Card className="card-surface text-center py-12">
        <CardContent>
          <p className="text-muted-foreground mb-4">No work experience</p>
          <p className="text-sm text-muted-foreground">
            This professional hasn't added any work experience yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {sortedExperiences.map((experience, index) => {
        const isCurrentJob = !experience.end_date;
        const duration = calculateDuration(experience.start_date, experience.end_date);
        
        return (
          <div key={experience.id} className="relative flex">
            {/* Timeline column */}
            <div className="flex flex-col items-center mr-6">
              {/* Timeline dot */}
              <div className="w-4 h-4 bg-primary rounded-full border-4 border-background relative z-10" />
              
              {/* Timeline line */}
              {index < sortedExperiences.length - 1 && (
                <div className="w-0.5 h-full bg-border mt-2 flex-1 min-h-[4rem]" />
              )}
            </div>
            
            {/* Content */}
            <Card className="card-secondary flex-1">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {experience.job_title}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Building className="w-4 h-4" />
                      <span className="font-medium">{experience.company_name}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatDate(experience.start_date)} - {isCurrentJob ? 'Present' : formatDate(experience.end_date!)}
                      </span>
                      <span className="text-muted-foreground/60">•</span>
                      <span>{duration}</span>
                    </div>
                  </div>
                  
                  {isCurrentJob && (
                    <Badge className="status-success">
                      Current
                    </Badge>
                  )}
                </div>
                
                {experience.description && (
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {experience.description}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
