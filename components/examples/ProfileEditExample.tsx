// Example usage in dashboard profile page
"use client";

import { useState } from "react";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface UserProfile {
  full_name: string;
  avatar_url: string;
  bio: string;
  title: string;
}

export default function ProfileEditExample() {
  const [profile, setProfile] = useState<UserProfile>({
    full_name: "John Doe",
    avatar_url: "",
    bio: "",
    title: ""
  });

  const updateProfile = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
      
      {/* Profile Picture */}
      <ImageUpload
        value={profile.avatar_url}
        onChange={(value) => updateProfile("avatar_url", value)}
        fallbackText={getInitials(profile.full_name)}
        size="lg"
        label="Profile Picture"
        className="self-center"
      />

      {/* Other form fields */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="full_name" className="text-muted-foreground font-medium">
            Full Name *
          </Label>
          <Input
            id="full_name"
            value={profile.full_name}
            onChange={(e) => updateProfile("full_name", e.target.value)}
            className="bg-secondary border-border text-white placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 hover:border-muted-foreground transition-colors duration-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="title" className="text-muted-foreground font-medium">
            Title *
          </Label>
          <Input
            id="title"
            value={profile.title}
            onChange={(e) => updateProfile("title", e.target.value)}
            className="bg-secondary border-border text-white placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 hover:border-muted-foreground transition-colors duration-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio" className="text-muted-foreground font-medium">
            Bio *
          </Label>
          <Textarea
            id="bio"
            value={profile.bio}
            onChange={(e) => updateProfile("bio", e.target.value)}
            rows={4}
            className="bg-secondary border-border text-white placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 hover:border-muted-foreground transition-colors duration-200 resize-none"
          />
        </div>
      </div>

      <Button className="btn-primary">Save Changes</Button>
    </div>
  );
}
