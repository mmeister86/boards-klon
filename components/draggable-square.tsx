"use client"

import { useDrag } from "react-dnd"
import { ItemTypes } from "@/lib/item-types"

export function DraggableSquare() {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.SQUARE,
    item: { id: "square" },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  return (
    <div
      ref={drag}
      className={`w-24 h-24 bg-blue-500 rounded-md cursor-move flex items-center justify-center text-white font-medium ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
      style={{ touchAction: "none" }}
    >
      Drag me
    </div>
  )
}

