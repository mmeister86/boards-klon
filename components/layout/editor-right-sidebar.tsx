/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable jsx-a11y/alt-text */
"use client";

import React, { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  Film,
  Music,
  FileText,
  Upload,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import { useSupabase } from "@/components/providers/supabase-provider";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Updated MediaItem interface to match our database schema
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

interface MediaCategoryProps {
  title: string;
  icon: React.ReactNode;
  iconColor: string;
  items: MediaItem[];
  type: string;
  isActive: boolean;
  onSelect: () => void;
}

function MediaCategory({
  title,
  icon,
  iconColor,
  items,
  type,
  isActive,
  onSelect,
}: MediaCategoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayItems = isExpanded ? items : items.slice(0, 4);

  const renderItem = (item: MediaItem) => {
    // Check if the file type starts with image/
    if (item.file_type.startsWith("image/")) {
      return (
        <div
          key={item.id}
          className="aspect-square bg-muted rounded-lg p-2 hover:bg-muted/80 cursor-pointer group relative"
        >
          <div className="w-full h-full bg-background rounded overflow-hidden">
            <Image
              src={item.url}
              alt={item.file_name}
              width={item.width || 100}
              height={item.height || 100}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/50 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-xs text-white truncate">{item.file_name}</p>
          </div>
        </div>
      );
    }

    // For non-image files, determine the icon based on file type
    const icon = (() => {
      if (item.file_type.startsWith("video/")) {
        return <Film className="w-6 h-6" />;
      } else if (item.file_type.startsWith("audio/")) {
        return <Music className="w-6 h-6" />;
      } else {
        return <FileText className="w-6 h-6" />;
      }
    })();

    return (
      <div
        key={item.id}
        className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg cursor-pointer"
      >
        {icon}
        <div className="flex-1 min-w-0">
          <p className="text-sm truncate">{item.file_name}</p>
          <p className="text-xs text-muted-foreground">
            {(item.size / 1024 / 1024).toFixed(1)} MB
          </p>
        </div>
      </div>
    );
  };

  const handleHeaderClick = () => {
    if (!isActive) {
      onSelect();
      setIsExpanded(false);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={handleHeaderClick}
        className={`w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors ${
          isActive ? "bg-muted/50" : ""
        }`}
      >
        <div className="flex items-center gap-2">
          <div className={iconColor}>{icon}</div>
          <h3 className="font-medium">{title}</h3>
          <span className="text-sm text-muted-foreground ml-2">
            ({items.length})
          </span>
        </div>
        {isActive && items.length > 4 && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            {!isExpanded && <span>{items.length - 4} weitere</span>}
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        )}
      </button>
      {isActive && (
        <div className="px-3 pb-3">
          {type === "image" ? (
            <div className="grid grid-cols-2 gap-2">
              {displayItems
                .filter((item) => item.file_type.startsWith("image/"))
                .map(renderItem)}
            </div>
          ) : (
            <div className="space-y-2">
              {displayItems
                .filter((item) => {
                  switch (type) {
                    case "video":
                      return item.file_type.startsWith("video/");
                    case "audio":
                      return item.file_type.startsWith("audio/");
                    case "document":
                      return (
                        !item.file_type.startsWith("image/") &&
                        !item.file_type.startsWith("video/") &&
                        !item.file_type.startsWith("audio/")
                      );
                    default:
                      return false;
                  }
                })
                .map(renderItem)}
            </div>
          )}
          {items.length > 4 && !isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="w-full mt-2 p-2 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors"
            >
              Mehr anzeigen
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// MediaLibraryContent component to handle media items and uploads
export function MediaLibraryContent() {
  const { user, supabase, session } = useSupabase();
  const [isDragging, setIsDragging] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("image");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const router = useRouter();

  // Fetch media items from Supabase and set up real-time subscription
  useEffect(() => {
    if (!supabase || !user) {
      setIsLoading(false);
      return;
    }

    // Initial fetch
    async function fetchMediaItems() {
      if (!supabase || !user) return;

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

    // Set up real-time subscription
    const channel = supabase
      .channel("media_items_changes")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all changes
          schema: "public",
          table: "media_items",
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          console.log("Real-time update received:", payload);

          // Refresh the entire list to ensure consistency
          const { data, error } = await supabase
            .from("media_items")
            .select("*")
            .eq("user_id", user.id)
            .order("uploaded_at", { ascending: false });

          if (!error && data) {
            setMediaItems(data);
          }
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      channel.unsubscribe();
    };
  }, [supabase, user]);

  // Check for session
  useEffect(() => {
    if (!session && !isLoading) {
      router.push("/auth/login");
    }
  }, [session, isLoading, router]);

  // Helper function to determine the appropriate bucket based on file type
  const getBucketForFile = (file: File): string => {
    if (file.type.startsWith("image/")) return "images";
    if (file.type.startsWith("video/")) return "videos";
    if (file.type.startsWith("audio/")) return "audio";
    return "documents";
  };

  // Handle file upload
  const handleFileUpload = async (files: File[]) => {
    if (!files || files.length === 0) return;
    if (!user || !supabase) {
      toast.error("Sie müssen angemeldet sein, um Medien hochzuladen");
      router.push("/auth/login");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    for (const file of files) {
      try {
        // Check file size (50MB limit)
        if (file.size > 50 * 1024 * 1024) {
          toast.error(`${file.name} ist zu groß (Max: 50MB)`);
          continue;
        }

        const bucket = getBucketForFile(file);
        const filePath = `${user.id}/${Date.now()}-${file.name}`;

        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) throw uploadError;

        // Get the public URL
        const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
        if (!data?.publicUrl) throw new Error("Could not get public URL");

        // Get dimensions if it's an image
        const dimensions = await new Promise<{ width: number; height: number }>(
          (resolve) => {
            const img = new window.Image();
            img.onload = () => {
              resolve({
                width: img.width,
                height: img.height,
              });
            };
            img.onerror = () => {
              resolve({ width: 0, height: 0 });
            };
            img.src = data.publicUrl;
          }
        );

        // Add to media_items table
        const { error: dbError } = await supabase.from("media_items").insert({
          id: uuidv4(),
          file_name: file.name,
          file_type: file.type,
          url: data.publicUrl,
          size: file.size,
          width: dimensions.width,
          height: dimensions.height,
          user_id: user.id,
          uploaded_at: new Date().toISOString(),
        });

        if (dbError) throw dbError;

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
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="divide-y divide-border">
            <MediaCategory
              title="Bilder"
              icon={<ImageIcon />}
              iconColor="text-blue-500"
              items={mediaItems.filter((item) =>
                item.file_type.startsWith("image/")
              )}
              type="image"
              isActive={activeCategory === "image"}
              onSelect={() => setActiveCategory("image")}
            />
            <MediaCategory
              title="Videos"
              icon={<Film />}
              iconColor="text-red-500"
              items={mediaItems.filter((item) =>
                item.file_type.startsWith("video/")
              )}
              type="video"
              isActive={activeCategory === "video"}
              onSelect={() => setActiveCategory("video")}
            />
            <MediaCategory
              title="Audio"
              icon={<Music />}
              iconColor="text-purple-500"
              items={mediaItems.filter((item) =>
                item.file_type.startsWith("audio/")
              )}
              type="audio"
              isActive={activeCategory === "audio"}
              onSelect={() => setActiveCategory("audio")}
            />
            <MediaCategory
              title="Dokumente"
              icon={<FileText />}
              iconColor="text-green-500"
              items={mediaItems.filter(
                (item) =>
                  !item.file_type.startsWith("image/") &&
                  !item.file_type.startsWith("video/") &&
                  !item.file_type.startsWith("audio/")
              )}
              type="document"
              isActive={activeCategory === "document"}
              onSelect={() => setActiveCategory("document")}
            />
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border mt-auto">
        <div className="flex flex-col gap-4">
          <div
            className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const files = Array.from(e.dataTransfer.files);
              if (files.length > 0) {
                handleFileUpload(files);
              }
            }}
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {isDragging
                    ? "Dateien hier ablegen"
                    : "Klicken zum Hochladen"}
                </p>
                <p className="text-sm text-muted-foreground">
                  oder Dateien hier reinziehen
                </p>
              </div>
            </div>
          </div>
          {isUploading && (
            <div className="space-y-2">
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Upload läuft... {uploadProgress}%
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// EditorRightSidebar component to handle the right sidebar in the editor
export function EditorRightSidebar() {
  const [activeTab, setActiveTab] = useState<"media" | "properties">("media");

  return (
    <div className="w-[300px] bg-background border-l border-border flex flex-col h-full">
      <div className="pt-16 border-b border-border">
        <div className="flex">
          <button
            onClick={() => setActiveTab("media")}
            className={`flex-1 p-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "media"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Mediathek
          </button>
          <button
            onClick={() => setActiveTab("properties")}
            className={`flex-1 p-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "properties"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Eigenschaften
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        {activeTab === "media" ? (
          <MediaLibraryContent />
        ) : (
          <div className="text-center text-muted-foreground p-4">
            Wählen Sie ein Element aus, um dessen Eigenschaften zu bearbeiten.
          </div>
        )}
      </div>
    </div>
  );
}

// ... rest of the file (PropertiesPanelContent and EditorRightSidebar) stays the same ...
