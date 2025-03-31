"use client";

import { useDrop } from "react-dnd";
import { useState, useEffect } from "react";
import { ItemTypes } from "@/lib/item-types";
import { useBlocksStore } from "@/store/blocks-store";
import type { DropAreaType } from "@/lib/types";
import type { ViewportType } from "@/lib/hooks/use-viewport";
import { findParentOfSplitAreas } from "@/lib/utils/drop-area-utils";
import type { DropTargetMonitor } from "react-dnd";

interface DragItem {
  id?: string;
  type: string;
  content: string;
  sourceDropAreaId?: string;
  isHoveringBetween?: boolean;
}

export const useDropArea = (dropArea: DropAreaType, viewport: ViewportType) => {
  const {
    addBlock,
    moveBlock,
    canSplit,
    splitDropArea,
    canMerge,
    mergeDropAreas,
    dropAreas,
  } = useBlocksStore();

  const [isHovering, setIsHovering] = useState(false);
  const [dropError, setDropError] = useState<string | null>(null);
  const [mergeTarget, setMergeTarget] = useState<string | null>(null);
  const [mergePosition, setMergePosition] = useState<"left" | "right" | "both">(
    "both"
  );

  const [{ isOver, canDrop, isHoveringBetween }, drop] = useDrop<
    DragItem,
    { name: string } | undefined,
    { isOver: boolean; canDrop: boolean; isHoveringBetween: boolean }
  >({
    accept: [ItemTypes.BLOCK, ItemTypes.SQUARE, ItemTypes.EXISTING_BLOCK],
    hover: (item: DragItem, monitor: DropTargetMonitor<DragItem>) => {
      // Skip if this is a child element's hover event bubbling up
      if (monitor.isOver({ shallow: false })) {
        const clientOffset = monitor.getClientOffset();
        const element = (monitor as any).getTargetElement() as Element | null;
        const dropTargetRect = element?.getBoundingClientRect();

        if (!clientOffset || !dropTargetRect) return;

        // Calculate relative position in the drop target
        const relativeY = clientOffset.y - dropTargetRect.top;
        const relativePercent = relativeY / dropTargetRect.height;

        // Check if we're hovering near the top or bottom edge (within 20% of the edge)
        const isNearEdge = relativePercent <= 0.2 || relativePercent >= 0.8;

        if (isNearEdge) {
          // Find this area's index in the root areas
          const areaIndex = dropAreas.findIndex(
            (area) => area.id === dropArea.id
          );
          if (areaIndex === -1) return;

          // Check if we have populated areas above and below
          const prevArea = areaIndex > 0 ? dropAreas[areaIndex - 1] : null;
          const nextArea =
            areaIndex < dropAreas.length - 1 ? dropAreas[areaIndex + 1] : null;

          const isPrevPopulated = prevArea && prevArea.blocks.length > 0;
          const isNextPopulated = nextArea && nextArea.blocks.length > 0;

          if (isPrevPopulated && isNextPopulated) {
            // We're between two populated areas
            item.isHoveringBetween = true;
          }
        }
      }
    },
    drop: (item: DragItem, monitor) => {
      try {
        // Skip if this is a child element's drop event bubbling up
        if (monitor.didDrop()) {
          return;
        }

        if (item.sourceDropAreaId && item.id) {
          // This is an existing block being moved
          if (item.sourceDropAreaId === dropArea.id) {
            // If it's within the same drop area, let the child components handle it
            return;
          }

          // If we're hovering between populated areas, create a new area
          if (item.isHoveringBetween) {
            const areaIndex = dropAreas.findIndex(
              (area) => area.id === dropArea.id
            );
            if (areaIndex !== -1) {
              const newAreaId = `drop-area-${Date.now()}`;
              const newArea: DropAreaType = {
                id: newAreaId,
                blocks: [],
                isSplit: false,
                splitAreas: [],
                splitLevel: 0,
              };

              // Insert the new area at the current position
              const updatedAreas = [...dropAreas];
              updatedAreas.splice(areaIndex, 0, newArea);

              // Move the block to the new area
              moveBlock(item.id, item.sourceDropAreaId, newAreaId);
              return;
            }
          }

          // Moving between different drop areas
          moveBlock(item.id, item.sourceDropAreaId, dropArea.id);
        } else {
          // This is a new block being added
          addBlock(
            {
              type: item.type || "square",
              content: item.content || "Dropped Square",
              dropAreaId: dropArea.id,
            },
            dropArea.id
          );
        }
        setDropError(null);
        return { name: `Drop Area ${dropArea.id}` };
      } catch (error) {
        console.error("Error during drop operation:", error);
        setDropError("Failed to drop item");
        return undefined;
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver({ shallow: true }), // Only detect direct drops, not nested ones
      canDrop: !!monitor.canDrop(),
      isHoveringBetween:
        (monitor.getItem() as DragItem | null)?.isHoveringBetween || false,
    }),
  });

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

    // Visual cues for drag operations
    if (isOver && canDrop) {
      if (isHoveringBetween) {
        // Hovering between populated areas - show insertion indicator
        baseClasses += " border-primary bg-primary/20 scale-[1.02] shadow-lg";
      } else {
        // Active drop target - strong visual cue
        baseClasses += " border-primary bg-primary/10 scale-[1.02] shadow-lg";
      }
    } else if (canDrop) {
      // Potential drop target - subtle visual cue
      baseClasses += " border-primary/50 bg-primary/5";
    } else if (isHovering && dropArea.blocks.length > 0) {
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
    drop,
    getDropAreaStyles,
    handleSplit,
    handleMerge,
    shouldShowSplitIndicator,
    shouldShowMergeIndicator,
    mergePosition,
    dropError,
  };
};
