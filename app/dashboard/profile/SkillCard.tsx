"use client";

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X, Trash2 } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { removeSkillFromProfile } from './actions'
import { Database } from '@/lib/supabase/database.types'

type ProfileSkill = {
  profile_id: string
  skill_id: string
  skill: Database['public']['Tables']['skills']['Row'] & {
    category?: {
      id: string
      name: string
    }
  }
}

interface SkillCardProps {
  profileSkill: ProfileSkill
}

export function SkillCard({ profileSkill }: SkillCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRemove = async () => {
    setIsDeleting(true);
    try {
      const formData = new FormData()
      formData.append('skillId', profileSkill.skill_id)
      await removeSkillFromProfile(formData)
      window.location.reload()
    } catch (error) {
      console.error("Failed to remove skill:", error);
    } finally {
      setIsDeleting(false);
      setDeleteOpen(false);
    }
  }

  return (
    <>
      <div className="group relative">
        <Badge variant="outline" className="pr-8 hover:bg-muted/50 transition-colors">
          {profileSkill.skill.name}
          {profileSkill.skill.category && (
            <span className="ml-1 text-xs text-muted-foreground">
              ({profileSkill.skill.category.name})
            </span>
          )}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-transparent text-destructive hover:bg-destructive hover:text-destructive-foreground"
          onClick={() => setDeleteOpen(true)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Skill</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{profileSkill.skill.name}" from your profile? 
              You can always add it back later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={isDeleting}
              className="bg-transparent border text-foreground hover:bg-destructive"
            >
              {isDeleting ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
