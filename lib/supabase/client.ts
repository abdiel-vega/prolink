import { createBrowserClient } from "@supabase/ssr";
import { Database } from "./database.types";

let supabaseInstance: ReturnType<typeof createBrowserClient<Database>> | null =
  null;

export function createClient() {
  // Return cached instance if available
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Check if we have the required environment variables
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    throw new Error("Missing Supabase environment variables");
  }

  try {
    supabaseInstance = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          // Reduce session refresh frequency to minimize cookie issues
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      }
    );

    return supabaseInstance;
  } catch (error) {
    console.error("Failed to create Supabase client:", error);
    throw error;
  }
}
