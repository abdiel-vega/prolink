import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProfessionalPageClient } from "@/components/professional/ProfessionalPageClient";
import { createClient } from "@/lib/supabase/server";
import type { ProfessionalHeader, ReviewWithClient, ProfessionalWithDetails } from "@/types";

interface ProfessionalPageProps {
  params: {
    username: string;
  };
}

async function getProfessionalData(username: string) {
  const supabase = await createClient();

  // Get professional profile with all related data
  const { data: professional, error } = await supabase
    .from('profiles')
    .select(`
      id,
      username,
      full_name,
      avatar_url,
      header_image_url,
      title,
      bio,
      location,
      phone_number,
      created_at,
      services!inner(
        id,
        title,
        description,
        price_in_cents,
        service_type,
        pricing_type,
        delivery_time_value,
        delivery_time_unit,
        is_active,
        created_at
      ),
      portfolio_projects(*),
      work_experience(*),
      profile_skills(
        skill_id,
        skills(*)
      )
    `)
    .eq('username', username)
    .eq('role', 'PROFESSIONAL')
    .eq('services.is_active', true)
    .single();

  if (error || !professional) {
    return null;
  }

  // Get reviews with client information
  const { data: reviewsData } = await supabase
    .from('reviews')
    .select(`
      id,
      rating,
      comment,
      created_at,
      client_id,
      profiles!client_id(
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('professional_profile_id', professional.id)
    .order('created_at', { ascending: false });

  // Get booking stats
  const { data: bookingStats } = await supabase
    .from('bookings')
    .select('status')
    .eq('professional_profile_id', professional.id);

  const completedBookings = bookingStats?.filter((b: any) => b.status === 'COMPLETED').length || 0;
  const averageRating = reviewsData?.length 
    ? reviewsData.reduce((sum: number, review: any) => sum + review.rating, 0) / reviewsData.length 
    : 0;

  // Format the data
  const formattedProfessional: any = {
    ...professional,
    services: professional.services || [],
    portfolio_projects: professional.portfolio_projects || [],
    work_experience: professional.work_experience || [],
    skills: professional.profile_skills?.map((ps: any) => ps.skills).filter(Boolean) || [],
    reviews: reviewsData?.map((review: any) => ({
      ...review,
      client: review.profiles,
      verified_purchase: true, // This would be determined by actual booking status
    })) || [],
    stats: {
      rating: averageRating,
      totalReviews: reviewsData?.length || 0,
      totalCompletedBookings: completedBookings,
      isOnline: true, // This would be determined by last activity
    },
  };

  return formattedProfessional;
}

async function ProfessionalPageContent({ params }: ProfessionalPageProps) {
  const professional = await getProfessionalData(params.username);

  if (!professional) {
    notFound();
  }

  // Format header data
  const headerData: ProfessionalHeader = {
    avatar_url: professional.avatar_url,
    header_image_url: professional.header_image_url,
    full_name: professional.full_name,
    username: professional.username,
    title: professional.title,
    bio: professional.bio,
    location: professional.location,
    rating: professional.stats.rating,
    totalReviews: professional.stats.totalReviews,
    totalCompletedBookings: professional.stats.totalCompletedBookings,
    isOnline: professional.stats.isOnline,
    joinedDate: professional.created_at,
  };

  return <ProfessionalPageClient professional={professional} headerData={headerData} />;
}

export default function Page({ params }: ProfessionalPageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <ProfessionalPageContent params={params} />
    </Suspense>
  );
}

export async function generateMetadata({ params }: ProfessionalPageProps) {
  const professional = await getProfessionalData(params.username);

  if (!professional) {
    return {
      title: 'Professional Not Found',
      description: 'The professional profile you are looking for does not exist.',
    };
  }

  const name = professional.full_name || professional.username;
  const title = professional.title ? ` - ${professional.title}` : '';

  return {
    title: `${name}${title} | ProLink`,
    description: professional.bio || `View ${name}'s professional profile, services, and reviews on ProLink.`,
    openGraph: {
      title: `${name}${title}`,
      description: professional.bio || `Professional services by ${name}`,
      images: professional.avatar_url ? [professional.avatar_url] : [],
    },
  };
}
