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
  SkillsManageButton,
  ViewPublicProfileButton,
  AvatarEditButton,
  HeaderEditButton
} from './ProfileButtons'
import { SkillCard } from './SkillCard'
import { formatDate } from '@/lib/utils/formatting'
import { Database } from '@/lib/supabase/database.types'
import { User, Briefcase, FolderOpen, Award, ExternalLink } from 'lucide-react'

type ProfileWithDetails = Database['public']['Tables']['profiles']['Row'] & {
  work_experience: Database['public']['Tables']['work_experience']['Row'][]
  portfolio_projects: Database['public']['Tables']['portfolio_projects']['Row'][]
  profile_skills: {
    profile_id: string
    skill_id: string
    skill: Database['public']['Tables']['skills']['Row'] & {
      category?: {
        id: string
        name: string
      }
    }
  }[]
}

interface WorkExperienceCardProps {
  experience: Database['public']['Tables']['work_experience']['Row']
}

function WorkExperienceCard({ experience }: WorkExperienceCardProps) {
  return (
    <Card className="card-surface hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground truncate">{experience.job_title}</h4>
            <p className="text-sm text-muted-foreground truncate">{experience.company_name}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDate(experience.start_date)} - {experience.end_date ? formatDate(experience.end_date) : 'Present'}
            </p>
            {experience.description && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{experience.description}</p>
            )}
          </div>
          <div className="flex-shrink-0 ml-3">
            <WorkExperienceEditButton experience={experience} />
          </div>
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
    <Card className="card-surface hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground truncate">{project.project_title}</h4>
            {project.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
            )}
            {project.project_url && (
              <a 
                href={project.project_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-primary hover:underline mt-2 transition-colors"
              >
                <ExternalLink className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">View Project</span>
              </a>
            )}
          </div>
          <div className="flex-shrink-0 ml-3">
            <PortfolioEditButton project={project} />
          </div>
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
        skill:skills (
          *,
          category:categories (
            id,
            name
          )
        )
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
        <div className="flex items-center space-x-3">
          {isProfessional && (
            <ViewPublicProfileButton username={profile.username || profile.id} />
          )}
          <Badge variant={isProfessional ? 'default' : 'secondary'}>
            {profile.role}
          </Badge>
        </div>
      </div>

      {/* Header Image Section */}
      {isProfessional && (
        <Card className="card-surface overflow-hidden">
          <div className="relative">
            {profile.header_image_url ? (
              <div className="aspect-[3/1] w-full bg-gradient-to-r from-primary to-primary-green-light relative">
                <img 
                  src={profile.header_image_url} 
                  alt="Header" 
                  className="w-full h-full object-cover"
                />
                <HeaderEditButton currentHeader={profile.header_image_url} />
              </div>
            ) : (
              <div className="aspect-[3/1] w-full bg-gradient-to-r from-primary to-primary-green-light relative flex items-center justify-center">
                <p className="text-primary-foreground/80 text-lg">Add a header image to showcase your brand</p>
                <HeaderEditButton currentHeader={profile.header_image_url} />
              </div>
            )}
          </div>
        </Card>
      )}

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
            <div className="relative">
              <UserAvatar
                src={profile.avatar_url}
                fallback={profile.full_name || profile.username || 'User'}
                size="xl"
              />
              <AvatarEditButton currentAvatar={profile.avatar_url} />
            </div>
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
                <div className="text-center py-12 px-4">
                  <div className="glass-effect rounded-lg p-6 max-w-sm mx-auto">
                    <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-foreground mb-2">Add Your Experience</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Showcase your professional journey and highlight your achievements
                    </p>
                    <WorkExperienceAddButton />
                  </div>
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
                <div className="text-center py-12 px-4">
                  <div className="glass-effect rounded-lg p-6 max-w-sm mx-auto">
                    <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-foreground mb-2">Build Your Portfolio</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Showcase your best work and demonstrate your skills to potential clients
                    </p>
                    <PortfolioAddButton />
                  </div>
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
                    <SkillCard key={profileSkill.skill_id} profileSkill={profileSkill} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 px-4">
                  <div className="glass-effect rounded-lg p-6 max-w-sm mx-auto">
                    <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-foreground mb-2">Add Your Skills</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      List your technical skills and expertise to help clients find you
                    </p>
                    <SkillsManageButton />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
