"use client"

import type { DropAreaType } from "@/lib/types"
import { DropArea } from "./drop-area"
import { MergeGapIndicator } from "./merge-gap-indicator"
import { useBlocksStore } from "@/store/blocks-store"

interface TabletDropAreaProps {
  dropArea: DropAreaType
  showSplitIndicator: boolean
}

export function TabletDropArea({ dropArea, showSplitIndicator }: TabletDropAreaProps) {
  const { canMerge, mergeDropAreas } = useBlocksStore()
  
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
  return (
    <div className="w-full flex items-stretch">
      <div className="flex-1 bento-box">
        <DropArea 
          dropArea={dropArea.splitAreas[0]} 
          showSplitIndicator={showSplitIndicator} 
          viewport="tablet"
          hideInternalMergeIndicator={true}
        />
      </div>
      <MergeGapIndicator 
        canMerge={areasCanMerge} 
        onClick={handleMerge}
      />
      <div className="flex-1 bento-box">
        <DropArea 
          dropArea={dropArea.splitAreas[1]} 
          showSplitIndicator={showSplitIndicator} 
          viewport="tablet"
          hideInternalMergeIndicator={true}
        />
      </div>
    </div>
  )
}

