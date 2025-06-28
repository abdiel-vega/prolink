import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { User } from "@supabase/supabase-js";
import type { Profile, AuthState as AuthStateSlice } from "@/types";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// Track initialization state to prevent multiple initializations
let isInitializing = false;
let hasInitialized = false;

type AuthActions = {
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    userData: {
      username: string;
      full_name: string;
      role: "CLIENT" | "PROFESSIONAL";
    }
  ) => Promise<any>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<Profile>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  requireAuth: () => User;
  requireRole: (role: "CLIENT" | "PROFESSIONAL") => User;
};

type AuthState = AuthStateSlice & AuthActions;

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      user: null,
      profile: null,
      loading: true,

      initialize: async () => {
        // Prevent multiple simultaneous initializations
        if (isInitializing || hasInitialized) {
          return;
        }

        isInitializing = true;

        try {
          set({ loading: true });

          // Get initial session with error handling
          let session = null;
          let sessionError = null;

          try {
            const { data, error } = await supabase.auth.getSession();
            if (error) {
              sessionError = error;
              console.warn("Session error:", error.message);
            } else {
              session = data.session;
            }
          } catch (error) {
            sessionError = error;
            console.warn("Failed to get session:", error);
          }

          // Only clear cookies if we have a specific session parsing error
          if (
            sessionError &&
            typeof sessionError === "object" &&
            "message" in sessionError &&
            typeof sessionError.message === "string" &&
            (sessionError.message.includes("cookie") ||
              sessionError.message.includes("parse") ||
              sessionError.message.includes("malformed"))
          ) {
            console.log("Clearing potentially corrupted session data...");

            if (typeof window !== "undefined") {
              try {
                // Clear localStorage
                localStorage.removeItem("supabase.auth.token");

                // Clear only problematic supabase cookies
                const cookies = document.cookie.split(";");
                cookies.forEach((cookie) => {
                  const eqPos = cookie.indexOf("=");
                  const name =
                    eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
                  if (name.includes("supabase-auth-token")) {
                    try {
                      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
                    } catch (e) {
                      // Ignore cookie clearing errors
                    }
                  }
                });

                // Try to get session again after cleanup
                const { data } = await supabase.auth.getSession();
                session = data.session;
              } catch (e) {
                console.warn("Error during session cleanup:", e);
              }
            }
          }

          if (session?.user) {
            try {
              // Get user profile
              const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", session.user.id)
                .single();

              if (profileError) {
                console.error("Error fetching profile:", profileError);
              }

              set({
                user: session.user,
                profile: profile || null,
                loading: false,
              });
            } catch (profileError) {
              console.error("Profile fetch failed:", profileError);
              set({
                user: session.user,
                profile: null,
                loading: false,
              });
            }
          } else {
            set({ user: null, profile: null, loading: false });
          }

          // Listen for auth changes with error handling
          supabase.auth.onAuthStateChange(async (event, session) => {
            try {
              if (event === "SIGNED_IN" && session?.user) {
                // Get user profile
                const { data: profile } = await supabase
                  .from("profiles")
                  .select("*")
                  .eq("id", session.user.id)
                  .single();

                set({
                  user: session.user,
                  profile: profile || null,
                  loading: false,
                });
              } else if (event === "SIGNED_OUT") {
                set({ user: null, profile: null, loading: false });
              }
            } catch (error) {
              console.error("Auth state change error:", error);
            }
          });
        } catch (error) {
          console.error("Error initializing auth:", error);
          set({ user: null, profile: null, loading: false });
        } finally {
          isInitializing = false;
          hasInitialized = true;
        }
      },

      signIn: async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
      },

      signUp: async (
        email: string,
        password: string,
        userData: {
          username: string;
          full_name: string;
          role: "CLIENT" | "PROFESSIONAL";
        }
      ) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: userData,
          },
        });

        if (error) throw error;
        return data;
      },

      signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        set({ user: null, profile: null });
      },

      updateProfile: async (updates: Partial<Profile>) => {
        const { user } = get();
        if (!user) throw new Error("No user logged in");

        console.log("Current user:", user);
        console.log("User ID:", user.id);
        console.log("Updating profile with data:", updates);

        // Check if avatar_url is too large
        if (updates.avatar_url && updates.avatar_url.length > 1000000) {
          // 1MB limit for base64
          throw new Error(
            "Avatar image is too large. Please select a smaller image."
          );
        }

        // Refresh session to ensure we have a valid auth token
        let session = null;
        try {
          const {
            data: { session: refreshedSession },
            error: sessionError,
          } = await supabase.auth.refreshSession();

          if (sessionError) {
            console.warn("Session refresh warning:", sessionError.message);
            // Try to get existing session if refresh fails
            const { data: existingSession } = await supabase.auth.getSession();
            session = existingSession.session;
          } else {
            session = refreshedSession;
          }
        } catch (error) {
          console.warn(
            "Session refresh failed, trying existing session:",
            error
          );
          const { data: existingSession } = await supabase.auth.getSession();
          session = existingSession.session;
        }

        if (!session) {
          throw new Error(
            "Authentication session invalid. Please sign in again."
          );
        }

        console.log(
          "Session refreshed, user role:",
          session.user.role || "authenticated"
        );

        // First, check if profile exists
        const { data: existingProfile, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (fetchError && fetchError.code === "PGRST116") {
          // Profile doesn't exist, create it
          console.log("Profile does not exist, creating new profile...");
          const { data, error } = await supabase
            .from("profiles")
            .insert({ id: user.id, ...updates })
            .select()
            .single();

          if (error) {
            console.error("Database error during insert:", error);
            throw error;
          }

          console.log("Profile created successfully:", data);
          set((state) => ({ profile: data }));
          return data;
        } else if (fetchError) {
          console.error("Error fetching profile:", fetchError);
          throw fetchError;
        }

        // Profile exists, update it
        console.log("Updating existing profile...");
        const { data, error } = await supabase
          .from("profiles")
          .update(updates)
          .eq("id", user.id)
          .select()
          .single();

        if (error) {
          console.error("Database error during update:", error);
          throw error;
        }

        console.log("Profile updated successfully:", data);

        set((state) => ({
          profile: data,
        }));

        return data;
      },

      resetPassword: async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/update-password`,
        });

        if (error) throw error;
      },

      updatePassword: async (password: string) => {
        const { error } = await supabase.auth.updateUser({
          password,
        });

        if (error) throw error;
      },

      requireAuth: () => {
        const { user } = get();
        if (!user) throw new Error("Authentication required");
        return user;
      },

      requireRole: (role: "CLIENT" | "PROFESSIONAL") => {
        const { user, profile } = get();
        if (!user) throw new Error("Authentication required");
        if (profile?.role !== role) {
          throw new Error(`${role} access required`);
        }
        return user;
      },
    }),
    {
      name: "auth-store",
    }
  )
);

// Initialize the store when it's first used
if (typeof window !== "undefined") {
  useAuthStore.getState().initialize();
}
