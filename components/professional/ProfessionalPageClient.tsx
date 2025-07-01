"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfessionalHeader } from "@/components/professional/ProfessionalHeader";
import { ServiceGrid } from "@/components/professional/ServiceGrid";
import { PortfolioGrid } from "@/components/professional/PortfolioGrid";
import { ExperienceTimeline } from "@/components/professional/ExperienceTimeline";
import { ReviewsList } from "@/components/professional/ReviewsList";
import { SkillsCloud } from "@/components/professional/SkillsCloud";
import type { ProfessionalHeader as ProfessionalHeaderType, ReviewWithClient } from "@/types";

interface ProfessionalPageClientProps {
  professional: any;
  headerData: ProfessionalHeaderType;
}

export function ProfessionalPageClient({ professional, headerData }: ProfessionalPageClientProps) {
  const handleBookService = () => {
    // Scroll to services section
    const servicesSection = document.getElementById('services-section');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleMessage = () => {
    // TODO: Implement messaging functionality
    console.log('Open message dialog');
  };

  const handleServiceBook = (service: any) => {
    // Navigate to booking page
    window.location.href = `/booking/${service.id}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <ProfessionalHeader
        professional={headerData}
        onBookService={handleBookService}
        onMessage={handleMessage}
      />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="services" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="services" id="services-section">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Services</h2>
                <p className="text-muted-foreground">
                  Browse and book professional services offered by {professional.full_name || professional.username}.
                </p>
              </div>
              <ServiceGrid
                services={professional.services}
                onBookService={handleServiceBook}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="portfolio">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Portfolio</h2>
                <p className="text-muted-foreground">
                  Explore completed projects and work samples.
                </p>
              </div>
              <PortfolioGrid projects={professional.portfolio_projects} />
            </div>
          </TabsContent>
          
          <TabsContent value="experience">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Work Experience</h2>
                <p className="text-muted-foreground">
                  Professional background and career history.
                </p>
              </div>
              <ExperienceTimeline experiences={professional.work_experience} />
            </div>
          </TabsContent>
          
          <TabsContent value="skills">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Skills & Expertise</h2>
                <p className="text-muted-foreground">
                  Technical skills and areas of expertise.
                </p>
              </div>
              <SkillsCloud skills={professional.skills} />
            </div>
          </TabsContent>
          
          <TabsContent value="reviews">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Reviews & Ratings</h2>
                <p className="text-muted-foreground">
                  What clients are saying about working with {professional.full_name || professional.username}.
                </p>
              </div>
              <ReviewsList
                reviews={professional.reviews as ReviewWithClient[]}
                averageRating={professional.stats.rating}
                totalReviews={professional.stats.totalReviews}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Add padding at bottom for mobile sticky buttons */}
      <div className="md:hidden h-20" />
    </div>
  );
}
