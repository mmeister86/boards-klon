"use client";

import React, { useState, useEffect, useRef } from "react"; // Import useRef
import type { DropAreaType, BlockType } from "@/lib/types";
import type { ViewportType } from "@/lib/hooks/use-viewport";
import { CanvasBlock } from "@/components/blocks/canvas-block";
import { useDrop, type DropTargetMonitor } from "react-dnd";
import { ItemTypes } from "@/lib/item-types";
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

  // Reset hover state when dragging stops
  useEffect(() => {
    const handleDragEnd = () => {
      setHoverIndex(null);
      setDraggedItemOriginalIndex(null);
    };
    window.addEventListener("dragEnd", handleDragEnd);
    return () => window.removeEventListener("dragEnd", handleDragEnd);
  }, []);

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

      const canItDrop = isNewBlockType || isReorderingWithinArea;

      // console.log( // Removed log
      //   `[DropAreaContent] canDrop check for item type ${item.type} (isNew: ${isNewBlockType}, isReorder: ${isReorderingWithinArea}): ${canItDrop}`
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

      // Iterate through rendered block items to find the gap the cursor is over
      blockRefs.current.forEach((blockRef, index) => {
        if (!blockRef) return;
        const domNode = blockRef; // Keep only one declaration
        const hoverBoundingRect = domNode.getBoundingClientRect(); // Keep only one declaration
        const hoverMiddleY =
          (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        const hoverClientYRelative = hoverClientY - hoverBoundingRect.top;

        // Simplified logic: If cursor is above the vertical middle of the item,
        // the insertion index is the item's index. Otherwise, it's after.
        // Use a threshold (e.g., 30% of height) instead of exact middle
        const hoverThreshold = hoverBoundingRect.height * 0.3;
        // console.log( // Keep logs commented out for now
        //   `  [Hover Loop Index ${index}] RelativeY: ${hoverClientYRelative.toFixed(2)}, Threshold: ${hoverThreshold.toFixed(2)}`
        // );
        if (hoverClientYRelative < hoverThreshold) {
          calculatedHoverIndex = index;
          // console.log(`  [Hover Loop Index ${index}] Condition Met (< threshold). Setting index to ${calculatedHoverIndex}. EXITING LOOP.`); // Log decision
          return; // Restore early return
        } else {
          calculatedHoverIndex = index + 1;
          // console.log(`  [Hover Loop Index ${index}] Condition NOT Met (>= threshold). Setting index to ${calculatedHoverIndex}. Continuing loop.`); // Log decision
        }
      });

      // Prevent indicator flicker when dragging existing item over its own position or the gap after it
      if (
        isExistingBlock &&
        (calculatedHoverIndex === originalIndex ||
          calculatedHoverIndex === (originalIndex ?? -1) + 1)
      ) {
        setHoverIndex(null);
      } else {
        setHoverIndex(calculatedHoverIndex);
      }
    },
    drop: (item) => {
      // Use the hoverIndex state which should be correctly calculated by hover()
      const targetIndex = hoverIndex;

      if (targetIndex === null) {
        // console.log("Drop cancelled: Invalid hoverIndex"); // Removed log
        setHoverIndex(null); // Reset state just in case
        setDraggedItemOriginalIndex(null);
        return; // Don't proceed if targetIndex is invalid
      }

      // Handle drop based on item type
      if (item.type === ItemTypes.EXISTING_BLOCK) {
        // Reordering an existing block
        const existingItem = item as DraggedExistingBlockItem;
        const sourceIndex = existingItem.originalIndex;

        // Adjust target index if it's after the original position due to removal
        const adjustedTargetIndex =
          targetIndex > sourceIndex ? targetIndex - 1 : targetIndex;

        if (adjustedTargetIndex === sourceIndex) {
          // console.log("Drop cancelled: Target index is same as original"); // Removed log
        } else {
          // console.log( // Removed log
          //   `Reordering: Moving block from index ${sourceIndex} to index ${adjustedTargetIndex}`
          // );
          const reordered = [...dropArea.blocks];
          const [movedItem] = reordered.splice(sourceIndex, 1);
          reordered.splice(adjustedTargetIndex, 0, movedItem);
          reorderBlocks(dropArea.id, reordered);
        }
      } else {
        // Adding a new block (BLOCK or SQUARE)
        const newItem = item as DraggedNewBlockItem;
        // console.log( // Removed log
        //   `Adding new block of type ${newItem.type} at index ${targetIndex}`
        // );
        // Call the new addBlockAtIndex action
        useBlocksStore.getState().addBlockAtIndex(
          {
            type: newItem.type,
            content: newItem.content,
            dropAreaId: dropArea.id, // Pass dropAreaId for the block data
          },
          dropArea.id, // Pass target dropAreaId
          targetIndex // Pass the calculated insertion index
        );
      }

      // Reset hover state after any drop
      setHoverIndex(null);
      setDraggedItemOriginalIndex(null);
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
        className={`relative transition-opacity duration-200 py-1 ${
          // Added py-1 for vertical padding
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
