"use client";

import { useDrop } from "react-dnd";
import { useState, useEffect, useRef } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ItemTypes, markDropHandled } from "@/lib/item-types";
import { useBlocksStore } from "@/store/blocks-store";
// Removed duplicate imports
import type { DropAreaType, BlockType } from "@/lib/types";
import type { ViewportType } from "@/lib/hooks/use-viewport";
import { findDropAreaById } from "@/lib/utils/drop-area-utils";
import type { DropTargetMonitor } from "react-dnd";
import { NativeTypes } from "react-dnd-html5-backend";
import { useSupabase } from "@/components/providers/supabase-provider";
import { toast } from "sonner";
// Re-import storage helpers for direct uploads
import { uploadMediaFile, addMediaItemToDatabase } from "@/lib/supabase/storage";
// Import der wiederverwendeten Schnittstelle
import type { MediaItemInput } from "@/components/media/draggable-media-item";

// Definiere einen Union Type für die verschiedenen möglichen Drag-Items
// Dies verbessert die Typsicherheit in der drop-Funktion
type CombinedDragItem =
  | { type: typeof ItemTypes.BLOCK | typeof ItemTypes.EXISTING_BLOCK | typeof ItemTypes.SQUARE; id?: string; content: string; sourceDropAreaId?: string; files?: never; }
  | { type: typeof NativeTypes.FILE; files: File[]; id?: never; content?: never; sourceDropAreaId?: never; }
  | (MediaItemInput & { type: typeof ItemTypes.MEDIA; files?: never; }); // Fügt den Typ für Media-Items hinzu

/**
 * Helper function to handle optimized file uploads via API endpoints.
 * @param file - The file to upload.
 * @param userId - The ID of the user uploading the file.
 * @param apiEndpoint - The API route for optimization (e.g., "/api/optimize-image").
 * @param formDataKey - The key to use when appending the file to FormData (e.g., "file", "video").
 * @returns An object containing the processed URLs or throws an error.
 */
async function uploadAndOptimizeFile(
  file: File,
  userId: string,
  apiEndpoint: string,
  formDataKey: string
): Promise<{
  storageUrl?: string; // Main URL (might be storage or public)
  publicUrl?: string; // Public URL (specifically for images)
  previewUrl?: string; // General preview (e.g., PDF)
  previewUrl512?: string; // 512px image preview
  previewUrl128?: string; // 128px image preview
}> {
  const formData = new FormData();
  formData.append(formDataKey, file);
  formData.append("userId", userId); // Add userId consistently

  console.log(`useDropArea (Helper): Calling ${apiEndpoint} for ${file.name}`);
  const response = await fetch(apiEndpoint, {
    method: "POST",
    body: formData,
    credentials: 'include',
  });

  console.log(`useDropArea (Helper): ${apiEndpoint} response status: ${response.status}`);
  const result = await response.json();
  console.log(`useDropArea (Helper): Parsed JSON response from ${apiEndpoint}:`, JSON.stringify(result, null, 2));

  if (!response.ok) {
    const errorMessage = result?.error || `Upload failed (Status: ${response.status}) via ${apiEndpoint}`;
    console.error(`useDropArea (Helper): API fetch not ok for ${apiEndpoint}.`, errorMessage);
    throw new Error(errorMessage);
  }

  // Return the relevant fields from the result. Specific handling happens in the caller.
  return {
      storageUrl: result.storageUrl,
      publicUrl: result.publicUrl,
      previewUrl: result.previewUrl,
      previewUrl512: result.previewUrl512,
      previewUrl128: result.previewUrl128,
  };
}

export const useDropArea = (dropArea: DropAreaType, viewport: ViewportType) => {
  const dropTargetRef = useRef<HTMLDivElement | null>(null);
  const { supabase: supabaseClient, user } = useSupabase();

  const {
    addBlock, // Function to add a new block
    moveBlock, // Function to move an existing block
    canSplit, // Function to check if an area can be split
    splitDropArea, // Function to split an empty area
    canMerge, // Function to check if areas can be merged
    mergeDropAreas, // Function to merge areas
    dropAreas, // Current state of all drop areas (used for merge checks)
    // Removed insertDropArea as it's handled by the parent now
  } = useBlocksStore();

  const [isHovering, setIsHovering] = useState(false); // Tracks direct hover over this area
  const [mousePosition, setMousePosition] = useState<{
    x: number;
    y: number;
  } | null>(null); // Track mouse position
  const [dropError, setDropError] = useState<string | null>(null);
  const [mergeTarget, setMergeTarget] = useState<string | null>(null);
  const [mergePosition, setMergePosition] = useState<"left" | "right" | "both">(
    "both"
  );

  const [{ isOver, canDrop }, drop] = useDrop<
    CombinedDragItem, // Verwende den neuen Union Type
    { name: string; handled: boolean; dropAreaId: string } | undefined,
    { isOver: boolean; canDrop: boolean }
  >({
    // Füge ItemTypes.MEDIA zur Accept-Liste hinzu
    accept: [ItemTypes.BLOCK, ItemTypes.SQUARE, ItemTypes.EXISTING_BLOCK, NativeTypes.FILE, ItemTypes.MEDIA],

    canDrop: (item: CombinedDragItem, monitor) => {
      const itemType = monitor.getItemType();
      // Handle file drops
      if (itemType === NativeTypes.FILE) {
        const files = (item as { files: File[] }).files;
        if (!files || files.length === 0) return false;

        // Check if at least one file has a supported type
        const hasValidFile = files.some(file => {
          const type = file.type.toLowerCase();
          return (
            type.startsWith('image/') ||
            type.startsWith('video/') ||
            type.startsWith('audio/') ||
            type === 'application/pdf' ||
            type === 'application/msword' ||
            type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          );
        });

        return hasValidFile;
      }

      // Default canDrop behavior for other item types (BLOCK, EXISTING_BLOCK, MEDIA)
      return true;
    },

    hover: (
      item: CombinedDragItem, // Verwende den neuen Union Type
      monitor: DropTargetMonitor<CombinedDragItem, { name: string } | undefined>
    ) => {
      const clientOffset = monitor.getClientOffset();
      if (clientOffset) {
        setMousePosition(clientOffset);
      }

      if (!monitor.isOver({ shallow: true })) {
        if (isHovering) setIsHovering(false);
        setMousePosition(null);
        return;
      }
      if (!isHovering) setIsHovering(true);
    },

    drop: (item: CombinedDragItem, monitor) => { // Verwende den neuen Union Type
      const dropOpId = `drop_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const itemType = monitor.getItemType(); // Hole den Typ des Items

      // Check if handled by parent
      if (monitor.didDrop()) {
        console.log(
          `[${dropOpId}] DropAreaHook ${dropArea.id}: Drop already handled by parent, ignoring.`
        );
        return undefined;
      }

      // Ensure drop target is still valid and we are directly over it
      if (!dropTargetRef.current || !monitor.isOver({ shallow: true })) {
        console.warn(
          `[${dropOpId}] DropAreaHook ${dropArea.id}: Drop target ref is null or not directly over.`
        );
        return undefined;
      }

      // Handle file drops (NativeTypes.FILE)
      if (itemType === NativeTypes.FILE) {
        if (!user || !supabaseClient) {
          toast.error("Du musst dich einloggen, um Dateien hochzuladen");
          return undefined;
        }

        const files = (item as { files: File[] }).files;
        if (!files || files.length === 0) return undefined;

        // Find the first supported file
        const supportedFile = files.find(file => {
          const type = file.type.toLowerCase();
          return (
            type.startsWith('image/') ||
            type.startsWith('video/') ||
            type.startsWith('audio/') ||
            type === 'application/pdf' ||
            type === 'application/msword' ||
            type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          );
        });

        if (!supportedFile) {
          toast.error("Diese Datei-Typen werden nicht unterstützt");
          return undefined;
        }

        // Show loading state
        const loadingToast = toast.loading(`Optimiere ${supportedFile.name}...`);

        (async () => {
          let url: string | null = null;
          let finalBlockType: BlockType['type'];
          let blockPreviewUrl: string | undefined = undefined;
          let dbPreviewUrl: string | null = null;
          let dbPreviewUrl512: string | null = null;
          let dbPreviewUrl128: string | null = null;

          const fileType = supportedFile.type.toLowerCase();

          try {
            // --- Refactored Upload Logic ---
            if (fileType.startsWith('image/')) {
              finalBlockType = 'image';
              const result = await uploadAndOptimizeFile(supportedFile, user.id, "/api/optimize-image", "file");
              // Images primarily use publicUrl
              url = result.publicUrl ?? null;
              if (!url) throw new Error("Image upload succeeded but no publicUrl returned.");
              dbPreviewUrl512 = result.previewUrl512 ?? null; // Specific image previews
              dbPreviewUrl128 = result.previewUrl128 ?? null;

            } else if (fileType.startsWith('video/')) {
              finalBlockType = 'video';
              const result = await uploadAndOptimizeFile(supportedFile, user.id, "/api/optimize-video", "video");
              // Videos might return storageUrl or publicUrl, prioritize storageUrl
              url = result.storageUrl ?? result.publicUrl ?? null;
              if (!url) throw new Error("Video upload succeeded but no URL returned.");
              dbPreviewUrl512 = result.previewUrl512 ?? null; // Assign previews
              dbPreviewUrl128 = result.previewUrl128 ?? null;

            } else if (fileType.startsWith('audio/')) {
              finalBlockType = 'audio';
              const result = await uploadAndOptimizeFile(supportedFile, user.id, "/api/optimize-audio", "audio");
              // Audio primarily uses storageUrl
              url = result.storageUrl ?? null;
              if (!url) throw new Error("Audio upload succeeded but no storageUrl returned.");

            } else if (fileType === 'application/pdf') {
              finalBlockType = 'document';
              const result = await uploadAndOptimizeFile(supportedFile, user.id, "/api/optimize-pdf", "pdf");
              // PDFs use storageUrl and have a specific previewUrl
              url = result.storageUrl ?? null;
              if (!url) throw new Error("PDF optimization succeeded but storageUrl is missing.");
              // Save preview for both DB and Block specific props
              dbPreviewUrl = result.previewUrl ?? null;
              blockPreviewUrl = result.previewUrl ?? undefined;

            } else { // Handle OTHER Documents directly (remaining file types)
              finalBlockType = 'document';
              console.log(`useDropArea: Uploading other document directly for ${supportedFile.name}`);
              url = await uploadMediaFile(supportedFile, user.id, supabaseClient); // Direct Upload
              if (!url) {
                throw new Error("Direct file upload failed to return a URL.");
              }
              console.log(`useDropArea: Direct upload success. URL: ${url}`);
              // No specific previews for direct uploads currently
            }

            // --- Add to Database (common logic) ---
            if (!url) { // Should not happen if error handling above is correct, but check anyway
              throw new Error("File processing completed without a valid URL.");
            }
            await addMediaItemToDatabase(
              supportedFile,
              url,
              user.id,
              supabaseClient,
              dbPreviewUrl, // Pass general preview (for PDF)
              dbPreviewUrl512, // Pass 512px preview (for Image/Video) - Corrected comment
              dbPreviewUrl128 // Pass 128px preview (for Image/Video) - Corrected comment
            );

            // --- Add block to store (common logic) ---
            const blockConfig = {
              type: finalBlockType,
              content: url,
              dropAreaId: dropArea.id,
            };

            // Add type-specific properties
            if (finalBlockType === 'image') {
              Object.assign(blockConfig, {
                altText: supportedFile.name,
                previewUrl512: dbPreviewUrl512,
                previewUrl128: dbPreviewUrl128
              });
            } else if (finalBlockType === 'video') {
              Object.assign(blockConfig, {
                previewUrl512: dbPreviewUrl512,
                previewUrl128: dbPreviewUrl128
              });
            } else if (finalBlockType === 'document') {
              Object.assign(blockConfig, {
                fileName: supportedFile.name,
                previewUrl: blockPreviewUrl
              });
            }

            // Add the block with all configured properties
            addBlock(blockConfig, dropArea.id);

            toast.dismiss(loadingToast);
            toast.success("Datei erfolgreich hochgeladen");

          } catch (error) {
            console.error("Error handling file drop:", error);
            toast.dismiss(loadingToast);
            const message = error instanceof Error ? error.message : "Fehler beim Verarbeiten der Datei";
            toast.error(message);
          }
        })(); // End of async IIFE

        return {
            name: "Datei-Upload gestartet",
          handled: true,
          dropAreaId: dropArea.id,
        };
      }

      // Handle Media Item Drops (ItemTypes.MEDIA)
      else if (itemType === ItemTypes.MEDIA) {
        // Casting zu MediaItemInput, da wir den Typ überprüft haben
        const mediaItem = item as MediaItemInput;

        let finalBlockType: BlockType['type'] = 'document'; // Default
        const fileType = mediaItem.file_type.toLowerCase();

        // Bestimme den Block-Typ basierend auf dem file_type des Media-Items
        if (fileType.startsWith('image/')) {
          finalBlockType = 'image';
        } else if (fileType.startsWith('video/')) {
          finalBlockType = 'video';
        } else if (fileType.startsWith('audio/')) {
          finalBlockType = 'audio';
        } else {
          // Bleibt 'document' für PDF, Word etc.
          finalBlockType = 'document';
        }

        // Erstelle die Konfiguration für den neuen Block
        const blockConfig: Partial<BlockType> & { type: BlockType['type']; content: string } = {
            type: finalBlockType,
            content: mediaItem.url, // Verwende die URL aus dem Media-Item
        };

        // Füge typspezifische Eigenschaften hinzu
        if (finalBlockType === 'image') {
            Object.assign(blockConfig, {
                altText: mediaItem.file_name, // Verwende file_name als altText
                previewUrl512: mediaItem.preview_url_512,
                previewUrl128: mediaItem.preview_url_128
            });
        } else if (finalBlockType === 'video') {
            Object.assign(blockConfig, {
                // Videos haben keine speziellen Props außer Previews (optional)
                previewUrl512: mediaItem.preview_url_512,
                previewUrl128: mediaItem.preview_url_128
            });
        } else if (finalBlockType === 'document') {
            Object.assign(blockConfig, {
                fileName: mediaItem.file_name, // Verwende file_name als fileName
                // Keine spezifische Vorschau-URL für Dokumente aus der Library momentan
            });
        }
        // Audio hat keine zusätzlichen spezifischen Props

        // Füge den Block zum Store hinzu (innerhalb setTimeout für Konsistenz)
        setTimeout(() => {
            addBlock(blockConfig as BlockType, dropArea.id);
        }, 0);

        console.log(`[${dropOpId}] DropAreaHook ${dropArea.id}: Added new block ${finalBlockType} from dropped media item ${mediaItem.id}`);
        toast.success(`${mediaItem.file_name} hinzugefügt.`);

        return {
          name: `Media Item ${mediaItem.id} hinzugefügt`,
          handled: true,
          dropAreaId: dropArea.id
        };
      }

      // --- Handle BLOCK and EXISTING_BLOCK types ---
      else if (itemType === ItemTypes.BLOCK || itemType === ItemTypes.EXISTING_BLOCK || itemType === ItemTypes.SQUARE) {
          // Type assertion: Now we know item has the properties for BLOCK/EXISTING_BLOCK
          const blockItem = item as { type: typeof ItemTypes.BLOCK | typeof ItemTypes.EXISTING_BLOCK | typeof ItemTypes.SQUARE; id?: string; content: string; sourceDropAreaId?: string; };

          const isAreaEmpty = dropArea.blocks.length === 0;
          // Verwende blockItem.sourceDropAreaId hier
          const isExistingBlock = blockItem.sourceDropAreaId !== undefined;
          // Verwende blockItem.sourceDropAreaId und blockItem.id hier
          const isExternalBlock = isExistingBlock && blockItem.sourceDropAreaId !== dropArea.id && blockItem.id;

          const shouldHandleDrop = isAreaEmpty || isExternalBlock;

          if (!shouldHandleDrop) {
              console.log(
                  `[${dropOpId}] DropAreaHook ${dropArea.id}: Delegating drop to nested handlers for block.`
              );
              return undefined;
          }

          try {
              // Handle NEW block dropped into EMPTY area
              if (!isExistingBlock && isAreaEmpty) {
                  const result = {
                      name: `Added Block to ${dropArea.id}`,
                      handled: true,
                      dropAreaId: dropArea.id,
                  };

                  // FIX: Validate the block type before adding
                  const validBlockTypesForNew: BlockType['type'][] = ['paragraph', 'image', 'video', 'audio', 'document', 'heading'];
                  let blockTypeToAdd: BlockType['type'];

                  if (blockItem.type && validBlockTypesForNew.includes(blockItem.type as BlockType['type'])) {
                      blockTypeToAdd = blockItem.type as BlockType['type'];
                  } else {
                      console.warn(`Invalid or missing block type "${String(blockItem.type)}" dropped. Defaulting to paragraph.`);
                      blockTypeToAdd = 'paragraph';
                  }

                  setTimeout(() => {
                      addBlock(
                          {
                              type: blockTypeToAdd,
                              content: blockItem.content || "", // Verwende blockItem.content
                              dropAreaId: dropArea.id,
                              ...(blockTypeToAdd === 'image' && { altText: 'New Image' }),
                              ...(blockTypeToAdd === 'document' && { fileName: 'New Document' }),
                          },
                          dropArea.id
                      );
                  }, 0);

                  console.log(`[${dropOpId}] DropAreaHook ${dropArea.id}: Added new block ${blockTypeToAdd}`);
                  return result;
              }

              // Handle EXISTING block moved into this area (empty or populated)
              // Verwende blockItem.id und blockItem.sourceDropAreaId
              if (isExistingBlock && blockItem.id && blockItem.sourceDropAreaId) {
                  const result = {
                      name: `Moved Block ${blockItem.id} to ${dropArea.id}`,
                      handled: true,
                      dropAreaId: dropArea.id,
                  };
                  setTimeout(() => {
                      moveBlock(blockItem.id!, blockItem.sourceDropAreaId!, dropArea.id);
                  }, 0);

                  console.log(`[${dropOpId}] DropAreaHook ${dropArea.id}: Moved existing block ${blockItem.id}`);
                  return result;
              }

          } catch (error) {
              console.error(
                  `[${dropOpId}] DropAreaHook ${dropArea.id}: Error during block drop:`, error
              );
              setDropError(
                  error instanceof Error ? error.message : "An unknown error occurred"
              );
              setIsHovering(false);
              return undefined;
          }
      }
      // Fallback, wenn kein Typ passt (sollte nicht passieren)
      else {
          // Umschließe itemType mit String() für die Konsolenausgabe
          console.warn(`[${dropOpId}] DropAreaHook ${dropArea.id}: Unhandled item type dropped: ${String(itemType)}`);
          return undefined;
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver({ shallow: true }),
      canDrop: !!monitor.canDrop(),
    }),
  }, [dropArea.id, dropArea.blocks.length, moveBlock, addBlock, user, supabaseClient]);

  // Helper function to check mouse proximity to element edges
  const isNearEdge = (
    mousePos: { x: number; y: number },
    element: HTMLElement | null
  ): boolean => {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    const edgeThreshold = 30; // Pixels from edge to trigger merge indicator

    // Check proximity to left or right edge for horizontal merging
    const nearLeftEdge = Math.abs(mousePos.x - rect.left) < edgeThreshold;
    const nearRightEdge = Math.abs(mousePos.x - rect.right) < edgeThreshold;

    // Ensure mouse is vertically within the element bounds (plus some tolerance)
    const verticalTolerance = 10;
    const isVerticallyInside =
      mousePos.y >= rect.top - verticalTolerance &&
      mousePos.y <= rect.bottom + verticalTolerance;

    return isVerticallyInside && (nearLeftEdge || nearRightEdge);
  };

  // --- Merge Logic ---

  // Check if this drop area can be merged with a sibling
  // This effect runs when hovering state or mouse position changes
  useEffect(() => {
    // Conditions to check for merge: hovering, have mouse position, have element ref
    if (!isHovering || !mousePosition || !dropTargetRef.current) {
      // If not hovering or missing data, ensure merge target is cleared
      if (mergeTarget !== null) {
        // console.log( // Removed log
        //   `${dropArea.id}: Clearing merge target (not hovering or missing data)`
        // );
        setMergeTarget(null);
      }
      return;
    }

    // Check proximity: Only proceed if mouse is near the edge
    if (!isNearEdge(mousePosition, dropTargetRef.current)) {
      // If not near edge, ensure merge target is cleared
      if (mergeTarget !== null) {
        // console.log(`${dropArea.id}: Clearing merge target (not near edge)`); // Removed log
        setMergeTarget(null);
      }
      return;
    }

    // --- Proximity check passed, proceed with merge logic ---
    // console.log(`${dropArea.id}: Near edge, checking merge possibility...`); // Removed log

    // We need to be part of a split area to merge
    if (!dropArea.parentId) {
      if (mergeTarget !== null) {
        // console.log( // Removed log
        //   `${dropArea.id}: Clearing merge target because no parent ID`
        // );
        setMergeTarget(null);
      }
      return;
    }

    // Find our parent area using the parentId, only if parentId exists
    const parent = dropArea.parentId
      ? findDropAreaById(dropAreas, dropArea.parentId)
      : null;
    if (!parent || !parent.isSplit || parent.splitAreas.length !== 2) {
      if (mergeTarget !== null) {
        // console.log( // Removed log
        //   `${dropArea.id}: Clearing merge target because no valid parent found`
        // );
        setMergeTarget(null);
      }
      return;
    }

    // Find our sibling - we need a valid sibling to merge with
    const sibling = parent.splitAreas.find(
      (area: DropAreaType) => area.id !== dropArea.id
    ); // Added type DropAreaType
    if (!sibling) {
      if (mergeTarget !== null) {
        // console.log( // Removed log
        //   `${dropArea.id}: Clearing merge target because no sibling found`
        // );
        setMergeTarget(null);
      }
      return;
    }

    // Check if we can merge with the sibling (based on merge rules)
    if (canMerge(dropArea.id, sibling.id)) {
      // Only update if changing
      if (mergeTarget !== sibling.id) {
        // console.log(`${dropArea.id}: Setting merge target to ${sibling.id}`); // Removed log

        // Set the merge position based on which side we're on
        const isLeftArea = parent.splitAreas[0].id === dropArea.id;
        setMergePosition(isLeftArea ? "right" : "left");

        // Set the merge target (this should be last to ensure all other state is set first)
        setMergeTarget(sibling.id);
      }
    } else {
      // Clear the merge target if we can't merge
      if (mergeTarget !== null) {
        // console.log( // Removed log
        //   `${dropArea.id}: Clearing merge target because cannot merge with sibling`
        // );
        setMergeTarget(null);
      }
    }
  }, [
    isHovering,
    dropArea.id,
    dropArea.parentId,
    dropAreas,
    canMerge,
    mergeTarget,
    mousePosition, // Add mousePosition as dependency
  ]);

  // Determine visual cues based on drop state
  const getDropAreaStyles = () => {
    let baseClasses =
      "w-full min-h-[120px] rounded-xl border-2 relative bento-box transition-all duration-200";

    // Empty drop area has dashed border, populated has solid but subtle border
    if (dropArea.blocks.length === 0) {
      baseClasses += " border-dashed";
    } else {
      // For populated areas, show a subtle border when hovered
      baseClasses += isHovering ? " border-border" : " border-transparent";
    }

    // Visual cues for drag operations (Simplified)
    if (isOver && canDrop) {
      // Active drop target - strong visual cue
      baseClasses += " border-primary bg-primary/10 scale-[1.02] shadow-lg";
      // Removed isHoveringBetween logic
    } else if (canDrop) {
      // Potential drop target (item is draggable but not hovering) - subtle visual cue
      // Note: This state might not be visually distinct if isHovering is also true
      baseClasses += " border-primary/50 bg-primary/5";
    } else if (isHovering && dropArea.blocks.length > 0) {
      // Just hovering, not necessarily a valid drop target
      // Hovering over populated area - subtle highlight
      baseClasses += " bg-background/80 shadow-md";
    } else {
      // Default state
      baseClasses += " border-border";
    }

    // Add merge target highlight
    if (mergeTarget) {
      baseClasses += " border-green-500 bg-green-50/30";
    }

    // Add error state if there was a drop error
    if (dropError) {
      baseClasses += " border-red-500 bg-red-50";
    }

    return baseClasses;
  };

  const handleSplit = () => {
    // Pass viewport to canSplit
    if (canSplit(dropArea.id, viewport)) {
      splitDropArea(dropArea.id);
    }
  };

  const handleMerge = () => {
    if (mergeTarget) {
      mergeDropAreas(dropArea.id, mergeTarget);
    }
  };

  // Only show split indicator if:
  // 1. The area is being hovered
  // 2. The area is not currently being dragged over
  // 3. The area doesn't have any blocks yet
  // 4. The area can be split (based on split level restrictions)
  // Note: We allow showing the split indicator for empty areas even if they are part of a split
  const shouldShowSplitIndicator = (showSplitIndicator: boolean) => {
    // Pass viewport to canSplit
    const isSplittable = canSplit(dropArea.id, viewport);

    const shouldShow =
      showSplitIndicator &&
      isHovering &&
      !isOver &&
      dropArea.blocks.length === 0 &&
      isSplittable; // Use the result from canSplit
    // Removed !mergeTarget check here, will check against shouldShowMergeIndicator result

    // Determine if merge indicator *should* show based on proximity and merge target
    const showMerge = shouldShowMergeIndicator();

    // Final decision: Show split only if basic conditions met AND merge indicator isn't showing
    const finalShouldShow = shouldShow && !showMerge;

    // --- DEBUG LOGGING ---
    // Only log if the state might be relevant (hovering or indicator was expected)
    // if (isHovering || finalShouldShow) { // Removed log block
    //   // Update log condition
    //   console.log(`[Split Indicator Debug] Area: ${dropArea.id}`, {
    //     "Prop: showSplitIndicator": showSplitIndicator,
    //     "State: isHovering": isHovering,
    //     "State: isOver": isOver,
    //     "State: isEmpty": dropArea.blocks.length === 0,
    //     "Result: canSplit()": isSplittable,
    //     "State: mergeTarget": mergeTarget, // Keep for context
    //     "Check: shouldShowMergeIndicator()": showMerge, // Add merge check result
    //     "FINAL shouldShow": finalShouldShow, // Log final decision
    //     "Area Details": {
    //       id: dropArea.id,
    //       splitLevel: dropArea.splitLevel,
    //       isSplit: dropArea.isSplit,
    //       parentId: dropArea.parentId,
    //     },
    //     viewport: viewport,
    //   });
    // }
    // --- END DEBUG LOGGING ---

    return finalShouldShow; // Return the refined value
  };

  // Show merge indicator ONLY if we have a merge target AND mouse is near edge
  // This function remains the same, but its result is now used by shouldShowSplitIndicator
  const shouldShowMergeIndicator = () => {
    const nearEdge =
      mousePosition && dropTargetRef.current
        ? isNearEdge(mousePosition, dropTargetRef.current)
        : false;
    const showMerge = isHovering && mergeTarget !== null && !isOver && nearEdge;
    // Optional: Add similar debug log here if needed
    // if (isHovering && mergeTarget) {
    //   console.log(`[Merge Indicator Debug] Area: ${dropArea.id}`, { nearEdge, mergeTarget, isHovering, isOver, showMerge });
    // }
    return showMerge;
  };

  return {
    isOver,
    canDrop,
    isHovering,
    setIsHovering,
    drop: (el: HTMLDivElement | null) => {
      dropTargetRef.current = el;
      drop(el);
    },
    getDropAreaStyles,
    handleSplit,
    handleMerge,
    shouldShowSplitIndicator,
    shouldShowMergeIndicator,
    mergePosition,
    dropError,
  };
};
