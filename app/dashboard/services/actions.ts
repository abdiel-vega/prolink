"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Database } from "@/lib/supabase/database.types";

const serviceFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(1000),
  price_in_cents: z.number().min(500, "Minimum price is $5.00"),
  category_id: z.string().uuid("Please select a category").optional(),
  service_type: z.enum(["TIME_BASED", "PROJECT_BASED"]),
  pricing_type: z.enum(["FIXED", "HOURLY"]),
  delivery_time_value: z.number().min(1),
  delivery_time_unit: z.enum(["MINUTES", "HOURS", "DAYS", "WEEKS", "MONTHS"]),
  is_active: z.boolean().default(true),
});

type ServiceFormData = z.infer<typeof serviceFormSchema>;

export async function createService(formData: FormData) {
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

    // Check if user is a professional
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "PROFESSIONAL") {
      throw new Error("Only professionals can create services");
    }

    // Parse and validate form data
    const rawData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      price_in_cents: parseInt(formData.get("price_in_cents") as string),
      category_id: (formData.get("category_id") as string) || undefined,
      service_type: formData.get("service_type") as
        | "TIME_BASED"
        | "PROJECT_BASED",
      pricing_type: formData.get("pricing_type") as "FIXED" | "HOURLY",
      delivery_time_value: parseInt(
        formData.get("delivery_time_value") as string
      ),
      delivery_time_unit: formData.get("delivery_time_unit") as
        | "MINUTES"
        | "HOURS"
        | "DAYS"
        | "WEEKS"
        | "MONTHS",
      is_active: formData.get("is_active") === "true",
    };

    const result = serviceFormSchema.safeParse(rawData);
    if (!result.success) {
      throw new Error(
        `Validation failed: ${result.error.errors
          .map((e) => e.message)
          .join(", ")}`
      );
    }

    const serviceData = result.data;

    // Create service
    const { data: service, error: serviceError } = await supabase
      .from("services")
      .insert({
        ...serviceData,
        profile_id: user.id,
        category_id: serviceData.category_id || null,
      })
      .select()
      .single();

    if (serviceError) {
      throw serviceError;
    }

    revalidatePath("/dashboard/services");
    return { success: true, service };
  } catch (error) {
    console.error("Error creating service:", error);
    throw error;
  }
}

export async function updateService(formData: FormData) {
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

    const serviceId = formData.get("serviceId") as string;
    if (!serviceId) {
      throw new Error("Service ID is required");
    }

    // Verify ownership
    const { data: existingService, error: serviceError } = await supabase
      .from("services")
      .select("profile_id")
      .eq("id", serviceId)
      .single();

    if (serviceError || !existingService) {
      throw new Error("Service not found");
    }

    if (existingService.profile_id !== user.id) {
      throw new Error("Unauthorized: You can only edit your own services");
    }

    // Parse and validate form data
    const rawData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      price_in_cents: parseInt(formData.get("price_in_cents") as string),
      category_id: (formData.get("category_id") as string) || undefined,
      service_type: formData.get("service_type") as
        | "TIME_BASED"
        | "PROJECT_BASED",
      pricing_type: formData.get("pricing_type") as "FIXED" | "HOURLY",
      delivery_time_value: parseInt(
        formData.get("delivery_time_value") as string
      ),
      delivery_time_unit: formData.get("delivery_time_unit") as
        | "MINUTES"
        | "HOURS"
        | "DAYS"
        | "WEEKS"
        | "MONTHS",
      is_active: formData.get("is_active") === "true",
    };

    const result = serviceFormSchema.safeParse(rawData);
    if (!result.success) {
      throw new Error(
        `Validation failed: ${result.error.errors
          .map((e) => e.message)
          .join(", ")}`
      );
    }

    const serviceData = result.data;

    // Update service
    const { data: service, error: updateError } = await supabase
      .from("services")
      .update({
        ...serviceData,
        category_id: serviceData.category_id || null,
      })
      .eq("id", serviceId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    revalidatePath("/dashboard/services");
    return { success: true, service };
  } catch (error) {
    console.error("Error updating service:", error);
    throw error;
  }
}

export async function deleteService(formData: FormData) {
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

    const serviceId = formData.get("serviceId") as string;
    if (!serviceId) {
      throw new Error("Service ID is required");
    }

    // Verify ownership
    const { data: existingService, error: serviceError } = await supabase
      .from("services")
      .select("profile_id")
      .eq("id", serviceId)
      .single();

    if (serviceError || !existingService) {
      throw new Error("Service not found");
    }

    if (existingService.profile_id !== user.id) {
      throw new Error("Unauthorized: You can only delete your own services");
    }

    // Check for active bookings
    const { data: activeBookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("id")
      .eq("service_id", serviceId)
      .in("status", ["PENDING_CONFIRMATION", "CONFIRMED"]);

    if (bookingsError) {
      throw bookingsError;
    }

    if (activeBookings && activeBookings.length > 0) {
      throw new Error(
        "Cannot delete service with active bookings. Please cancel or complete them first."
      );
    }

    // Delete service
    const { error: deleteError } = await supabase
      .from("services")
      .delete()
      .eq("id", serviceId);

    if (deleteError) {
      throw deleteError;
    }

    revalidatePath("/dashboard/services");
    return { success: true };
  } catch (error) {
    console.error("Error deleting service:", error);
    throw error;
  }
}
