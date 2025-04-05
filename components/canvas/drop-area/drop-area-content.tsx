"use client";

import React, { useState, useEffect, useRef } from "react"; // Import useRef
import type { DropAreaType, BlockType } from "@/lib/types";
import type { ViewportType } from "@/lib/hooks/use-viewport";
import { CanvasBlock } from "@/components/blocks/canvas-block";
import { useDrop, type DropTargetMonitor } from "react-dnd";
import { ItemTypes, markDropHandled } from "@/lib/item-types"; // Import markDropHandled
import { useBlocksStore } from "@/store/blocks-store";
import { InsertionIndicator } from "./insertion-indicator"; // Import existing indicator

interface DropAreaContentProps {
  dropArea: DropAreaType;
  viewport: ViewportType;
  onSplitPopulated?: () => void;
  canSplit?: boolean;
}

// Define the types for dragged items this component can accept
interface DraggedExistingBlockItem {
  id: string;
  sourceDropAreaId: string;
  type: typeof ItemTypes.EXISTING_BLOCK; // Use literal type
  originalIndex: number;
  originalType: string; // Add original type
  content: string; // Add content (might be needed by drop handler)
  headingLevel?: number; // Add heading level
}

interface DraggedNewBlockItem {
  id?: string; // New blocks might not have an ID yet
  type: typeof ItemTypes.BLOCK | typeof ItemTypes.SQUARE; // Use literal types
  content: string;
  sourceDropAreaId?: string; // Might not be relevant for new blocks
}

type AcceptedDragItem = DraggedExistingBlockItem | DraggedNewBlockItem;

export function DropAreaContent({
  dropArea,
  viewport,
  onSplitPopulated,
  canSplit = true,
}: DropAreaContentProps) {
  const { reorderBlocks } = useBlocksStore();
  const containerRef = useRef<HTMLDivElement>(null); // Ref for the container
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]); // Refs for each block item
  const [hoverIndex, setHoverIndex] = useState<number | null>(null); // Index for insertion indicator
  const [draggedItemOriginalIndex, setDraggedItemOriginalIndex] = useState<
    number | null
  >(null); // Track original index of dragged item

  // Ensure blockRefs array has the correct size
  useEffect(() => {
    blockRefs.current = blockRefs.current.slice(0, dropArea.blocks.length);
  }, [dropArea.blocks.length]);

  // Removed redundant useEffect for dragEnd listener

  // Expose a reset function globally (use with caution - consider context/store later)
  useEffect(() => {
    // @ts-ignore - Attaching to window for simplicity
    window.resetDropAreaContentHover = () => {
      console.log("[Window Reset] Resetting DropAreaContent hover state");
      setHoverIndex(null);
      setDraggedItemOriginalIndex(null);
    };
    return () => {
      // @ts-ignore
      delete window.resetDropAreaContentHover;
    };
  }, []); // Empty dependency array ensures it runs once

  // --- Container Drop Logic ---
  const [{ isOverContainer, canDropOnContainer }, dropContainer] = useDrop<
    AcceptedDragItem, // Use the union type
    void,
    { isOverContainer: boolean; canDropOnContainer: boolean }
  >({
    // Accept existing blocks being reordered AND new blocks being added
    accept: [ItemTypes.EXISTING_BLOCK, ItemTypes.BLOCK, ItemTypes.SQUARE], // Keep accepting all relevant types
    canDrop: (item) => {
      // Revised logic:
      // Allow drop if:
      // 1. It's NOT an EXISTING_BLOCK (meaning it's a new block type like 'paragraph', 'image', 'button', etc.)
      // OR
      // 2. It IS an EXISTING_BLOCK, but it originates from THIS dropArea (meaning it's being reordered within the same area)
      const isNewBlockType = item.type !== ItemTypes.EXISTING_BLOCK;
      const isReorderingWithinArea =
        item.type === ItemTypes.EXISTING_BLOCK &&
        item.sourceDropAreaId === dropArea.id;

      // EXTRA SAFETY: If it's an existing block from another area, ALWAYS reject it
      const isFromAnotherArea =
        item.type === ItemTypes.EXISTING_BLOCK &&
        item.sourceDropAreaId !== dropArea.id;

      if (isFromAnotherArea) {
        // console.log( // Keep logs commented out
        //   `[DropAreaContent] REJECTING drop for item from another area: ${
        //     (item as DraggedExistingBlockItem).id
        //   } from ${(item as DraggedExistingBlockItem).sourceDropAreaId} to ${
        //     dropArea.id
        //   }`
        // );
        return false;
      }

      const canItDrop = isNewBlockType || isReorderingWithinArea;

      // Add debug info with item details for better troubleshooting
      // const itemDetails = // Keep logs commented out
      //   item.type === ItemTypes.EXISTING_BLOCK
      //     ? `id: ${(item as DraggedExistingBlockItem).id}, sourceArea: ${
      //         (item as DraggedExistingBlockItem).sourceDropAreaId
      //       }, origIndex: ${(item as DraggedExistingBlockItem).originalIndex}`
      //     : `content: ${
      //         (item as DraggedNewBlockItem).content?.substring(0, 15) || "none"
      //       }`;

      // console.log( // Keep logs commented out
      //   `[DropAreaContent] canDrop check for item type ${item.type} (isNew: ${isNewBlockType}, isReorder: ${isReorderingWithinArea}): ${canItDrop}. Item details: ${itemDetails}`
      // );
      return canItDrop;
    },
    hover: (item, monitor: DropTargetMonitor<AcceptedDragItem>) => {
      // Check if item is an existing block to access originalIndex safely
      const isExistingBlock = item.type === ItemTypes.EXISTING_BLOCK;
      const originalIndex = isExistingBlock
        ? (item as DraggedExistingBlockItem).originalIndex
        : null;

      if (!containerRef.current || !monitor.isOver({ shallow: true })) {
        setHoverIndex(null);
        setDraggedItemOriginalIndex(null); // Reset original index tracking too
        return; // Only one return needed
      }

      // Store original index only if it's an existing block
      setDraggedItemOriginalIndex(originalIndex);

      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) {
        setHoverIndex(null); // Clear hover if no offset
        return;
      }

      const hoverClientY = clientOffset.y; // Keep only one declaration
      let calculatedHoverIndex = dropArea.blocks.length; // Default to inserting at the end

      // Use a for loop instead of forEach for proper break functionality
      for (let index = 0; index < blockRefs.current.length; index++) {
        const blockRef = blockRefs.current[index];
        if (!blockRef) continue;

        const domNode = blockRef;
        const hoverBoundingRect = domNode.getBoundingClientRect();
        const hoverMiddleY =
          (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        const hoverClientYRelative = hoverClientY - hoverBoundingRect.top;

        // console.log( // Keep logs commented out
        //   `[Hover Loop Index ${index}] RelativeY: ${hoverClientYRelative.toFixed(
        //     2
        //   )}, MiddleY: ${hoverMiddleY.toFixed(2)}`
        // );

        if (hoverClientYRelative < hoverMiddleY) {
          calculatedHoverIndex = index;
          // console.log( // Keep logs commented out
          //   `[Hover Loop Index ${index}] Condition Met (< middle). Setting index to ${calculatedHoverIndex}. EXITING LOOP.`
          // );
          break; // Use proper break to exit the loop
        } else {
          calculatedHoverIndex = index + 1;
          // console.log( // Keep logs commented out
          //   `[Hover Loop Index ${index}] Condition NOT Met (>= threshold). Setting index to ${calculatedHoverIndex}. Continuing loop.`
          // );
        }
      }

      // console.log( // Keep logs commented out
      //   `Final calculated hover index: ${calculatedHoverIndex}, Original index: ${originalIndex}`
      // );

      // Prevent indicator flicker when dragging existing item over its own position or the gap after it
      if (
        isExistingBlock &&
        (calculatedHoverIndex === originalIndex ||
          calculatedHoverIndex === (originalIndex ?? -1) + 1)
      ) {
        // console.log( // Keep logs commented out
        //   `Setting hover index to null (would be moving to same position)`
        // );
        setHoverIndex(null);
      } else {
        // console.log(`Setting hover index to ${calculatedHoverIndex}`); // Keep logs commented out
        setHoverIndex(calculatedHoverIndex);
      }
    },
    drop: (item, monitor) => {
      // Get the fresh item reference - CRITICAL for proper operation
      const freshItem = monitor.getItem();

      // Create a unique ID for tracking this drop operation
      const dropId = `drop-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}`;
      // console.log( // Keep logs commented out
      //   `[DropAreaContent:${dropId}] Drop triggered for item type: ${freshItem.type}`
      // );

      // IMPORTANT: Check if drop was already handled elsewhere in the hierarchy
      if (monitor.didDrop()) {
        // console.log( // Keep logs commented out
        //   `[DropAreaContent:${dropId}] Drop already handled by another target, ignoring.`
        // );
        setHoverIndex(null);
        setDraggedItemOriginalIndex(null);
        return undefined;
      }

      // Get item ID (for existing blocks use ID, for new blocks use a unique ID)
      const itemId =
        freshItem.type === ItemTypes.EXISTING_BLOCK
          ? (freshItem as DraggedExistingBlockItem).id
          : `new-${freshItem.type}-${Date.now()}`;

      // CRITICAL: Check with the global drop tracker if this drop is already being handled
      if (!markDropHandled(`DropAreaContent-${dropArea.id}`, itemId)) {
        // console.log( // Keep logs commented out
        //   `[DropAreaContent:${dropId}] Drop for item ${itemId} rejected by global tracker`
        // );
        setHoverIndex(null);
        setDraggedItemOriginalIndex(null);
        return undefined;
      }

      // Get the current target index from hover state
      const targetIndex = hoverIndex;
      if (targetIndex === null) {
        // console.log( // Keep logs commented out
        //   `[DropAreaContent:${dropId}] Drop cancelled: No valid hover index`
        // );
        setHoverIndex(null);
        setDraggedItemOriginalIndex(null);
        return undefined;
      }

      try {
        if (freshItem.type === ItemTypes.EXISTING_BLOCK) {
          // This is a reordering operation
          const existingItem = freshItem as DraggedExistingBlockItem;
          const blockId = existingItem.id;
          if (
            existingItem.originalIndex === undefined ||
            existingItem.originalIndex === null
          ) {
            // Falls kein originalIndex vorhanden ist, behandle es als neues Element
            const newItem = freshItem as DraggedNewBlockItem;
            // console.log( // Keep logs commented out
            //   `[DropAreaContent:${dropId}] Adding new block of type ${newItem.type} at index ${targetIndex}`
            // );

            useBlocksStore.getState().addBlockAtIndex(
              {
                type: newItem.type,
                content: newItem.content || "",
                dropAreaId: dropArea.id,
              },
              dropArea.id,
              targetIndex
            );
            // console.log( // Keep logs commented out
            //   `[DropAreaContent:${dropId}] New ${newItem.type} block added at index ${targetIndex}`
            // );

            // Setze den Zustand zurück
            setHoverIndex(null);
            setDraggedItemOriginalIndex(null);
            return undefined;
          }
          const sourceIndex = existingItem.originalIndex;
          const sourceAreaId = existingItem.sourceDropAreaId;

          // We should never reach this check due to the safeguard above, but keep it for robustness
          if (sourceAreaId !== dropArea.id) {
            // console.log( // Keep logs commented out
            //   `[DropAreaContent:${dropId}] Block ${blockId} is from another area (${sourceAreaId}), not reordering`
            // );
            return undefined;
          }

          // Verify valid data
          if (!dropArea.blocks || !Array.isArray(dropArea.blocks)) {
            console.error(
              `[DropAreaContent:${dropId}] Invalid blocks array`,
              dropArea
            );
            return undefined;
          }

          if (sourceIndex < 0 || sourceIndex >= dropArea.blocks.length) {
            console.error(
              `[DropAreaContent:${dropId}] Invalid source index: ${sourceIndex}, length: ${dropArea.blocks.length}`
            );
            return undefined;
          }

          // Prevent dropping in the same spot or right after itself (which is a no-op)
          if (targetIndex === sourceIndex || targetIndex === sourceIndex + 1) {
            // console.log( // Keep logs commented out
            //   `[DropAreaContent:${dropId}] Drop at same position, ignoring`,
            //   { targetIndex, sourceIndex }
            // );
            return undefined;
          }

          // Calculate adjusted target index (if dropping after removal point)
          const adjustedTargetIndex =
            targetIndex > sourceIndex ? targetIndex - 1 : targetIndex;

          // console.log( // Keep logs commented out
          //   `[DropAreaContent:${dropId}] Reordering block ${blockId}:`,
          //   {
          //     from: sourceIndex,
          //     to: adjustedTargetIndex,
          //     blocks: dropArea.blocks.length,
          //   }
          // );

          // Verify the block ID at source index matches
          const blockToMove = dropArea.blocks[sourceIndex];
          if (blockToMove.id !== blockId) {
            console.error(
              `[DropAreaContent:${dropId}] Block ID mismatch at source index!`,
              {
                expected: blockId,
                found: blockToMove.id,
                index: sourceIndex,
              }
            );
            return undefined;
          }

          // Create a new copy of the blocks array
          const newBlocks = [...dropArea.blocks];

          // Remove the item from its original position
          const [movedItem] = newBlocks.splice(sourceIndex, 1);

          // Insert at the new position
          newBlocks.splice(adjustedTargetIndex, 0, movedItem);

          // Apply the reordering
          console.log(
            `[DropAreaContent:${dropId}] Calling reorderBlocks for ${blockId}`
          ); // ADD THIS LOG
          reorderBlocks(dropArea.id, newBlocks);
          console.log(
            `[DropAreaContent:${dropId}] Called reorderBlocks for ${blockId}`
          ); // ADD THIS LOG
        } else {
          // This is a new block being added
          const newItem = freshItem as DraggedNewBlockItem;
          // console.log( // Removed log
          //   `[DropAreaContent:${dropId}] Adding new block of type ${newItem.type} at index ${targetIndex}`
          // );
          // Call the new addBlockAtIndex action
          useBlocksStore.getState().addBlockAtIndex(
            {
              type: newItem.type,
              content: newItem.content || "",
              dropAreaId: dropArea.id, // Pass dropAreaId for the block data
            },
            dropArea.id, // Pass target dropAreaId
            targetIndex // Pass the calculated insertion index
          );
        }
      } catch (error) {
        console.error(
          `[DropAreaContent:${dropId}] Error during drop operation:`,
          error
        );
      }

      // Always reset state
      setHoverIndex(null);
      setDraggedItemOriginalIndex(null);

      // Return undefined to satisfy the type requirement
      return undefined;
    },
    collect: (monitor) => ({
      isOverContainer: !!monitor.isOver({ shallow: true }),
      canDropOnContainer: !!monitor.canDrop(),
    }),
  });

  // Attach drop ref to the container
  dropContainer(containerRef);

  // If drop area is empty, show placeholder
  if (dropArea.blocks.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground p-8">
        <p className="text-sm">Drop blocks here</p>
      </div> // Add closing tag
    );
  }

  // Use the consistent InsertionIndicator component
  // (Assuming it takes no props or suitable defaults)

  return (
    <div
      ref={containerRef} // Attach container ref
      className={`space-y-1 p-4 ${
        isOverContainer && canDropOnContainer ? "bg-primary/5" : "" // Subtle bg on valid hover
      }`}
    >
      {/* Render indicator at the beginning if hoverIndex is 0 */}
      <InsertionIndicator isVisible={hoverIndex === 0} />

      {dropArea.blocks.map((block, index) => (
        <React.Fragment key={block.id}>
          <BlockItem // Use the component defined below
            block={block}
            index={index}
            totalBlocks={dropArea.blocks.length}
            viewport={viewport}
            onSplitPopulated={onSplitPopulated}
            canSplit={canSplit}
            // Assign ref to the block item's wrapper div (ensure void return type)
            ref={(el: HTMLDivElement | null) => {
              blockRefs.current[index] = el;
            }}
            isBeingDragged={draggedItemOriginalIndex === index} // Pass down drag status
          />
          {/* Render indicator between items */}
          <InsertionIndicator isVisible={hoverIndex === index + 1} />
        </React.Fragment>
      ))}
    </div> // Add closing tag
  );
}

// Simplified BlockItem component (forwardRef is needed to pass the ref down)
interface BlockItemProps {
  block: BlockType;
  index: number; // Keep index for potential future use
  totalBlocks: number;
  viewport: ViewportType;
  onSplitPopulated?: () => void;
  canSplit?: boolean;
  isBeingDragged: boolean; // Receive drag status
}

const BlockItem = React.forwardRef<HTMLDivElement, BlockItemProps>(
  (
    {
      block,
      index,
      totalBlocks,
      viewport,
      onSplitPopulated,
      canSplit,
      isBeingDragged, // Use the prop
    },
    ref // Receive the forwarded ref
  ) => {
    return (
      <div
        ref={ref} // Attach the forwarded ref here
        className={`relative transition-opacity duration-200 ${
          // Removed py-1 padding
          isBeingDragged ? "opacity-30" : "opacity-100" // Style when dragged
        }`}
        data-index={index} // Keep data attributes if needed
        data-block-id={block.id}
      >
        <CanvasBlock
          block={block}
          index={index} // Pass index down
          viewport={viewport}
          onSplit={onSplitPopulated}
          canSplit={canSplit}
          isOnlyBlockInArea={totalBlocks === 1}
        />
      </div>
    );
  }
);

// Add display name for React DevTools
BlockItem.displayName = "BlockItem";
