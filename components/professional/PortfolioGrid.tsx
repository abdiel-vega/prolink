"use client";

import { useState } from "react";
import { ExternalLink, Eye, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { PortfolioProject } from "@/types";

interface PortfolioGridProps {
  projects: PortfolioProject[];
  className?: string;
}

interface SelectedProject extends PortfolioProject {
  technologies?: string[];
}

export function PortfolioGrid({ projects, className = "" }: PortfolioGridProps) {
  const [selectedProject, setSelectedProject] = useState<SelectedProject | null>(null);

  if (projects.length === 0) {
    return (
      <Card className="card-surface text-center py-12">
        <CardContent>
          <p className="text-muted-foreground mb-4">No portfolio projects</p>
          <p className="text-sm text-muted-foreground">
            This professional hasn't added any portfolio projects yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {projects.map((project) => (
          <Card 
            key={project.id} 
            className="card-surface group cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden"
            onClick={() => setSelectedProject(project)}
          >
            {project.cover_image_url && (
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={project.cover_image_url}
                  alt={project.project_title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <Eye className="w-8 h-8 text-white" />
                </div>
              </div>
            )}
            
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {project.project_title}
              </h3>
              
              {project.description && (
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                  {project.description}
                </p>
              )}
              
              {project.project_url && (
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(project.project_url!, '_blank');
                    }}
                    className="p-0 h-auto text-primary hover:text-primary-foreground"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View Live
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Portfolio Modal */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold pr-8">
                {selectedProject?.project_title}
              </DialogTitle>
            </div>
          </DialogHeader>
          
          {selectedProject && (
            <div className="space-y-6">
              {selectedProject.cover_image_url && (
                <div className="aspect-video relative overflow-hidden rounded-lg">
                  <img
                    src={selectedProject.cover_image_url}
                    alt={selectedProject.project_title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              {selectedProject.description && (
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Project Description</h4>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedProject.description}
                  </p>
                </div>
              )}
              
              {selectedProject.technologies && selectedProject.technologies.length > 0 && (
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Technologies Used</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedProject.project_url && (
                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button
                    onClick={() => window.open(selectedProject.project_url!, '_blank')}
                    className="bg-white text-gray-900 hover:bg-gray-100 font-semibold"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Live Project
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
