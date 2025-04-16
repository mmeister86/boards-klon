import { useDrag, DragSourceMonitor } from "react-dnd"; // Correctly import only DragSourceMonitor
import { ItemTypes } from "@/lib/item-types";
import type { BlockType } from "@/lib/types";
import { useBlocksStore } from "@/store/blocks-store"; // NEU: Importiere den Store

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
    item: () => {
      // CRITICAL: Before creating the item, check if this block is already being dragged
      if (isBlockBeingDragged(block.id)) {
        // console.log(`[useBlockDrag] Block ${block.id} is already being dragged! Preventing duplicate drag.`); // Keep logs commented out
        return null;
      }

      // --- BEGIN ADD LOG ---
      console.log(`[useBlockDrag] Begin drag for block:`, {
        id: block.id,
        type: block.type,
        dropAreaId: block.dropAreaId,
        index,
      });
      // --- END ADD LOG ---

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
    canDrag: () => {
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
      // monitor: DragSourceMonitor<BlockDragItem, unknown> // Entfernt, da nicht mehr verwendet
    ) => {
      const dragId = `drag-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}`;

      const itemToUntrack = item ?? block; // Use block as fallback if item is undefined during untrack

      if (!itemToUntrack) {
        console.warn(`[useBlockDrag:end ${dragId}] No item or block available for untracking.`);
        // Versuche trotzdem, den globalen Zustand zurückzusetzen, falls ein Drag stattgefunden hat
        useBlocksStore.getState().resetAllHoverStates(); // NEU: Immer Reset über Store
        return;
      }

      // Untrack this block using its ID
      untrackBlockDrag(itemToUntrack.id);

      // Dispatch custom event for drag end
      const event = new CustomEvent("dragEnd", {
        detail: { blockId: itemToUntrack.id, dragId },
      });
      window.dispatchEvent(event);

      // *** IMMER Reset über den Store aufrufen, unabhängig von didDrop() ***
      useBlocksStore.getState().resetAllHoverStates();
    },
  });

  // Return only isDragging and drag
  return { isDragging, drag };
};
