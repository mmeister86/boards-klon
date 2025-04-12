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

interface DragItem {
  id?: string; // ID of the block being dragged (if existing)
  type: string; // Type of the block (e.g., 'heading', 'paragraph')
  content: string; // Default content for new blocks
  sourceDropAreaId?: string; // Original drop area ID (if moving existing block)
  files?: File[]; // Add files for NativeTypes.FILE
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
    DragItem,
    { name: string; handled: boolean; dropAreaId: string } | undefined,
    { isOver: boolean; canDrop: boolean }
  >({
    accept: [ItemTypes.BLOCK, ItemTypes.SQUARE, ItemTypes.EXISTING_BLOCK, NativeTypes.FILE],

    canDrop: (item: DragItem, monitor) => {
      // Handle file drops
      if (monitor.getItemType() === NativeTypes.FILE) {
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

      // Default canDrop behavior for other item types
      return true;
    },

    hover: (
      item: DragItem,
      monitor: DropTargetMonitor<DragItem, { name: string } | undefined>
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

    drop: (item: DragItem, monitor) => {
      const dropOpId = `drop_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

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

      // Handle file drops
      if (monitor.getItemType() === NativeTypes.FILE) {
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
          const fileType = supportedFile.type.toLowerCase();

          try {
            // --- Corrected Routing Logic ---
            if (fileType.startsWith('image/')) {
              finalBlockType = 'image';
              const formData = new FormData();
              formData.append("file", supportedFile);
              console.log(`useDropArea: Calling IMAGE optimize route for ${supportedFile.name}`);
              const response = await fetch("/api/optimize-image", {
                method: "POST",
                body: formData,
                credentials: 'include',
              });
              const result = await response.json();
              if (!response.ok) throw new Error(result.error || `Image upload failed (Status: ${response.status})`);

              const imageUrl = result.publicUrl;
              // NEU: Extrahiere Vorschau-URLs
              const previewUrl512 = result.previewUrl512 ?? null;
              const previewUrl128 = result.previewUrl128 ?? null;

              if (!imageUrl) {
                  throw new Error("Image upload succeeded but no URL returned.");
              }
              url = imageUrl;
              console.log(`useDropArea: Image API success. URL: ${url}, Preview512: ${previewUrl512}, Preview128: ${previewUrl128}`);

              // ÄNDERUNG: Übergib Vorschau-URLs an addMediaItemToDatabase (Annahme: Funktion wurde angepasst)
              // Note: You need to modify the actual definition of addMediaItemToDatabase as well
              await addMediaItemToDatabase(
                supportedFile,
                imageUrl,
                user.id,
                supabaseClient,
                null,
                previewUrl512,
                previewUrl128
              );

            } else if (fileType.startsWith('video/')) {
              finalBlockType = 'video';
              const formData = new FormData();
              formData.append("video", supportedFile);
              if (user?.id) {
                formData.append("userId", user.id);
              } else {
                throw new Error("Cannot upload video without User ID.");
              }
              console.log(`useDropArea: Calling VIDEO optimize route for ${supportedFile.name}`);
              const response = await fetch("/api/optimize-video", {
                method: "POST",
                body: formData,
                credentials: 'include',
              });
              console.log(`useDropArea: Video API response status: ${response.status}`); // Log status

              const result = await response.json();
              // Log the actual parsed result EXACTLY as the client sees it
              console.log("useDropArea: Parsed JSON response from video API:", JSON.stringify(result, null, 2));

              if (!response.ok) {
                 const errorMessage = result?.error || `Video upload failed (Status: ${response.status})`;
                 console.error("useDropArea: Video API fetch not ok.", errorMessage); // Log error before throwing
                 throw new Error(errorMessage);
              }

              // Explicitly check the keys we expect from the API route
              const receivedStorageUrl = result.storageUrl;
              const receivedPublicUrl = result.publicUrl;

              console.log(`useDropArea: Checking received URLs - storageUrl: ${receivedStorageUrl}, publicUrl: ${receivedPublicUrl}`); // Log values being checked

              // Assign URL if either key exists
              let videoUrl: string | null = null;
              if (receivedStorageUrl) {
                  videoUrl = receivedStorageUrl;
              } else if (receivedPublicUrl) {
                  videoUrl = receivedPublicUrl;
              }

              // Check if URL was successfully assigned before proceeding
              if (!videoUrl) {
                 console.error("useDropArea: Video API response missing BOTH storageUrl and publicUrl. Parsed Response:", result);
                 throw new Error("Video upload succeeded but no URL returned.");
              }
              // Assign to the outer scope url *after* validation
              url = videoUrl;
              console.log(`useDropArea: Video API success. URL assigned: ${url}`);
              // We need to ensure addMediaItemToDatabase handles null for preview URLs here
              await addMediaItemToDatabase(
                supportedFile,
                videoUrl!,
                user.id,
                supabaseClient,
                null,
                null
              );

            } else if (fileType.startsWith('audio/')) {
              finalBlockType = 'audio';
              // Erstellt FormData für die Audio-API.
              const formData = new FormData();
              formData.append("audio", supportedFile); // Korrekter Schlüssel 'audio'
              if (user?.id) {
                formData.append("userId", user.id); // userId hinzufügen
              } else {
                throw new Error("Cannot upload audio without User ID.");
              }
              console.log(`useDropArea: Calling AUDIO optimize route for ${supportedFile.name}`);
              // Ruft die Audio-Optimierungs-API auf.
              const response = await fetch("/api/optimize-audio", {
                method: "POST",
                body: formData,
                credentials: 'include',
              });
              console.log(`useDropArea: Audio API response status: ${response.status}`);

              const result = await response.json();
              console.log("useDropArea: Parsed JSON response from audio API:", JSON.stringify(result, null, 2));

              if (!response.ok) {
                 const errorMessage = result?.error || `Audio upload failed (Status: ${response.status})`;
                 console.error("useDropArea: Audio API fetch not ok.", errorMessage);
                 throw new Error(errorMessage);
              }

              // Erwartet 'storageUrl' von der Audio-API.
              const audioUrl = result.storageUrl;
              if (!audioUrl) {
                 console.error("useDropArea: Audio API response missing storageUrl. Parsed Response:", result);
                 throw new Error("Audio upload succeeded but no URL returned.");
              }
              // Weist die URL der äußeren Variable zu.
              url = audioUrl;
              console.log(`useDropArea: Audio API success. URL assigned: ${url}`);
              // We need to ensure addMediaItemToDatabase handles null for preview URLs here
              await addMediaItemToDatabase(
                supportedFile,
                audioUrl!,
                user.id,
                supabaseClient,
                null,
                null
              );

            } else if (fileType === 'application/pdf') {
              finalBlockType = 'document'; // PDF wird als Dokument behandelt
              const formData = new FormData();
              formData.append("pdf", supportedFile); // 'pdf'-Schlüssel verwenden
              if (user?.id) {
                formData.append("userId", user.id);
              } else {
                throw new Error("Cannot upload PDF without User ID.");
              }
              console.log(`useDropArea: Calling PDF optimize route for ${supportedFile.name}`);
              const response = await fetch("/api/optimize-pdf", { // PDF-API-Route aufrufen
                method: "POST",
                body: formData,
                credentials: 'include',
              });
              console.log(`useDropArea: PDF API response status: ${response.status}`);

              const result = await response.json();
              console.log("useDropArea: Parsed JSON response from PDF API:", JSON.stringify(result, null, 2));

              if (!response.ok) {
                 const errorMessage = result?.error || `PDF upload failed (Status: ${response.status})`;
                 console.error("useDropArea: PDF API fetch not ok.", errorMessage);
                 throw new Error(errorMessage);
              }

              // Erwartet 'storageUrl' UND 'previewUrl' von der PDF-API.
              const pdfUrl = result.storageUrl;
              const previewUrl = result.previewUrl; // Hole die previewUrl
              if (!pdfUrl) { // Haupt-URL ist entscheidend
                 console.error("useDropArea: PDF API response missing storageUrl. Parsed Response:", result);
                 throw new Error("PDF optimization succeeded but main URL (storageUrl) is missing.");
              }
              url = pdfUrl; // Haupt-URL für den Block-Content

              // FIX: Übergib die previewUrl als fünftes Argument (PDF Vorschau, nicht 512px)
              // We need to ensure addMediaItemToDatabase handles null for the 128px preview URL here
              await addMediaItemToDatabase(
                supportedFile,
                pdfUrl!,
                user.id,
                supabaseClient,
                previewUrl,
                null,
                null
              );

              // Speichere die previewUrl im Block
              if (previewUrl) {
                blockPreviewUrl = previewUrl; // Speichere die Vorschau-URL für den Block
              }

            } else { // Handle OTHER Documents directly (remaining file types)
              // Stellt sicher, dass dies nur für Dokumente gilt.
              finalBlockType = 'document';
              console.log(`useDropArea: Uploading other document directly for ${supportedFile.name}`);
              url = await uploadMediaFile(supportedFile, user.id, supabaseClient); // Direkter Upload
              if (!url) {
                throw new Error("Direct file upload failed to return a URL.");
              }
              console.log(`useDropArea: Direct upload success. URL: ${url}`);
              // We need to ensure addMediaItemToDatabase handles null for preview URLs here
              await addMediaItemToDatabase(
                supportedFile,
                url!,
                user.id,
                supabaseClient,
                null,
                null
              );
            }

            // --- Add block to store (common logic) ---
            if (!url) { // Check url is now assigned
              throw new Error("File processing completed without a valid URL.");
            }

            addBlock(
              {
                type: finalBlockType,
                content: url, // Haupt-URL (PDF, Video, Audio, Bild)
                dropAreaId: dropArea.id,
                // Spezifische Felder für Blocktypen
                ...(finalBlockType === 'image' && { altText: supportedFile.name }),
                ...(finalBlockType === 'document' && {
                    fileName: supportedFile.name,
                    previewUrl: blockPreviewUrl // Füge die previewUrl hinzu (ist undefined wenn nicht vorhanden)
                }),
                // Füge hier ggf. weitere typspezifische Felder hinzu
              },
              dropArea.id
            );

            toast.dismiss(loadingToast);
            toast.success("Datei erfolgreich hochgeladen");

          } catch (error) {
            console.error("Error handling file drop:", error);
            toast.dismiss(loadingToast);
            const message = error instanceof Error ? error.message : "Fehler beim Verarbeiten der Datei";
            toast.error(message);
          }
        })();

        return {
            name: "Datei-Upload gestartet",
          handled: true,
          dropAreaId: dropArea.id,
        };
      }

      // --- Core Logic: Determine if this hook should handle the drop ---
      const isAreaEmpty = dropArea.blocks.length === 0;
      const isExistingBlock = item.sourceDropAreaId !== undefined;
      const isExternalBlock = isExistingBlock && item.sourceDropAreaId !== dropArea.id && item.id;

      // Handle drops only if:
      // 1. Area is empty (for both new and external blocks)
      // 2. OR it's an external block (even to populated areas)
      const shouldHandleDrop = isAreaEmpty || isExternalBlock;

      if (!shouldHandleDrop) {
        console.log(
          `[${dropOpId}] DropAreaHook ${dropArea.id}: Delegating drop to nested handlers.`
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

          if (item.type && validBlockTypesForNew.includes(item.type as BlockType['type'])) {
              blockTypeToAdd = item.type as BlockType['type'];
          } else {
              // Default to paragraph if type is missing or invalid
              console.warn(`Invalid or missing block type \"${item.type}\" dropped. Defaulting to paragraph.`);
              blockTypeToAdd = 'paragraph';
          }

          // Use setTimeout to ensure drop operation completes before state update
          setTimeout(() => {
            addBlock(
              {
                type: blockTypeToAdd, // Use the validated type
                content: item.content || "", // Use provided content or empty string
                dropAreaId: dropArea.id,
                // Add specific props based on the validated type if necessary
                ...(blockTypeToAdd === 'image' && { altText: 'New Image' }), // Example default
                ...(blockTypeToAdd === 'document' && { fileName: 'New Document' }), // Example default
              },
              dropArea.id
            );
          }, 0); // Execute after current event loop tick

          console.log(`[${dropOpId}] DropAreaHook ${dropArea.id}: Added new block ${blockTypeToAdd}`);
          return result;
        }

        // Handle EXISTING block moved into this area (empty or populated)
        if (isExistingBlock && item.id && item.sourceDropAreaId) {
           const result = {
            name: `Moved Block ${item.id} to ${dropArea.id}`,
            handled: true,
            dropAreaId: dropArea.id,
          };
          // Use setTimeout for consistency
          setTimeout(() => {
             moveBlock(item.id!, item.sourceDropAreaId!, dropArea.id);
          }, 0);

          console.log(`[${dropOpId}] DropAreaHook ${dropArea.id}: Moved existing block ${item.id}`);
          return result;
        }

      } catch (error) {
        console.error(
          `[${dropOpId}] DropAreaHook ${dropArea.id}: Error during drop:`,
          error
        );
        setDropError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
        setIsHovering(false);
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
