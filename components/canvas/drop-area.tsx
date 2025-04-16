"use client";

import { ConnectDropTarget, useDrop, DropTargetMonitor } from "react-dnd";
import { NativeTypes } from "react-dnd-html5-backend";
import { useState, useCallback } from "react";
import { useBlocksStore } from "@/store/blocks-store";
import type { DropAreaType } from "@/lib/types";
import type { ViewportType } from "@/lib/hooks/use-viewport";
import { CanvasBlock } from "@/components/blocks/canvas-block";
import { SquareSplitHorizontalIcon as SplitHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface DropAreaProps {
  dropArea: DropAreaType;
  showSplitIndicator?: boolean;
  viewport: ViewportType;
}

// Define type for dropped files
interface FileDropItem {
  files: File[];
}

// Define type for dropped blocks (new or existing)
interface BlockDropItem {
  id?: string; // Present if existing block
  type: string; // Block type from ItemTypes or potentially new block
  content: string;
  sourceDropAreaId?: string; // Present if existing block
}

// Combined type for accepted drop items
type AcceptedDropItem = FileDropItem | BlockDropItem;

export function DropArea({
  dropArea,
  showSplitIndicator = false,
  viewport,
}: DropAreaProps) {
  const { addBlock, splitDropArea, canSplit, moveBlock } = useBlocksStore();
  const [isHovering, setIsHovering] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // --- File Upload Handler ---
  const handleFileUpload = useCallback(
    async (file: File) => {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        console.log(`DropArea: Calling API route for ${file.name}`);

        const response = await fetch("/api/tinify-upload", {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || `Upload failed (Status: ${response.status})`
          );
        }
        if (!result.publicUrl) {
          throw new Error("Upload succeeded but no URL returned.");
        }

        console.log(`DropArea: API success. URL: ${result.publicUrl}`);

        // Add a new image block with the URL
        addBlock(
          {
            type: "image", // Create an image block
            content: result.publicUrl, // Use the returned URL
            altText: file.name, // Use filename as initial alt text
            dropAreaId: dropArea.id,
          },
          dropArea.id
        );
        toast.success(`${file.name} hochgeladen und als Block hinzugefügt.`);
      } catch (error) {
        console.error("DropArea: Upload failed:", error);
        const message =
          error instanceof Error ? error.message : "Unbekannter Upload-Fehler";
        toast.error(`Fehler beim Hochladen von ${file.name}: ${message}`);
      } finally {
        setIsUploading(false);
      }
    },
    [addBlock, dropArea.id]
  ); // Dependencies for useCallback

  // --- useDrop Hook ---
  const [{ isOver, canDrop, itemType }, drop]: [
    { isOver: boolean; canDrop: boolean; itemType: string | symbol | null },
    ConnectDropTarget
  ] = useDrop(
    {
      // --- MODIFIED: Accept NativeTypes.FILE ---
      accept: [
        // ItemTypes.BLOCK, // REMOVED
        // ItemTypes.SQUARE, // REMOVED
        // ItemTypes.EXISTING_BLOCK, // REMOVED
        NativeTypes.FILE,
      ],
      drop: (item: AcceptedDropItem, monitor) => {
        // --- BEGIN ADD LOG ---
        console.log(`[DropArea] Drop occurred on area: ${dropArea.id}`, {
          item,
          itemType: monitor.getItemType(),
          targetAreaBlocksCount: dropArea.blocks.length,
          isTargetSplit: dropArea.isSplit,
        });
        // --- END ADD LOG ---

        const currentItemType = monitor.getItemType();
        console.log("Dropped item type:", currentItemType);

        // --- ADDED: Handle File Drop ---
        if (currentItemType === NativeTypes.FILE) {
          const fileItem = item as FileDropItem;
          if (fileItem.files && fileItem.files.length > 0) {
            // Find the first dropped file that is an image
            const imageFile = fileItem.files.find((f) =>
              f.type.startsWith("image/")
            );
            if (imageFile) {
              handleFileUpload(imageFile); // Trigger the upload process
            } else {
              toast.info(
                "Nur Bilddateien können direkt abgelegt werden, um Blöcke zu erstellen."
              );
            }
          }
        }
        // --- Handle Block/Existing Block Drop (Original Logic) ---
        /* // --- REMOVED BLOCK HANDLING LOGIC ---
        else if (
          currentItemType === ItemTypes.EXISTING_BLOCK ||
          (item as BlockDropItem).sourceDropAreaId
        ) {
          const blockItem = item as BlockDropItem;
          if (blockItem.id && blockItem.sourceDropAreaId) {
            moveBlock(blockItem.id, blockItem.sourceDropAreaId, dropArea.id);
          }
        } else {
          // New block from sidebar
          const blockItem = item as BlockDropItem;
          const blockType: BlockType["type"] =
            blockItem.type &&
            [
              "paragraph",
              "image",
              "video",
              "audio",
              "document",
              "heading",
            ].includes(blockItem.type)
              ? (blockItem.type as BlockType["type"])
              : "paragraph";

          addBlock(
            {
              type: blockType,
              content: blockItem.content || "Dropped Content",
              dropAreaId: dropArea.id,
            },
            dropArea.id
          );
        }
        */ // --- END REMOVED BLOCK HANDLING LOGIC ---
        return { name: `Drop Area ${dropArea.id}` };
      },
      // --- MODIFIED: canDrop check for files ---
      canDrop: (
        item: AcceptedDropItem,
        monitor: DropTargetMonitor<AcceptedDropItem, unknown>
      ) => {
        const currentItemType = monitor.getItemType();
        if (currentItemType === NativeTypes.FILE) {
          // Files can only be dropped if the drop area is currently empty
          // and at least one of the files is an image.
          return (
            dropArea.blocks.length === 0 &&
            (item as FileDropItem).files?.some((f) =>
              f.type.startsWith("image/")
            ) === true
          );
        }
        // Original canDrop logic for blocks
        // REMOVED: return true; // Allow dropping blocks/squares/existing blocks regardless of content
        // --- ADDED: Explicitly return false for non-file types ---
        return false;
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: !!monitor.canDrop(),
        itemType: monitor.getItemType(),
      }),
    },
    [dropArea.id, dropArea.blocks.length, moveBlock, addBlock, handleFileUpload]
  ); // Add dependencies

  // Determine visual cues based on drop state
  const getDropAreaStyles = () => {
    let baseClasses =
      "w-full min-h-[120px] rounded-xl border-2 relative bento-box transition-all duration-200";

    // Empty drop area has dashed border
    if (dropArea.blocks.length === 0) {
      baseClasses += " border-dashed";
    } else {
      baseClasses += " border-transparent";
    }

    // Visual cues for drag operations
    if (isOver && canDrop) {
      // Active drop target - strong visual cue
      baseClasses += " border-primary bg-primary/10 scale-[1.02] shadow-lg";
    } else if (canDrop) {
      // Potential drop target - subtle visual cue
      baseClasses += " border-primary/50 bg-primary/5";
    } else {
      // Default state
      baseClasses += " border-border";
    }

    return baseClasses;
  };

  const handleSplit = () => {
    if (canSplit(dropArea.id, viewport)) {
      splitDropArea(dropArea.id);
    }
  };

  // Only show split indicator if:
  // 1. showSplitIndicator is true
  // 2. The area is being hovered
  // 3. The area is not currently being dragged over
  // 4. The area doesn't have any blocks yet
  // 5. The area is not already split
  // 6. The area can be split (based on split level restrictions)
  const shouldShowSplitIndicator =
    showSplitIndicator &&
    isHovering &&
    !isOver &&
    dropArea.blocks.length === 0 &&
    !dropArea.isSplit &&
    canSplit(dropArea.id, viewport);

  // For mobile viewport, always stack vertically
  if (
    viewport === "mobile" &&
    dropArea.isSplit &&
    dropArea.splitAreas.length === 2
  ) {
    return (
      <div className="w-full space-y-4">
        <DropArea
          dropArea={dropArea.splitAreas[0]}
          showSplitIndicator={false}
          viewport={viewport}
        />
        <DropArea
          dropArea={dropArea.splitAreas[1]}
          showSplitIndicator={false}
          viewport={viewport}
        />
      </div>
    );
  }

  // For tablet viewport with 2x2 grid layout
  if (
    viewport === "tablet" &&
    dropArea.isSplit &&
    dropArea.splitAreas.length === 2
  ) {
    // Check if this is a second-level split (creating a 2x2 grid)
    if (dropArea.splitAreas.some((area) => area.isSplit)) {
      return (
        <div className="w-full grid grid-cols-2 gap-4">
          {/* Render the first split area */}
          {dropArea.splitAreas[0].isSplit ? (
            <>
              <DropArea
                dropArea={dropArea.splitAreas[0].splitAreas[0]}
                showSplitIndicator={false}
                viewport={viewport}
              />
              <DropArea
                dropArea={dropArea.splitAreas[0].splitAreas[1]}
                showSplitIndicator={false}
                viewport={viewport}
              />
            </>
          ) : (
            <DropArea
              dropArea={dropArea.splitAreas[0]}
              showSplitIndicator={showSplitIndicator}
              viewport={viewport}
            />
          )}

          {/* Render the second split area */}
          {dropArea.splitAreas[1].isSplit ? (
            <>
              <DropArea
                dropArea={dropArea.splitAreas[1].splitAreas[0]}
                showSplitIndicator={false}
                viewport={viewport}
              />
              <DropArea
                dropArea={dropArea.splitAreas[1].splitAreas[1]}
                showSplitIndicator={false}
                viewport={viewport}
              />
            </>
          ) : (
            <DropArea
              dropArea={dropArea.splitAreas[1]}
              showSplitIndicator={showSplitIndicator}
              viewport={viewport}
            />
          )}
        </div>
      );
    }

    // First-level split for tablet - side by side
    return (
      <div className="w-full flex gap-4">
        <div className="flex-1 bento-box">
          <DropArea
            dropArea={dropArea.splitAreas[0]}
            showSplitIndicator={showSplitIndicator}
            viewport={viewport}
          />
        </div>
        <div className="flex-1 bento-box">
          <DropArea
            dropArea={dropArea.splitAreas[1]}
            showSplitIndicator={showSplitIndicator}
            viewport={viewport}
          />
        </div>
      </div>
    );
  }

  // For desktop with up to 4-in-a-row layout
  if (
    viewport === "desktop" &&
    dropArea.isSplit &&
    dropArea.splitAreas.length === 2
  ) {
    return (
      <div className="w-full flex gap-4">
        <div className="flex-1 bento-box">
          <DropArea
            dropArea={dropArea.splitAreas[0]}
            showSplitIndicator={showSplitIndicator}
            viewport={viewport}
          />
        </div>
        <div className="flex-1 bento-box">
          <DropArea
            dropArea={dropArea.splitAreas[1]}
            showSplitIndicator={showSplitIndicator}
            viewport={viewport}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      // @ts-expect-error - Suppressing persistent type error with react-dnd ref
      ref={(node: HTMLDivElement | null) => drop(node)}
      className={getDropAreaStyles()}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Drop indicator - show when dragging over */}
      {isOver && canDrop && !isUploading && (
        <div className="absolute inset-0 border-2 border-primary rounded-xl pointer-events-none z-10 flex items-center justify-center">
          <div className="bg-primary/20 rounded-lg px-3 py-1.5 text-sm font-medium text-primary">
            {dropArea.blocks.length === 0 && itemType === NativeTypes.FILE
              ? "Bild hier ablegen"
              : "Element hier ablegen"}
          </div>
        </div>
      )}

      {/* Split indicator - only show under specific conditions */}
      {shouldShowSplitIndicator && (
        <button
          onClick={handleSplit}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-background p-2 rounded-full shadow-md hover:bg-secondary transition-colors"
          title="Split drop area horizontally"
        >
          <SplitHorizontal size={16} className="text-primary" />
        </button>
      )}

      {isUploading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-20 rounded-xl">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">Bild wird verarbeitet...</p>
          </div>
        </div>
      )}

      {dropArea.blocks.length === 0 ? (
        <div className="h-full flex items-center justify-center text-muted-foreground p-8">
          <p className="text-sm">Lege deine Elemente hier ab</p>
        </div>
      ) : (
        <div className="space-y-4 p-4">
          {dropArea.blocks.map((block, index) => (
            <CanvasBlock
              key={block.id}
              block={block}
              viewport={viewport}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}
