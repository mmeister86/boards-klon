"use client";

import React, { useState, useEffect, forwardRef } from "react"; // Import React, forwardRef
import { useDropArea } from "@/lib/hooks/use-drop-area";
import type { DropAreaType } from "@/lib/types";
import type { ViewportType } from "@/lib/hooks/use-viewport";
import { DropAreaContent } from "./drop-area-content";
import { DropIndicators } from "./drop-indicators";
import { MobileDropArea } from "./mobile-drop-area";
import { TabletDropArea } from "./tablet-drop-area";
import { DesktopDropArea } from "./desktop-drop-area";
import { useBlocksStore } from "@/store/blocks-store";
import { Trash2 } from "lucide-react";

interface DropAreaProps {
  dropArea: DropAreaType;
  showSplitIndicator?: boolean;
  viewport: ViewportType;
  hideInternalMergeIndicator?: boolean;
  // Removed unused isBelowInsertionPoint prop
  isParentMerging?: boolean; // Added prop for parent-controlled animation
}

// Wrap component with forwardRef
export const DropArea = forwardRef<HTMLDivElement, DropAreaProps>(
  (
    {
      dropArea,
      showSplitIndicator = false,
      viewport,
      hideInternalMergeIndicator = false,
      // Removed isBelowInsertionPoint destructuring
      isParentMerging = false, // Destructure new prop
    },
    ref // Receive the forwarded ref
  ) => {
    const { splitPopulatedDropArea, splitDropArea, canSplit, deleteDropArea } =
      useBlocksStore();
    const [isSplitting, setIsSplitting] = useState(false);
    // Removed isMerging state
    const [showDeleteButton, setShowDeleteButton] = useState(false);
    const {
      isOver, // Is an item hovering directly over this area?
      canDrop, // Can this area accept the current dragged item?
      // isHovering, // No longer needed here
      setIsHovering, // Function to manually set the hover state (used for mouse enter/leave)
      drop, // The drop ref connector from react-dnd for this area
      getDropAreaStyles, // Function to get dynamic styles based on state
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      handleSplit, // Function to trigger splitting this area
      handleMerge, // Function to trigger merging this area
      shouldShowSplitIndicator, // Function to determine if split indicator should show
      shouldShowMergeIndicator, // Function to determine if merge indicator should show
      mergePosition, // Which side the merge indicator should appear on ('left' or 'right')
      dropError, // Any error message from the last drop attempt
    } = useDropArea(dropArea, viewport); // The core logic hook

    // Check if this drop area can be split based on viewport and level
    const canSplitThisArea = canSplit(dropArea.id, viewport);

    // Handle splitting a populated drop area (when split button is clicked)
    const handleSplitPopulated = () => {
      if (canSplitThisArea && dropArea.blocks.length > 0) {
        setIsSplitting(true); // Show splitting animation
        // Add a small delay to show the animation before actually splitting
        setTimeout(() => {
          splitPopulatedDropArea(dropArea.id); // Call store action
          setIsSplitting(false); // Hide animation
        }, 300);
      }
    };

    // Handle splitting an empty drop area (when split indicator is clicked)
    const handleSplitEmpty = () => {
      if (canSplitThisArea && dropArea.blocks.length === 0) {
        setIsSplitting(true); // Show splitting animation
        // Add a small delay to show the animation before actually splitting
        setTimeout(() => {
          splitDropArea(dropArea.id); // Call store action from drop-area-actions.ts
          setIsSplitting(false); // Hide animation
        }, 300);
      } // Added missing closing brace for the if statement
    }; // Added missing closing brace for the handleSplitEmpty function
    // Removed handleMergeWithAnimation function

    // Reset animation states if the drop area ID changes
    useEffect(() => {
      setIsSplitting(false);
      // Removed isMerging reset
    }, [dropArea.id]);

    // --- Render different layouts based on viewport and split state ---
    // If the area is split and has 2 children, render the specific layout component
    if (dropArea.isSplit && dropArea.splitAreas.length === 2) {
      if (viewport === "mobile") {
        return (
          <MobileDropArea
            ref={ref} // Pass ref down
            dropArea={dropArea}
            showSplitIndicator={showSplitIndicator}
          />
        );
      }
      if (viewport === "tablet") {
        return (
          <TabletDropArea
            ref={ref} // Pass ref down
            dropArea={dropArea}
            showSplitIndicator={showSplitIndicator}
          />
        );
      }
      if (viewport === "desktop") {
        return (
          <DesktopDropArea
            ref={ref} // Pass ref down
            dropArea={dropArea}
            showSplitIndicator={showSplitIndicator}
          />
        );
      }
    }

    // --- Default rendering for non-split or single-child split areas ---
    // Combine the forwarded ref and the drop ref
    const combinedRef = (node: HTMLDivElement | null) => {
      // Assign to the forwarded ref (for position calculation in Canvas)
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
      // Assign to the drop ref (for react-dnd)
      drop(node);
    };

    return (
      <div
        ref={combinedRef} // Use the combined ref
        className={`group relative ${getDropAreaStyles()} ${
          isSplitting ? "scale-105 shadow-lg" : ""
        } ${isParentMerging ? "scale-105 shadow-lg" : ""}
          mb-6 transition-all duration-300`} // Removed conditional mt-10, kept mb-6
        onMouseEnter={() => {
          // console.log(`Mouse enter ${dropArea.id}`); // Reduce console noise
          setIsHovering(true);
          setShowDeleteButton(true);
        }}
        onMouseLeave={(e) => {
          // Only set to false if we're leaving the container itself,
          // not just moving the mouse over a child element within the container.
          if (
            e.relatedTarget instanceof Node &&
            !e.currentTarget.contains(e.relatedTarget)
          ) {
            // console.log(`Mouse leave ${dropArea.id}`); // Reduce console noise
            setIsHovering(false);
            setShowDeleteButton(false);
          }
        }}
      >
        {/* Splitting Animation Overlay */}
        {isSplitting && (
          <div className="absolute inset-0 bg-blue-500/10 rounded-xl z-20 flex items-center justify-center pointer-events-none">
            <div className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
              Wird aufgeteilt...
            </div>
          </div>
        )}

        {/* Merging Animation Overlay Background - Controlled by parent */}
        {isParentMerging && (
          <div className="absolute inset-0 bg-green-500/10 rounded-xl z-30 pointer-events-none">
            {" "}
            {/* Use z-30 */}
            {/* Text box removed from here, only background remains */}
          </div>
        )}

        {/* Drop Error Overlay */}
        {dropError && (
          <div className="absolute inset-0 bg-red-500/10 rounded-xl z-20 flex items-center justify-center pointer-events-none">
            <div className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
              {dropError}
            </div>
          </div>
        )}

        <DropIndicators
          isOver={isOver}
          canDrop={canDrop}
          shouldShowSplitIndicator={shouldShowSplitIndicator(
            showSplitIndicator
          )}
          shouldShowMergeIndicator={
            !hideInternalMergeIndicator && shouldShowMergeIndicator()
          }
          onSplit={handleSplitEmpty}
          onMerge={handleMerge} // Pass the direct merge handler from the hook (no animation here)
          mergePosition={mergePosition}
        />

        <DropAreaContent
          dropArea={dropArea}
          viewport={viewport}
          onSplitPopulated={handleSplitPopulated}
          canSplit={canSplitThisArea}
        />

        {/* Delete button - Shows on hover for populated areas:
            - Always show for areas with multiple blocks
            - Only show for areas with a single block if that block doesn't show its own delete button
        */}
        {showDeleteButton && dropArea.blocks.length > 0 && (
          <button
            onClick={() => deleteDropArea(dropArea.id)}
            className="absolute -right-4 -top-4 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 z-20"
            title={
              dropArea.blocks.length === 1
                ? "Block löschen"
                : "Drop-Bereich löschen"
            }
            aria-label={
              dropArea.blocks.length === 1 ? "Delete block" : "Delete drop area"
            }
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    );
  }
);

// Add display name for React DevTools
DropArea.displayName = "DropArea";
