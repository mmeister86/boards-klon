/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useCallback, forwardRef } from "react";
import { useDrop } from "react-dnd";
import type { DropTargetMonitor } from "react-dnd";
import { NativeTypes } from "react-dnd-html5-backend";
import { Loader2, AlertCircle, UploadCloud, X } from "lucide-react"; // Added X icon
import { useBlocksStore } from "@/store/blocks-store";
import { cn } from "@/lib/utils";
import { ItemTypes } from "@/lib/item-types"; // Assuming you have ItemTypes defined
import { supabase } from "@/lib/supabase"; // Import the supabase client

// Placeholder Image URL in case nothing is uploaded yet
const PLACEHOLDER_IMAGE =
  "https://placehold.co/2000x1800?text=Bild+hier+ablegen";
// Special value to indicate an empty image block
const EMPTY_IMAGE_BLOCK = "__EMPTY_IMAGE_BLOCK__";

// --- Utility function to handle image uploads (e.g., to Supabase Storage) ---
// This should ideally be moved to a utility file (e.g., lib/supabase/storage.ts)
async function uploadImageToStorage(file: File): Promise<string> {
  console.log(`Uploading file: ${file.name}`);
  if (!supabase) throw new Error("Supabase client not available");

  const filePath = `public/${Date.now()}-${file.name}`; // Define a unique path

  try {
    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      throw uploadError;
    }

    // Get the public URL
    const { data } = supabase.storage.from("images").getPublicUrl(filePath);

    if (!data?.publicUrl) {
      throw new Error("Could not get public URL after upload.");
    }

    // Get image dimensions
    const dimensions = await new Promise<{ width: number; height: number }>(
      (resolve) => {
        const img = new Image();
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
      file_name: file.name,
      file_type: file.type,
      url: data.publicUrl,
      size: file.size,
      width: dimensions.width,
      height: dimensions.height,
    });

    if (dbError) {
      console.error("Error adding to media library:", dbError);
      // Don't throw here - we still want to return the URL even if media library insert fails
    }

    console.log(`Upload successful. URL: ${data.publicUrl}`);
    return data.publicUrl;
  } catch (error) {
    console.error("Error during image upload process:", error);
    // Re-throw the error to be caught by the calling function
    throw error;
  }
}
// --- End Upload Function ---

interface ImageBlockProps {
  blockId: string;
  dropAreaId: string;
  content: string | null; // Image URL or null/empty for placeholder
  altText?: string;
}

// Define accepted drop item types
interface FileDropItem {
  files: File[];
}
// Define your Media Library item type if it's different
interface MediaLibraryImageItem {
  type: typeof ItemTypes.MEDIA_IMAGE; // Example type
  url: string;
  alt?: string;
}

type AcceptedDropItem = FileDropItem | MediaLibraryImageItem;

export const ImageBlock = forwardRef<HTMLDivElement, ImageBlockProps>(
  ({ blockId, dropAreaId, content, altText }, ref) => {
    const { updateBlockContent } = useBlocksStore();
    const [imageUrl, setImageUrl] = useState<string | null>(content);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Handle image deletion
    const handleDeleteImage = useCallback(() => {
      // Use special placeholder value instead of empty string
      updateBlockContent(blockId, dropAreaId, EMPTY_IMAGE_BLOCK, {
        altText: "",
      });
      setImageUrl(null);
      setError(null);
    }, [blockId, dropAreaId, updateBlockContent]);

    // Validate and format the image URL
    const getValidImageUrl = useCallback((url: string | null): string => {
      if (!url || url === EMPTY_IMAGE_BLOCK) return PLACEHOLDER_IMAGE;

      // Check if URL starts with http:// or https://
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        console.error(
          "Invalid image URL: URL must start with http:// or https://",
          url
        );
        return PLACEHOLDER_IMAGE;
      }

      try {
        // Validate if it's a proper URL
        new URL(url);
        return url;
      } catch {
        console.error("Invalid image URL format:", url);
        return PLACEHOLDER_IMAGE;
      }
    }, []);

    // Update local state if block content changes from store
    useEffect(() => {
      const validUrl =
        content === EMPTY_IMAGE_BLOCK ? null : getValidImageUrl(content);
      setImageUrl(validUrl);
      setIsLoading(!!content && content !== EMPTY_IMAGE_BLOCK); // Only show loading if we have actual content
      setError(null);
    }, [content, getValidImageUrl]);

    const handleImageLoad = () => {
      setIsLoading(false);
      setError(null);
    };

    const handleImageError = () => {
      setIsLoading(false);
      setError("Bild konnte nicht geladen werden.");
      setImageUrl(PLACEHOLDER_IMAGE);
    };

    const processDroppedFiles = useCallback(
      async (files: File[]) => {
        const imageFile = files.find((file) => file.type.startsWith("image/"));
        if (!imageFile) {
          setError("Nur Bilddateien werden akzeptiert.");
          setTimeout(() => setError(null), 3000);
          return;
        }

        setIsUploading(true);
        setError(null);
        setIsLoading(true); // Show loading state immediately
        try {
          const uploadedUrl = await uploadImageToStorage(imageFile);
          updateBlockContent(blockId, dropAreaId, uploadedUrl, {
            altText: altText || imageFile.name,
          });
        } catch (uploadError: unknown) {
          console.error("Upload failed:", uploadError);
          const message =
            uploadError instanceof Error
              ? uploadError.message
              : "Unbekannter Fehler";
          setError(`Upload fehlgeschlagen: ${message}`);
          setIsLoading(false); // Reset loading state on error
        } finally {
          setIsUploading(false);
        }
      },
      [blockId, dropAreaId, updateBlockContent, altText]
    );

    const [{ isOver, canDrop }, dropRef] = useDrop<
      AcceptedDropItem,
      void,
      { isOver: boolean; canDrop: boolean }
    >(
      () => ({
        accept: [NativeTypes.FILE, ItemTypes.MEDIA_IMAGE],
        drop: (
          item: AcceptedDropItem,
          monitor: DropTargetMonitor<AcceptedDropItem>
        ) => {
          const itemType = monitor.getItemType();
          if (itemType === NativeTypes.FILE) {
            const fileItem = item as FileDropItem;
            if (fileItem.files) {
              processDroppedFiles(fileItem.files);
            }
          } else if (itemType === ItemTypes.MEDIA_IMAGE) {
            const mediaItem = item as MediaLibraryImageItem;
            if (mediaItem.url) {
              updateBlockContent(blockId, dropAreaId, mediaItem.url, {
                altText: mediaItem.alt || altText || "",
              });
            }
          }
        },
        canDrop: (
          item: AcceptedDropItem,
          monitor: DropTargetMonitor<AcceptedDropItem>
        ) => {
          const itemType = monitor.getItemType();
          if (itemType === NativeTypes.FILE) {
            return true;
          }
          if (itemType === ItemTypes.MEDIA_IMAGE) {
            return true;
          }
          return false;
        },
        collect: (monitor: DropTargetMonitor<AcceptedDropItem>) => ({
          isOver: monitor.isOver(),
          canDrop: monitor.canDrop(),
        }),
      }),
      [blockId, dropAreaId, processDroppedFiles, updateBlockContent, altText]
    );

    const isActive = isOver && canDrop;

    // Combine the forwarded ref and the drop ref
    const combinedRef = (node: HTMLDivElement | null) => {
      // Assign to the forwarded ref
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
      // Assign to the drop ref (cast to avoid type error)
      (dropRef as (node: HTMLDivElement | null) => void)(node);
    };

    return (
      <div
        ref={combinedRef}
        className={cn(
          "relative w-full border border-dashed border-transparent transition-colors duration-200",
          // Apply aspect ratio only for placeholder, not when image is loaded
          !content && "aspect-video",
          // Apply dropzone styling when active
          isActive
            ? "border-primary bg-primary/10"
            : canDrop
            ? "border-primary/50" // Indicate potential drop
            : "border-transparent",
          // Basic placeholder background
          !content && "bg-muted rounded-lg"
        )}
      >
        {/* Delete Button - Only show when image is loaded and not uploading */}
        {content && !isUploading && !isLoading && (
          <button
            onClick={handleDeleteImage}
            className="absolute top-2 right-2 z-10 p-1 bg-background/80 hover:bg-background rounded-full shadow-sm"
            aria-label="Bild löschen"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Placeholder View */}
        {!content && !isUploading && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-muted-foreground">
            <UploadCloud
              className={cn(
                "h-10 w-10 mb-2 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground/50"
              )}
            />
            <p className="text-sm font-medium">
              Bild hierher ziehen oder{" "}
              <span className="text-primary">hochladen</span>
            </p>
            <p className="text-xs mt-1">Oder URL im Seitenmenü eingeben</p>
          </div>
        )}

        {/* Loading/Uploading State */}
        {(isUploading || isLoading) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-background/80 rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm font-medium">
              {isUploading ? "Wird hochgeladen..." : "Wird geladen..."}
            </p>
          </div>
        )}

        {/* Image View */}
        <div className="relative w-full aspect-video">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted rounded-lg">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          {error && !isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-destructive/10 rounded-lg p-4 text-destructive">
              <AlertCircle className="h-6 w-6 mb-1" />
              <p className="text-xs text-center">{error}</p>
            </div>
          )}
          <img
            src={getValidImageUrl(imageUrl)}
            alt={altText || "Bild"}
            className={cn(
              "absolute inset-0 w-full h-full object-cover rounded-lg",
              (isLoading || error) && "opacity-0" // Hide broken/loading image
            )}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </div>

        {/* Drop Overlay (Visual feedback during drag) */}
        {isActive && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 text-center bg-primary/10 rounded-lg border-2 border-primary pointer-events-none">
            <UploadCloud className="h-10 w-10 mb-2 text-primary" />
            <p className="text-sm font-medium text-primary">
              Bild hier ablegen
            </p>
          </div>
        )}
      </div>
    );
  }
);

// Add display name
ImageBlock.displayName = "ImageBlock";
