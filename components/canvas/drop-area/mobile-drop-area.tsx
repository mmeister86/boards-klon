"use client"

import type { DropAreaType } from "@/lib/types"
import { DropArea } from "./drop-area"
import { useBlocksStore } from "@/store/blocks-store"
import { MergeGapIndicator } from "./merge-gap-indicator"

interface MobileDropAreaProps {
  dropArea: DropAreaType
  showSplitIndicator: boolean
}

export function MobileDropArea({ dropArea, showSplitIndicator }: MobileDropAreaProps) {
  const { canMerge, mergeDropAreas } = useBlocksStore()

  if (!dropArea.isSplit || dropArea.splitAreas.length !== 2) {
    return <DropArea dropArea={dropArea} showSplitIndicator={showSplitIndicator} viewport="mobile" />
  }

  // For mobile, we'll place a horizontal merge indicator between the vertical areas
  const topAreaId = dropArea.splitAreas[0].id
  const bottomAreaId = dropArea.splitAreas[1].id
  const areasCanMerge = canMerge(topAreaId, bottomAreaId)
  
  const handleMerge = () => {
    if (areasCanMerge) {
      mergeDropAreas(topAreaId, bottomAreaId)
    }
  }
  
  // In mobile, we want a horizontal indicator
  const MobileHorizontalMergeIndicator = () => {
    if (!areasCanMerge) {
      return <div className="h-4"></div>
    }
    
    return (
      <div className="h-4 w-full flex items-center justify-center relative z-10 group hover:bg-green-100/50 transition-colors">
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleMerge()
          }}
          className="bg-green-500 p-2 rounded-full shadow-md hover:bg-green-600 
            transition-all text-white opacity-0 group-hover:opacity-100 absolute 
            z-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          title="Merge drop areas"
          aria-label="Merge drop areas"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 16H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"></path>
            <path d="M16 8h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2v-2"></path>
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className="w-full space-y-0">
      <DropArea 
        dropArea={dropArea.splitAreas[0]} 
        showSplitIndicator={false} 
        viewport="mobile" 
        hideInternalMergeIndicator={true} 
      />
      <MobileHorizontalMergeIndicator />
      <DropArea 
        dropArea={dropArea.splitAreas[1]} 
        showSplitIndicator={false} 
        viewport="mobile" 
        hideInternalMergeIndicator={true} 
      />
    </div>
  )
}

