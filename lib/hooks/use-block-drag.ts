import { useDrag, DragSourceMonitor } from "react-dnd"; // Correctly import only DragSourceMonitor
import { ItemTypes } from "@/lib/item-types";
import type { BlockType, HeadingBlock as HeadingBlockType } from "@/lib/types";
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
  type: typeof ItemTypes.EXISTING_BLOCK;
  originalType: string;
  content: unknown; // Allow any content type for now
  sourceLayoutId: string;
  sourceZoneId: string;
  originalIndex: number;
  headingLevel?: number;
}

export const useBlockDrag = (
  block: BlockType,
  index: number,
  layoutId: string,
  zoneId: string,
  // NEW: Add canDrag parameter and a function to reset the drag state
  canDrag: boolean = false, // Default to false
  setCanDrag: (can: boolean) => void = () => {}
) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.EXISTING_BLOCK,
    item: () => {
      if (isBlockBeingDragged(block.id)) {
        return null;
      }
      console.log(`[useBlockDrag] Begin drag for block:`, {
        id: block.id,
        type: block.type,
        layoutId: layoutId,
        zoneId: zoneId,
        index,
      });
      trackBlockDrag(block.id, `${layoutId}-${zoneId}`, index);

      // Conditionally add headingLevel only if block is a heading
      const headingLevelData = block.type === 'heading'
        ? { headingLevel: (block as HeadingBlockType).headingLevel }
        : {};

      return {
        id: block.id,
        type: ItemTypes.EXISTING_BLOCK,
        originalType: block.type,
        content: block.content,
        sourceLayoutId: layoutId,
        sourceZoneId: zoneId,
        originalIndex: index,
        ...headingLevelData, // Spread the conditional heading level
      };
    },
    // Use the passed canDrag state
    canDrag: () => {
      if (isBlockBeingDragged(block.id)) {
        return false;
      }
      return canDrag;
    },
    collect: (monitor: DragSourceMonitor<BlockDragItem, unknown>) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (
      item: BlockDragItem | undefined
    ) => {
      const dragId = `drag-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}`;
      const itemToUntrack = item ?? { id: block.id };

      if (!itemToUntrack || !itemToUntrack.id) {
        console.warn(`[useBlockDrag:end ${dragId}] No item or block ID available for untracking.`);
        useBlocksStore.getState().resetAllHoverStates();
        setCanDrag(false); // Reset drag state even on error
        return;
      }

      untrackBlockDrag(itemToUntrack.id);
      const event = new CustomEvent("dragEnd", {
        detail: { blockId: itemToUntrack.id, dragId },
      });
      window.dispatchEvent(event);
      useBlocksStore.getState().resetAllHoverStates();
      // NEW: Call the reset function provided by the component
      setCanDrag(false);
    },
  }, [block, index, layoutId, zoneId, canDrag, setCanDrag]); // Add canDrag and setCanDrag to dependencies

  return { isDragging, drag };
};
