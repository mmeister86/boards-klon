"use client";

import React, { useState, forwardRef } from "react"; // Import React and forwardRef
import type { DropAreaType } from "@/lib/types";
import { DropArea } from "./drop-area";
import { MergeGapIndicator } from "./merge-gap-indicator";
import { useBlocksStore } from "@/store/blocks-store";
import { Trash2 } from "lucide-react";

interface TabletDropAreaProps {
  dropArea: DropAreaType;
  showSplitIndicator: boolean;
}

// Wrap with forwardRef
export const TabletDropArea = forwardRef<HTMLDivElement, TabletDropAreaProps>(
  ({ dropArea, showSplitIndicator }, ref) => {
    const { canMerge, mergeDropAreas, deleteDropArea } = useBlocksStore();
    const [showDeleteButton, setShowDeleteButton] = useState(false);
    const [isMerging, setIsMerging] = useState(false); // Added merging state

    if (!dropArea.isSplit || dropArea.splitAreas.length !== 2) {
      return (
        <DropArea
          dropArea={dropArea}
          showSplitIndicator={showSplitIndicator}
          viewport="tablet"
        />
      );
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
      );
    }

    // For first-level split, add merge gap indicator between areas
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

    // First-level split for tablet - side by side with merge gap
    // Check if either split area has content for showing delete button
    const hasContent =
      dropArea.splitAreas[0].blocks.length > 0 ||
      dropArea.splitAreas[1].blocks.length > 0;

    // Note: The 2x2 grid case might need ref handling too if it becomes a drop target,
    // but for now, we only need the ref on the main container for the first-level split.

    return (
      // Attach the forwarded ref here
      <div
        ref={ref}
        className="group w-full flex items-center relative"
        onMouseEnter={() => setShowDeleteButton(true)}
        onMouseLeave={() => setShowDeleteButton(false)}
      >
        {/* Merging Text Overlay - Rendered centrally within the parent */}
        {isMerging && (
          <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
            <div className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
              Wird zusammengeführt...
            </div>
          </div>
        )}
        {/* Removed Merging Animation Overlay from here */}
        <div className="flex-1">
          <DropArea
            dropArea={dropArea.splitAreas[0]}
            showSplitIndicator={showSplitIndicator}
            viewport="tablet"
            hideInternalMergeIndicator={true}
            isParentMerging={isMerging} // Pass state down
          />
        </div>
        {/* Center the indicator wrapper */}
        <div className="self-center">
          <MergeGapIndicator
            canMerge={areasCanMerge}
            onClick={handleMergeWithAnimation} // Use animation handler
          />
        </div>
        <div className="flex-1">
          <DropArea
            dropArea={dropArea.splitAreas[1]}
            showSplitIndicator={showSplitIndicator}
            viewport="tablet"
            hideInternalMergeIndicator={true}
            isParentMerging={isMerging} // Pass state down
          />
        </div>

        {/* Delete button for the entire split area */}
        {showDeleteButton && hasContent && (
          <button
            onClick={() => deleteDropArea(dropArea.id)}
            className="absolute -right-4 -top-4 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 z-20"
            title="Gesamten Drop-Bereich löschen"
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
TabletDropArea.displayName = "TabletDropArea";
