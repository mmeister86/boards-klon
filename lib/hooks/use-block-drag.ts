import { useDrag, DragSourceMonitor } from "react-dnd";
import { ItemTypes } from "@/lib/item-types";
import type { BlockType } from "@/lib/types";

// Define the drag item structure explicitly
interface BlockDragItem {
  id: string;
  type: string;
  content: string;
  sourceDropAreaId: string;
  // Add any additional metadata needed for rendering the block preview
  headingLevel?: number; // For heading blocks
}

export const useBlockDrag = (block: BlockType, canDrag: boolean = true) => {
  // Pass spec object directly to useDrag
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.EXISTING_BLOCK,
    item: {
      id: block.id,
      type: block.type,
      content: block.content,
      sourceDropAreaId: block.dropAreaId,
      isCanvasItem: true, // Explicitly mark this as a canvas item
      // Include heading level if present
      ...(block.headingLevel && { headingLevel: block.headingLevel }),
    },
    canDrag: canDrag,
    collect: (monitor: DragSourceMonitor<BlockDragItem, unknown>) => ({
      isDragging: !!monitor.isDragging(),
    }),
    // Called when dragging stops
    end: (
      item: BlockDragItem | undefined,
      monitor: DragSourceMonitor<BlockDragItem, unknown>
    ) => {
      console.log("[useBlockDrag] end"); // Debug log

      // Dispatch custom event for drag end
      const event = new CustomEvent("dragEnd", {
        detail: { blockId: item?.id },
      });
      window.dispatchEvent(event);

      // Log the drop result for debugging
      const dropResult = monitor.getDropResult();
      console.log(
        "Drag ended for block:",
        item?.id,
        "Drop result:",
        dropResult,
        "Was dropped:",
        monitor.didDrop()
      );
    },
  });

  // Return only isDragging and drag
  return { isDragging, drag };
};
