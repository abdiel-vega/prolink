"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { HeaderImageUpload } from "@/components/shared/HeaderImageUpload";
import { PortfolioCoverImageUpload } from "@/components/shared/PortfolioCoverImageUpload";
import { updateProfileInfo, addWorkExperience, updateWorkExperience, addPortfolioProject, updatePortfolioProject, addSkillToProfile, addExistingSkillToProfile, getAvailableSkillsByCategory, removeSkillFromProfile, updateProfileAvatar, updateProfileHeader, deleteWorkExperience, deletePortfolioProject } from "./actions";
import { Loader2, Calendar, Building, ExternalLink, Tag, Check, Plus, X, User, Image } from "lucide-react";
import type { Profile, WorkExperience, PortfolioProject } from "@/types";

// Result type
type ActionResult = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

// Validation schemas
const profileSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  title: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  phone_number: z.string().optional(),
});

const workExperienceSchema = z.object({
  company_name: z.string().min(1, "Company is required"),
  job_title: z.string().min(1, "Position is required"),
  description: z.string().optional(),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional(),
});

const portfolioSchema = z.object({
  project_title: z.string().min(1, "Project title is required"),
  description: z.string().optional(),
  project_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type WorkExperienceFormData = z.infer<typeof workExperienceSchema>;
type PortfolioFormData = z.infer<typeof portfolioSchema>;

interface ProfileFormProps {
  profile: Profile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileForm({ profile, open, onOpenChange }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ActionResult | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile.full_name || "",
      title: profile.title || "",
      bio: profile.bio || "",
      location: profile.location || "",
      phone_number: profile.phone_number || "",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    setResult(null);

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value || "");
    });

    const result = await updateProfileInfo(formData);
    setResult(result);
    setIsSubmitting(false);

    if (result.success) {
      onOpenChange(false);
      window.location.reload(); // Refresh to show updated data
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your basic profile information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">
              Full Name *
            </Label>
            <Input
              id="full_name"
              {...register("full_name")}
            />
            {errors.full_name && (
              <p className="text-sm text-destructive">{errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">
              Professional Title
            </Label>
            <Input
              id="title"
              placeholder="e.g., Full Stack Developer"
              {...register("title")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">
              Bio
            </Label>
            <Textarea
              id="bio"
              placeholder="Tell clients about yourself..."
              {...register("bio")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">
              Location
            </Label>
            <Input
              id="location"
              placeholder="e.g., New York, NY"
              {...register("location")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number">
              Phone Number
            </Label>
            <Input
              id="phone_number"
              placeholder="+1 (555) 123-4567"
              {...register("phone_number")}
            />
          </div>

          {result && !result.success && (
            <div className="p-3 rounded-md text-sm bg-destructive/10 text-destructive border border-destructive/20">
              {result.message}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface WorkExperienceFormProps {
  experience?: WorkExperience;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WorkExperienceForm({ experience, open, onOpenChange }: WorkExperienceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ActionResult | null>(null);
  const isEditing = !!experience;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<WorkExperienceFormData>({
    resolver: zodResolver(workExperienceSchema),
    defaultValues: {
      company_name: experience?.company_name || "",
      job_title: experience?.job_title || "",
      description: experience?.description || "",
      start_date: experience?.start_date || "",
      end_date: experience?.end_date || "",
    },
  });

  const onSubmit = async (data: WorkExperienceFormData) => {
    setIsSubmitting(true);
    setResult(null);

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value || ""));
    });

    if (isEditing) {
      formData.append("experienceId", experience.id);
    }

    const result = isEditing 
      ? await updateWorkExperience(formData)
      : await addWorkExperience(formData);
    
    setResult(result);
    setIsSubmitting(false);

    if (result.success) {
      onOpenChange(false);
      window.location.reload();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-muted-foreground" />
            <DialogTitle>
              {isEditing ? "Edit" : "Add"} Work Experience
            </DialogTitle>
          </div>
          <DialogDescription>
            {isEditing ? "Update" : "Add"} your professional experience
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company_name">
              Company *
            </Label>
            <Input
              id="company_name"
              {...register("company_name")}
            />
            {errors.company_name && (
              <p className="text-sm text-destructive">{errors.company_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="job_title">
              Position *
            </Label>
            <Input
              id="job_title"
              {...register("job_title")}
            />
            {errors.job_title && (
              <p className="text-sm text-destructive">{errors.job_title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe your responsibilities and achievements..."
              {...register("description")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">
                Start Date *
              </Label>
              <Input
                id="start_date"
                type="date"
                {...register("start_date")}
              />
              {errors.start_date && (
                <p className="text-sm text-destructive">{errors.start_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">
                End Date
              </Label>
              <Input
                id="end_date"
                type="date"
                {...register("end_date")}
              />
            </div>
          </div>

          {result && !result.success && (
            <div className="p-3 rounded-md text-sm bg-destructive/10 text-destructive border border-destructive/20">
              {result.message}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update" : "Add"} Experience
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface PortfolioFormProps {
  project?: PortfolioProject;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PortfolioForm({ project, open, onOpenChange }: PortfolioFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState(project?.cover_image_url || "");
  const [coverImageError, setCoverImageError] = useState<string | null>(null);
  const isEditing = !!project;

  // Reset cover image state when dialog opens/closes or project changes
  useEffect(() => {
    if (open && project) {
      setCoverImageUrl(project.cover_image_url || "");
    } else if (open && !project) {
      setCoverImageUrl("");
    }
    setCoverImageError(null);
    setResult(null);
  }, [open, project]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PortfolioFormData>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: {
      project_title: project?.project_title || "",
      description: project?.description || "",
      project_url: project?.project_url || "",
    },
  });

  const onSubmit = async (data: PortfolioFormData) => {
    setIsSubmitting(true);
    setResult(null);
    setCoverImageError(null);

    // Validate cover image URL if provided
    if (coverImageUrl && coverImageUrl.trim()) {
      try {
        new URL(coverImageUrl);
      } catch {
        // Only validate if it's not a data URL (uploaded file)
        if (!coverImageUrl.startsWith('data:')) {
          setCoverImageError("Invalid image URL format");
          setIsSubmitting(false);
          return;
        }
      }
    }

    const formData = new FormData();
    // Use the controlled cover image state instead of form data
    const submitData = {
      ...data,
      cover_image_url: coverImageUrl.trim()
    };
    
    Object.entries(submitData).forEach(([key, value]) => {
      formData.append(key, value || "");
    });

    if (isEditing) {
      formData.append("projectId", project.id);
    }

    try {
      const result = isEditing 
        ? await updatePortfolioProject(formData)
        : await addPortfolioProject(formData);
      
      setResult(result);
      setIsSubmitting(false);

      if (result.success) {
        onOpenChange(false);
        window.location.reload();
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Failed to save project"
      });
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-muted-foreground" />
            <DialogTitle>
              {isEditing ? "Edit" : "Add"} Portfolio Project
            </DialogTitle>
          </div>
          <DialogDescription>
            Showcase your work and achievements
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project_title">
              Project Title *
            </Label>
            <Input
              id="project_title"
              {...register("project_title")}
            />
            {errors.project_title && (
              <p className="text-sm text-destructive">{errors.project_title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the project and your role..."
              {...register("description")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project_url">
              Project URL
            </Label>
            <Input
              id="project_url"
              type="url"
              placeholder="https://example.com"
              {...register("project_url")}
            />
            {errors.project_url && (
              <p className="text-sm text-destructive">{errors.project_url.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <PortfolioCoverImageUpload
              value={coverImageUrl}
              onChange={setCoverImageUrl}
              label="Cover Image"
            />
            {coverImageError && (
              <p className="text-sm text-destructive">{coverImageError}</p>
            )}
          </div>

          {result && !result.success && (
            <div className="p-3 rounded-md text-sm bg-destructive/10 text-destructive border border-destructive/20">
              {result.message}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update" : "Add"} Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface SkillsFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SkillCategory = {
  id: string;
  name: string;
  skills: Array<{
    id: string;
    name: string;
    hasSkill: boolean;
  }>;
};

export function SkillsForm({ open, onOpenChange }: SkillsFormProps) {
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [processingSkills, setProcessingSkills] = useState<Set<string>>(new Set());

  // Load skills when dialog opens
  useEffect(() => {
    if (open) {
      loadSkills();
      setSelectedCategory("");
    }
  }, [open]);

  const loadSkills = async () => {
    setLoading(true);
    try {
      const result = await getAvailableSkillsByCategory();
      if (result.success) {
        setCategories(result.data);
        // Auto-select first category if available
        if (result.data.length > 0) {
          setSelectedCategory(result.data[0].id);
        }
      }
    } catch (error) {
      console.error("Error loading skills:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async (skillId: string) => {
    if (processingSkills.has(skillId)) return;

    setProcessingSkills(prev => new Set(prev).add(skillId));

    try {
      const formData = new FormData();
      formData.append("skill_id", skillId);
      
      const result = await addExistingSkillToProfile(formData);
      
      if (result.success) {
        // Update local state to reflect the change
        setCategories(prev => prev.map(category => ({
          ...category,
          skills: category.skills.map(skill =>
            skill.id === skillId ? { ...skill, hasSkill: true } : skill
          )
        })));
      }
    } catch (error) {
      console.error("Error adding skill:", error);
    } finally {
      setProcessingSkills(prev => {
        const newSet = new Set(prev);
        newSet.delete(skillId);
        return newSet;
      });
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    if (processingSkills.has(skillId)) return;

    setProcessingSkills(prev => new Set(prev).add(skillId));

    try {
      const formData = new FormData();
      formData.append("skillId", skillId);
      
      const result = await removeSkillFromProfile(formData);
      
      if (result.success) {
        // Update local state to reflect the change
        setCategories(prev => prev.map(category => ({
          ...category,
          skills: category.skills.map(skill =>
            skill.id === skillId ? { ...skill, hasSkill: false } : skill
          )
        })));
      }
    } catch (error) {
      console.error("Error removing skill:", error);
    } finally {
      setProcessingSkills(prev => {
        const newSet = new Set(prev);
        newSet.delete(skillId);
        return newSet;
      });
    }
  };

  // Get skills for the selected category
  const getFilteredSkills = () => {
    if (!selectedCategory) return [];
    
    const category = categories.find(cat => cat.id === selectedCategory);
    if (!category) return [];

    return category.skills;
  };

  const filteredSkills = getFilteredSkills();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col bg-background border border-border">
        <DialogHeader className="pb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold text-foreground">Skill Categories</DialogTitle>
              <DialogDescription className="mt-1 text-muted-foreground">
                Select category to view and manage skills for your profile.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center flex-1">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Category Selection */}
            <div className="mb-6 flex-shrink-0">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`
                      rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 border
                      ${selectedCategory === category.id
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm hover:bg-primary/90'
                        : 'bg-background text-foreground border-border hover:bg-muted hover:border-primary/50'
                      }
                    `}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Selected Category Skills */}
            {selectedCategory && (
              <div className="flex flex-col flex-1 min-h-0">
                <div className="mb-4 flex-shrink-0">
                </div>

                {filteredSkills.length === 0 ? (
                  <div className="flex flex-col items-center justify-center flex-1 text-center">
                    <Tag className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No skills available in this category.
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto min-h-0 pr-2">
                    <div className="flex flex-wrap gap-2 pb-4">
                      {filteredSkills.map((skill) => (
                        <button
                          key={skill.id}
                          type="button"
                          disabled={processingSkills.has(skill.id)}
                          onClick={() => skill.hasSkill ? handleRemoveSkill(skill.id) : handleAddSkill(skill.id)}
                          className={`
                            inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium 
                            transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-primary/50
                            ${skill.hasSkill
                              ? 'bg-primary text-primary-foreground border-primary shadow-sm hover:bg-primary/90'
                              : 'bg-background text-foreground border-border hover:bg-muted hover:border-primary/50'
                            }
                            disabled:opacity-50 disabled:cursor-not-allowed
                          `}
                        >
                          <span>{skill.name}</span>
                          {processingSkills.has(skill.id) ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : skill.hasSkill ? (
                            <X className="h-3 w-3" />
                          ) : (
                            <Plus className="h-3 w-3" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex justify-between pt-4 border-t border-border flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="px-6"
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-6"
          >
            Next
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface AvatarFormProps {
  currentAvatar?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AvatarForm({ currentAvatar, open, onOpenChange }: AvatarFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [avatarUrl, setAvatarUrl] = useState(currentAvatar || "");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    const formData = new FormData();
    formData.append("avatar_url", avatarUrl);

    try {
      const result = await updateProfileAvatar(formData);
      setResult(result);
      
      if (result.success) {
        onOpenChange(false);
        window.location.reload();
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Failed to update avatar"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <DialogTitle>Update Profile Picture</DialogTitle>
          </div>
          <DialogDescription>
            Upload a new profile picture to personalize your account
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          <ImageUpload
            value={avatarUrl}
            onChange={setAvatarUrl}
            fallbackText="U"
            size="lg"
            label="Profile Picture"
            className="mx-auto"
          />

          {result && !result.success && (
            <div className="text-red-600 text-sm bg-red-50 dark:bg-red-950/20 p-3 rounded-md border border-red-200 dark:border-red-800">
              {result.message}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Picture"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface HeaderFormProps {
  currentHeader?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HeaderForm({ currentHeader, open, onOpenChange }: HeaderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [headerUrl, setHeaderUrl] = useState(currentHeader || "");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    const formData = new FormData();
    formData.append("header_image_url", headerUrl);

    try {
      const result = await updateProfileHeader(formData);
      setResult(result);
      
      if (result.success) {
        onOpenChange(false);
        window.location.reload();
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Failed to update header"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Image className="h-5 w-5 text-muted-foreground" />
            <DialogTitle>Update Header Image</DialogTitle>
          </div>
          <DialogDescription>
            Upload a header image to showcase your professional brand
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          <HeaderImageUpload
            value={headerUrl}
            onChange={setHeaderUrl}
            label="Header Image"
          />

          {result && !result.success && (
            <div className="text-red-600 text-sm bg-red-50 dark:bg-red-950/20 p-3 rounded-md border border-red-200 dark:border-red-800">
              {result.message}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Header"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
