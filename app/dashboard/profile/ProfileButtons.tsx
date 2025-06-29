"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProfileForm, WorkExperienceForm, PortfolioForm, SkillsForm } from "./ProfileForms";
import { Edit, Plus } from "lucide-react";
import type { Profile, WorkExperience, PortfolioProject } from "@/types";

interface ProfileEditButtonProps {
  profile: Profile;
}

export function ProfileEditButton({ profile }: ProfileEditButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="w-4 h-4 mr-1" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <ProfileForm profile={profile} open={open} onOpenChange={setOpen} />
      </DialogContent>
    </Dialog>
  );
}

interface WorkExperienceEditButtonProps {
  experience: WorkExperience;
}

export function WorkExperienceEditButton({ experience }: WorkExperienceEditButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Work Experience</DialogTitle>
        </DialogHeader>
        <WorkExperienceForm experience={experience} open={open} onOpenChange={setOpen} />
      </DialogContent>
    </Dialog>
  );
}

export function WorkExperienceAddButton() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Add Experience
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Work Experience</DialogTitle>
        </DialogHeader>
        <WorkExperienceForm open={open} onOpenChange={setOpen} />
      </DialogContent>
    </Dialog>
  );
}

interface PortfolioEditButtonProps {
  project: PortfolioProject;
}

export function PortfolioEditButton({ project }: PortfolioEditButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Portfolio Project</DialogTitle>
        </DialogHeader>
        <PortfolioForm project={project} open={open} onOpenChange={setOpen} />
      </DialogContent>
    </Dialog>
  );
}

export function PortfolioAddButton() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Add Project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Portfolio Project</DialogTitle>
        </DialogHeader>
        <PortfolioForm open={open} onOpenChange={setOpen} />
      </DialogContent>
    </Dialog>
  );
}

export function SkillsManageButton() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Manage Skills
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Skills</DialogTitle>
        </DialogHeader>
        <SkillsForm open={open} onOpenChange={setOpen} />
      </DialogContent>
    </Dialog>
  );
}
