"use client"

import { useState, useEffect } from "react"
import type { DropAreaType, BlockType } from "@/lib/types"
import type { ViewportType } from "@/lib/hooks/use-viewport"
import { CanvasBlock } from "@/components/blocks/canvas-block"
import { ChevronUp, ChevronDown } from "lucide-react"
import { useDrop } from "react-dnd"
import { ItemTypes } from "@/lib/item-types"
import { useBlocksStore } from "@/store/blocks-store"

interface DropAreaContentProps {
  dropArea: DropAreaType
  viewport: ViewportType
  onSplitPopulated?: () => void
  canSplit?: boolean
}

export function DropAreaContent({ dropArea, viewport, onSplitPopulated, canSplit = true }: DropAreaContentProps) {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [isDraggingWithin, setIsDraggingWithin] = useState(false)
  const [dragSourceIndex, setDragSourceIndex] = useState<number | null>(null)
  const { reorderBlocks } = useBlocksStore()

  // Reset drag states when component unmounts or drop area changes
  useEffect(() => {
    const resetDragStates = () => {
      setDragOverIndex(null)
      setDragSourceIndex(null)
      setIsDraggingWithin(false)
    }

    // Listen for dragEnd events from useBlockDrag
    window.addEventListener("dragEnd", resetDragStates)

    return () => {
      window.removeEventListener("dragEnd", resetDragStates)
    }
  }, [dropArea.id])

  // If drop area is empty, show placeholder
  if (dropArea.blocks.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground p-8">
        <p className="text-sm">Drop blocks here</p>
      </div>
    )
  }

  // Handle direct reordering of blocks within this drop area
  const handleReorderBlocks = (blocks: BlockType[]) => {
    reorderBlocks(dropArea.id, blocks)
  }

  return (
    <div
      className={`space-y-4 p-4 ${isDraggingWithin ? "bg-background/50 rounded-lg" : ""}`}
      onDragEnter={() => setIsDraggingWithin(true)}
      onDragLeave={(e) => {
        // Only set to false if we're leaving the container, not entering a child
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsDraggingWithin(false)
        }
      }}
      onDragEnd={() => {
        setIsDraggingWithin(false)
        setDragOverIndex(null)
        setDragSourceIndex(null)
      }}
    >
      {dropArea.blocks.map((block, index) => (
        <BlockItem
          key={block.id}
          block={block}
          index={index}
          totalBlocks={dropArea.blocks.length}
          dropAreaId={dropArea.id}
          viewport={viewport}
          onSplitPopulated={onSplitPopulated}
          canSplit={canSplit}
          allBlocks={dropArea.blocks}
          onReorder={handleReorderBlocks}
          dragOverIndex={dragOverIndex}
          setDragOverIndex={setDragOverIndex}
          dragSourceIndex={dragSourceIndex}
          setDragSourceIndex={setDragSourceIndex}
        />
      ))}
    </div>
  )
}

// Extracted component for each block item with drag-and-drop functionality
interface BlockItemProps {
  block: BlockType
  index: number
  totalBlocks: number
  dropAreaId: string
  viewport: ViewportType
  onSplitPopulated?: () => void
  canSplit?: boolean
  allBlocks: BlockType[]
  onReorder: (blocks: BlockType[]) => void
  dragOverIndex: number | null
  setDragOverIndex: (index: number | null) => void
  dragSourceIndex: number | null
  setDragSourceIndex: (index: number | null) => void
}

function BlockItem({
  block,
  index,
  totalBlocks,
  dropAreaId,
  viewport,
  onSplitPopulated,
  canSplit,
  allBlocks,
  onReorder,
  dragOverIndex,
  setDragOverIndex,
  dragSourceIndex,
  setDragSourceIndex,
}: BlockItemProps) {
  // Set up drop target for this block item
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.EXISTING_BLOCK,
    hover: (item: any, monitor) => {
      // Only handle blocks from the same drop area
      if (item.sourceDropAreaId === dropAreaId) {
        // Find the source block index
        const sourceIndex = allBlocks.findIndex((b) => b.id === item.id)

        // Don't replace with itself
        if (sourceIndex === index) {
          return
        }

        setDragOverIndex(index)
        setDragSourceIndex(sourceIndex)
      }
    },
    drop: (item: any, monitor) => {
      // Only handle blocks from the same drop area
      if (item.sourceDropAreaId === dropAreaId) {
        // Find the source block index
        const sourceIndex = allBlocks.findIndex((b) => b.id === item.id)

        // Don't replace with itself
        if (sourceIndex === index) {
          return
        }

        console.log(`Swapping block at index ${sourceIndex} with block at index ${index}`)

        // Create a new array with the blocks in the new order
        const newBlocks = [...allBlocks]

        // Perform a direct swap of the two blocks
        ;[newBlocks[sourceIndex], newBlocks[index]] = [newBlocks[index], newBlocks[sourceIndex]]

        // Update the blocks order
        onReorder(newBlocks)
      }

      // Clear the drag over state
      setDragOverIndex(null)
      setDragSourceIndex(null)
      return undefined
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop() && monitor.getItem()?.sourceDropAreaId === dropAreaId,
    }),
  })

  // Determine if this block is being dragged over
  const isDragTarget = isOver && canDrop && dragOverIndex === index

  // Determine if this is the source block being dragged
  const isSource = dragSourceIndex === index

  // Determine the direction of the swap (up or down)
  const swapDirection = dragSourceIndex !== null && dragSourceIndex < index ? "down" : "up"

  return (
    <div
      ref={drop}
      className={`relative group transition-all duration-200 ${
        isDragTarget ? "scale-105 z-10" : ""
      } ${isSource ? "opacity-50" : ""}`}
      data-index={index}
      data-block-id={block.id}
    >
      {/* Visual indicator for drag target */}
      {isDragTarget && (
        <div className="absolute inset-0 border-2 border-primary rounded-lg bg-primary/10 pointer-events-none z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
            Swap {swapDirection === "up" ? "Up" : "Down"}
          </div>
        </div>
      )}

      {/* Block reordering controls - show on hover */}
      {totalBlocks > 1 && (
        <div className="absolute -left-10 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {index > 0 && (
            <button
              onClick={() => {
                // Move block up (swap with previous block)
                const newBlocks = [...allBlocks]
                ;[newBlocks[index], newBlocks[index - 1]] = [newBlocks[index - 1], newBlocks[index]]
                onReorder(newBlocks)
              }}
              className="p-1 bg-primary text-primary-foreground rounded-full hover:bg-primary/90"
              title="Move up"
            >
              <ChevronUp size={14} />
            </button>
          )}
          {index < totalBlocks - 1 && (
            <button
              onClick={() => {
                // Move block down (swap with next block)
                const newBlocks = [...allBlocks]
                ;[newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]]
                onReorder(newBlocks)
              }}
              className="p-1 bg-primary text-primary-foreground rounded-full hover:bg-primary/90"
              title="Move down"
            >
              <ChevronDown size={14} />
            </button>
          )}
        </div>
      )}

      <CanvasBlock block={block} viewport={viewport} onSplit={onSplitPopulated} canSplit={canSplit} />
    </div>
  )
}

