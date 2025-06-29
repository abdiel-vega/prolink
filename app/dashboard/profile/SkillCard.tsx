"use client";

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
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
  const handleRemove = async () => {
    const formData = new FormData()
    formData.append('skillId', profileSkill.skill_id)
    await removeSkillFromProfile(formData)
    window.location.reload()
  }

  return (
    <div className="group relative">
      <Badge variant="outline" className="pr-8">
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
        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive text-destructive-foreground hover:bg-destructive/90"
        onClick={handleRemove}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  )
}
