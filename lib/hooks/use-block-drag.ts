import { useDrag } from "react-dnd"
import { ItemTypes } from "@/lib/item-types"
import type { BlockType } from "@/lib/types"

export const useBlockDrag = (block: BlockType) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.EXISTING_BLOCK,
    item: {
      id: block.id,
      type: block.type,
      content: block.content,
      sourceDropAreaId: block.dropAreaId,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      // Clear any lingering drag states when drag ends
      const event = new CustomEvent("dragEnd", {
        detail: { blockId: block.id },
      })
      window.dispatchEvent(event)

      // Log the drop result for debugging
      const dropResult = monitor.getDropResult()
      console.log("Drag ended for block:", block.id, "Drop result:", dropResult)
    },
  })

  return { isDragging, drag }
}

