import { useDrag, DragSourceMonitor } from "react-dnd"; // Correctly import only DragSourceMonitor
import { ItemTypes } from "@/lib/item-types";
import type { BlockType } from "@/lib/types";
import { useBlocksStore } from "@/store/blocks-store"; // NEU: Importiere den Store

// Global object to track which blocks are currently being dragged
// This helps prevent duplicate drag operations of the same block
const ActiveDrags = new Map<
  string,
  {
    sourceLocation: string;
    index: number;
    startTime: number;
  }
>();

function isBlockBeingDragged(blockId: string): boolean {
  return ActiveDrags.has(blockId);
}

function trackBlockDrag(
  blockId: string,
  sourceLocation: string,
  index: number
): void {
  ActiveDrags.set(blockId, {
    sourceLocation,
    index,
    startTime: Date.now(),
  });
  // console.log(`[DragTracker] Started tracking drag for block ${blockId} from ${sourceLocation}`); // Keep logs commented out
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
  sourceLayoutId: string;
  sourceZoneId: string;
  originalIndex: number; // Add original index
  // Add any additional metadata needed for rendering the block preview
  headingLevel?: number; // For heading blocks
}

export const useBlockDrag = (
  block: BlockType,
  index: number,
  layoutId: string,
  zoneId: string,
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
        layoutId: layoutId,
        zoneId: zoneId,
        index,
      });
      // --- END ADD LOG ---

      // console.log(`[useBlockDrag] Begin drag for block: ${block.id}`); // Keep logs commented out

      // Track that we're starting to drag this block
      trackBlockDrag(block.id, `${layoutId}-${zoneId}`, index);

      // Return the item data
      return {
        id: block.id,
        type: ItemTypes.EXISTING_BLOCK, // *** FIX: Set type explicitly ***
        originalType: block.type, // *** ADD: Store original type ***
        content: block.content,
        sourceLayoutId: layoutId,
        sourceZoneId: zoneId,
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

      const itemToUntrack = item ?? { id: block.id }; // Use block.id as fallback

      if (!itemToUntrack || !itemToUntrack.id) {
        console.warn(`[useBlockDrag:end ${dragId}] No item or block ID available for untracking.`);
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
