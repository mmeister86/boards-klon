"use client"

import type { DropAreaType } from "@/lib/types"
import { PreviewBlock } from "./preview-block"

interface PreviewDropAreaProps {
  dropArea: DropAreaType
  viewport: string
}

export function PreviewDropArea({ dropArea, viewport }: PreviewDropAreaProps) {
  // Skip empty drop areas in preview mode
  if (dropArea.blocks.length === 0 && !dropArea.isSplit) {
    return null
  }

  // For mobile viewport, always stack vertically
  if (viewport === "mobile" && dropArea.isSplit && dropArea.splitAreas.length === 2) {
    return (
      <div className="w-full space-y-4">
        <PreviewDropArea dropArea={dropArea.splitAreas[0]} viewport={viewport} />
        <PreviewDropArea dropArea={dropArea.splitAreas[1]} viewport={viewport} />
      </div>
    )
  }

  // For tablet viewport with 2x2 grid layout
  if (viewport === "tablet" && dropArea.isSplit && dropArea.splitAreas.length === 2) {
    // Check if this is a second-level split (creating a 2x2 grid)
    if (dropArea.splitAreas.some((area) => area.isSplit)) {
      return (
        <div className="w-full grid grid-cols-2 gap-4">
          {/* Render the first split area */}
          {dropArea.splitAreas[0].isSplit ? (
            <>
              <PreviewDropArea dropArea={dropArea.splitAreas[0].splitAreas[0]} viewport={viewport} />
              <PreviewDropArea dropArea={dropArea.splitAreas[0].splitAreas[1]} viewport={viewport} />
            </>
          ) : (
            <PreviewDropArea dropArea={dropArea.splitAreas[0]} viewport={viewport} />
          )}

          {/* Render the second split area */}
          {dropArea.splitAreas[1].isSplit ? (
            <>
              <PreviewDropArea dropArea={dropArea.splitAreas[1].splitAreas[0]} viewport={viewport} />
              <PreviewDropArea dropArea={dropArea.splitAreas[1].splitAreas[1]} viewport={viewport} />
            </>
          ) : (
            <PreviewDropArea dropArea={dropArea.splitAreas[1]} viewport={viewport} />
          )}
        </div>
      )
    }

    // First-level split for tablet - side by side
    return (
      <div className="w-full flex gap-4">
        <div className="flex-1">
          <PreviewDropArea dropArea={dropArea.splitAreas[0]} viewport={viewport} />
        </div>
        <div className="flex-1">
          <PreviewDropArea dropArea={dropArea.splitAreas[1]} viewport={viewport} />
        </div>
      </div>
    )
  }

  // For desktop with up to 4-in-a-row layout
  if (viewport === "desktop" && dropArea.isSplit && dropArea.splitAreas.length === 2) {
    return (
      <div className="w-full flex gap-4">
        <div className="flex-1">
          <PreviewDropArea dropArea={dropArea.splitAreas[0]} viewport={viewport} />
        </div>
        <div className="flex-1">
          <PreviewDropArea dropArea={dropArea.splitAreas[1]} viewport={viewport} />
        </div>
      </div>
    )
  }

  // Render blocks in this drop area
  return dropArea.blocks.length > 0 ? (
    <div className="space-y-4">
      {dropArea.blocks.map((block) => (
        <PreviewBlock key={block.id} block={block} viewport={viewport} />
      ))}
    </div>
  ) : null
}

