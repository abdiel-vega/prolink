import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BookingPageClient } from "@/app/booking/[serviceId]/BookingPageClient";
import { createClient } from "@/lib/supabase/server";
import type { ServiceWithProfile } from "@/types";

interface BookingPageProps {
  params: {
    serviceId: string;
  };
}

async function getServiceData(serviceId: string) {
  const supabase = await createClient();

  const { data: service, error } = await supabase
    .from('services')
    .select(`
      id,
      title,
      description,
      price_in_cents,
      service_type,
      pricing_type,
      delivery_time_value,
      delivery_time_unit,
      is_active,
      created_at,
      category_id,
      profile_id,
      profiles!profile_id(
        id,
        username,
        full_name,
        avatar_url,
        title,
        location
      )
    `)
    .eq('id', serviceId)
    .eq('is_active', true)
    .single();

  if (error || !service) {
    return null;
  }

  // Transform the data to match ServiceWithProfile type
  const serviceWithProfile: ServiceWithProfile = {
    ...service,
    profile: service.profiles,
  };

  return serviceWithProfile;
}

async function BookingPageContent({ params }: BookingPageProps) {
  const service = await getServiceData(params.serviceId);

  if (!service) {
    notFound();
  }

  return <BookingPageClient service={service} />;
}

export default function Page({ params }: BookingPageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <BookingPageContent params={params} />
    </Suspense>
  );
}

export async function generateMetadata({ params }: BookingPageProps) {
  const service = await getServiceData(params.serviceId);
  
  if (!service) {
    return {
      title: 'Service Not Found',
    };
  }

  return {
    title: `Book ${service.title} - ProLink`,
    description: service.description || `Book ${service.title} with ${service.profile.full_name || service.profile.username}`,
  };
}
