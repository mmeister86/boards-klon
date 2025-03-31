"use client"

import { SplitHorizontal, Merge } from "@/lib/icons"

interface DropIndicatorsProps {
  isOver: boolean
  canDrop: boolean
  shouldShowSplitIndicator: boolean
  shouldShowMergeIndicator: boolean
  onSplit: () => void
  onMerge: () => void
  mergePosition?: "left" | "right" | "both"
}

export function DropIndicators({ 
  isOver, 
  canDrop, 
  shouldShowSplitIndicator, 
  shouldShowMergeIndicator,
  onSplit, 
  onMerge,
  mergePosition = "both"
}: DropIndicatorsProps) {
  return (
    <>
      {/* Drop indicator - show when dragging over */}
      {isOver && canDrop && (
        <div className="absolute inset-0 border-2 border-primary rounded-xl pointer-events-none z-10 flex items-center justify-center">
          <div className="bg-primary/20 rounded-lg px-3 py-1.5 text-sm font-medium text-primary">Drop here</div>
        </div>
      )}

      {/* Split indicator - only show under specific conditions */}
      {shouldShowSplitIndicator && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSplit();
          }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-blue-500 p-2 rounded-full shadow-md hover:bg-blue-600 transition-colors text-white"
          title="Split drop area horizontally"
        >
          <SplitHorizontal size={16} />
        </button>
      )}

      {/* Merge indicator - show between two empty or one empty + one populated drop area */}
      {shouldShowMergeIndicator && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMerge();
          }}
          className={`absolute ${getMergePositionClasses(mergePosition)} z-10 bg-green-500 p-2 rounded-full shadow-md hover:bg-green-600 transition-colors text-white`}
          title="Merge drop areas"
        >
          <Merge size={16} />
        </button>
      )}
    </>
  )
}

// Helper function to get the correct positioning classes
function getMergePositionClasses(position: "left" | "right" | "both") {
  switch (position) {
    case "left":
      return "left-0 top-1/2 -translate-y-1/2 -translate-x-1/2";
    case "right":
      return "right-0 top-1/2 -translate-y-1/2 translate-x-1/2";
    case "both":
      return "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2";
  }
}