"use client";

import { useBlocksStore } from "@/store/blocks-store";
import { useViewport } from "@/lib/hooks/use-viewport";
import { DropArea } from "./drop-area/drop-area";
import { ViewportSelector } from "./viewport-selector";
import React, { useEffect, useState, useRef, createRef } from "react"; // Added React import
import { getViewportStyles } from "@/lib/utils/viewport-utils";
import { useDrop } from "react-dnd"; // Added useDrop, removed DropTargetMonitor import
import { ItemTypes } from "@/lib/item-types"; // Added ItemTypes
// Removed unused BlockType, DropAreaType imports
import { isDropAreaEmpty } from "@/lib/utils/drop-area-utils"; // Added utility
import { InsertionIndicator } from "./drop-area/insertion-indicator"; // Import the new component
import Preview from "@/components/preview/preview";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

// Define the type for the item being dragged (consistent with useDropArea)
interface DragItem {
  // Keep this interface
  // Keep this interface
  id?: string;
  type: string;
  content: string;
  sourceDropAreaId?: string;
}

export default function Canvas() {
  const {
    dropAreas,
    cleanupEmptyDropAreas,
    insertBlockInNewArea, // Get the new store action
    previewMode,
    setPreviewMode,
  } = useBlocksStore();
  const { viewport } = useViewport();
  const [hoveredInsertionIndex, setHoveredInsertionIndex] = useState<
    number | null
  >(null);

  // Refs for each drop area element
  const dropAreaRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);

  // Ref for tracking mouse movement timeouts
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Keep for inactivity reset (if re-enabled)
  // Removed unused lastCursorPositionRef
  const hideIndicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref for hysteresis timer

  // Filter out consecutive empty drop areas for rendering (keep existing logic)
  const filteredDropAreas = dropAreas.filter((area, index) => {
    if (index === 0) return true;

    const prevArea = dropAreas[index - 1];
    const currentArea = area;
    const isPrevEmpty =
      isDropAreaEmpty(prevArea) &&
      (!prevArea.isSplit || prevArea.splitAreas.every(isDropAreaEmpty));
    const isCurrentEmpty =
      isDropAreaEmpty(currentArea) &&
      (!currentArea.isSplit || currentArea.splitAreas.every(isDropAreaEmpty));
    return !(isPrevEmpty && isCurrentEmpty);
  });

  // Run cleanup on component mount and when dropAreas change
  useEffect(() => {
    // Ensure refs array matches the number of filtered drop areas
    dropAreaRefs.current = filteredDropAreas.map(
      (_, i) => dropAreaRefs.current[i] ?? createRef<HTMLDivElement>()
    );
    cleanupEmptyDropAreas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cleanupEmptyDropAreas, dropAreas.length]); // filteredDropAreas is derived from dropAreas

  // Cleanup effect to remove any timeouts when component unmounts
  useEffect(() => {
    return () => {
      // Safely clear timeouts on component unmount
      if (inactivityTimeoutRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        clearTimeout(inactivityTimeoutRef.current);
      }

      // Clear hysteresis timer on unmount
      const hideIndicatorTimeout = hideIndicatorTimeoutRef.current;
      if (hideIndicatorTimeout) {
        clearTimeout(hideIndicatorTimeout);
      }
    };
  }, []); // Empty dependency array ensures this runs only on mount and unmount

  // --- Centralized Drop Logic for Gaps ---
  const [, drop] = useDrop<DragItem, void, { isOverCanvas: boolean }>({
    accept: [ItemTypes.BLOCK, ItemTypes.SQUARE, ItemTypes.EXISTING_BLOCK],
    hover: (item, monitor) => {
      const clientOffset = monitor.getClientOffset();
      const isOverCurrent = monitor.isOver({ shallow: true });

      // Early return if we don't have the necessary data
      if (!isOverCurrent || !clientOffset) {
        // If not hovering, start the timer to hide the indicator (if it's visible)
        if (
          hoveredInsertionIndex !== null &&
          !hideIndicatorTimeoutRef.current // Only start if not already timing out
        ) {
          hideIndicatorTimeoutRef.current = setTimeout(() => {
            setHoveredInsertionIndex(null);
            hideIndicatorTimeoutRef.current = null; // Clear ref after execution
          }, 150); // Hide after 150ms delay
        }
        return;
      }

      // --- Inactivity Timer Logic (Currently Disabled) ---
      // if (inactivityTimeoutRef.current) { ... }
      // ---

      // Get container and check bounds
      const dropContainer = document.querySelector(
        '[data-drop-container="true"]'
      ) as HTMLElement;
      if (!dropContainer) return;
      const dropTargetRect = dropContainer.getBoundingClientRect();
      const { x: cursorX, y: cursorY } = clientOffset;
      const boundsPadding = 20;
      const isInBounds =
        cursorX >= dropTargetRect.left - boundsPadding &&
        cursorX <= dropTargetRect.right + boundsPadding;

      if (!isInBounds) {
        // If out of bounds, start timer to hide indicator
        if (
          hoveredInsertionIndex !== null &&
          !hideIndicatorTimeoutRef.current // Only start if not already timing out
        ) {
          hideIndicatorTimeoutRef.current = setTimeout(() => {
            setHoveredInsertionIndex(null);
            hideIndicatorTimeoutRef.current = null; // Clear ref after execution
          }, 100); // Use shorter delay for out of bounds
        }
        return;
      }

      // --- Calculate Hovered Index ---
      let currentHoveredIndex: number | null = null;
      for (let i = 0; i < filteredDropAreas.length - 1; i++) {
        const topAreaRef = dropAreaRefs.current[i];
        const bottomAreaRef = dropAreaRefs.current[i + 1];
        if (!topAreaRef?.current || !bottomAreaRef?.current) continue;

        const topRect = topAreaRef.current.getBoundingClientRect();
        const bottomRect = bottomAreaRef.current.getBoundingClientRect();
        const gapThreshold = 20;
        const midPointY =
          topRect.bottom + (bottomRect.top - topRect.bottom) / 2;
        const isVerticallyNearMidpoint =
          Math.abs(cursorY - midPointY) < gapThreshold;

        if (isVerticallyNearMidpoint) {
          const gapLeft = Math.min(topRect.left, bottomRect.left);
          const gapRight = Math.max(topRect.right, bottomRect.right);
          if (cursorX >= gapLeft && cursorX <= gapRight) {
            const topArea = filteredDropAreas[i];
            const bottomArea = filteredDropAreas[i + 1];
            const topIsEmpty = isDropAreaEmpty(topArea);
            const topHasPopulatedChildren =
              topArea.isSplit &&
              topArea.splitAreas.some((a) => !isDropAreaEmpty(a));
            const isTopPopulated = !topIsEmpty || topHasPopulatedChildren;
            const bottomIsEmptyCheck = isDropAreaEmpty(bottomArea);
            const bottomHasPopulatedChildrenCheck =
              bottomArea.isSplit &&
              bottomArea.splitAreas.some((a) => !isDropAreaEmpty(a));
            const isBottomPopulated =
              !bottomIsEmptyCheck || bottomHasPopulatedChildrenCheck;

            if (isTopPopulated && isBottomPopulated) {
              currentHoveredIndex = i + 1;
              break;
            }
          }
        }
      }

      // --- Hysteresis Logic ---
      if (currentHoveredIndex !== null) {
        // If hovering over a valid gap, clear any pending hide timer
        if (hideIndicatorTimeoutRef.current) {
          clearTimeout(hideIndicatorTimeoutRef.current);
          hideIndicatorTimeoutRef.current = null;
        }
        // Set the index immediately if it's different
        if (currentHoveredIndex !== hoveredInsertionIndex) {
          setHoveredInsertionIndex(currentHoveredIndex);
        }
      } else {
        // If not hovering over a valid gap, start timer to hide (if not already started)
        if (
          hoveredInsertionIndex !== null &&
          !hideIndicatorTimeoutRef.current
        ) {
          hideIndicatorTimeoutRef.current = setTimeout(() => {
            setHoveredInsertionIndex(null);
            hideIndicatorTimeoutRef.current = null; // Clear ref after execution
          }, 150); // Hide after 150ms delay
        }
      }
      // --- End Hysteresis Logic ---
    },
    drop: (item) => {
      // Clear any inactivity timeout on drop (if re-enabled later)
      // if (inactivityTimeoutRef.current) { ... }

      // *** Clear hysteresis timeout on drop ***
      if (hideIndicatorTimeoutRef.current) {
        clearTimeout(hideIndicatorTimeoutRef.current);
        hideIndicatorTimeoutRef.current = null;
      }

      if (hoveredInsertionIndex !== null) {
        // console.log( // Removed log
        //   `Canvas: Drop detected in gap at index ${hoveredInsertionIndex}`
        // );
        insertBlockInNewArea(item, hoveredInsertionIndex);
        setHoveredInsertionIndex(null); // Reset state immediately on drop
        return undefined;
      }
      // console.log("Canvas: Drop not in gap, letting DropArea handle."); // Removed log
      return undefined;
    },
    collect: (monitor) => ({
      isOverCanvas: !!monitor.isOver({ shallow: true }),
    }),
  });
  // --- End Centralized Drop Logic ---

  // Callback ref to connect the drop target
  const dropRefCallback = (node: HTMLDivElement | null) => {
    drop(node); // Call the react-dnd connector function
  };

  return (
    <div className="flex-1 bg-muted overflow-auto p-6">
      {/* Header with centered viewport selector and right-aligned preview toggle */}
      <div className="relative flex justify-center items-center mb-6">
        <ViewportSelector />
        <div className="absolute right-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2"
          >
            {previewMode ? (
              <>
                <EyeOff className="h-4 w-4" />
                <span>Vorschau beenden</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                <span>Vorschau</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {previewMode ? (
        <Preview />
      ) : (
        /* Canvas container with proper width */
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
            {/* Attach the drop ref using the callback */}
            <div
              ref={dropRefCallback}
              className="w-full"
              data-drop-container="true"
            >
              {filteredDropAreas.map((dropArea, index) => (
                <React.Fragment key={`${dropArea.id}-${index}`}>
                  <InsertionIndicator
                    isVisible={index === hoveredInsertionIndex}
                  />
                  <DropArea
                    ref={dropAreaRefs.current[index]}
                    dropArea={dropArea}
                    showSplitIndicator={viewport !== "mobile"}
                    viewport={viewport}
                  />
                </React.Fragment>
              ))}
              <InsertionIndicator
                isVisible={filteredDropAreas.length === hoveredInsertionIndex}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
