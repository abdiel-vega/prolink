import { Database } from "./database.types";

// Export the main Database type
export type { Database };

// Export table types for easier access
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// Export enum types
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];

// Common table types
export type Profile = Tables<"profiles">;
export type Service = Tables<"services">;
export type Booking = Tables<"bookings">;
export type Review = Tables<"reviews">;
export type Category = Tables<"categories">;
export type Skill = Tables<"skills">;
export type PortfolioProject = Tables<"portfolio_projects">;
export type WorkExperience = Tables<"work_experience">;
export type ProfileSkill = Tables<"profile_skills">;

// Common enum types
export type UserRole = Enums<"user_role">;
export type BookingStatus = Enums<"booking_status">;
export type PricingType = Enums<"pricing_type">;
export type ServiceType = Enums<"service_type">;
export type DeliveryTimeUnit = Enums<"delivery_time_unit">;

// Insert types
export type ProfileInsert = TablesInsert<"profiles">;
export type ServiceInsert = TablesInsert<"services">;
export type BookingInsert = TablesInsert<"bookings">;
export type ReviewInsert = TablesInsert<"reviews">;

// Update types
export type ProfileUpdate = TablesUpdate<"profiles">;
export type ServiceUpdate = TablesUpdate<"services">;
export type BookingUpdate = TablesUpdate<"bookings">;
export type ReviewUpdate = TablesUpdate<"reviews">;
