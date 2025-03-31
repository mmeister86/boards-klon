"use client"

import { useDropArea } from "@/lib/hooks/use-drop-area"
import type { DropAreaType } from "@/lib/types"
import type { ViewportType } from "@/lib/hooks/use-viewport"
import { DropAreaContent } from "./drop-area-content"
import { DropIndicators } from "./drop-indicators"
import { MobileDropArea } from "./mobile-drop-area"
import { TabletDropArea } from "./tablet-drop-area"
import { DesktopDropArea } from "./desktop-drop-area"
import { useBlocksStore } from "@/store/blocks-store"
import { useState, useEffect } from "react"

interface DropAreaProps {
  dropArea: DropAreaType
  showSplitIndicator?: boolean
  viewport: ViewportType
  hideInternalMergeIndicator?: boolean
}

export function DropArea({ dropArea, showSplitIndicator = false, viewport, hideInternalMergeIndicator = false }: DropAreaProps) {
  const { splitPopulatedDropArea, canSplit } = useBlocksStore()
  const [isSplitting, setIsSplitting] = useState(false)
  const {
    isOver,
    canDrop,
    isHovering,
    setIsHovering,
    drop,
    getDropAreaStyles,
    handleSplit,
    handleMerge,
    shouldShowSplitIndicator,
    shouldShowMergeIndicator,
    mergePosition,
    dropError,
  } = useDropArea(dropArea, viewport)

  // Check if this drop area can be split
  const canSplitThisArea = canSplit(dropArea.id, viewport)

  // Handle splitting a populated drop area
  const handleSplitPopulated = () => {
    if (canSplitThisArea && dropArea.blocks.length > 0) {
      setIsSplitting(true)
      // Add a small delay to show the animation before actually splitting
      setTimeout(() => {
        splitPopulatedDropArea(dropArea.id)
        setIsSplitting(false)
      }, 300)
    }
  }

  // Reset splitting state when drop area changes
  useEffect(() => {
    setIsSplitting(false)
  }, [dropArea.id])

  // Handle viewport-specific rendering
  if (viewport === "mobile" && dropArea.isSplit && dropArea.splitAreas.length === 2) {
    return <MobileDropArea dropArea={dropArea} showSplitIndicator={showSplitIndicator} />
  }

  if (viewport === "tablet" && dropArea.isSplit && dropArea.splitAreas.length === 2) {
    return <TabletDropArea dropArea={dropArea} showSplitIndicator={showSplitIndicator} />
  }

  if (viewport === "desktop" && dropArea.isSplit && dropArea.splitAreas.length === 2) {
    return <DesktopDropArea dropArea={dropArea} showSplitIndicator={showSplitIndicator} />
  }

  return (
    <div
      ref={drop}
      className={`${getDropAreaStyles()} ${isSplitting ? "scale-105 shadow-lg" : ""} transition-all duration-300`}
      onMouseEnter={() => {
        console.log(`Mouse enter ${dropArea.id}`);
        setIsHovering(true);
      }}
      onMouseLeave={(e) => {
        // Only set to false if we're leaving the container, not entering a child
        console.log(`Mouse leave ${dropArea.id}`, e.relatedTarget);
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsHovering(false);
        }
      }}
    >
      {isSplitting && (
        <div className="absolute inset-0 bg-blue-500/10 rounded-xl z-10 flex items-center justify-center">
          <div className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium">Splitting...</div>
        </div>
      )}

      {dropError && (
        <div className="absolute inset-0 bg-red-500/10 rounded-xl z-10 flex items-center justify-center">
          <div className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium">{dropError}</div>
        </div>
      )}

      <DropIndicators
        isOver={isOver}
        canDrop={canDrop}
        shouldShowSplitIndicator={shouldShowSplitIndicator(showSplitIndicator)}
        shouldShowMergeIndicator={!hideInternalMergeIndicator && shouldShowMergeIndicator()}
        onSplit={handleSplit}
        onMerge={handleMerge}
        mergePosition={mergePosition}
      />

      <DropAreaContent
        dropArea={dropArea}
        viewport={viewport}
        onSplitPopulated={handleSplitPopulated}
        canSplit={canSplitThisArea}
      />
    </div>
  )
}

