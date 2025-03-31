"use client";

import { useBlocksStore } from "@/store/blocks-store";
import { useViewport } from "@/lib/hooks/use-viewport";
import { DropArea } from "./drop-area/drop-area";
import { ViewportSelector } from "./viewport-selector";
import { useEffect, useState, useRef, createRef } from "react"; // Added useState, useRef, createRef
import { getViewportStyles } from "@/lib/utils/viewport-utils";
import { useDrop } from "react-dnd"; // Added useDrop, removed DropTargetMonitor import
import { ItemTypes } from "@/lib/item-types"; // Added ItemTypes
// Removed unused BlockType, DropAreaType imports
import { isDropAreaEmpty } from "@/lib/utils/drop-area-utils"; // Added utility
import { InsertionIndicator } from "./drop-area/insertion-indicator"; // Import the new component

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
    selectBlock,
    cleanupEmptyDropAreas,
    insertBlockInNewArea, // Get the new store action
  } = useBlocksStore();
  const { viewport } = useViewport();
  const [hoveredInsertionIndex, setHoveredInsertionIndex] = useState<
    number | null
  >(null);

  // Refs for each drop area element
  const dropAreaRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);

  // Run cleanup on component mount and when dropAreas change
  useEffect(() => {
    // Ensure refs array matches the number of filtered drop areas
    dropAreaRefs.current = filteredDropAreas.map(
      (_, i) => dropAreaRefs.current[i] ?? createRef<HTMLDivElement>()
    );
    cleanupEmptyDropAreas();
  }, [cleanupEmptyDropAreas, dropAreas.length]); // Re-run when dropAreas length changes

  const handleCanvasClick = () => {
    // Deselect any selected block when clicking on the canvas background
    selectBlock(null);
  };

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

  // --- Centralized Drop Logic for Gaps ---
  const [, drop] = useDrop<
    // Removed isOverCanvas from collected props
    DragItem,
    void, // Drop result is void
    { isOverCanvas: boolean } // Collected props type (keep definition for type safety)
  >({
    accept: [ItemTypes.BLOCK, ItemTypes.SQUARE, ItemTypes.EXISTING_BLOCK],
    hover: (item, monitor) => {
      // monitor is used here
      // item and monitor are used
      if (!monitor.isOver()) {
        // Removed { shallow: true }
        // If not hovering over the container (or its children), clear insertion index
        if (hoveredInsertionIndex !== null) {
          // console.log("Canvas Hover: Clearing index (not over)"); // DEBUG LOG
          setHoveredInsertionIndex(null);
        }
        return;
      }

      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) {
        // console.log("Canvas Hover: No client offset"); // DEBUG LOG
        return;
      }

      let currentHoveredIndex: number | null = null;
      const cursorY = clientOffset.y;
      // console.log(`Canvas Hover: Cursor Y = ${cursorY}`); // DEBUG LOG

      // Iterate through the refs of the *filtered* drop areas
      for (let i = 0; i < filteredDropAreas.length - 1; i++) {
        const topAreaRef = dropAreaRefs.current[i];
        const bottomAreaRef = dropAreaRefs.current[i + 1];

        if (topAreaRef?.current && bottomAreaRef?.current) {
          const topRect = topAreaRef.current.getBoundingClientRect();
          const bottomRect = bottomAreaRef.current.getBoundingClientRect();
          // console.log(`Canvas Hover: Checking index ${i+1} between ${topAreaRef.current.dataset.id} (${topRect.bottom}) and ${bottomAreaRef.current.dataset.id} (${bottomRect.top})`); // DEBUG LOG

          // Define a gap threshold between areas
          const gapThreshold = 20; // pixels - Increased from 10

          // Check if cursor is between the bottom of the top area and the top of the bottom area
          if (
            cursorY > topRect.bottom - gapThreshold &&
            cursorY < bottomRect.top + gapThreshold
          ) {
            // console.log(`Canvas Hover: Cursor is between index ${i} and ${i+1}`); // DEBUG LOG
            // Check if both surrounding areas are populated
            const topArea = filteredDropAreas[i];
            const bottomArea = filteredDropAreas[i + 1];
            const isTopPopulated =
              !isDropAreaEmpty(topArea) ||
              (topArea.isSplit &&
                topArea.splitAreas.some((a) => !isDropAreaEmpty(a)));
            const isBottomPopulated =
              !isDropAreaEmpty(bottomArea) ||
              (bottomArea.isSplit &&
                bottomArea.splitAreas.some((a) => !isDropAreaEmpty(a)));

            // console.log(`Canvas Hover: Top populated = ${isTopPopulated}, Bottom populated = ${isBottomPopulated}`); // DEBUG LOG

            if (isTopPopulated && isBottomPopulated) {
              currentHoveredIndex = i + 1; // Index where the new area should be inserted
              // console.log(`Canvas Hover: Setting index to ${currentHoveredIndex}`); // DEBUG LOG
              break; // Found the gap
            }
          }
        } else {
          // console.log(`Canvas Hover: Missing ref for index ${i} or ${i+1}`); // DEBUG LOG
        }
      }

      // Update state only if it changed
      if (currentHoveredIndex !== hoveredInsertionIndex) {
        // console.log(`Canvas Hover: Updating state from ${hoveredInsertionIndex} to ${currentHoveredIndex}`); // DEBUG LOG
        setHoveredInsertionIndex(currentHoveredIndex);
      }
    },
    drop: (item) => {
      // Removed unused monitor parameter
      // This drop handler is specifically for drops *between* areas (in the gap)
      if (hoveredInsertionIndex !== null) {
        console.log(
          `Canvas: Drop detected in gap at index ${hoveredInsertionIndex}`
        );
        // Call the store action to handle insertion
        insertBlockInNewArea(item, hoveredInsertionIndex);

        // Reset hover state after drop
        setHoveredInsertionIndex(null);
        // Return void/undefined as per the expected type
        return undefined;
      }
      // If not dropped in a gap, let the individual DropArea handle it (monitor.didDrop() check)
      console.log("Canvas: Drop not in gap, letting DropArea handle.");
      return undefined; // Return void/undefined
    },
    collect: (monitor) => ({
      isOverCanvas: !!monitor.isOver({ shallow: true }), // Keep isOverCanvas definition
    }), // Removed isOverCanvas from destructuring above
  });
  // --- End Centralized Drop Logic ---

  // Callback ref to connect the drop target
  const dropRefCallback = (node: HTMLDivElement | null) => {
    drop(node); // Call the react-dnd connector function
  };

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
          {/* Attach the drop ref using the callback */}
          <div ref={dropRefCallback} className="w-full">
            {" "}
            {/* Removed p-6 */}
            {/* Use shorthand fragment syntax */}
            {filteredDropAreas.map((dropArea, index) => (
              <>
                {" "}
                {/* Changed from React.Fragment */}
                {/* Render insertion indicator *above* the current drop area if needed */}
                <InsertionIndicator
                  isVisible={index === hoveredInsertionIndex}
                />
                <DropArea
                  // Assign the ref for position calculation
                  ref={dropAreaRefs.current[index]}
                  dropArea={dropArea}
                  showSplitIndicator={viewport !== "mobile"}
                  viewport={viewport}
                  // Pass down the prop indicating if it's below the insertion point
                  isBelowInsertionPoint={index === hoveredInsertionIndex}
                />
              </> // Changed from React.Fragment
            ))}
            {/* Render indicator after the last item if hovering there */}
            <InsertionIndicator
              isVisible={filteredDropAreas.length === hoveredInsertionIndex}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
