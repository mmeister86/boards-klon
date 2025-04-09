"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Image as LucideImage,
  Video,
  Music,
  Link2,
  FileText,
  Search,
  Loader2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// Updated MediaItem type to match our database schema
interface MediaItem {
  id: string;
  file_name: string;
  file_type: string;
  url: string;
  uploaded_at: string;
  size: number;
  width?: number;
  height?: number;
}

export default function MediathekView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Fetch media items from Supabase
  useEffect(() => {
    async function fetchMediaItems() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("media_items")
          .select("*")
          .order("uploaded_at", { ascending: false });

        if (error) throw error;
        setMediaItems(data || []);
      } catch (error) {
        console.error("Error fetching media items:", error);
        toast.error("Fehler beim Laden der Medien");
      } finally {
        setIsLoading(false);
      }
    }

    fetchMediaItems();
  }, []);

  // Filter media based on search query
  const filteredMedia = mediaItems.filter((item) =>
    item.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group media by type
  const groupedMedia = filteredMedia.reduce((acc, item) => {
    const type = item.file_type.startsWith("image/")
      ? "image"
      : item.file_type.startsWith("video/")
      ? "video"
      : item.file_type.startsWith("audio/")
      ? "audio"
      : "document";

    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(item);
    return acc;
  }, {} as Record<string, MediaItem[]>);

  // Render media preview with actual image URLs
  const renderMediaPreview = (item: MediaItem) => {
    const type = item.file_type.startsWith("image/")
      ? "image"
      : item.file_type.startsWith("video/")
      ? "video"
      : item.file_type.startsWith("audio/")
      ? "audio"
      : "document";

    switch (type) {
      case "image":
        return (
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
            <Image
              src={item.url}
              alt={item.file_name}
              className="object-cover"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        );
      case "video":
        return (
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <Video className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        );
      case "audio":
        return (
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <Music className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        );
      case "document":
        return (
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Render-Funktion für eine Medienkategorie
  const renderMediaCategory = (
    type: string,
    title: string,
    icon: React.ReactNode
  ) => {
    const items = groupedMedia[type] || [];
    if (items.length === 0) return null;

    const displayItems = items.slice(0, 4);
    const hasMore = items.length > 4;

    return (
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          {icon}
          <h2 className="text-xl font-semibold">{title}</h2>
          <span className="text-sm text-muted-foreground">
            ({items.length})
          </span>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {displayItems.map((item) => (
            <div key={item.id} className="relative group">
              {renderMediaPreview(item)}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-b-lg">
                <p className="text-sm truncate">{item.file_name}</p>
                <p className="text-xs opacity-75">
                  {(item.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
            </div>
          ))}
          {hasMore && (
            <Button
              variant="outline"
              className="aspect-square flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
            >
              mehr
            </Button>
          )}
        </div>
      </section>
    );
  };

  // Helper function to determine the appropriate bucket based on file type
  const getBucketForFile = (file: File): string => {
    if (file.type.startsWith("image/")) return "images";
    if (file.type.startsWith("video/")) return "videos";
    if (file.type.startsWith("audio/")) return "audio";
    return "documents";
  };

  // Helper function to get file dimensions (for images)
  const getImageDimensions = async (
    file: File
  ): Promise<{ width: number; height: number }> => {
    if (!file.type.startsWith("image/")) {
      return { width: 0, height: 0 };
    }

    return new Promise((resolve) => {
      const img = new (window.Image as { new (): HTMLImageElement })();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
        });
      };
      img.onerror = () => {
        resolve({ width: 0, height: 0 });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  // Handle file upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    for (const file of Array.from(files)) {
      try {
        // Check file size (50MB limit)
        if (file.size > 50 * 1024 * 1024) {
          toast.error(`${file.name} ist zu groß (Max: 50MB)`);
          continue;
        }

        const bucket = getBucketForFile(file);
        const filePath = `${Date.now()}-${file.name}`;

        // Upload file to storage
        const { error: uploadError, data } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) throw uploadError;

        // Get the public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from(bucket).getPublicUrl(filePath);

        // Get dimensions if it's an image
        const dimensions = await getImageDimensions(file);

        // Add to media_items table
        const { error: dbError } = await supabase.from("media_items").insert({
          file_name: file.name,
          file_type: file.type,
          url: publicUrl,
          size: file.size,
          width: dimensions.width,
          height: dimensions.height,
        });

        if (dbError) throw dbError;

        // Add the new item to the state
        setMediaItems((prev) => [
          {
            id: Date.now().toString(), // Temporary ID until we refresh
            file_name: file.name,
            file_type: file.type,
            url: publicUrl,
            uploaded_at: new Date().toISOString(),
            size: file.size,
            width: dimensions.width,
            height: dimensions.height,
          },
          ...prev,
        ]);

        toast.success(`${file.name} erfolgreich hochgeladen`);
        setUploadProgress((prev) => prev + 100 / files.length);
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(`Fehler beim Hochladen von ${file.name}`);
      }
    }

    setIsUploading(false);
    setUploadProgress(0);
  };

  // Handle drag and drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files);
  };

  return (
    // Removed the outer div and Navbar from the original page structure
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mediathek</h1>
        <div className="relative w-full max-w-md ml-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Medien durchsuchen..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-8">
        {/* Linke Spalte: Medienkategorien */}
        <div className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-8">
              {renderMediaCategory(
                "image",
                "Bilder",
                <LucideImage className="h-5 w-5" />
              )}
              {renderMediaCategory(
                "video",
                "Videos",
                <Video className="h-5 w-5" />
              )}
              {renderMediaCategory(
                "audio",
                "Audio",
                <Music className="h-5 w-5" />
              )}
              {renderMediaCategory(
                "document",
                "Dokumente",
                <FileText className="h-5 w-5" />
              )}
              {/* Display message if no media matches search */}
              {filteredMedia.length === 0 && !isLoading && (
                <p className="text-muted-foreground text-center py-4">
                  Keine Medien gefunden.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Rechte Spalte: Upload-Bereich */}
        <div className="w-80">
          <div className="sticky top-8">
            {" "}
            {/* Adjust top value if needed based on final layout */}
            <h2 className="text-xl font-semibold mb-4">Medien hochladen</h2>
            <div
              className={`
                relative border-2 border-dashed rounded-lg p-8
                flex flex-col items-center justify-center gap-4
                transition-colors duration-200
                ${isDragging ? "border-primary bg-primary/5" : "border-border"}
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Dateien hierher ziehen oder
                </p>
                <label htmlFor="file-upload">
                  <Button variant="link" className="mt-1" asChild>
                    <span>Dateien auswählen</span>
                  </Button>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileInputChange}
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Maximale Dateigröße: 50MB
              </p>
              {isUploading && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Upload: {Math.round(uploadProgress)}%
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
