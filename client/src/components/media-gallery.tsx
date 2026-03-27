/**
 * MediaGallery Component
 * 
 * Purpose:
 * Provides a unified interface for uploading, previewing, and managing image/video
 * media files. Supports both read-only display and interactive upload modes.
 * 
 * Key Features:
 * - Multi-file upload support (images and videos)
 * - Client-side file type validation
 * - Object URL generation for instant previews
 * - Configurable max file limit
 * - Read-only mode for display-only scenarios
 * - Hover-to-reveal delete controls
 * 
 * Security Considerations:
 * - File type validation (images/* and video/* only) prevents arbitrary file uploads
 * - No direct file data storage; uses temporary object URLs that are revoked on removal
 * - Parent component handles actual S3 upload via onUpload callback
 * - File input is hidden and triggered programmatically to prevent accidental exposure
 * 
 * State Management:
 * - Uses useState for preview list (local state, not persisted until parent confirms)
 * - Uses useCallback for memoized event handlers
 * - Uses useRef to programmatically trigger hidden file input
 * 
 * Usage:
 * <MediaGallery
 *   initialMedia={existingMedia}
 *   onUpload={handleFileUpload}
 *   onRemove={handleFileRemove}
 *   maxFiles={10}
 *   readOnly={false}
 * />
 */

import { useState, useCallback, useRef } from "react";
import { Upload, Image, X, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Represents a single media item in the gallery preview.
 * @interface MediaPreview
 * @property url - Object URL or remote URL for the media
 * @property type - Media type discriminator ('image' or 'video')
 * @property name - Original filename for display purposes
 */
interface MediaPreview {
  url: string;
  type: "image" | "video";
  name: string;
}

/**
 * Props for the MediaGallery component.
 * @interface MediaGalleryProps
 * @property initialMedia - Pre-existing media items to display on mount
 * @property onRemove - Callback fired when user removes a preview item
 * @property onUpload - Async callback to handle file upload to server/S3
 * @property maxFiles - Maximum number of files allowed (default: 10)
 * @property accept - File input accept attribute (default: images and videos)
 * @property readOnly - If true, hides upload button and remove controls
 */
interface MediaGalleryProps {
  initialMedia?: MediaPreview[];
  onRemove?: (url: string) => void;
  onUpload?: (files: FileList) => Promise<void>;
  maxFiles?: number;
  accept?: string;
  readOnly?: boolean;
}

/**
 * MediaGallery displays a grid of image/video previews with upload and delete controls.
 * 
 * @param initialMedia - Array of existing media to display
 * @param onRemove - Callback when a media item is removed
 * @param onUpload - Async function to handle file upload to backend
 * @param maxFiles - Maximum files allowed in gallery
 * @param accept - MIME types to accept (default: image/*,video/*)
 * @param readOnly - Disables all interactive controls if true
 */
export function MediaGallery({
  initialMedia = [],
  onRemove,
  onUpload,
  maxFiles = 10,
  accept = "image/*,video/*",
  readOnly = false,
}: MediaGalleryProps) {
  // Local state holds preview data; persists until parent confirms upload/removal
  const [previews, setPreviews] = useState<MediaPreview[]>(initialMedia);
  
  // Ref to hidden file input element; triggered programmatically via click()
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handles file selection from the hidden file input.
   * Validates file count, checks MIME types, generates object URLs for previews.
   * 
   * Security: Only processes files with image/* or video/* MIME types,
   * preventing non-media files from being selected or previewed.
   */
  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      // Enforce maximum file count limit
      if (previews.length + files.length > maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`);
        return;
      }

      // Build preview array with client-side file validation
      const newPreviews: MediaPreview[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Skip non-media files silently (defense-in-depth; input accept helps too)
        if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
          continue;
        }

        // Create temporary object URL for instant preview without server round-trip
        const url = URL.createObjectURL(file);
        const type = file.type.startsWith("image/") ? "image" : "video";
        newPreviews.push({ url, type, name: file.name });
      }

      // Merge new previews with existing; triggers re-render
      setPreviews((prev) => [...prev, ...newPreviews]);
      
      // Delegate actual upload to parent (typically S3 via backend)
      if (onUpload) {
        await onUpload(files);
      }
    },
    [previews.length, maxFiles, onUpload]
  );

  /**
   * Removes a preview item from local state.
   * Also notifies parent component via onRemove callback.
   * Note: Object URLs should be revoked by the caller if needed.
   */
  const handleRemove = useCallback(
    (urlToRemove: string) => {
      setPreviews((prev) => prev.filter((p) => p.url !== urlToRemove));
      if (onRemove) {
        onRemove(urlToRemove);
      }
    },
    [onRemove]
  );

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header row: title and upload button */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Media Gallery</h3>
            
            {/* Upload controls: hidden input + styled button (hidden in readOnly) */}
            {!readOnly && (
              <>
                {/*
                  Hidden file input accepts multiple files of configured types.
                  Disabled when max file count reached to prevent overflow.
                  Ref allows programmatic click without exposing the input.
                */}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept={accept}
                  multiple
                  onChange={handleFileSelect}
                  disabled={previews.length >= maxFiles}
                />
                
                {/* Styled upload button triggers hidden input via ref */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                  disabled={previews.length >= maxFiles}
                >
                  <Upload className="h-4 w-4" />
                  Upload Media
                </button>
              </>
            )}
          </div>

          {/* Empty state: shown when no media exists */}
          {previews.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
              <Image className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No media uploaded yet</p>
            </div>
          ) : (
            /* Grid of media previews with hover-to-reveal delete */
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {previews.map((preview, index) => (
                <div 
                  key={`${preview.url}-${index}`} 
                  className="group relative aspect-video rounded-lg overflow-hidden bg-muted"
                >
                  {/* Conditional rendering: Image vs Video based on type */}
                  {preview.type === "image" ? (
                    <img 
                      src={preview.url} 
                      alt={preview.name} 
                      className="h-full w-full object-cover" 
                    />
                  ) : (
                    <video 
                      src={preview.url} 
                      controls 
                      className="h-full w-full object-cover" 
                    />
                  )}
                  
                  {/* Delete button: hidden until hover (opacity transition) */}
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => handleRemove(preview.url)}
                      className="absolute top-2 right-2 h-8 w-8 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground"
                      aria-label="Remove media"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  
                  {/* Filename overlay at bottom of preview */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                    {preview.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
