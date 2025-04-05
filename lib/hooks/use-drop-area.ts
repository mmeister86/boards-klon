"use client";

import { useDrop } from "react-dnd";
import { useState, useEffect, useRef } from "react";
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
      monitor: DropTargetMonitor<DragItem, { name: string; handled: boolean; dropAreaId: string } | undefined>
    ) => {
      // Generate a unique ID for this drop operation for tracking in logs
      const dropOpId = `drop_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      // Get item ID - for existing blocks use actual ID, for new blocks generate a unique ID
      const itemId = item.id || `new-${item.type}-${Date.now()}`;

      // *** IMPORTANT: Check if the drop was already handled by a parent container (the Canvas gap drop) ***
      if (monitor.didDrop()) {
        console.log(
          `[${dropOpId}] DropArea ${dropArea.id}: Drop already handled by parent, ignoring.`
        );
        return undefined; // Let the parent handler deal with it
      }
      
      // CRITICAL NEW CHECK: Check with the global drop tracker if this drop is already being handled
      if (!markDropHandled(`DropArea-${dropArea.id}`, itemId)) {
        console.log(
          `[${dropOpId}] DropArea ${dropArea.id}: Drop for item ${itemId} rejected by global tracker.`
        );
        return undefined; // Another handler has claimed this drop
      }

      // If drop wasn't handled by parent, proceed
      console.log(
        `[${dropOpId}] DropArea ${dropArea.id}: Potential drop target.`
      );
      try {
        // EXTRA CHECK: If this is an EXISTING_BLOCK and sourceDropAreaId matches this area
        // Let the internal DropAreaContent handler handle it for reordering
        if (item.type === ItemTypes.EXISTING_BLOCK && item.sourceDropAreaId === dropArea.id) {
          console.log(
            `[${dropOpId}] DropArea ${dropArea.id}: This is a reordering operation within this area. Letting DropAreaContent handle it.`
          );
          return undefined;
        }
        
        // *** NEW CHECK: If this area is populated, let nested targets handle it ***
        // We only handle drops directly here if the area is EMPTY.
        // Drops onto populated areas are handled by DropAreaContent's internal useDrop.
        if (dropArea.blocks.length > 0) {
          console.log(
            `[${dropOpId}] DropArea ${dropArea.id}: Area is populated. Allowing nested drop targets (like DropAreaContent) to handle.`
          );
          
          // CRITICAL FIX: If this is an EXISTING_BLOCK from a different area, we need
          // to handle it at this level regardless of whether the area is populated
          if (item.type === ItemTypes.EXISTING_BLOCK && item.sourceDropAreaId !== dropArea.id && item.id) {
            console.log(
              `[${dropOpId}] DropArea ${dropArea.id}: IMPORTANT - Block is from a different area (${item.sourceDropAreaId}). Handling at this level to prevent duplication.`
            );
            
            // Create a result before modifying state
            const result = {
              name: `Moved to Area ${dropArea.id}`,
              handled: true,
              dropAreaId: dropArea.id,
              dropOpId,
            };
            
            // Move the block in the next event loop tick
            setTimeout(() => {
              console.log(`[${dropOpId}] DropArea ${dropArea.id}: Moving block ${item.id} from ${item.sourceDropAreaId} to ${dropArea.id}`);
              moveBlock(item.id!, item.sourceDropAreaId!, dropArea.id);
            }, 0);
            
            return result;
          }
          
          // For other cases, let the nested handlers handle it
          return undefined;
        }

        // --- Area is EMPTY, proceed with handling the drop directly ---
        // console.log( // Removed log
        //   `[${dropOpId}] DropArea ${dropArea.id}: Area is EMPTY. Handling drop directly.`
        // );

        // Ensure we are actually over this specific target (still relevant for empty areas)
        if (!monitor.isOver({ shallow: true })) {
          // console.log( // Removed log
          //   `[${dropOpId}] DropArea ${dropArea.id}: Drop occurred but not directly over the empty area, ignoring.`
          // );
          return undefined;
        }

        // Handle moving an existing block (rare case: moving into an empty top-level area?)
        if (item.sourceDropAreaId && item.id) {
          // Don't allow dropping back into the same area it came from
          if (item.sourceDropAreaId === dropArea.id) {
            // console.log( // Removed log
            //   `[${dropOpId}] DropArea ${dropArea.id}: Block dropped back into original area, ignoring.`
            // );
            return undefined;
          }

          // console.log( // Removed log
          //   `[${dropOpId}] DropArea ${dropArea.id}: ACCEPTED drop for block ${item.id} from ${item.sourceDropAreaId} to here. Preparing result...`
          // );

          // First, create and return a result BEFORE modifying state
          // This is critical - it tells react-dnd that this handler has claimed this drop
          const result = {
            name: `Dropped in Area ${dropArea.id}`,
            handled: true,
            dropAreaId: dropArea.id,
            dropOpId,
          };

          // Schedule the moveBlock call to run AFTER this drop handler returns
          // console.log( // Removed log
          //   `[${dropOpId}] DropArea ${dropArea.id}: Scheduling moveBlock operation to run AFTER drop completes`
          // );

          // Use setTimeout to move this to the next event loop tick
          setTimeout(() => {
            // console.log( // Removed log
            //   `[${dropOpId}] DropArea ${dropArea.id}: EXECUTING moveBlock(${item.id}, ${item.sourceDropAreaId}, ${dropArea.id})`
            // );
            // Add non-null assertions as item.id and item.sourceDropAreaId are checked above
            moveBlock(item.id!, item.sourceDropAreaId!, dropArea.id);
            // console.log(`[${dropOpId}] DROP OPERATION COMPLETED.`); // Removed log
          }, 0);

          // Return the result immediately
          // console.log( // Removed log
          //   `[${dropOpId}] DropArea ${dropArea.id}: Returning result and ENDING drop handler`,
          //   result
          // );
          return result;
        }
        // Handle adding a new block (dragged from sidebar) into this EMPTY area
        else {
          // console.log( // Removed log
          //   `[${dropOpId}] DropArea ${dropArea.id}: ACCEPTED new block of type ${item.type} into EMPTY area. Preparing result...`
          // );

          // Return a result BEFORE calling addBlock
          const result = {
            name: `Added Block to ${dropArea.id}`,
            handled: true,
            dropAreaId: dropArea.id,
            dropOpId,
          };

          // Schedule the addBlock call to run AFTER this drop handler returns
          // console.log( // Removed log
          //   `[${dropOpId}] DropArea ${dropArea.id}: Scheduling addBlock operation to run AFTER drop completes`
          // );

          // Add the block AFTER setting the result
          setTimeout(() => {
            // console.log( // Removed log
            //   `[${dropOpId}] DropArea ${dropArea.id}: EXECUTING addBlock for new ${item.type} block`
            // );
            addBlock(
              {
                // Create the block data
                type: item.type || "square", // Default to square if type missing
                content: item.content || "Dropped Content", // Default content
                dropAreaId: dropArea.id, // Assign to this drop area
              },
              dropArea.id // Target drop area ID
            );
            // console.log(`[${dropOpId}] DROP OPERATION COMPLETED.`); // Removed log
          }, 0);

          // Return the result immediately
          // console.log( // Removed log
          //   `[${dropOpId}] DropArea ${dropArea.id}: Returning result and ENDING drop handler`,
          //   result
          // );
          return result;
        }
      } catch (error) {
        console.error(
          `[${dropOpId}] DropArea ${dropArea.id}: ERROR during drop operation:`,
          error
        );
        setDropError("Failed to drop item"); // Set error state for UI feedback
        return undefined; // Indicate drop failed
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
