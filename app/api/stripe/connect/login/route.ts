import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(request: NextRequest) {
  try {
    const { accountId } = await request.json();

    if (!accountId) {
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 }
      );
    }

    // Verify the account belongs to the current user
    const supabase = await createClient();
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

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_account_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.stripe_account_id !== accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Create login link
    const loginLink = await stripe.accounts.createLoginLink(accountId);

    return NextResponse.json({ loginLink });
  } catch (error) {
    console.error("Error creating Stripe login link:", error);
    return NextResponse.json(
      { error: "Failed to create login link" },
      { status: 500 }
    );
  }
}
