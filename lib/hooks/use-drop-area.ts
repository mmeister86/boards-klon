"use client";

import { useDrop } from "react-dnd";
import { useState, useEffect, useRef } from "react";
import { ItemTypes } from "@/lib/item-types";
import { useBlocksStore } from "@/store/blocks-store";
import type { DropAreaType } from "@/lib/types";
import type { ViewportType } from "@/lib/hooks/use-viewport";
import { findParentOfSplitAreas } from "@/lib/utils/drop-area-utils";
import type { DropTargetMonitor } from "react-dnd"; // Removed XYCoord

interface DragItem {
  id?: string; // ID of the block being dragged (if existing)
  type: string; // Type of the block (e.g., 'heading', 'paragraph')
  content: string; // Default content for new blocks
  sourceDropAreaId?: string; // Original drop area ID (if moving existing block)
}

export const useDropArea = (dropArea: DropAreaType, viewport: ViewportType) => {
  const dropTargetRef = useRef<HTMLDivElement | null>(null);
  // Removed isHoveringBetween and hoverPosition state

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
  const [dropError, setDropError] = useState<string | null>(null);
  const [mergeTarget, setMergeTarget] = useState<string | null>(null);
  const [mergePosition, setMergePosition] = useState<"left" | "right" | "both">(
    "both"
  );

  const [{ isOver, canDrop }, drop] = useDrop<
    DragItem,
    { name: string } | undefined,
    { isOver: boolean; canDrop: boolean }
  >({
    accept: [ItemTypes.BLOCK, ItemTypes.SQUARE, ItemTypes.EXISTING_BLOCK], // Accepts new blocks and existing blocks
    // Simplified hover: Only concerned with direct hover over this specific area
    hover: (
      item: DragItem,
      monitor: DropTargetMonitor<DragItem, { name: string } | undefined>
    ) => {
      // No complex edge detection needed here anymore
      // We still might want to update isHovering state if needed for direct hover styles
      if (!monitor.isOver({ shallow: true })) {
        if (isHovering) setIsHovering(false); // Clear hover if not over anymore
        return;
      }
      if (!isHovering) setIsHovering(true); // Set hover if over
    },
    drop: (
      item: DragItem,
      monitor: DropTargetMonitor<DragItem, { name: string } | undefined>
    ) => {
      // *** IMPORTANT: Check if the drop was already handled by a parent container (the Canvas gap drop) ***
      if (monitor.didDrop()) {
        console.log(
          `DropArea ${dropArea.id}: Drop already handled by parent, ignoring.`
        );
        return undefined; // Let the parent handler deal with it
      }

      // If drop wasn't handled by parent, proceed with dropping directly into this area
      console.log(`DropArea ${dropArea.id}: Handling drop directly.`);
      try {
        // Ensure we are actually over this specific target
        if (!monitor.isOver({ shallow: true })) {
          console.log(
            `DropArea ${dropArea.id}: Drop occurred but not directly over, ignoring.`
          );
          return undefined;
        }

        // Handle moving an existing block
        if (item.sourceDropAreaId && item.id) {
          // Don't allow dropping back into the same area it came from
          if (item.sourceDropAreaId === dropArea.id) {
            console.log(
              `DropArea ${dropArea.id}: Block dropped back into original area, ignoring.`
            );
            return undefined;
          }
          // Move the block to this area
          console.log(
            `DropArea ${dropArea.id}: Moving block ${item.id} from ${item.sourceDropAreaId} to here.`
          );
          moveBlock(item.id, item.sourceDropAreaId, dropArea.id);
        }
        // Handle adding a new block (dragged from sidebar)
        else {
          console.log(
            `DropArea ${dropArea.id}: Adding new block of type ${item.type}.`
          );
          addBlock(
            {
              // Create the block data
              type: item.type || "square", // Default to square if type missing
              content: item.content || "Dropped Content", // Default content
              dropAreaId: dropArea.id, // Assign to this drop area
            },
            dropArea.id // Target drop area ID
          );
        }

        // Return drop result (optional, useful for debugging)
        return { name: `Dropped in Area ${dropArea.id}` };
      } catch (error) {
        console.error(
          `DropArea ${dropArea.id}: Error during drop operation:`,
          error
        );
        setDropError("Failed to drop item"); // Set error state for UI feedback
        return undefined; // Indicate drop failed
      }
      // Removed finally block that reset isHoveringBetween/hoverPosition
    },
    collect: (
      monitor: DropTargetMonitor<DragItem, { name: string } | undefined>
    ) => ({
      isOver: !!monitor.isOver({ shallow: true }), // Is an item hovering directly over this target?
      canDrop: !!monitor.canDrop(), // Can this target accept the dragged item?
    }),
  });

  // --- Merge Logic (remains largely the same) ---

  // Check if this drop area can be merged with a sibling
  // This effect runs when hovering state changes
  useEffect(() => {
    // Only try to identify merge targets when we're actively hovering over this drop area
    // Clear any existing merge target when not hovering
    if (!isHovering) {
      if (mergeTarget !== null) {
        console.log(
          `${dropArea.id}: Clearing merge target because no longer hovering`
        );
        setMergeTarget(null);
      }
      return;
    }

    // We need to be part of a split area to merge
    if (!dropArea.parentId) {
      if (mergeTarget !== null) {
        console.log(
          `${dropArea.id}: Clearing merge target because no parent ID`
        );
        setMergeTarget(null);
      }
      return;
    }

    // Find our parent area
    const parent = findParentOfSplitAreas(dropAreas, dropArea.id, dropArea.id);
    if (!parent || !parent.isSplit || parent.splitAreas.length !== 2) {
      if (mergeTarget !== null) {
        console.log(
          `${dropArea.id}: Clearing merge target because no valid parent found`
        );
        setMergeTarget(null);
      }
      return;
    }

    // Find our sibling - we need a valid sibling to merge with
    const sibling = parent.splitAreas.find((area) => area.id !== dropArea.id);
    if (!sibling) {
      if (mergeTarget !== null) {
        console.log(
          `${dropArea.id}: Clearing merge target because no sibling found`
        );
        setMergeTarget(null);
      }
      return;
    }

    // Check if we can merge with the sibling (based on merge rules)
    if (canMerge(dropArea.id, sibling.id)) {
      // Only update if changing
      if (mergeTarget !== sibling.id) {
        console.log(`${dropArea.id}: Setting merge target to ${sibling.id}`);

        // Set the merge position based on which side we're on
        const isLeftArea = parent.splitAreas[0].id === dropArea.id;
        setMergePosition(isLeftArea ? "right" : "left");

        // Set the merge target (this should be last to ensure all other state is set first)
        setMergeTarget(sibling.id);
      }
    } else {
      // Clear the merge target if we can't merge
      if (mergeTarget !== null) {
        console.log(
          `${dropArea.id}: Clearing merge target because cannot merge with sibling`
        );
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
    const shouldShow =
      showSplitIndicator &&
      isHovering &&
      !isOver &&
      dropArea.blocks.length === 0 &&
      canSplit(dropArea.id, viewport) &&
      !mergeTarget; // Don't show split indicator if we're showing merge indicator

    // For debugging only - log when status changes
    if (shouldShow) {
      console.log(`Split indicator should show for ${dropArea.id}`, {
        showSplitIndicator,
        isHovering,
        isOver,
        emptyBlocks: dropArea.blocks.length === 0,
        canSplitCheck: canSplit(dropArea.id, viewport),
        mergeTarget,
      });
    }

    return shouldShow;
  };

  // Show merge indicator if we have a merge target and we're hovering
  const shouldShowMergeIndicator = () => {
    return isHovering && mergeTarget !== null && !isOver;
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
