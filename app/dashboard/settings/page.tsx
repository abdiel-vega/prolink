import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PasswordChangeForm, StripeSettings, DeleteAccountForm } from "./SettingsForms";

export default async function SettingsPage() {
  const supabase = await createClient();

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect("/auth/login");
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, stripe_account_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[--text-primary]">Settings</h1>
        <p className="text-[--text-secondary]">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Password Change */}
        <PasswordChangeForm />

        {/* Stripe Settings (for professionals only) */}
        <StripeSettings 
          userRole={profile.role} 
          hasStripeAccount={!!profile.stripe_account_id}
        />

        {/* Account Deletion */}
        <DeleteAccountForm userEmail={user.email!} />
      </div>
    </div>
  );
}
