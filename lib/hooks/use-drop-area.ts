"use client";

import { useDrop } from "react-dnd";
import { useState, useEffect, useRef } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ItemTypes, markDropHandled } from "@/lib/item-types";
import { useBlocksStore } from "@/store/blocks-store";
// Removed duplicate imports
import type { DropAreaType } from "@/lib/types";
import type { ViewportType } from "@/lib/hooks/use-viewport";
import { findDropAreaById } from "@/lib/utils/drop-area-utils";
import type { DropTargetMonitor } from "react-dnd";

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
    accept: [ItemTypes.BLOCK, ItemTypes.SQUARE, ItemTypes.EXISTING_BLOCK], // Accepts new blocks and existing blocks
    // Simplified hover: Only concerned with direct hover over this specific area
    hover: (
      item: DragItem,
      monitor: DropTargetMonitor<DragItem, { name: string } | undefined>
    ) => {
      // No complex edge detection needed here anymore
      // We still might want to update isHovering state if needed for direct hover styles
      const clientOffset = monitor.getClientOffset(); // Get mouse position
      if (clientOffset) {
        setMousePosition(clientOffset); // Update state
      }

      if (!monitor.isOver({ shallow: true })) {
        if (isHovering) setIsHovering(false); // Clear hover if not over anymore
        setMousePosition(null); // Clear mouse position when not hovering
        return;
      }
      if (!isHovering) setIsHovering(true); // Set hover if over
    },
    drop: (
      item: DragItem,
      monitor: DropTargetMonitor<
        DragItem,
        { name: string; handled: boolean; dropAreaId: string } | undefined
      >
    ) => {
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

      // --- Core Logic: Determine if this hook should handle the drop ---
      const isAreaEmpty = dropArea.blocks.length === 0;
      const isExistingBlock = item.type === ItemTypes.EXISTING_BLOCK;
      const isExternalBlock =
        isExistingBlock && item.sourceDropAreaId !== dropArea.id && item.id;

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
        // Handle new block into empty area
        if (!isExistingBlock && isAreaEmpty) {
          const result = {
            name: `Added Block to ${dropArea.id}`,
            handled: true,
            dropAreaId: dropArea.id,
          };

          setTimeout(() => {
            addBlock(
              {
                type: item.type,
                content: item.content || "",
                dropAreaId: dropArea.id,
              },
              dropArea.id
            );
          }, 0);

          return result;
        }

        // Handle external block move (to either empty or populated area)
        if (isExternalBlock) {
          const result = {
            name: `Moved Block to ${dropArea.id}`,
            handled: true,
            dropAreaId: dropArea.id,
          };

          setTimeout(() => {
            moveBlock(item.id!, item.sourceDropAreaId!, dropArea.id);
          }, 0);

          return result;
        }

        return undefined;
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
    collect: (
      monitor: DropTargetMonitor<DragItem, { name: string } | undefined>
    ) => ({
      isOver: !!monitor.isOver({ shallow: true }), // Is an item hovering directly over this target?
      canDrop: !!monitor.canDrop(), // Can this target accept the dragged item?
    }),
  });

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
