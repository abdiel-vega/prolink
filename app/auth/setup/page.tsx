"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { cn } from "@/lib/utils";
import {
  User,
  Briefcase,
  MapPin,
  FileText,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Users,
  Building,
  Wifi
} from "lucide-react";

type UserRole = "CLIENT" | "PROFESSIONAL";

interface SetupData {
  full_name: string;
  username: string;
  title: string;
  bio: string;
  role: UserRole;
  location: string;
  avatar_url?: string;
}

const steps = [
  {
    id: 1,
    title: "Welcome to ProLink!",
    subtitle: "Let's get you set up",
    icon: Sparkles,
  },
  {
    id: 2,
    title: "Tell us about yourself",
    subtitle: "Basic information",
    icon: User,
  },
  {
    id: 3,
    title: "Choose your role",
    subtitle: "How will you use ProLink?",
    icon: Users,
  },
  {
    id: 4,
    title: "Professional details",
    subtitle: "What do you do?",
    icon: Briefcase,
  },
  {
    id: 5,
    title: "Complete your profile",
    subtitle: "Almost done!",
    icon: CheckCircle,
  },
];

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user, updateProfile, loading, initialize } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [setupData, setSetupData] = useState<SetupData>({
    full_name: "",
    username: "",
    title: "",
    bio: "",
    role: "CLIENT",
    location: "",
    avatar_url: "",
  });

  useEffect(() => {
    // Initialize auth store if not already done
    if (loading) {
      initialize();
    }
  }, [loading, initialize]);

  useEffect(() => {
    // Only redirect if auth is not loading and user is definitely not authenticated
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  const updateSetupData = (field: keyof SetupData, value: string) => {
    setSetupData(prev => ({ ...prev, [field]: value }));
    
    // Clear username error when user types
    if (field === "username") {
      setUsernameError("");
    }
  };

  const validateUsername = (username: string) => {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return "Username must be 3-20 characters, alphanumeric, dash, or underscore only";
    }
    return "";
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return true;
      case 2:
        return setupData.full_name.trim().length > 0 && 
               setupData.username.trim().length > 0 && 
               !validateUsername(setupData.username);
      case 3:
        return setupData.role === "CLIENT" || setupData.role === "PROFESSIONAL";
      case 4:
        return setupData.title.trim().length > 0 && setupData.location.trim().length > 0;
      case 5:
        return setupData.bio.trim().length > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep === 2) {
      const error = validateUsername(setupData.username);
      if (error) {
        setUsernameError(error);
        return;
      }
    }

    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinish = async () => {
    setIsLoading(true);
    try {
      // Verify user is authenticated
      if (!user) {
        throw new Error("User not authenticated");
      }

      console.log('Current user:', user);
      console.log('Setup data before update:', setupData);
      
      // Log the size of avatar data if present
      if (setupData.avatar_url) {
        console.log('Avatar data size:', setupData.avatar_url.length, 'characters');
      }
      
      await updateProfile(setupData);
      
      // Add a small delay to show the completion state
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Error updating profile:", error);
      
      // More specific error handling
      if (error instanceof Error) {
        if (error.message.includes('not authenticated') || error.message.includes('session')) {
          alert('Authentication error. Please sign in again.');
          router.push('/auth/login');
        } else if (error.message.includes('cookie') || error.message.includes('token')) {
          alert('Authentication error. Please try signing in again.');
          router.push('/auth/login');
        } else if (error.message.includes('size') || error.message.includes('large')) {
          alert('Profile data is too large. Please try a smaller image.');
        } else {
          alert(`Failed to update profile: ${error.message}`);
        }
      } else {
        alert('Failed to update profile. Please try again.');
      }
      
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            <div className="relative">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-primary to-primary-green-light rounded-full flex items-center justify-center mb-6 animate-float">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <div className="absolute inset-0 w-24 h-24 mx-auto bg-gradient-to-br from-primary to-primary-green-light rounded-full animate-ping opacity-20"></div>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white">Welcome to ProLink!</h2>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto">
                Let's set up your profile to connect you with the right opportunities and professionals.
              </p>
              <div className="flex items-center justify-center gap-2 text-primary">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Tell us about yourself</h2>
              <p className="text-muted-foreground">Let's start with the basics</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-muted-foreground font-medium">
                  Full Name *
                </Label>
                <Input
                  id="full_name"
                  value={setupData.full_name}
                  onChange={(e) => updateSetupData("full_name", e.target.value)}
                  placeholder="Enter your full name"
                  className="bg-secondary border-border text-white placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 hover:border-muted-foreground transition-colors duration-200"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username" className="text-muted-foreground font-medium">
                  Username *
                </Label>
                <div className="relative">
                  <Input
                    id="username"
                    value={setupData.username}
                    onChange={(e) => updateSetupData("username", e.target.value.toLowerCase())}
                    placeholder="your-username"
                    className={cn(
                      "bg-secondary border-border text-white placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 hover:border-muted-foreground transition-colors duration-200 pr-10",
                      usernameError && "border-error focus:border-error focus:ring-error/20",
                      setupData.username.length > 0 && !usernameError && !validateUsername(setupData.username) && "border-primary"
                    )}
                  />
                  {setupData.username.length > 0 && !validateUsername(setupData.username) && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary animate-in zoom-in-0 duration-200" />
                  )}
                </div>
                {setupData.username.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          setupData.username.length >= 3 ? "bg-primary" : "bg-border"
                        )} />
                        <span className={cn(
                          setupData.username.length >= 3 ? "text-primary" : "text-muted-foreground"
                        )}>
                          At least 3 characters
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          /^[a-zA-Z0-9_-]+$/.test(setupData.username) ? "bg-primary" : "bg-border"
                        )} />
                        <span className={cn(
                          /^[a-zA-Z0-9_-]+$/.test(setupData.username) ? "text-primary" : "text-muted-foreground"
                        )}>
                          Only letters, numbers, dash, and underscore
                        </span>
                      </div>
                    </div>
                  )}
                <div className="space-y-4">
                  <div className="flex flex-col items-center text-center gap-3 p-4 bg-secondary/50 rounded-lg border border-border">
                    <AlertCircle className="w-6 h-6 text-foreground flex-shrink-0" />
                    <div className="space-y-2">
                      <p className="text-sm text-foreground">
                        Choose carefully! Your username will be your unique ProLink URL: 
                        <span className="text-primary font-medium font-mono block mt-2 text-base">
                          prolink.com/{setupData.username || "your-username"}
                        </span>
                      </p>
                      <p className="text-sm text-muted-foreground font-medium">
                        This cannot be changed later.
                      </p>
                    </div>
                  </div>
                </div>
                {usernameError && (
                  <p className="text-error text-sm flex items-center gap-1 animate-in slide-in-from-left-2 duration-200">
                    <AlertCircle className="w-4 h-4" />
                    {usernameError}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Choose your role</h2>
              <p className="text-muted-foreground">How will you use ProLink?</p>
            </div>
            
            <div className="grid gap-4">
              <button
                onClick={() => updateSetupData("role", "CLIENT")}
                className={cn(
                  "p-6 rounded-xl border-2 transition-all duration-200 text-left group hover:scale-[1.02] active:scale-[0.98]",
                  setupData.role === "CLIENT"
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/20 animate-glow"
                    : "border-border bg-secondary hover:border-muted hover:shadow-md"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200",
                    setupData.role === "CLIENT" 
                      ? "bg-primary shadow-lg shadow-primary/30" 
                      : "bg-muted group-hover:bg-border"
                  )}>
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">I'm looking to hire</h3>
                    <p className="text-muted-foreground text-sm">Find and connect with professionals for your projects</p>
                  </div>
                  {setupData.role === "CLIENT" && (
                    <CheckCircle className="w-6 h-6 text-primary animate-in zoom-in-0 duration-200" />
                  )}
                </div>
              </button>
              
              <button
                onClick={() => updateSetupData("role", "PROFESSIONAL")}
                className={cn(
                  "p-6 rounded-xl border-2 transition-all duration-200 text-left group hover:scale-[1.02] active:scale-[0.98]",
                  setupData.role === "PROFESSIONAL"
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/20 animate-glow"
                    : "border-border bg-secondary hover:border-muted hover:shadow-md"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200",
                    setupData.role === "PROFESSIONAL" 
                      ? "bg-primary shadow-lg shadow-primary/30" 
                      : "bg-muted group-hover:bg-border"
                  )}>
                    <Building className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">I'm a professional</h3>
                    <p className="text-muted-foreground text-sm">Offer your services and grow your business</p>
                  </div>
                  {setupData.role === "PROFESSIONAL" && (
                    <CheckCircle className="w-6 h-6 text-primary animate-in zoom-in-0 duration-200" />
                  )}
                </div>
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Professional details</h2>
              <p className="text-muted-foreground">Tell us about your work</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-muted-foreground font-medium">
                  {setupData.role === "PROFESSIONAL" ? "Professional Title" : "What do you do?"} *
                </Label>
                <Input
                  id="title"
                  value={setupData.title}
                  onChange={(e) => updateSetupData("title", e.target.value)}
                  placeholder={setupData.role === "PROFESSIONAL" ? "e.g., Senior Frontend Developer" : "e.g., Startup Founder"}
                  className="bg-secondary border-border text-white placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 hover:border-muted-foreground transition-colors duration-200"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location" className="text-muted-foreground font-medium">
                  Location *
                </Label>
                <div className="relative">
                  <Input
                    id="location"
                    value={setupData.location}
                    onChange={(e) => updateSetupData("location", e.target.value)}
                    placeholder="e.g., San Francisco, CA"
                    className="bg-secondary border-border text-white placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 hover:border-muted-foreground transition-colors duration-200 pr-20"
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => updateSetupData("location", "Remote")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-2 text-xs text-primary hover:bg-primary/10 hover:text-primary transition-all duration-200"
                        >
                          <Wifi className="w-3 h-3 mr-1" />
                          Remote
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Set location to Remote</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Complete your profile</h2>
              <p className="text-muted-foreground">Almost there! Add some final touches</p>
            </div>
            
            <div className="space-y-6">
              {/* Avatar Upload */}
              <ImageUpload
                value={setupData.avatar_url}
                onChange={(value) => updateSetupData("avatar_url", value)}
                fallbackText={getInitials(setupData.full_name)}
                size="lg"
                label="Profile Picture (Optional)"
              />
              
              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-muted-foreground font-medium">
                  Bio *
                </Label>
                <Textarea
                  id="bio"
                  value={setupData.bio}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      updateSetupData("bio", e.target.value);
                    }
                  }}
                  placeholder={setupData.role === "PROFESSIONAL" 
                    ? "Tell clients about your experience, skills, and what makes you unique..."
                    : "Tell professionals what kind of projects you work on and what you're looking for..."
                  }
                  rows={4}
                  className="bg-secondary border-border text-white placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 hover:border-muted-foreground transition-colors duration-200 resize-none"
                />
                <div className="flex justify-between items-center">
                  <p className={cn(
                    "text-xs transition-colors",
                    setupData.bio.length > 450 ? "text-yellow-500" : "text-muted-foreground"
                  )}>
                    {setupData.bio.length}/500 characters
                  </p>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-2 h-2 rounded-full transition-colors",
                          setupData.bio.length > i * 100 ? "bg-primary" : "bg-border"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Show loading state while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary-green-light rounded-full flex items-center justify-center animate-spin">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated (redirect will happen)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                  currentStep > step.id 
                    ? "bg-primary text-white shadow-lg shadow-primary/30 scale-110" 
                    : currentStep === step.id
                    ? "bg-primary text-white shadow-lg shadow-primary/30 animate-bounce-gentle"
                    : "bg-secondary text-muted-foreground border border-border"
                )}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5 animate-in zoom-in-0 duration-300" />
                  ) : (
                    step.id
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "w-full h-1 mx-2 transition-all duration-500 rounded-full",
                    currentStep > step.id ? "bg-primary shadow-sm shadow-primary/20" : "bg-border"
                  )} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center animate-in fade-in-0 duration-300">
            <h1 className="text-lg font-semibold text-white mb-1">
              {steps[currentStep - 1]?.title}
            </h1>
            <p className="text-muted-foreground text-sm">
              Step {currentStep} of {steps.length} • {steps[currentStep - 1]?.subtitle}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <Card className="card-secondary">
          <CardContent className="p-8">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            variant="outline"
            className="btn-secondary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex gap-2">
            {currentStep < steps.length ? (
              <Button
                onClick={handleNext}
                disabled={!canProceedToNextStep()}
                className="btn-primary"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                disabled={!canProceedToNextStep() || isLoading}
                className="btn-primary"
              >
                {isLoading ? "Setting up..." : "Complete Setup"}
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
