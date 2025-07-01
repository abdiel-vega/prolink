"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  label?: string;
  required?: boolean;
}

export function HeaderImageUpload({
  value,
  onChange,
  className,
  label,
  required = false
}: HeaderImageUploadProps) {
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
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
        
        // Create a header-appropriate sized version
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions for header (max 1200x400, maintaining aspect ratio)
          const maxWidth = 1200;
          const maxHeight = 400;
          let { width, height } = img;
          
          // Calculate scaling to fit within bounds while maintaining aspect ratio
          const scaleX = maxWidth / width;
          const scaleY = maxHeight / height;
          const scale = Math.min(scaleX, scaleY, 1); // Don't upscale
          
          const newWidth = Math.round(width * scale);
          const newHeight = Math.round(height * scale);
          
          canvas.width = newWidth;
          canvas.height = newHeight;
          
          ctx?.drawImage(img, 0, 0, newWidth, newHeight);
          
          // Convert to high-quality JPEG (0.9 quality for headers)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
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
    <div className={cn("space-y-4", className)}>
      {label && (
        <Label className="text-muted-foreground font-medium">
          {label} {required && "*"}
        </Label>
      )}
      
      <div className="space-y-4">
        {preview ? (
          <div className="space-y-3">
            <div className="aspect-[3/1] w-full max-w-md mx-auto rounded-lg overflow-hidden bg-muted border-2 border-dashed border-border">
              <img 
                src={preview} 
                alt="Header preview" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClick}
                disabled={isUploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                Change Image
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
              >
                <X className="w-4 h-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div 
            className="aspect-[3/1] w-full max-w-md mx-auto border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
            onClick={handleClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {isUploading ? (
              <div className="flex flex-col items-center space-y-2">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">Processing image...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <ImageIcon className="w-12 h-12 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    Upload header image
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Drag and drop or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Recommended: 1200×400px, Max: 5MB
                  </p>
                </div>
              </div>
            )}
          </div>
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
    </div>
  );
}
