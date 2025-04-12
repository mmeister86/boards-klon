/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useCallback, forwardRef } from "react";
import { useDrop } from "react-dnd";
import type { DropTargetMonitor } from "react-dnd";
import { NativeTypes } from "react-dnd-html5-backend";
import { Loader2, AlertCircle, UploadCloud, X } from "lucide-react";
import { useBlocksStore } from "@/store/blocks-store";
import { cn } from "@/lib/utils";
import { ItemTypes } from "@/lib/item-types";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useRouter } from "next/navigation";
import { type SupabaseClient } from "@supabase/supabase-js";
import Image from "next/image";

// Special value to indicate an empty image block
const EMPTY_IMAGE_BLOCK = "__EMPTY_IMAGE_BLOCK__";

// Interface for media items from the library
interface MediaLibraryImageItem {
  type: typeof ItemTypes.MEDIA_IMAGE;
  url: string;
  alt?: string;
  file_type: string;
}

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

// Helper function to add item to media library
const addToMediaLibrary = async (
  file: File,
  url: string,
  dimensions: { width: number; height: number },
  supabaseClient: SupabaseClient,
  previewUrl512: string | null,
  previewUrl128: string | null
) => {
  if (!supabaseClient) throw new Error("Supabase client not available");

  const { data: userData } = await supabaseClient.auth.getUser();
  if (!userData?.user) throw new Error("User not authenticated");

  // Add to media_items table
  const { error: dbError } = await supabaseClient.from("media_items").insert({
    id: uuidv4(),
    file_name: file.name,
    file_type: file.type,
    url: url,
    size: file.size,
    width: dimensions.width,
    height: dimensions.height,
    user_id: userData.user.id,
    uploaded_at: new Date().toISOString(),
    preview_url_512: previewUrl512,
    preview_url_128: previewUrl128,
  });

  if (dbError) {
    console.error("Error adding to media library:", dbError);
    throw dbError;
  }
};

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

type AcceptedDropItem = FileDropItem | MediaLibraryImageItem;

// Definiere Upload-Status-Typen für besseres State Management
type UploadStatus = "idle" | "uploading" | "loading" | "error" | "success";

interface ImageBlockState {
  status: UploadStatus;
  error: string | null;
  imageUrl: string | null;
}

export const ImageBlock = forwardRef<HTMLDivElement, ImageBlockProps>(
  ({ blockId, dropAreaId, content, altText }, ref) => {
    const { updateBlockContent } = useBlocksStore();
    // Initialize with idle state if content is empty or EMPTY_IMAGE_BLOCK
    const [state, setState] = useState<ImageBlockState>(() => {
      const isEmptyOrPlaceholder = !content || content === EMPTY_IMAGE_BLOCK;
      return {
        status: isEmptyOrPlaceholder ? "idle" : "loading",
        error: null,
        imageUrl: isEmptyOrPlaceholder ? null : content,
      };
    });
    const { supabase: supabaseClient, session, user } = useSupabase();
    const router = useRouter();

    // Session-Check mit verbesserter Fehlerbehandlung
    useEffect(() => {
      let timeoutId: NodeJS.Timeout;

      if (!session && state.status !== "loading") {
        timeoutId = setTimeout(() => {
          router.push("/auth/login");
        }, 1000);
      }

      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    }, [session, state.status, router]);

    // Update state when content changes
    useEffect(() => {
      const isEmptyOrPlaceholder = !content || content === EMPTY_IMAGE_BLOCK;
      setState((prev) => ({
        ...prev,
        status: isEmptyOrPlaceholder ? "idle" : "loading",
        imageUrl: isEmptyOrPlaceholder ? null : content,
        error: null,
      }));
    }, [content]);

    // Cleanup bei Unmount
    useEffect(() => {
      return () => {
        setState({
          status: "idle",
          error: null,
          imageUrl: null,
        });
      };
    }, []);

    // Verbesserte Bildverarbeitung mit API-Route
    const processDroppedFiles = useCallback(
      async (files: File[]) => {
        const imageFile = files.find((file) => file.type.startsWith("image/"));
        if (!imageFile) {
          setState((prev) => ({
            ...prev,
            status: "error",
            error: "Nur Bilddateien werden akzeptiert",
          }));
          toast.error("Nur Bilddateien werden akzeptiert");
          return;
        }

        // Keep user/session check for DB operation later
        if (!session || !user || !supabaseClient) {
          setState((prev) => ({
            ...prev,
            status: "error",
            error: "Bitte melden Sie sich an",
          }));
          toast.error("Bitte melden Sie sich an");
          router.push("/auth/login");
          return;
        }

        setState((prev) => ({ ...prev, status: "uploading", error: null }));

        try {
          // --- NEU: Verwende FormData für die API-Route ---
          const formData = new FormData();
          formData.append("file", imageFile);
          console.log(`ImageBlock: Calling API route for ${imageFile.name}`);

          // --- NEU: Rufe die API-Route auf ---
          const response = await fetch("/api/optimize-image", {
            method: "POST",
            body: formData,
            credentials: "include", // Send cookies
          });

          const result = await response.json();

          if (!response.ok) {
            console.error(
              `ImageBlock: API Route Error (${response.status}):`,
              result.error || "Unknown error from API"
            );
            throw new Error(
              result.error ||
                `Failed to upload ${imageFile.name} (Status: ${response.status})`
            );
          }

          // --- Verwende die URL aus der API-Antwort ---
          const uploadedUrl = result.publicUrl;
          const previewUrl512 = result.previewUrl512 ?? null;
          const previewUrl128 = result.previewUrl128 ?? null;

          if (!uploadedUrl) {
            console.error("ImageBlock: API Route did not return a publicUrl.");
            throw new Error(
              `Upload successful for ${imageFile.name}, but failed to get URL.`
            );
          }
          console.log(
            `ImageBlock: API success. URL: ${uploadedUrl}, Preview512: ${previewUrl512}, Preview128: ${previewUrl128}`
          );

          // Get image dimensions (client-side is fine)
          const dimensions = await getImageDimensions(imageFile);

          // Add to media library (still needs Supabase client)
          await addToMediaLibrary(
            imageFile,
            uploadedUrl,
            dimensions,
            supabaseClient,
            previewUrl512,
            previewUrl128
          );

          // Update block content in Zustand store
          updateBlockContent(blockId, dropAreaId, uploadedUrl, {
            altText: altText || imageFile.name,
          });

          // Update local component state
          setState((prev) => ({
            ...prev,
            status: "success",
            imageUrl: uploadedUrl,
            error: null,
          }));

          toast.success(`${imageFile.name} erfolgreich hochgeladen`);
        } catch (error) {
          console.error("Upload fehlgeschlagen:", error);
          const message =
            error instanceof Error ? error.message : "Unbekannter Fehler";

          setState((prev) => ({
            ...prev,
            status: "error",
            error: `Upload fehlgeschlagen: ${message}`,
          }));

          toast.error(message);
        }
      },
      // Ensure all dependencies are correctly listed
      [
        blockId,
        dropAreaId,
        updateBlockContent,
        altText,
        session,
        user,
        supabaseClient, // Add Supabase client as dependency
        router,
      ]
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
            if (mediaItem.url && mediaItem.file_type.startsWith("image/")) {
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
            const fileItem = item as FileDropItem;
            return (
              fileItem.files?.some((file) => file.type.startsWith("image/")) ??
              false
            );
          }
          if (itemType === ItemTypes.MEDIA_IMAGE) {
            const mediaItem = item as MediaLibraryImageItem;
            return mediaItem.file_type.startsWith("image/");
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
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
      (dropRef as (node: HTMLDivElement | null) => void)(node);
    };

    return (
      <div
        ref={combinedRef}
        className={cn(
          "relative w-full border border-dashed border-transparent transition-colors duration-200",
          (!state.imageUrl || state.imageUrl === EMPTY_IMAGE_BLOCK) &&
            "aspect-video",
          isActive
            ? "border-primary bg-primary/10"
            : canDrop
            ? "border-primary/50"
            : "border-transparent",
          (!state.imageUrl || state.imageUrl === EMPTY_IMAGE_BLOCK) &&
            "bg-muted rounded-lg",
          canDrop && "hover:border-primary hover:border-2"
        )}
      >
        {canDrop && (
          <div
            className={cn(
              "absolute inset-0 z-30 transition-opacity duration-200",
              isActive ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          >
            <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm rounded-lg border-2 border-primary">
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <UploadCloud className="h-10 w-10 mb-2 text-primary" />
                <p className="text-sm font-medium text-primary">
                  Neues Bild hier ablegen
                </p>
              </div>
            </div>
          </div>
        )}

        {state.imageUrl &&
          state.imageUrl !== EMPTY_IMAGE_BLOCK &&
          state.status !== "uploading" &&
          state.status !== "loading" && (
            <button
              onClick={() => {
                updateBlockContent(blockId, dropAreaId, EMPTY_IMAGE_BLOCK, {
                  altText: "",
                });
                setState((prev) => ({
                  ...prev,
                  status: "idle",
                  imageUrl: null,
                  error: null,
                }));
              }}
              className="absolute top-2 right-2 z-40 p-1 bg-background/80 hover:bg-background rounded-full shadow-sm"
              aria-label="Bild löschen"
            >
              <X className="h-4 w-4" />
            </button>
          )}

        {(!state.imageUrl || state.imageUrl === EMPTY_IMAGE_BLOCK) &&
          state.status === "idle" && (
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

        {(state.status === "uploading" || state.status === "loading") && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-background/80 backdrop-blur-sm rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm font-medium">
              {state.status === "uploading"
                ? "Wird hochgeladen..."
                : "Wird geladen..."}
            </p>
          </div>
        )}

        <div className="relative w-full aspect-video">
          {state.status === "loading" && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted rounded-lg">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}

          {state.error &&
            state.status === "error" &&
            state.imageUrl &&
            state.imageUrl !== EMPTY_IMAGE_BLOCK && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-destructive/10 rounded-lg p-4 text-destructive">
                <AlertCircle className="h-6 w-6 mb-1" />
                <p className="text-xs text-center">{state.error}</p>
              </div>
            )}

          {state.imageUrl &&
            state.imageUrl !== EMPTY_IMAGE_BLOCK &&
            typeof state.imageUrl === "string" &&
            state.imageUrl.trim().startsWith("http") && (
              <div className="relative w-full h-full">
                <Image
                  src={state.imageUrl}
                  alt={altText || "Bild"}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className={cn(
                    "object-cover rounded-lg",
                    (state.status === "loading" || state.status === "error") &&
                      "opacity-0",
                    isActive && "opacity-50 transition-opacity duration-200"
                  )}
                  onLoad={() =>
                    setState((prev) => ({
                      ...prev,
                      status: "success",
                      error: null,
                    }))
                  }
                  onError={() =>
                    setState((prev) => ({
                      ...prev,
                      status: "error",
                      error: "Bild konnte nicht geladen werden",
                    }))
                  }
                  priority={false}
                  quality={85}
                />
              </div>
            )}
        </div>
      </div>
    );
  }
);

// Add display name
ImageBlock.displayName = "ImageBlock";
