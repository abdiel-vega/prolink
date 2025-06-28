"use client";

import { useState, useRef, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Camera, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  fallbackText?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
  required?: boolean;
}

const sizeClasses = {
  sm: "w-16 h-16",
  md: "w-24 h-24", 
  lg: "w-32 h-32"
};

export function ImageUpload({
  value,
  onChange,
  fallbackText = "U",
  size = "md",
  className,
  label,
  required = false
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // For now, create a preview and use a smaller version
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
        
        // Create a smaller version for database storage
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions (max 200x200)
          const maxSize = 200;
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convert to smaller base64 (JPEG with 0.7 quality)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          onChange(compressedDataUrl);
        };
        img.src = result;
      };
      reader.readAsDataURL(file);

    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to process image');
    } finally {
      setIsUploading(false);
    }
  }, [onChange]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <div className={cn("flex flex-col items-center space-y-4", className)}>
      {label && (
        <Label className="text-muted-foreground font-medium">
          {label} {required && "*"}
        </Label>
      )}
      
      <div className="relative group">
        <Avatar className={cn(sizeClasses[size], "border-4 border-primary cursor-pointer")}>
          <AvatarImage src={preview || value} alt="Profile" />
          <AvatarFallback className="bg-secondary text-white text-2xl">
            {fallbackText}
          </AvatarFallback>
        </Avatar>
        
        {/* Overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer",
            isUploading && "opacity-100"
          )}
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {isUploading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
        </div>
      </div>

      {/* Upload button for non-hover devices */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClick}
          disabled={isUploading}
        >
          <Upload className="w-4 h-4 mr-2" />
          {preview ? 'Change' : 'Upload'} Photo
        </Button>
        
        {preview && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-destructive hover:bg-destructive/20"
          >
            <X className="w-4 h-4 mr-2" />
            Remove
          </Button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Help text */}
      <p className="text-xs text-muted-foreground text-center max-w-xs">
        Drag and drop an image or click to browse. Max file size: 5MB
      </p>
    </div>
  );
}
