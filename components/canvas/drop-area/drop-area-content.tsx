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
  originalType: string; // Add original type
  content: string; // Add content (might be needed by drop handler)
}

// Interface for new blocks that are specifically Headings
interface DraggedHeadingBlockItem extends DraggedNewBlockItem {
  type: "heading"; // Literal type for specific block type check
  headingLevel: 1 | 2 | 3 | 4 | 5 | 6; // Use specific union type matching BlockType
}

interface DraggedNewBlockItem {
  id?: string; // New blocks might not have an ID yet
  type: string; // Use string, assuming it holds the specific block type like 'heading', 'paragraph'
  content: string;
  sourceDropAreaId?: string; // Might not be relevant for new blocks
}

type AcceptedDragItem = DraggedExistingBlockItem | DraggedNewBlockItem;

// Type guard to check if a dragged item is a heading block
function isDraggedHeading(
  item: AcceptedDragItem
): item is DraggedHeadingBlockItem {
  // Check the specific block type string and ensure headingLevel exists and is a number
  return (
    item.type === "heading" &&
    "headingLevel" in item &&
    typeof item.headingLevel === "number"
  );
}

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
    // Attaching to window for simplicity (consider alternatives for production)
    window.resetDropAreaContentHover = () => {
      console.log("[Window Reset] Resetting DropAreaContent hover state");
      setHoverIndex(null);
      setDraggedItemOriginalIndex(null);
    };
    return () => {
      // Cleanup window property
      delete window.resetDropAreaContentHover;
    };
  }, []); // Empty dependency array ensures it runs once

  // Reset hover state when window is blurred
  useEffect(() => {
    const handleBlur = () => {
      setHoverIndex(null);
    };
    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, []);

  // --- Container Drop Logic ---
  const [{ isOverContainer, canDropOnContainer }, dropContainer] = useDrop<
    AcceptedDragItem, // Use the union type
    void,
    { isOverContainer: boolean; canDropOnContainer: boolean }
  >({
    accept: [ItemTypes.EXISTING_BLOCK, ItemTypes.BLOCK, ItemTypes.SQUARE],
    canDrop: () => {
      // Revised logic: If canDrop is called, react-dnd has already verified
      // the item type against the 'accept' array. So, we can always return true here.
      // The actual handling logic is in the drop handlers.
      return true;
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
      // Get the fresh item reference
      const freshItem = monitor.getItem();

      // Create a unique ID for tracking this drop operation
      const dropId = `drop-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}`;

      // Check if drop was already handled elsewhere
      if (monitor.didDrop()) {
        setHoverIndex(null);
        setDraggedItemOriginalIndex(null);
        return undefined;
      }

      // Ensure we are over the container specifically
      if (!monitor.isOver({ shallow: true })) {
        setHoverIndex(null);
        setDraggedItemOriginalIndex(null);
        return undefined;
      }

      // Get the current target index from hover state
      const targetIndex = hoverIndex;
      if (targetIndex === null) {
        setHoverIndex(null);
        setDraggedItemOriginalIndex(null);
        return undefined;
      }

      try {
        // Handle internal reordering
        if (freshItem.type === ItemTypes.EXISTING_BLOCK) {
          const existingItem = freshItem as DraggedExistingBlockItem;

          // Only handle if it's an internal reorder (same drop area)
          if (existingItem.sourceDropAreaId !== dropArea.id) {
            return undefined; // Let parent useDropArea handle external moves
          }

          const sourceIndex = existingItem.originalIndex;

          // Prevent dropping in the same spot or right after itself
          if (targetIndex === sourceIndex || targetIndex === sourceIndex + 1) {
            return undefined;
          }

          // Calculate adjusted target index
          const adjustedTargetIndex =
            targetIndex > sourceIndex ? targetIndex - 1 : targetIndex;

          // Create a new copy of the blocks array
          const newBlocks = [...dropArea.blocks];

          // Remove the item from its original position
          const [movedItem] = newBlocks.splice(sourceIndex, 1);

          // Insert at the new position
          newBlocks.splice(adjustedTargetIndex, 0, movedItem);

          // Apply the reordering with the updated blocks array
          setTimeout(() => {
            reorderBlocks(dropArea.id, newBlocks);
          }, 0);
        }
        // Handle new blocks onto populated areas
        else {
          const newItem = freshItem as DraggedNewBlockItem;

          // Prepare base block data
          const newBlockDataBase = {
            type: newItem.type,
            content: newItem.content || "",
            dropAreaId: dropArea.id,
          };

          // Add heading level if it's a heading block
          const finalNewBlockData = isDraggedHeading(freshItem)
            ? {
                ...newBlockDataBase,
                type: "heading",
                headingLevel: freshItem.headingLevel,
              }
            : newBlockDataBase;

          // Schedule block addition AFTER drop handler returns
          setTimeout(() => {
            useBlocksStore
              .getState()
              .addBlockAtIndex(finalNewBlockData, dropArea.id, targetIndex);
          }, 0);
        }
      } catch (error: unknown) {
        console.error(`[DropAreaContent:${dropId}] Error during drop:`, error);
      }

      // Reset state
      setHoverIndex(null);
      setDraggedItemOriginalIndex(null);
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
