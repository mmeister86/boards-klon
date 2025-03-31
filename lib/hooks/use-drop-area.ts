"use client";

import { useDrop } from "react-dnd";
import { useState, useEffect, useRef } from "react";
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
  const dropTargetRef = useRef<HTMLDivElement | null>(null);
  const [isHoveringBetween, setIsHoveringBetween] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<"top" | "bottom" | null>(
    null
  );

  const {
    addBlock,
    moveBlock,
    canSplit,
    splitDropArea,
    canMerge,
    mergeDropAreas,
    dropAreas,
    insertDropArea,
  } = useBlocksStore();

  const [isHovering, setIsHovering] = useState(false);
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
    accept: [ItemTypes.BLOCK, ItemTypes.SQUARE, ItemTypes.EXISTING_BLOCK],
    hover: (item: DragItem, monitor) => {
      if (!monitor.isOver({ shallow: true })) return;

      const clientOffset = monitor.getClientOffset();
      const dropTargetRect = dropTargetRef.current?.getBoundingClientRect();

      if (!clientOffset || !dropTargetRect) {
        setIsHoveringBetween(false);
        setHoverPosition(null);
        return;
      }

      // Calculate relative position in the drop target
      const relativeY = clientOffset.y - dropTargetRect.top;
      const relativePercent = relativeY / dropTargetRect.height;

      // Check if we're hovering near the edges (within 20% of the edge)
      const isNearTop = relativePercent <= 0.2;
      const isNearBottom = relativePercent >= 0.8;

      if (!isNearTop && !isNearBottom) {
        setIsHoveringBetween(false);
        setHoverPosition(null);
        return;
      }

      // Find this area's index in the root areas
      const areaIndex = dropAreas.findIndex((area) => area.id === dropArea.id);
      if (areaIndex === -1) {
        setIsHoveringBetween(false);
        setHoverPosition(null);
        return;
      }

      // Check if we have populated areas above and below
      const prevArea = areaIndex > 0 ? dropAreas[areaIndex - 1] : null;
      const nextArea =
        areaIndex < dropAreas.length - 1 ? dropAreas[areaIndex + 1] : null;

      const isPrevPopulated = prevArea && prevArea.blocks.length > 0;
      const isNextPopulated = nextArea && nextArea.blocks.length > 0;

      // Update hovering state based on position and populated areas
      if (isNearTop && isPrevPopulated) {
        setIsHoveringBetween(true);
        setHoverPosition("top");
      } else if (isNearBottom && isNextPopulated) {
        setIsHoveringBetween(true);
        setHoverPosition("bottom");
      } else {
        setIsHoveringBetween(false);
        setHoverPosition(null);
      }
    },
    drop: (item: DragItem, monitor) => {
      try {
        if (!monitor.isOver({ shallow: true })) return;

        if (item.sourceDropAreaId && item.id) {
          if (item.sourceDropAreaId === dropArea.id) return;

          // If we're hovering between populated areas, create a new area
          if (isHoveringBetween && hoverPosition) {
            const areaIndex = dropAreas.findIndex(
              (area) => area.id === dropArea.id
            );
            if (areaIndex !== -1) {
              // Insert the new area before or after based on hover position
              const insertIndex =
                hoverPosition === "top" ? areaIndex : areaIndex + 1;
              const newAreaId = insertDropArea(insertIndex);

              if (newAreaId) {
                moveBlock(item.id, item.sourceDropAreaId, newAreaId);
                return { name: `Drop Area ${newAreaId}` };
              }
            }
          }

          // Default drop behavior
          moveBlock(item.id, item.sourceDropAreaId, dropArea.id);
        } else {
          addBlock(
            {
              type: item.type || "square",
              content: item.content || "Dropped Square",
              dropAreaId: dropArea.id,
            },
            dropArea.id
          );
        }

        return { name: `Drop Area ${dropArea.id}` };
      } catch (error) {
        console.error("Error during drop operation:", error);
        setDropError("Failed to drop item");
        return undefined;
      } finally {
        setIsHoveringBetween(false);
        setHoverPosition(null);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver({ shallow: true }),
      canDrop: !!monitor.canDrop(),
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
        baseClasses += " border-primary border-4";
        if (hoverPosition === "top") {
          baseClasses += " border-b-0 rounded-b-none";
        } else {
          baseClasses += " border-t-0 rounded-t-none";
        }
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
