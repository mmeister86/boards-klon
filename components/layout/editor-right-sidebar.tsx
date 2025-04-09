/* eslint-disable jsx-a11y/alt-text */
"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Image as ImageIcon,
  Film,
  Music,
  FileText,
  Upload,
  ChevronDown,
  ChevronUp,
  Settings, // Icon for Properties tab
  Library, // Icon for Media tab
  Loader2,
} from "lucide-react";
import { useBlocksStore } from "@/store/blocks-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { findBlockById } from "@/store/blocks/utils"; // Assuming this utility exists
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import { useSupabase } from "@/components/providers/supabase-provider";
import { toast } from "sonner";

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
    const icon = (() => {
      switch (item.file_type) {
        case "video":
          return <Film className="w-6 h-6" />;
        case "audio":
          return <Music className="w-6 h-6" />;
        default:
          return <FileText className="w-6 h-6" />;
      }
    })();

    if (item.file_type === "image") {
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
              {displayItems.map(renderItem)}
            </div>
          ) : (
            <div className="space-y-2">{displayItems.map(renderItem)}</div>
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

function MediaLibraryContent() {
  const { user } = useSupabase();
  const [isDragging, setIsDragging] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("image");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Helper function to get file dimensions (for images)
  const getImageDimensions = async (
    file: File
  ): Promise<{ width: number; height: number }> => {
    if (!file.type.startsWith("image/")) {
      return { width: 0, height: 0 };
    }

    return new Promise((resolve) => {
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
      img.src = URL.createObjectURL(file);
    });
  };

  // Helper function to determine the appropriate bucket based on file type
  const getBucketForFile = (file: File): string => {
    if (file.type.startsWith("image/")) return "images";
    if (file.type.startsWith("video/")) return "videos";
    if (file.type.startsWith("audio/")) return "audio";
    return "documents";
  };

  // Fetch media items from Supabase
  useEffect(() => {
    async function fetchMediaItems() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("media_items")
          .select("*")
          .eq("user_id", user?.id)
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

    if (user) {
      fetchMediaItems();
    }
  }, [user]);

  // Handle file upload
  const handleFileUpload = async (files: File[]) => {
    if (!files || files.length === 0) return;
    if (!user) {
      toast.error("Sie müssen angemeldet sein, um Medien hochzuladen");
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

        // Generate a UUID for the new item
        const newId = uuidv4();

        // Add to media_items table with user_id
        const { error: dbError } = await supabase.from("media_items").insert({
          id: newId,
          file_name: file.name,
          file_type: file.type,
          url: publicUrl,
          size: file.size,
          width: dimensions.width,
          height: dimensions.height,
          user_id: user.id,
        });

        if (dbError) throw dbError;

        // Add the new item to the state
        setMediaItems((prev) => [
          {
            id: newId,
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

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
      icon: <ImageIcon size={18} />,
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

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pb-5">
        <div className="divide-y divide-border">
          {categories.map((category) => (
            <MediaCategory
              key={category.type}
              title={category.title}
              icon={category.icon}
              iconColor={category.iconColor}
              items={category.items}
              type={category.type}
              isActive={activeCategory === category.type}
              onSelect={() => setActiveCategory(category.type)}
            />
          ))}
        </div>
      </div>
      <div className="border-t border-border p-4">
        <div
          className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            className="hidden"
            id="fileUpload"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              if (files.length > 0) {
                handleFileUpload(files);
              }
            }}
          />
          <label
            htmlFor="fileUpload"
            className="flex flex-col items-center gap-2 cursor-pointer"
          >
            <Upload size={20} className="text-muted-foreground" />
            <div className="text-sm">
              <span className="text-primary font-medium">
                Klicken zum Hochladen
              </span>{" "}
              oder Dateien hier reinziehen
            </div>
            <p className="text-xs text-muted-foreground">
              Unterstützt Bilder, Videos, Audio und Dokumente
            </p>
          </label>
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
  );
}

// --- Properties Panel Content (from properties-panel.tsx) ---

function PropertiesPanelContent() {
  const { selectedBlockId, dropAreas, updateBlockContent } = useBlocksStore();
  const selectedBlock = selectedBlockId
    ? findBlockById(dropAreas, selectedBlockId)
    : null;

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedBlock) {
      updateBlockContent(
        selectedBlock.id,
        selectedBlock.dropAreaId,
        e.target.value,
        { altText: selectedBlock.altText }
      );
    }
  };

  const handleAltTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedBlock) {
      updateBlockContent(
        selectedBlock.id,
        selectedBlock.dropAreaId,
        selectedBlock.content,
        { altText: e.target.value }
      );
    }
  };

  const handleClearImage = () => {
    if (selectedBlock) {
      updateBlockContent(selectedBlock.id, selectedBlock.dropAreaId, "", {
        altText: "",
      });
    }
  };

  return (
    // Removed pt-16
    <div className="px-5 pb-5">
      {/* Conditionally render config based on selected block type */}
      {selectedBlock && selectedBlock.type === "image" && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://beispiel.com/bild.jpg"
              value={selectedBlock.content || ""}
              onChange={handleUrlChange}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="altText">Alt Text</Label>
            <Input
              id="altText"
              type="text"
              placeholder="Descriptive text for the image"
              value={selectedBlock.altText || ""}
              onChange={handleAltTextChange}
              className="mt-1"
            />
          </div>
          <Button variant="outline" size="sm" onClick={handleClearImage}>
            Bild entfernen
          </Button>
        </div>
      )}
      {selectedBlock && selectedBlock.type === "heading" && (
        <div>{/* TODO: Heading config... */}</div>
      )}
      {selectedBlock && selectedBlock.type === "paragraph" && (
        <div>{/* TODO: Paragraph config... */}</div>
      )}
      {!selectedBlock && (
        <p className="text-sm text-muted-foreground">
          Select a block to edit its properties.
        </p>
      )}
    </div>
  );
}

// --- Combined Sidebar Component ---

export default function EditorRightSidebar() {
  return (
    // Added pt-24 and overflow-y-auto to main container, removed flex flex-col h-full
    <div className="w-64 bg-card border-l border-border overflow-y-auto p-5 pt-24">
      {/* Removed h-full from Tabs */}
      <Tabs defaultValue="media" className="flex flex-col">
        <TabsList className="grid w-full grid-cols-2 rounded-none border-b flex-shrink-0">
          <TabsTrigger value="media" className="rounded-none">
            <Library className="h-4 w-4 mr-2" /> Media
          </TabsTrigger>
          <TabsTrigger value="properties" className="rounded-none">
            <Settings className="h-4 w-4 mr-2" /> Properties
          </TabsTrigger>
        </TabsList>
        {/* Removed overflow-auto */}
        <TabsContent value="media" className="mt-0">
          <MediaLibraryContent />
        </TabsContent>
        {/* Removed overflow-auto */}
        <TabsContent value="properties" className="mt-0">
          <PropertiesPanelContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}
