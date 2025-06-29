import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { 
  ProfileEditButton, 
  WorkExperienceEditButton, 
  WorkExperienceAddButton, 
  PortfolioEditButton, 
  PortfolioAddButton, 
  SkillsManageButton 
} from './ProfileButtons'
import { formatDate } from '@/lib/utils/formatting'
import { Database } from '@/lib/supabase/database.types'
import { User, Briefcase, FolderOpen, Award, ExternalLink } from 'lucide-react'

type ProfileWithDetails = Database['public']['Tables']['profiles']['Row'] & {
  work_experience: Database['public']['Tables']['work_experience']['Row'][]
  portfolio_projects: Database['public']['Tables']['portfolio_projects']['Row'][]
  profile_skills: (Database['public']['Tables']['profile_skills']['Row'] & {
    skill: Database['public']['Tables']['skills']['Row']
  })[]
}

interface WorkExperienceCardProps {
  experience: Database['public']['Tables']['work_experience']['Row']
}

function WorkExperienceCard({ experience }: WorkExperienceCardProps) {
  return (
    <Card className="card-surface">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-foreground">{experience.job_title}</h4>
            <p className="text-sm text-muted-foreground">{experience.company_name}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDate(experience.start_date)} - {experience.end_date ? formatDate(experience.end_date) : 'Present'}
            </p>
            {experience.description && (
              <p className="text-sm text-muted-foreground mt-2">{experience.description}</p>
            )}
          </div>
          <WorkExperienceEditButton experience={experience} />
        </div>
      </CardContent>
    </Card>
  )
}

interface PortfolioCardProps {
  project: Database['public']['Tables']['portfolio_projects']['Row']
}

function PortfolioCard({ project }: PortfolioCardProps) {
  return (
    <Card className="card-surface">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-foreground">{project.project_title}</h4>
            {project.description && (
              <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
            )}
            {project.project_url && (
              <a 
                href={project.project_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-primary hover:underline mt-2"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                View Project
              </a>
            )}
          </div>
          <PortfolioEditButton project={project} />
        </div>
      </CardContent>
    </Card>
  )
}

export default async function ProfilePage() {
  const supabase = await createClient()
  
  // Get user session and profile
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/auth/login')
  }

  // Fetch complete profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      work_experience (*),
      portfolio_projects (*),
      profile_skills (
        *,
        skill:skills (*)
      )
    `)
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/auth/setup')
  }

  const isProfessional = profile.role === 'PROFESSIONAL'

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your profile information and showcase your experience
          </p>
        </div>
        <Badge variant={isProfessional ? 'default' : 'secondary'}>
          {profile.role}
        </Badge>
      </div>

      {/* Basic Profile Information */}
      <Card className="card-surface">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Basic Information</span>
            </CardTitle>
            <ProfileEditButton profile={profile} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <UserAvatar
              src={profile.avatar_url}
              fallback={profile.full_name || profile.username || 'User'}
              size="xl"
            />
            <div>
              <h3 className="text-xl font-semibold text-foreground">
                {profile.full_name || profile.username}
              </h3>
              {profile.title && (
                <p className="text-muted-foreground">{profile.title}</p>
              )}
              {profile.location && (
                <p className="text-sm text-muted-foreground">{profile.location}</p>
              )}
            </div>
          </div>
          
          {profile.bio && (
            <div>
              <h4 className="font-medium text-foreground mb-2">About</h4>
              <p className="text-muted-foreground">{profile.bio}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Professional Sections */}
      {isProfessional && (
        <>
          {/* Work Experience */}
          <Card className="card-surface">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5" />
                  <span>Work Experience</span>
                </CardTitle>
                <WorkExperienceAddButton />
              </div>
            </CardHeader>
            <CardContent>
              {profile.work_experience && profile.work_experience.length > 0 ? (
                <div className="space-y-4">
                  {profile.work_experience.map((experience) => (
                    <WorkExperienceCard key={experience.id} experience={experience} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No work experience added yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Portfolio */}
          <Card className="card-surface">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <FolderOpen className="w-5 h-5" />
                  <span>Portfolio</span>
                </CardTitle>
                <PortfolioAddButton />
              </div>
            </CardHeader>
            <CardContent>
              {profile.portfolio_projects && profile.portfolio_projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.portfolio_projects.map((project) => (
                    <PortfolioCard key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No portfolio projects added yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="card-surface">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5" />
                  <span>Skills</span>
                </CardTitle>
                <SkillsManageButton />
              </div>
            </CardHeader>
            <CardContent>
              {profile.profile_skills && profile.profile_skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.profile_skills.map((profileSkill) => (
                    <Badge key={profileSkill.skill_id} variant="outline">
                      {profileSkill.skill.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No skills added yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
