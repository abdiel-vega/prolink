"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { updateProfileInfo, addWorkExperience, updateWorkExperience, addPortfolioProject, addSkillToProfile } from "./actions";
import { Loader2, Calendar, Building, ExternalLink, Tag } from "lucide-react";
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
  cover_image_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

const skillSchema = z.object({
  skill_name: z.string().min(1, "Skill name is required"),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type WorkExperienceFormData = z.infer<typeof workExperienceSchema>;
type PortfolioFormData = z.infer<typeof portfolioSchema>;
type SkillFormData = z.infer<typeof skillSchema>;

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
      formData.append("id", experience.id);
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
  const isEditing = !!project;

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
      cover_image_url: project?.cover_image_url || "",
    },
  });

  const onSubmit = async (data: PortfolioFormData) => {
    setIsSubmitting(true);
    setResult(null);

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value || "");
    });

    if (isEditing) {
      formData.append("id", project.id);
    }

    const result = await addPortfolioProject(formData);
    
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
            <Label htmlFor="cover_image_url">
              Image URL
            </Label>
            <Input
              id="cover_image_url"
              type="url"
              placeholder="https://example.com/image.jpg"
              {...register("cover_image_url")}
            />
            {errors.cover_image_url && (
              <p className="text-sm text-destructive">{errors.cover_image_url.message}</p>
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

export function SkillsForm({ open, onOpenChange }: SkillsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ActionResult | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SkillFormData>({
    resolver: zodResolver(skillSchema),
  });

  const onSubmit = async (data: SkillFormData) => {
    setIsSubmitting(true);
    setResult(null);

    const formData = new FormData();
    formData.append("skill_name", data.skill_name);

    const result = await addSkillToProfile(formData);
    setResult(result);
    setIsSubmitting(false);

    if (result.success) {
      reset();
      onOpenChange(false);
      window.location.reload();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-muted-foreground" />
            <DialogTitle>Add Skill</DialogTitle>
          </div>
          <DialogDescription>
            Add a new skill to your profile
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Skill Name *
            </Label>
            <Input
              id="skill_name"
              placeholder="e.g., React, Python, Graphic Design"
              {...register("skill_name")}
            />
            {errors.skill_name && (
              <p className="text-sm text-destructive">{errors.skill_name.message}</p>
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
              Add Skill
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
