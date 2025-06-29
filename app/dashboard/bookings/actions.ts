"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Database } from "@/lib/supabase/database.types";

const updateBookingStatusSchema = z.object({
  bookingId: z.string().uuid(),
  status: z.enum([
    "PENDING_CONFIRMATION",
    "CONFIRMED",
    "COMPLETED",
    "CANCELLED",
    "DECLINED",
  ]),
});

export async function updateBookingStatus(formData: FormData) {
  try {
    const supabase = await createClient();

    // Validate authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      redirect("/auth/login");
    }

    // Validate input
    const result = updateBookingStatusSchema.safeParse({
      bookingId: formData.get("bookingId"),
      status: formData.get("status"),
    });

    if (!result.success) {
      throw new Error("Invalid input data");
    }

    const { bookingId, status } = result.data;

    // Get booking details to verify authorization
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("client_id, professional_profile_id, status")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error("Booking not found");
    }

    // Verify user has permission to update this booking
    const isClient = booking.client_id === user.id;
    const isProfessional = booking.professional_profile_id === user.id;

    if (!isClient && !isProfessional) {
      throw new Error("Unauthorized: You can only update your own bookings");
    }

    // Validate status transitions based on role
    if (isClient && status !== "CANCELLED") {
      throw new Error("Clients can only cancel bookings");
    }

    if (
      isProfessional &&
      booking.status !== "PENDING_CONFIRMATION" &&
      !["CONFIRMED", "COMPLETED", "CANCELLED", "DECLINED"].includes(status)
    ) {
      throw new Error("Invalid status transition");
    }

    // Update booking status
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", bookingId);

    if (updateError) {
      throw updateError;
    }

    revalidatePath("/dashboard/bookings");
  } catch (error) {
    console.error("Error updating booking status:", error);
    throw error;
  }
}
