"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

// Validation schemas
const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const deleteAccountSchema = z.object({
  email: z.string().email("Invalid email address"),
  confirmation: z.literal("DELETE", {
    errorMap: () => ({ message: "You must type 'DELETE' to confirm" }),
  }),
});

export type ActionResult = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function updatePassword(
  formData: FormData
): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, message: "Authentication required" };
    }

    // Validate form data
    const result = updatePasswordSchema.safeParse({
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!result.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      };
    }

    const { currentPassword, newPassword } = result.data;

    // Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (signInError) {
      return {
        success: false,
        message: "Current password is incorrect",
        errors: { currentPassword: ["Current password is incorrect"] },
      };
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      return { success: false, message: updateError.message };
    }

    return { success: true, message: "Password updated successfully" };
  } catch (error) {
    console.error("Error updating password:", error);
    return { success: false, message: "An unexpected error occurred" };
  }
}

export async function createStripeConnectAccount(): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, message: "Authentication required" };
    }

    // Check if user is a professional
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, stripe_account_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return { success: false, message: "Profile not found" };
    }

    if (profile.role !== "PROFESSIONAL") {
      return {
        success: false,
        message: "Only professionals can connect Stripe accounts",
      };
    }

    if (profile.stripe_account_id) {
      return { success: false, message: "Stripe account already connected" };
    }

    // Create Stripe Connect account
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/stripe/connect/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.error || "Failed to create Stripe account",
      };
    }

    const { accountLink } = await response.json();

    // Redirect to Stripe onboarding
    redirect(accountLink.url);
  } catch (error) {
    console.error("Error creating Stripe Connect account:", error);
    return { success: false, message: "An unexpected error occurred" };
  }
}

export async function getStripeLoginLink(): Promise<
  ActionResult & { loginUrl?: string }
> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, message: "Authentication required" };
    }

    // Get user's Stripe account ID
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_account_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.stripe_account_id) {
      return { success: false, message: "No Stripe account connected" };
    }

    // Create login link
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/stripe/connect/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accountId: profile.stripe_account_id }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.error || "Failed to create login link",
      };
    }

    const { loginLink } = await response.json();

    return {
      success: true,
      message: "Login link created",
      loginUrl: loginLink.url,
    };
  } catch (error) {
    console.error("Error creating Stripe login link:", error);
    return { success: false, message: "An unexpected error occurred" };
  }
}

export async function deleteAccount(formData: FormData): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, message: "Authentication required" };
    }

    // Validate form data
    const result = deleteAccountSchema.safeParse({
      email: formData.get("email"),
      confirmation: formData.get("confirmation"),
    });

    if (!result.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      };
    }

    const { email } = result.data;

    // Verify email matches current user
    if (email !== user.email) {
      return {
        success: false,
        message: "Email doesn't match your account",
        errors: { email: ["Email doesn't match your account"] },
      };
    }

    // Check for active bookings
    const { data: activeBookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("id")
      .or(`client_id.eq.${user.id},professional_id.eq.${user.id}`)
      .in("status", ["PENDING_CONFIRMATION", "CONFIRMED"]);

    if (bookingsError) {
      return { success: false, message: "Error checking active bookings" };
    }

    if (activeBookings && activeBookings.length > 0) {
      return {
        success: false,
        message:
          "Cannot delete account with active bookings. Please complete or cancel all bookings first.",
      };
    }

    // Delete user data (cascading deletes should handle related records)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(
      user.id
    );

    if (deleteError) {
      return { success: false, message: deleteError.message };
    }

    // Sign out and redirect
    await supabase.auth.signOut();
    redirect("/auth/login?message=Account deleted successfully");
  } catch (error) {
    console.error("Error deleting account:", error);
    return { success: false, message: "An unexpected error occurred" };
  }
}
