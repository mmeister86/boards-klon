import { useDrag, DragSourceMonitor } from "react-dnd"; // Correctly import only DragSourceMonitor
import { ItemTypes } from "@/lib/item-types";
import type { BlockType } from "@/lib/types";

// Global object to track which blocks are currently being dragged
// This helps prevent duplicate drag operations of the same block
const ActiveDrags = new Map<
  string,
  {
    dropAreaId: string;
    index: number;
    startTime: number;
  }
>();

function isBlockBeingDragged(blockId: string): boolean {
  return ActiveDrags.has(blockId);
}

function trackBlockDrag(
  blockId: string,
  dropAreaId: string,
  index: number
): void {
  ActiveDrags.set(blockId, {
    dropAreaId,
    index,
    startTime: Date.now(),
  });
  // console.log(`[DragTracker] Started tracking drag for block ${blockId} from ${dropAreaId}`); // Keep logs commented out
}

function untrackBlockDrag(blockId: string): void {
  if (ActiveDrags.has(blockId)) {
    // console.log(`[DragTracker] Stopped tracking drag for block ${blockId}`); // Keep logs commented out
    ActiveDrags.delete(blockId);
  }
}

// Define the drag item structure explicitly
interface BlockDragItem {
  id: string;
  type: typeof ItemTypes.EXISTING_BLOCK; // Explicitly set type
  originalType: string; // Store the actual block type
  content: string;
  sourceDropAreaId: string;
  originalIndex: number; // Add original index
  // Add any additional metadata needed for rendering the block preview
  headingLevel?: number; // For heading blocks
}

export const useBlockDrag = (
  block: BlockType,
  index: number, // Add index parameter
  canDrag: boolean = true
) => {
  // Pass spec object directly to useDrag
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.EXISTING_BLOCK, // Draggable type
    item: (monitor) => {
      // CRITICAL: Before creating the item, check if this block is already being dragged
      if (isBlockBeingDragged(block.id)) {
        // console.log(`[useBlockDrag] Block ${block.id} is already being dragged! Preventing duplicate drag.`); // Keep logs commented out
        return null;
      }

      // console.log(`[useBlockDrag] Begin drag for block: ${block.id}`); // Keep logs commented out

      // Track that we're starting to drag this block
      trackBlockDrag(block.id, block.dropAreaId, index);

      // Return the item data
      return {
        id: block.id,
        type: ItemTypes.EXISTING_BLOCK, // *** FIX: Set type explicitly ***
        originalType: block.type, // *** ADD: Store original type ***
        content: block.content,
        sourceDropAreaId: block.dropAreaId,
        originalIndex: index, // Include the index
        // Include heading level if present
        ...(block.headingLevel && { headingLevel: block.headingLevel }),
      };
    },
    canDrag: (monitor) => {
      // Don't allow drag if this block is already being dragged
      if (isBlockBeingDragged(block.id)) {
        return false;
      }
      return canDrag;
    },
    collect: (monitor: DragSourceMonitor<BlockDragItem, unknown>) => ({
      isDragging: !!monitor.isDragging(),
    }),
    // Log the start of drag in the item function instead of using begin
    // Called when dragging stops
    end: (
      item: BlockDragItem | undefined,
      monitor: DragSourceMonitor<BlockDragItem, any> // *** FIX: Use DragSourceMonitor ***
    ) => {
      const dragId = `drag-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}`;
      console.log(
        `[useBlockDrag:${dragId}] End handler fired for item:`,
        item?.id
      ); // Log entry

      if (!item) {
        console.log(`[useBlockDrag:${dragId}] End handler: No item found.`);
        // If we have the block.id, we should still untack it
        untrackBlockDrag(block.id);
        return;
      }

      // Untrack this block
      untrackBlockDrag(item.id);

      // Dispatch custom event for drag end
      const event = new CustomEvent("dragEnd", {
        detail: { blockId: item.id, dragId },
      });
      window.dispatchEvent(event);

      // Log the drop result for debugging
      const dropResult = monitor.getDropResult();
      const wasDropped = monitor.didDrop();

      // console.log( // Keep logs commented out
      //   `[useBlockDrag:${dragId}] Drag ended for block: ${item.id}`,
      //   `\nDropped: ${wasDropped}`,
      //   `\nDrop result: ${JSON.stringify(dropResult)}`,
      //   `\nSource area: ${item.sourceDropAreaId}`,
      //   `\nOriginal index: ${item.originalIndex}`
      // );

      // If no drop result but drag ended, make sure UI is reset
      console.log(
        `[useBlockDrag:${dragId}] Checking drop status. wasDropped: ${wasDropped}`
      ); // Log drop status
      if (!wasDropped) {
        console.log(
          `[useBlockDrag:${dragId}] Drop was not successful (wasDropped is false). Attempting to reset hover state.`
        ); // Log condition met
        // Call the global reset function if it exists
        // @ts-ignore - Accessing window property
        const resetFnExists =
          typeof window.resetDropAreaContentHover === "function";
        console.log(
          `[useBlockDrag:${dragId}] Does window.resetDropAreaContentHover exist? ${resetFnExists}`
        ); // Log function existence
        if (resetFnExists) {
          // @ts-ignore
          window.resetDropAreaContentHover();
          console.log(
            `[useBlockDrag:${dragId}] Called window.resetDropAreaContentHover.`
          ); // Log function call
        }
      }
    },
  });

  // Return only isDragging and drag
  return { isDragging, drag };
};
