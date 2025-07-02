"use client";

import { useRouter } from "next/navigation";
import { BookingForm } from "@/components/booking/BookingForm";
import type { ServiceWithProfile } from "@/types";

interface BookingPageClientProps {
  service: ServiceWithProfile;
}

export function BookingPageClient({ service }: BookingPageClientProps) {
  const router = useRouter();

  const handleBookingSuccess = (bookingId: string) => {
    // Use Next.js router for better navigation
    router.push(`/dashboard/bookings?booking=${bookingId}`);
  };

  const handleClose = () => {
    // Go back to professional profile or service page
    router.back();
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Book Service: {service.title}
          </h1>
          <p className="text-muted-foreground">
            Complete your booking with {service.profile.full_name || service.profile.username}
          </p>
        </div>

        <BookingForm
          service={service}
          onSuccess={handleBookingSuccess}
          onClose={handleClose}
        />
      </div>
    </div>
  );
}
