"use client";

import React, { useState, forwardRef } from "react"; // Import React and forwardRef
import type { DropAreaType } from "@/lib/types";
import { DropArea } from "./drop-area";
import { MergeGapIndicator } from "./merge-gap-indicator";
import { useBlocksStore } from "@/store/blocks-store";
import { Trash2 } from "lucide-react";

interface DesktopDropAreaProps {
  dropArea: DropAreaType;
  showSplitIndicator: boolean;
}

// Wrap with forwardRef
export const DesktopDropArea = forwardRef<HTMLDivElement, DesktopDropAreaProps>(
  ({ dropArea, showSplitIndicator }, ref) => {
    const { canMerge, mergeDropAreas, deleteDropArea } = useBlocksStore();
    const [showDeleteButton, setShowDeleteButton] = useState(false);
    const [isMerging, setIsMerging] = useState(false); // Added merging state

    if (!dropArea.isSplit || dropArea.splitAreas.length !== 2) {
      return (
        <DropArea
          dropArea={dropArea}
          showSplitIndicator={showSplitIndicator}
          viewport="desktop"
        />
      );
    }

    // Check if the two areas can be merged
    const leftAreaId = dropArea.splitAreas[0].id;
    const rightAreaId = dropArea.splitAreas[1].id;
    const areasCanMerge = canMerge(leftAreaId, rightAreaId);

    // Handler for merge gap click with animation
    const handleMergeWithAnimation = () => {
      if (areasCanMerge) {
        setIsMerging(true); // Start animation
        setTimeout(() => {
          mergeDropAreas(leftAreaId, rightAreaId); // Call store action
          // No need to setIsMerging(false) as the component will likely unmount/re-render
        }, 300);
      }
    };

    // Check if either split area has content
    const hasContent =
      dropArea.splitAreas[0].blocks.length > 0 ||
      dropArea.splitAreas[1].blocks.length > 0;

    return (
      // Attach the forwarded ref here
      <div
        ref={ref}
        className="group w-full flex items-center min-h-full relative"
        onMouseEnter={() => setShowDeleteButton(true)}
        onMouseLeave={() => setShowDeleteButton(false)}
      >
        {/* Merging Text Overlay - Rendered centrally within the parent */}
        {isMerging && (
          <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
            <div className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
              Merging...
            </div>
          </div>
        )}
        {/* Removed Merging Animation Overlay from here */}
        <div className="flex-1">
          <DropArea
            dropArea={dropArea.splitAreas[0]}
            showSplitIndicator={true}
            viewport="desktop"
            hideInternalMergeIndicator={true}
            isParentMerging={isMerging} // Pass state down
          />
        </div>
        {/* Center the indicator wrapper */}
        <div className="self-center">
          {/* Use the animation handler */}
          <MergeGapIndicator
            canMerge={areasCanMerge}
            onClick={handleMergeWithAnimation}
          />
        </div>
        <div className="flex-1">
          <DropArea
            dropArea={dropArea.splitAreas[1]}
            showSplitIndicator={true}
            viewport="desktop"
            hideInternalMergeIndicator={true}
            isParentMerging={isMerging} // Pass state down
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
    );
  }
);

// Add display name for React DevTools
DesktopDropArea.displayName = "DesktopDropArea";
