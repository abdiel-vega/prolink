import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Verify user exists and is a professional
    const supabase = await createClient();
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, stripe_account_id")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (profile.role !== "PROFESSIONAL") {
      return NextResponse.json(
        { error: "Only professionals can create Stripe accounts" },
        { status: 403 }
      );
    }

    if (profile.stripe_account_id) {
      return NextResponse.json(
        { error: "Stripe account already exists" },
        { status: 400 }
      );
    }

    // Get user email
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Create Stripe Connect account
    const account = await stripe.accounts.create({
      type: "standard",
      email: user.email,
      metadata: {
        prolink_user_id: userId,
      },
    });

    // Update profile with Stripe account ID
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ stripe_account_id: account.id })
      .eq("id", userId);

    if (updateError) {
      console.error(
        "Error updating profile with Stripe account ID:",
        updateError
      );
      // Try to delete the Stripe account if profile update failed
      try {
        await stripe.accounts.del(account.id);
      } catch (deleteError) {
        console.error("Error deleting Stripe account:", deleteError);
      }
      return NextResponse.json(
        { error: "Failed to save Stripe account" },
        { status: 500 }
      );
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/settings?stripe_refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/settings?stripe_success=true`,
      type: "account_onboarding",
    });

    return NextResponse.json({ accountLink });
  } catch (error) {
    console.error("Error creating Stripe Connect account:", error);
    return NextResponse.json(
      { error: "Failed to create Stripe account" },
      { status: 500 }
    );
  }
}
