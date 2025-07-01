"use client";

import { Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Skill } from "@/types";

interface SkillsCloudProps {
  skills: Skill[];
  className?: string;
}

interface SkillWithCategory extends Skill {
  category?: {
    id: string;
    name: string;
  };
  experience_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export function SkillsCloud({ skills, className = "" }: SkillsCloudProps) {
  // Group skills by category
  const groupedSkills = skills.reduce((acc, skill) => {
    // For now, we'll create a default category since the DB doesn't have category info
    const categoryName = "Technical Skills"; // This would come from skill.category?.name
    
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  const getSkillColor = (index: number) => {
    const colors = [
      "bg-blue-100 text-blue-800 hover:bg-blue-200",
      "bg-green-100 text-green-800 hover:bg-green-200", 
      "bg-purple-100 text-purple-800 hover:bg-purple-200",
      "bg-orange-100 text-orange-800 hover:bg-orange-200",
      "bg-pink-100 text-pink-800 hover:bg-pink-200",
      "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
    ];
    return colors[index % colors.length];
  };

  if (skills.length === 0) {
    return (
      <Card className="card-surface text-center py-12">
        <CardContent>
          <p className="text-muted-foreground mb-4">No skills listed</p>
          <p className="text-sm text-muted-foreground">
            This professional hasn't added any skills yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Skills by Category */}
      {Object.entries(groupedSkills).map(([category, categorySkills]) => (
        <Card key={category} className="card-surface">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              {category}
              <Badge variant="outline" className="ml-auto">
                {categorySkills.length} skills
              </Badge>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {categorySkills.map((skill, index) => (
                <Badge
                  key={skill.id}
                  variant="secondary"
                  className={`${getSkillColor(index)} cursor-default transition-colors duration-200 px-3 py-1.5 text-sm font-medium`}
                >
                  {skill.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* No Results */}
      {Object.keys(groupedSkills).length === 0 && (
        <Card className="card-surface text-center py-8">
          <CardContent>
            <p className="text-muted-foreground mb-2">No skills found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filter criteria.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Skills Summary */}
      <Card className="card-secondary">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-foreground">{skills.length}</div>
              <div className="text-sm text-muted-foreground">Total Skills</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{Object.keys(groupedSkills).length}</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">Expert</div>
              <div className="text-sm text-muted-foreground">Level</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-500">5+</div>
              <div className="text-sm text-muted-foreground">Years Exp</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
