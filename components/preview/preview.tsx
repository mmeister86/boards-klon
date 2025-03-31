"use client"

import { useBlocksStore } from "@/store/blocks-store"
import { useViewport } from "@/lib/hooks/use-viewport"
import { PreviewDropArea } from "./preview-drop-area"
import { getViewportStyles } from "@/lib/utils/viewport-utils"
import { filterNonEmptyDropAreas } from "@/lib/utils/drop-area-utils"

export default function Preview() {
  const { dropAreas } = useBlocksStore()
  const { viewport } = useViewport()

  // Filter out empty drop areas for preview
  const nonEmptyDropAreas = filterNonEmptyDropAreas(dropAreas)

  return (
    <div className="flex-1 bg-gray-50 overflow-auto p-6">
      <div className="mx-auto flex justify-center">
        <div
          className={`bg-white rounded-2xl transition-all duration-300 ${
            viewport === "desktop" ? "w-full max-w-5xl" : ""
          }`}
          style={getViewportStyles(viewport)}
        >
          <div className="space-y-6 w-full">
            {nonEmptyDropAreas.map((dropArea) => (
              <PreviewDropArea key={dropArea.id} dropArea={dropArea} viewport={viewport} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

