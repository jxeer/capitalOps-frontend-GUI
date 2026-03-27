/**
 * ImageLightbox Component
 * 
 * Purpose: Full-screen image viewer with gallery navigation.
 * Displays images in a modal overlay with prev/next navigation.
 * 
 * USAGE:
 * <ImageLightbox 
 *   images={[{url, type, name}, ...]} 
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   initialIndex={0}
 * />
 * 
 * ACCESSIBILITY:
 * - Keyboard navigation (left/right arrows) should be added
 * - Focus trapping in modal recommended
 * - Screen reader announcements for image changes
 */

import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

/**
 * Single media item in the gallery.
 * 
 * @property url - Full URL to the image/video
 * @property type - Media type (image or video)
 * @property name - Display name/alt text for the media
 */
interface MediaItem {
  url: string;
  type: "image" | "video";
  name: string;
}

/**
 * Props for ImageLightbox component.
 * 
 * @param images - Array of media items to display
 * @param initialIndex - Which image to show first (default 0)
 * @param open - Whether the lightbox is visible
 * @param onClose - Callback when user closes the lightbox
 */
interface ImageLightboxProps {
  images: MediaItem[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
}

/**
 * ImageLightbox Component
 * 
 * Renders a full-screen modal with:
 * - Large image display
 * - Previous/next navigation (when multiple images)
 * - Thumbnail strip at bottom (when multiple images)
 * - Close button
 * - Image counter (e.g., "2 / 5")
 */
export function ImageLightbox({ 
  images, 
  initialIndex = 0, 
  open, 
  onClose 
}: ImageLightboxProps) {
  // Current image index in the gallery
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Guard: Don't render if no images provided
  if (!images || images.length === 0) return null;

  // Current image object
  const current = images[currentIndex];
  
  // Whether to show navigation controls
  const hasMultiple = images.length > 1;

  /**
   * Navigate to next image with wraparound.
   * Goes from last image back to first.
   */
  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  /**
   * Navigate to previous image with wraparound.
   * Goes from first image back to last.
   * Adding images.length ensures we don't go negative.
   */
  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    // Dialog from shadcn/ui provides the modal overlay and escape-to-close
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-black/95 border-none">
        {/* Main image display area */}
        <div className="relative flex items-center justify-center min-h-[60vh]">
          {/* The image itself - sized to fit viewport */}
          <img
            src={current.url}
            alt={current.name || "Image"}
            className="max-w-full max-h-[80vh] object-contain"
          />

          {/* === PREVIOUS BUTTON === */}
          {/* Only show when multiple images exist */}
          {hasMultiple && (
            <>
              <button
                // Stop propagation prevents closing when clicking the button itself
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              
              {/* === NEXT BUTTON === */}
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* === IMAGE COUNTER === */}
              {/* Shows "2 / 5" style indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
                {currentIndex + 1} / {images.length}
              </div>
            </>
          )}

          {/* === CLOSE BUTTON === */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* === THUMBNAIL STRIP === */}
        {/* Shows when multiple images - allows direct navigation */}
        {hasMultiple && (
          <div className="flex gap-2 p-4 overflow-x-auto justify-center">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                  idx === currentIndex 
                    ? "border-white"           // Active: white border
                    : "border-transparent opacity-60 hover:opacity-100"  // Inactive: subtle
                }`}
              >
                {/* Thumbnail of the image */}
                <img 
                  src={img.url} 
                  alt={img.name} 
                  className="h-12 w-12 object-cover" 
                />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
