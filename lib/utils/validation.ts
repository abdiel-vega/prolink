import { z } from "zod";

// Service form validation
export const serviceFormSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description must be less than 2000 characters"),
  price_in_cents: z
    .number()
    .min(500, "Minimum price is $5.00")
    .max(100000000, "Maximum price is $1,000,000"),
  category_id: z.string().uuid("Please select a category"),
  service_type: z.enum(["TIME_BASED", "PROJECT_BASED"]),
  pricing_type: z.enum(["FIXED", "HOURLY"]),
  delivery_time_value: z
    .number()
    .min(1, "Delivery time must be at least 1")
    .max(365, "Delivery time cannot exceed 365"),
  delivery_time_unit: z.enum(["MINUTES", "HOURS", "DAYS"]),
  cover_image_url: z.string().url().optional().or(z.literal("")),
  is_active: z.boolean().default(true),
});

// Booking form validation
export const bookingFormSchema = z.object({
  service_id: z.string().uuid("Invalid service"),
  booking_start_time: z
    .string()
    .datetime("Please select a valid date and time"),
  duration_minutes: z
    .number()
    .min(15, "Minimum duration is 15 minutes")
    .max(480, "Maximum duration is 8 hours")
    .optional(),
  notes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .optional(),
});

// Review form validation
export const reviewFormSchema = z.object({
  booking_id: z.string().uuid("Invalid booking"),
  rating: z
    .number()
    .min(1, "Rating must be at least 1 star")
    .max(5, "Rating cannot exceed 5 stars"),
  comment: z
    .string()
    .min(10, "Comment must be at least 10 characters")
    .max(1000, "Comment must be less than 1000 characters"),
});

// Profile form validation
export const profileFormSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens"
    ),
  full_name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be less than 100 characters"),
  title: z
    .string()
    .max(100, "Title must be less than 100 characters")
    .optional(),
  bio: z.string().max(1000, "Bio must be less than 1000 characters").optional(),
  location: z
    .string()
    .max(100, "Location must be less than 100 characters")
    .optional(),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-\(\)]+$/, "Please enter a valid phone number")
    .optional()
    .or(z.literal("")),
  avatar_url: z.string().url().optional().or(z.literal("")),
  header_image_url: z.string().url().optional().or(z.literal("")),
});

// Portfolio project validation
export const portfolioProjectSchema = z.object({
  project_title: z
    .string()
    .min(3, "Project title must be at least 3 characters")
    .max(100, "Project title must be less than 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters"),
  project_url: z.string().url().optional().or(z.literal("")),
  cover_image_url: z.string().url().optional().or(z.literal("")),
});

// Work experience validation
export const workExperienceSchema = z.object({
  job_title: z
    .string()
    .min(2, "Job title must be at least 2 characters")
    .max(100, "Job title must be less than 100 characters"),
  company_name: z
    .string()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  start_date: z.string().date("Please enter a valid start date"),
  end_date: z
    .string()
    .date("Please enter a valid end date")
    .optional()
    .or(z.literal("")),
  is_current: z.boolean().default(false),
});

// Authentication validation
export const signUpSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one lowercase letter, one uppercase letter, and one number"
      ),
    confirmPassword: z.string(),
    role: z.enum(["CLIENT", "PROFESSIONAL"]),
    terms: z
      .boolean()
      .refine(
        (val) => val === true,
        "You must accept the terms and conditions"
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one lowercase letter, one uppercase letter, and one number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Search validation
export const searchSchema = z.object({
  query: z.string().optional(),
  category_id: z.string().uuid().optional(),
  location: z.string().optional(),
  price_min: z.number().min(0).optional(),
  price_max: z.number().min(0).optional(),
  service_type: z.enum(["TIME_BASED", "PROJECT_BASED"]).optional(),
  rating_min: z.number().min(1).max(5).optional(),
  sort_by: z
    .enum(["relevance", "price_asc", "price_desc", "rating", "newest"])
    .optional(),
});

// Contact form validation
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z
    .string()
    .min(5, "Subject must be at least 5 characters")
    .max(200, "Subject must be less than 200 characters"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be less than 2000 characters"),
});

// Custom validation functions
export function validateImageFile(file: File): string | null {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  if (file.size > maxSize) {
    return "File size must be less than 5MB";
  }

  if (!allowedTypes.includes(file.type)) {
    return "File must be a JPEG, PNG, WebP, or GIF image";
  }

  return null;
}

export function validatePasswordStrength(password: string): {
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  else feedback.push("At least 8 characters");

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push("At least one lowercase letter");

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push("At least one uppercase letter");

  if (/\d/.test(password)) score += 1;
  else feedback.push("At least one number");

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  else feedback.push("At least one special character");

  return { score, feedback };
}

export function validateBusinessHours(
  startTime: string,
  endTime: string,
  date: Date
): string | null {
  const start = new Date(`${date.toDateString()} ${startTime}`);
  const end = new Date(`${date.toDateString()} ${endTime}`);

  if (start >= end) {
    return "End time must be after start time";
  }

  const minDuration = 15 * 60 * 1000; // 15 minutes
  if (end.getTime() - start.getTime() < minDuration) {
    return "Minimum duration is 15 minutes";
  }

  return null;
}

// Type inference helpers
export type ServiceFormData = z.infer<typeof serviceFormSchema>;
export type BookingFormData = z.infer<typeof bookingFormSchema>;
export type ReviewFormData = z.infer<typeof reviewFormSchema>;
export type ProfileFormData = z.infer<typeof profileFormSchema>;
export type PortfolioProjectData = z.infer<typeof portfolioProjectSchema>;
export type WorkExperienceData = z.infer<typeof workExperienceSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;
