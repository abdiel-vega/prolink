"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProfileForm, WorkExperienceForm, PortfolioForm, SkillsForm, AvatarForm, HeaderForm } from "./ProfileForms";
import { Edit, Plus, Tag, ExternalLink, Camera, Image, Trash2, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { deleteWorkExperience, deletePortfolioProject } from "./actions";
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
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const formData = new FormData();
      formData.append("experienceId", experience.id);
      await deleteWorkExperience(formData);
      window.location.reload();
    } catch (error) {
      console.error("Failed to delete work experience:", error);
    } finally {
      setIsDeleting(false);
      setDeleteOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Work Experience</DialogTitle>
          </DialogHeader>
          <WorkExperienceForm experience={experience} open={editOpen} onOpenChange={setEditOpen} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Work Experience</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{experience.job_title}" at {experience.company_name}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
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
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const formData = new FormData();
      formData.append("projectId", project.id);
      await deletePortfolioProject(formData);
      window.location.reload();
    } catch (error) {
      console.error("Failed to delete portfolio project:", error);
    } finally {
      setIsDeleting(false);
      setDeleteOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Portfolio Project</DialogTitle>
          </DialogHeader>
          <PortfolioForm project={project} open={editOpen} onOpenChange={setEditOpen} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Portfolio Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{project.project_title}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
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
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Tag className="w-4 h-4 mr-1" />
        Manage Skills
      </Button>
      <SkillsForm open={open} onOpenChange={setOpen} />
    </>
  );
}

interface ViewPublicProfileButtonProps {
  username: string;
  className?: string;
}

export function ViewPublicProfileButton({ username, className }: ViewPublicProfileButtonProps) {
  const handleViewPublicProfile = () => {
    window.open(`/professional/${username}`, '_blank');
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleViewPublicProfile}
      className={className}
    >
      <ExternalLink className="w-4 h-4 mr-1" />
      View Public Profile
    </Button>
  );
}

interface AvatarEditButtonProps {
  currentAvatar?: string | null;
}

export function AvatarEditButton({ currentAvatar }: AvatarEditButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setOpen(true)}
        className="absolute -bottom-2 -right-2 rounded-full p-2 bg-muted text-primary-foreground hover:bg-primary hover:text-foregorund shadow-lg border-2 border-background"
      >
        <Camera className="w-4 h-4" />
      </Button>
      <AvatarForm 
        currentAvatar={currentAvatar} 
        open={open} 
        onOpenChange={setOpen} 
      />
    </>
  );
}

interface HeaderEditButtonProps {
  currentHeader?: string | null;
}

export function HeaderEditButton({ currentHeader }: HeaderEditButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button 
        variant="ghost" 
        size="default" 
        onClick={() => setOpen(true)}
        className="absolute top-3 right-3 rounded-md px-4 py-2 bg-background/70 text-foreground hover:bg-primary hover:text-foreground shadow-lg backdrop-blur-sm transition-all duration-200"
      >
        <Image className="w-5 h-5 mr-2" />
        Edit Header
      </Button>
      <HeaderForm 
        currentHeader={currentHeader} 
        open={open} 
        onOpenChange={setOpen} 
      />
    </>
  );
}
