"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Database } from "@/lib/supabase/database.types";

const profileInfoSchema = z.object({
  full_name: z.string().min(1, "Full name is required").max(100),
  title: z.string().max(100).optional().or(z.literal("")),
  bio: z.string().max(500).optional().or(z.literal("")),
  location: z.string().max(100).optional().or(z.literal("")),
  phone_number: z.string().max(20).optional().or(z.literal("")),
});

const workExperienceSchema = z.object({
  job_title: z.string().min(1, "Job title is required").max(100),
  company_name: z.string().min(1, "Company name is required").max(100),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional().or(z.literal("")),
  description: z.string().max(1000).optional().or(z.literal("")),
});

const portfolioProjectSchema = z.object({
  project_title: z.string().min(1, "Project title is required").max(100),
  description: z.string().max(1000).optional().or(z.literal("")),
  project_url: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  cover_image_url: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
});

export async function updateProfileInfo(formData: FormData) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      redirect("/auth/login");
    }

    const rawData = {
      full_name: formData.get("full_name") as string,
      title: (formData.get("title") as string) || "",
      bio: (formData.get("bio") as string) || "",
      location: (formData.get("location") as string) || "",
      phone_number: (formData.get("phone_number") as string) || "",
    };

    const result = profileInfoSchema.safeParse(rawData);
    if (!result.success) {
      throw new Error(
        `Validation failed: ${result.error.errors
          .map((e) => e.message)
          .join(", ")}`
      );
    }

    // Convert empty strings to null for database
    const updateData = {
      full_name: result.data.full_name,
      title: result.data.title || null,
      bio: result.data.bio || null,
      location: result.data.location || null,
      phone_number: result.data.phone_number || null,
    };

    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id);

    if (error) throw error;

    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
}

export async function addWorkExperience(formData: FormData) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      redirect("/auth/login");
    }

    const rawData = {
      job_title: formData.get("job_title") as string,
      company_name: formData.get("company_name") as string,
      start_date: formData.get("start_date") as string,
      end_date: (formData.get("end_date") as string) || "",
      description: (formData.get("description") as string) || "",
    };

    const result = workExperienceSchema.safeParse(rawData);
    if (!result.success) {
      throw new Error(
        `Validation failed: ${result.error.errors
          .map((e) => e.message)
          .join(", ")}`
      );
    }

    const { error } = await supabase.from("work_experience").insert({
      job_title: result.data.job_title,
      company_name: result.data.company_name,
      start_date: result.data.start_date,
      end_date: result.data.end_date || null,
      description: result.data.description || null,
      profile_id: user.id,
    });

    if (error) throw error;

    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error) {
    console.error("Error adding work experience:", error);
    throw error;
  }
}

export async function updateWorkExperience(formData: FormData) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      redirect("/auth/login");
    }

    const experienceId = formData.get("experienceId") as string;
    if (!experienceId) {
      throw new Error("Experience ID is required");
    }

    // Verify ownership
    const { data: existing, error: checkError } = await supabase
      .from("work_experience")
      .select("profile_id")
      .eq("id", experienceId)
      .single();

    if (checkError || !existing || existing.profile_id !== user.id) {
      throw new Error("Work experience not found or unauthorized");
    }

    const rawData = {
      job_title: formData.get("job_title") as string,
      company_name: formData.get("company_name") as string,
      start_date: formData.get("start_date") as string,
      end_date: (formData.get("end_date") as string) || "",
      description: (formData.get("description") as string) || "",
    };

    const result = workExperienceSchema.safeParse(rawData);
    if (!result.success) {
      throw new Error(
        `Validation failed: ${result.error.errors
          .map((e) => e.message)
          .join(", ")}`
      );
    }

    const { error } = await supabase
      .from("work_experience")
      .update({
        job_title: result.data.job_title,
        company_name: result.data.company_name,
        start_date: result.data.start_date,
        end_date: result.data.end_date || null,
        description: result.data.description || null,
      })
      .eq("id", experienceId);

    if (error) throw error;

    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error) {
    console.error("Error updating work experience:", error);
    throw error;
  }
}

export async function addPortfolioProject(formData: FormData) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      redirect("/auth/login");
    }

    const rawData = {
      project_title: formData.get("project_title") as string,
      description: (formData.get("description") as string) || "",
      project_url: (formData.get("project_url") as string) || "",
      cover_image_url: (formData.get("cover_image_url") as string) || "",
    };

    const result = portfolioProjectSchema.safeParse(rawData);
    if (!result.success) {
      throw new Error(
        `Validation failed: ${result.error.errors
          .map((e) => e.message)
          .join(", ")}`
      );
    }

    const { error } = await supabase.from("portfolio_projects").insert({
      project_title: result.data.project_title,
      description: result.data.description || null,
      project_url: result.data.project_url || null,
      cover_image_url: result.data.cover_image_url || null,
      profile_id: user.id,
    });

    if (error) throw error;

    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error) {
    console.error("Error adding portfolio project:", error);
    throw error;
  }
}

export async function addSkillToProfile(formData: FormData) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      redirect("/auth/login");
    }

    const skillName = formData.get("skill_name") as string;
    if (!skillName) {
      throw new Error("Skill name is required");
    }

    // Find or create the skill
    let skillId: string;

    // First try to find existing skill (case insensitive)
    const { data: existingSkill } = await supabase
      .from("skills")
      .select("id")
      .ilike("name", skillName)
      .maybeSingle();

    if (existingSkill) {
      skillId = existingSkill.id;
    } else {
      // Create new skill - we'll put it in a default "General" category for now
      // First, ensure we have a default category
      let categoryId: string;
      const { data: generalCategory } = await supabase
        .from("categories")
        .select("id")
        .ilike("name", "General")
        .maybeSingle();

      if (generalCategory) {
        categoryId = generalCategory.id;
      } else {
        // Create the General category
        const { data: newCategory, error: categoryError } = await supabase
          .from("categories")
          .insert({ name: "General" })
          .select("id")
          .single();

        if (categoryError) throw categoryError;
        categoryId = newCategory.id;
      }

      // Create the skill
      const { data: newSkill, error: skillError } = await supabase
        .from("skills")
        .insert({
          name: skillName,
          category_id: categoryId,
        })
        .select("id")
        .single();

      if (skillError) throw skillError;
      skillId = newSkill.id;
    }

    // Add skill to profile (upsert to handle duplicates)
    const { error: profileSkillError } = await supabase
      .from("profile_skills")
      .upsert({
        profile_id: user.id,
        skill_id: skillId,
      });

    if (profileSkillError) throw profileSkillError;

    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error) {
    console.error("Error adding skill:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to add skill",
    };
  }
}

export async function getAvailableSkillsByCategory() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      redirect("/auth/login");
    }

    // Get all skills with their categories and check which ones the user already has
    const { data: skillsData, error: skillsError } = await supabase
      .from("skills")
      .select(
        `
        id,
        name,
        category_id,
        categories!inner (
          id,
          name
        )
      `
      )
      .order("name");

    if (skillsError) throw skillsError;

    // Get user's current skills
    const { data: userSkills, error: userSkillsError } = await supabase
      .from("profile_skills")
      .select("skill_id")
      .eq("profile_id", user.id);

    if (userSkillsError) throw userSkillsError;

    const userSkillIds = new Set(userSkills.map((ps) => ps.skill_id));

    // Group skills by category and mark user's skills
    const skillsByCategory = skillsData.reduce(
      (acc, skill) => {
        const category = skill.categories;
        if (!category) return acc;

        if (!acc[category.id]) {
          acc[category.id] = {
            id: category.id,
            name: category.name,
            skills: [],
          };
        }

        acc[category.id].skills.push({
          id: skill.id,
          name: skill.name,
          hasSkill: userSkillIds.has(skill.id),
        });

        return acc;
      },
      {} as Record<
        string,
        {
          id: string;
          name: string;
          skills: Array<{
            id: string;
            name: string;
            hasSkill: boolean;
          }>;
        }
      >
    );

    return {
      success: true,
      data: Object.values(skillsByCategory),
    };
  } catch (error) {
    console.error("Error fetching skills by category:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch skills",
      data: [],
    };
  }
}

export async function addExistingSkillToProfile(formData: FormData) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      redirect("/auth/login");
    }

    const skillId = formData.get("skill_id") as string;
    if (!skillId) {
      throw new Error("Skill ID is required");
    }

    // Add skill to profile (upsert to handle duplicates)
    const { error: profileSkillError } = await supabase
      .from("profile_skills")
      .upsert({
        profile_id: user.id,
        skill_id: skillId,
      });

    if (profileSkillError) throw profileSkillError;

    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error) {
    console.error("Error adding skill:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to add skill",
    };
  }
}

export async function removeSkillFromProfile(formData: FormData) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      redirect("/auth/login");
    }

    const skillId = formData.get("skillId") as string;
    if (!skillId) {
      throw new Error("Skill ID is required");
    }

    const { error } = await supabase
      .from("profile_skills")
      .delete()
      .eq("profile_id", user.id)
      .eq("skill_id", skillId);

    if (error) throw error;

    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error) {
    console.error("Error removing skill:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to remove skill",
    };
  }
}
