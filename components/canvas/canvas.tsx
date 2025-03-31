"use client";

import { useBlocksStore } from "@/store/blocks-store";
import { useViewport } from "@/lib/hooks/use-viewport";
import { DropArea } from "./drop-area/drop-area";
import { ViewportSelector } from "./viewport-selector";
import { useEffect } from "react";
import { getViewportStyles } from "@/lib/utils/viewport-utils";

export default function Canvas() {
  const { dropAreas, selectBlock, cleanupEmptyDropAreas } = useBlocksStore();
  const { viewport } = useViewport();

  // Run cleanup on component mount and when dropAreas change
  useEffect(() => {
    cleanupEmptyDropAreas();
  }, [cleanupEmptyDropAreas, dropAreas.length]);

  const handleCanvasClick = () => {
    // Deselect any selected block when clicking on the canvas
    selectBlock(null);
  };

  // Filter out consecutive empty drop areas for rendering
  const filteredDropAreas = dropAreas.filter((area, index) => {
    // Always keep the first area
    if (index === 0) return true;

    // Check if this area and the previous one are both empty
    const isPrevEmpty =
      dropAreas[index - 1].blocks.length === 0 && !dropAreas[index - 1].isSplit;
    const isCurrentEmpty = area.blocks.length === 0 && !area.isSplit;

    // Filter out this area if both are empty
    return !(isPrevEmpty && isCurrentEmpty);
  });

  return (
    <div
      className="flex-1 bg-muted overflow-auto p-6"
      onClick={handleCanvasClick}
    >
      {/* Viewport selector centered at the top */}
      <div className="flex justify-center mb-6">
        <ViewportSelector />
      </div>

      {/* Canvas container with proper width */}
      <div
        className={`mx-auto ${
          viewport === "desktop" ? "w-[90%]" : "w-auto"
        } flex justify-center`}
      >
        <div
          className={`bg-card rounded-2xl transition-all duration-300 shadow-md overflow-hidden ${
            viewport === "desktop" ? "w-full" : ""
          }`}
          style={getViewportStyles(viewport)}
        >
          <div className="space-y-6 w-full">
            {filteredDropAreas.map((dropArea) => (
              <DropArea
                key={dropArea.id}
                dropArea={dropArea}
                showSplitIndicator={viewport !== "mobile"}
                viewport={viewport}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
