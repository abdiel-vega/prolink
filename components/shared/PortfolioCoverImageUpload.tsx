"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, X, Image as ImageIcon, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface PortfolioCoverImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  label?: string;
  required?: boolean;
}

export function PortfolioCoverImageUpload({
  value,
  onChange,
  className,
  label = "Cover Image",
  required = false
}: PortfolioCoverImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(value || "");
  const [preview, setPreview] = useState<string | null>(value || null);
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
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
        
        // Create a portfolio-appropriate sized version
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions for portfolio (max 800x600, maintaining aspect ratio)
          const maxWidth = 800;
          const maxHeight = 600;
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
          
          // Convert to high-quality JPEG (0.85 quality for portfolio)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
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

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      setPreview(urlInput.trim());
      onChange(urlInput.trim());
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setUrlInput("");
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
      
      {/* Mode Toggle */}
      <div className="flex gap-1 p-1 bg-muted rounded-md">
        <Button
          type="button"
          variant={uploadMode === "file" ? "default" : "ghost"}
          size="sm"
          onClick={() => setUploadMode("file")}
          className="flex-1 h-8"
        >
          <Upload className="w-3 h-3 mr-1" />
          Upload
        </Button>
        <Button
          type="button"
          variant={uploadMode === "url" ? "default" : "ghost"}
          size="sm"
          onClick={() => setUploadMode("url")}
          className="flex-1 h-8"
        >
          <ExternalLink className="w-3 h-3 mr-1" />
          URL
        </Button>
      </div>

      {uploadMode === "url" ? (
        /* URL Mode */
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleUrlSubmit}
              disabled={!urlInput.trim()}
            >
              Add
            </Button>
          </div>
        </div>
      ) : (
        /* File Upload Mode */
        <div className="space-y-4">
          {preview ? (
            <div className="space-y-3">
              <div className="aspect-video w-full max-w-sm mx-auto rounded-lg overflow-hidden bg-muted border-2 border-dashed border-border">
                <img 
                  src={preview} 
                  alt="Cover preview" 
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
              className="aspect-video w-full max-w-sm mx-auto border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
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
                      Upload cover image
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Drag and drop or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Recommended: 800×600px, Max: 5MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Preview for URL mode */}
      {uploadMode === "url" && preview && (
        <div className="space-y-3">
          <div className="aspect-video w-full max-w-sm mx-auto rounded-lg overflow-hidden bg-muted border">
            <img 
              src={preview} 
              alt="Cover preview" 
              className="w-full h-full object-cover"
              onError={() => {
                setPreview(null);
                alert('Failed to load image from URL');
              }}
            />
          </div>
          <div className="flex justify-center">
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
          </div>
        </div>
      )}

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
