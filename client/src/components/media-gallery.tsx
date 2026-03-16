import { useState, useCallback } from "react";
import { Upload, Image, X, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface MediaPreview {
  url: string;
  type: "image" | "video";
  name: string;
}

interface MediaGalleryProps {
  initialMedia?: MediaPreview[];
  onRemove?: (url: string) => void;
  onUpload?: (files: FileList) => Promise<void>;
  maxFiles?: number;
  accept?: string;
  readOnly?: boolean;
}

export function MediaGallery({
  initialMedia = [],
  onRemove,
  onUpload,
  maxFiles = 10,
  accept = "image/*,video/*",
  readOnly = false,
}: MediaGalleryProps) {
  const [previews, setPreviews] = useState<MediaPreview[]>(initialMedia);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      if (previews.length + files.length > maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`);
        return;
      }

      const newPreviews: MediaPreview[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
          continue;
        }

        const url = URL.createObjectURL(file);
        const type = file.type.startsWith("image/") ? "image" : "video";
        newPreviews.push({ url, type, name: file.name });
      }

      setPreviews((prev) => [...prev, ...newPreviews]);
      if (onUpload) {
        await onUpload(files);
      }
    },
    [previews.length, maxFiles, onUpload]
  );

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
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Media Gallery</h3>
            {!readOnly && (
              <label className="cursor-pointer">
                <Button size="sm" variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Media
                </Button>
                <input
                  type="file"
                  className="hidden"
                  accept={accept}
                  multiple
                  onChange={handleFileSelect}
                  disabled={previews.length >= maxFiles}
                />
              </label>
            )}
          </div>

          {previews.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
              <Image className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No media uploaded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {previews.map((preview, index) => (
                <div key={`${preview.url}-${index}`} className="group relative aspect-video rounded-lg overflow-hidden bg-muted">
                  {preview.type === "image" ? (
                    <img src={preview.url} alt={preview.name} className="h-full w-full object-cover" />
                  ) : (
                    <video src={preview.url} controls className="h-full w-full object-cover" />
                  )}
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
