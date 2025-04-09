"use client";

import { useState, useEffect } from "react";
import {
  Image as LucideImage,
  Video,
  Music,
  FileText,
  Search,
  Loader2,
  Upload,
  Trash2,
  Film,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useRouter } from "next/navigation";

// Updated MediaItem type to match our database schema exactly
interface MediaItem {
  id: string; // UUID stored as string in TypeScript
  file_name: string;
  file_type: string;
  url: string;
  uploaded_at: string | null; // timestamp with time zone can be null
  size: number;
  width: number | null;
  height: number | null;
  user_id: string | null; // UUID stored as string in TypeScript
}

export default function MediathekView() {
  const { user, supabase, session } = useSupabase();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const router = useRouter();

  console.log("MediathekView rendered:", {
    hasUser: !!user,
    userId: user?.id,
    hasSession: !!session,
    hasSupabase: !!supabase,
    timestamp: new Date().toISOString(),
  });

  // Fetch media items from Supabase
  useEffect(() => {
    async function fetchMediaItems() {
      if (!supabase || !user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("media_items")
          .select("*")
          .eq("user_id", user.id)
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
  }, [user, supabase]);

  // Redirect if no session
  useEffect(() => {
    if (!session && !isLoading) {
      router.push("/auth/login");
    }
  }, [session, isLoading, router]);

  // Filter media based on search query
  const filteredMedia = mediaItems.filter((item) =>
    item.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group media items by type
  const groupedMedia = mediaItems.reduce((acc, item) => {
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

  const categories = [
    {
      title: "Fotos",
      icon: <LucideImage size={18} />,
      iconColor: "text-blue-500",
      type: "image",
      items: groupedMedia["image"] || [],
    },
    {
      title: "Videos",
      icon: <Film size={18} />,
      iconColor: "text-red-500",
      type: "video",
      items: groupedMedia["video"] || [],
    },
    {
      title: "Audio",
      icon: <Music size={18} />,
      iconColor: "text-green-500",
      type: "audio",
      items: groupedMedia["audio"] || [],
    },
    {
      title: "Dokumente",
      icon: <FileText size={18} />,
      iconColor: "text-purple-500",
      type: "document",
      items: groupedMedia["document"] || [],
    },
  ];

  // Render media preview with actual image URLs
  const renderMediaPreview = (item: MediaItem) => {
    const type = item.file_type.startsWith("image/")
      ? "image"
      : item.file_type.startsWith("video/")
      ? "video"
      : item.file_type.startsWith("audio/")
      ? "audio"
      : "document";

    const isDeleting = deletingItemId === item.id;

    const DeleteButton = () => (
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-2 right-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => handleDelete(item)}
        disabled={isDeleting}
      >
        {isDeleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </Button>
    );

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
            <DeleteButton />
          </div>
        );
      case "video":
        return (
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <Video className="h-8 w-8 text-muted-foreground" />
            </div>
            <DeleteButton />
          </div>
        );
      case "audio":
        return (
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <Music className="h-8 w-8 text-muted-foreground" />
            </div>
            <DeleteButton />
          </div>
        );
      case "document":
        return (
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <DeleteButton />
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
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
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

    try {
      if (!user || !session || !supabase) {
        toast.error("Sie müssen angemeldet sein, um Dateien hochzuladen");
        router.push("/auth/login");
        return;
      }

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
          const filePath = `${user.id}/${Date.now()}-${file.name}`;

          // Upload file to storage with proper caching and content type
          const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
              cacheControl: "3600",
              contentType: file.type,
              upsert: true,
            });

          if (uploadError) {
            console.error("Upload error:", uploadError);
            throw uploadError;
          }

          // Get the public URL
          const {
            data: { publicUrl },
          } = supabase.storage.from(bucket).getPublicUrl(filePath);

          // Get dimensions if it's an image
          const dimensions = await getImageDimensions(file);

          // Prepare the media item data
          const mediaItem: MediaItem = {
            id: uuidv4(),
            file_name: file.name,
            file_type: file.type,
            url: publicUrl,
            size: file.size,
            width: dimensions.width || null,
            height: dimensions.height || null,
            user_id: user.id,
            uploaded_at: new Date().toISOString(),
          };

          // Insert into media_items table
          const { error: dbError } = await supabase
            .from("media_items")
            .insert(mediaItem)
            .select()
            .single();

          if (dbError) {
            console.error("Database error:", dbError);
            // Clean up the uploaded file if database insert fails
            await supabase.storage.from(bucket).remove([filePath]);
            throw dbError;
          }

          // Update local state
          setMediaItems((prev) => [mediaItem, ...prev]);
          toast.success(`${file.name} erfolgreich hochgeladen`);
          setUploadProgress((prev) => prev + 100 / files.length);
        } catch (error) {
          console.error("File processing error:", error);
          toast.error(`Fehler beim Hochladen von ${file.name}`);
        }
      }
    } catch (error) {
      console.error("Upload process error:", error);
      toast.error("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
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

  // Hilfsfunktion zum Formatieren der Dateigröße
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  // Helper function to get file path from URL
  const getFilePathFromUrl = (url: string): string => {
    try {
      // Extract everything after /public/[bucket]/
      const matches = url.match(/\/public\/[^/]+\/(.+)$/);
      if (!matches || !matches[1]) {
        throw new Error("Invalid URL format");
      }
      return decodeURIComponent(matches[1]);
    } catch (error) {
      console.error("Error parsing URL:", error);
      throw new Error("Could not extract file path from URL");
    }
  };

  // Update the handleDelete function
  const handleDelete = async (item: MediaItem) => {
    try {
      if (!user || !supabase) {
        toast.error("Sie müssen angemeldet sein, um Medien zu löschen");
        return;
      }

      setDeletingItemId(item.id);

      // Determine bucket based on file type
      const bucket = getBucketForFile({ type: item.file_type } as File);
      const filePath = getFilePathFromUrl(item.url);

      console.log("Starting deletion process for:", {
        id: item.id,
        bucket,
        filePath,
        url: item.url,
        userId: user.id,
      });

      // Delete from storage first
      const { error: storageError } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (storageError) {
        console.error("Storage delete error:", storageError);
        throw storageError;
      }

      console.log(
        "Successfully deleted from storage, now deleting from database..."
      );

      // Delete from database with user_id check for security
      const { error: dbError } = await supabase
        .from("media_items")
        .delete()
        .match({
          id: item.id,
          user_id: user.id,
        });

      if (dbError) {
        console.error("Database delete error:", dbError);
        throw dbError;
      }

      // Update local state
      setMediaItems((prev) => prev.filter((i) => i.id !== item.id));
      toast.error(`${item.file_name} wurde gelöscht`, {
        description: "Die Datei wurde erfolgreich gelöscht.",
        style: {
          backgroundColor: "hsl(var(--destructive))",
          color: "white",
        },
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(`Fehler beim Löschen von ${item.file_name}`);
    } finally {
      setDeletingItemId(null);
    }
  };

  return (
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
