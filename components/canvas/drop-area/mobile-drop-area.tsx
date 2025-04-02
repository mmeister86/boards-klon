"use client";

import React, { useState, forwardRef } from "react"; // Import React and forwardRef
import type { DropAreaType } from "@/lib/types";
import { DropArea } from "./drop-area";
import { useBlocksStore } from "@/store/blocks-store";
// Removed unused MergeGapIndicator import
import { Trash2 } from "lucide-react";

interface MobileDropAreaProps {
  dropArea: DropAreaType;
  showSplitIndicator: boolean;
}

// Wrap with forwardRef
export const MobileDropArea = forwardRef<HTMLDivElement, MobileDropAreaProps>(
  ({ dropArea, showSplitIndicator }, ref) => {
    const { canMerge, mergeDropAreas, deleteDropArea } = useBlocksStore();
    const [showDeleteButton, setShowDeleteButton] = useState(false);
    const [isMerging, setIsMerging] = useState(false); // Added merging state

    if (!dropArea.isSplit || dropArea.splitAreas.length !== 2) {
      return (
        <DropArea
          dropArea={dropArea}
          showSplitIndicator={showSplitIndicator}
          viewport="mobile"
        />
      );
    }

    // For mobile, we'll place a horizontal merge indicator between the vertical areas
    const topAreaId = dropArea.splitAreas[0].id;
    const bottomAreaId = dropArea.splitAreas[1].id;
    const areasCanMerge = canMerge(topAreaId, bottomAreaId);

    // Handler for merge gap click with animation
    const handleMergeWithAnimation = () => {
      if (areasCanMerge) {
        setIsMerging(true); // Start animation
        setTimeout(() => {
          mergeDropAreas(topAreaId, bottomAreaId); // Call store action
          // No need to setIsMerging(false) as the component will likely unmount/re-render
        }, 300);
      }
    };

    // In mobile, we want a horizontal indicator
    const MobileHorizontalMergeIndicator = () => {
      if (!areasCanMerge) {
        return <div className="h-6 my-2"></div>;
      }

      return (
        <div className="h-6 my-2 w-full relative group">
          {/* Simple highlight that appears on hover */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-full bg-transparent group-hover:bg-green-100/50 transition-colors rounded-md" />
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleMergeWithAnimation(); // Use animation handler
            }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10
            p-2 rounded-full bg-green-500 shadow-md hover:bg-green-600
            transition-all text-white opacity-0 group-hover:opacity-100"
            title="Merge drop areas"
            aria-label="Merge drop areas"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 16H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"></path>
              <path d="M16 8h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2v-2"></path>
            </svg>
          </button>
        </div>
      );
    };

    // Check if either split area has content for showing delete button
    const hasContent =
      dropArea.splitAreas[0].blocks.length > 0 ||
      dropArea.splitAreas[1].blocks.length > 0;

    return (
      // Attach the forwarded ref here
      <div
        ref={ref}
        className="group w-full space-y-0 relative"
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
        <DropArea
          dropArea={dropArea.splitAreas[0]}
          showSplitIndicator={false}
          viewport="mobile"
          hideInternalMergeIndicator={true}
          isParentMerging={isMerging} // Pass state down
        />
        <MobileHorizontalMergeIndicator />
        <DropArea
          dropArea={dropArea.splitAreas[1]}
          showSplitIndicator={false}
          viewport="mobile"
          hideInternalMergeIndicator={true}
          isParentMerging={isMerging} // Pass state down
        />

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
MobileDropArea.displayName = "MobileDropArea";
