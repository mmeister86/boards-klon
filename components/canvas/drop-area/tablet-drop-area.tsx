"use client"

import { useState } from "react"
import type { DropAreaType } from "@/lib/types"
import { DropArea } from "./drop-area"
import { MergeGapIndicator } from "./merge-gap-indicator"
import { useBlocksStore } from "@/store/blocks-store"
import { Trash2 } from "lucide-react"

interface TabletDropAreaProps {
  dropArea: DropAreaType
  showSplitIndicator: boolean
}

export function TabletDropArea({ dropArea, showSplitIndicator }: TabletDropAreaProps) {
  const { canMerge, mergeDropAreas, deleteDropArea } = useBlocksStore()
  const [showDeleteButton, setShowDeleteButton] = useState(false)
  
  if (!dropArea.isSplit || dropArea.splitAreas.length !== 2) {
    return <DropArea dropArea={dropArea} showSplitIndicator={showSplitIndicator} viewport="tablet" />
  }

  // Check if this is a second-level split (creating a 2x2 grid)
  if (dropArea.splitAreas.some((area) => area.isSplit)) {
    return (
      <div className="w-full grid grid-cols-2 gap-4">
        {/* Render the first split area */}
        {dropArea.splitAreas[0].isSplit ? (
          <>
            <DropArea 
              dropArea={dropArea.splitAreas[0].splitAreas[0]} 
              showSplitIndicator={false} 
              viewport="tablet"
              hideInternalMergeIndicator={true}
            />
            <DropArea 
              dropArea={dropArea.splitAreas[0].splitAreas[1]} 
              showSplitIndicator={false} 
              viewport="tablet"
              hideInternalMergeIndicator={true}
            />
          </>
        ) : (
          <DropArea 
            dropArea={dropArea.splitAreas[0]} 
            showSplitIndicator={showSplitIndicator} 
            viewport="tablet"
            hideInternalMergeIndicator={true}
          />
        )}

        {/* Render the second split area */}
        {dropArea.splitAreas[1].isSplit ? (
          <>
            <DropArea 
              dropArea={dropArea.splitAreas[1].splitAreas[0]} 
              showSplitIndicator={false} 
              viewport="tablet"
              hideInternalMergeIndicator={true}
            />
            <DropArea 
              dropArea={dropArea.splitAreas[1].splitAreas[1]} 
              showSplitIndicator={false} 
              viewport="tablet"
              hideInternalMergeIndicator={true}
            />
          </>
        ) : (
          <DropArea 
            dropArea={dropArea.splitAreas[1]} 
            showSplitIndicator={showSplitIndicator} 
            viewport="tablet"
            hideInternalMergeIndicator={true}
          />
        )}
      </div>
    )
  }

  // For first-level split, add merge gap indicator between areas
  const leftAreaId = dropArea.splitAreas[0].id
  const rightAreaId = dropArea.splitAreas[1].id
  const areasCanMerge = canMerge(leftAreaId, rightAreaId)
  
  const handleMerge = () => {
    if (areasCanMerge) {
      mergeDropAreas(leftAreaId, rightAreaId)
    }
  }

  // First-level split for tablet - side by side with merge gap
  // Check if either split area has content for showing delete button
  const hasContent = 
    (dropArea.splitAreas[0].blocks.length > 0) || 
    (dropArea.splitAreas[1].blocks.length > 0);

  return (
    <div 
      className="group w-full flex items-center relative"
      onMouseEnter={() => setShowDeleteButton(true)}
      onMouseLeave={() => setShowDeleteButton(false)}
    >
      <div className="flex-1 bento-box">
        <DropArea 
          dropArea={dropArea.splitAreas[0]} 
          showSplitIndicator={showSplitIndicator} 
          viewport="tablet"
          hideInternalMergeIndicator={true}
        />
      </div>
      <div className="self-stretch">
        <MergeGapIndicator 
          canMerge={areasCanMerge} 
          onClick={handleMerge}
        />
      </div>
      <div className="flex-1 bento-box">
        <DropArea 
          dropArea={dropArea.splitAreas[1]} 
          showSplitIndicator={showSplitIndicator} 
          viewport="tablet"
          hideInternalMergeIndicator={true}
        />
      </div>
      
      {/* Delete button for the entire split area */}
      {showDeleteButton && hasContent && (
        <button
          onClick={() => deleteDropArea(dropArea.id)}
          className="absolute -right-4 -top-4 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 z-20"
          title="Delete entire drop area"
          aria-label="Delete entire drop area"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  )
}

