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
  
  // Ref for tracking mouse movement timeouts
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCursorPositionRef = useRef<{ x: number; y: number } | null>(null);

  // Run cleanup on component mount and when dropAreas change
  useEffect(() => {
    // Ensure refs array matches the number of filtered drop areas
    dropAreaRefs.current = filteredDropAreas.map(
      (_, i) => dropAreaRefs.current[i] ?? createRef<HTMLDivElement>()
    );
    cleanupEmptyDropAreas();
  }, [cleanupEmptyDropAreas, dropAreas.length]); // Re-run when dropAreas length changes
  
  // Cleanup effect to remove any timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, []);

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

  // Function to clear insertion indicator after inactivity
  const resetInsertionIndicator = () => {
    if (hoveredInsertionIndex !== null) {
      console.log("Clearing insertion indicator due to inactivity");
      setHoveredInsertionIndex(null);
    }
  };

  // --- Centralized Drop Logic for Gaps ---
  const [, drop] = useDrop<DragItem, void, { isOverCanvas: boolean }>({
    accept: [ItemTypes.BLOCK, ItemTypes.SQUARE, ItemTypes.EXISTING_BLOCK],
    hover: (item, monitor) => {
      const clientOffset = monitor.getClientOffset();
      const isOverCurrent = monitor.isOver({ shallow: true });

      // Debug state
      console.log("Hover Debug:", {
        isOverCurrent,
        hasOffset: !!clientOffset,
        currentIndex: hoveredInsertionIndex,
      });

      // Early return if we don't have the necessary data
      if (!isOverCurrent || !clientOffset) {
        if (hoveredInsertionIndex !== null) {
          console.log("Clearing index - not over current or no offset");
          setHoveredInsertionIndex(null);
        }
        return;
      }
      
      // Clear any existing inactivity timeout when movement is detected
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }

      // Get the actual drop target container
      const dropContainer = document.querySelector(
        '[data-drop-container="true"]'
      ) as HTMLElement;
      if (!dropContainer) return;

      const dropTargetRect = dropContainer.getBoundingClientRect();
      const { x: cursorX, y: cursorY } = clientOffset;
      
      // Check if cursor has moved enough from last position to be considered movement
      const hasMovedSignificantly = !lastCursorPositionRef.current || 
        Math.abs(lastCursorPositionRef.current.x - cursorX) > 3 || 
        Math.abs(lastCursorPositionRef.current.y - cursorY) > 3;
      
      // Update last cursor position
      lastCursorPositionRef.current = { x: cursorX, y: cursorY };
      
      // If cursor has moved significantly, set a new inactivity timeout
      if (hasMovedSignificantly && hoveredInsertionIndex !== null) {
        inactivityTimeoutRef.current = setTimeout(resetInsertionIndicator, 500);
      }

      // Check if cursor is within bounds (with padding)
      const boundsPadding = 20; // Increased padding for better UX
      const isInBounds =
        cursorX >= dropTargetRect.left - boundsPadding &&
        cursorX <= dropTargetRect.right + boundsPadding;

      // Debug cursor position
      console.log("Drag State:", {
        cursor: { x: cursorX, y: cursorY },
        bounds: {
          left: dropTargetRect.left - boundsPadding,
          right: dropTargetRect.right + boundsPadding,
        },
        isInBounds,
        isOverCurrent,
        exitDirection: !isInBounds
          ? cursorX < dropTargetRect.left - boundsPadding
            ? "LEFT"
            : "RIGHT"
          : "IN_BOUNDS",
      });

      // Clear the insertion index if we're out of bounds horizontally
      if (!isInBounds) {
        if (hoveredInsertionIndex !== null) {
          console.log("Clearing index - out of bounds horizontally");
          setHoveredInsertionIndex(null);
        }
        return;
      }

      let currentHoveredIndex: number | null = null;

      // Iterate through the refs of the filtered drop areas
      for (let i = 0; i < filteredDropAreas.length - 1; i++) {
        const topAreaRef = dropAreaRefs.current[i];
        const bottomAreaRef = dropAreaRefs.current[i + 1];
        if (!topAreaRef?.current || !bottomAreaRef?.current) continue;

        const topRect = topAreaRef.current.getBoundingClientRect();
        const bottomRect = bottomAreaRef.current.getBoundingClientRect();
        const gapThreshold = 20; // pixels threshold for vertical gap

        // Check if cursor's Y coordinate is within the vertical gap between areas
        if (
          cursorY > topRect.bottom - gapThreshold &&
          cursorY < bottomRect.top + gapThreshold
        ) {
          // Calculate horizontal gap boundaries from both areas
          const gapLeft = Math.min(topRect.left, bottomRect.left);
          const gapRight = Math.max(topRect.right, bottomRect.right);

          // Check if the cursor's X coordinate lies within the horizontal gap
          if (cursorX >= gapLeft && cursorX <= gapRight) {
            currentHoveredIndex = i + 1;
            console.log("Gap detected with horizontal overlap", {
              index: i + 1,
              gapLeft,
              gapRight,
              cursorX,
            });
            break;
          } else {
            console.log("Cursor not horizontally over gap", {
              cursorX,
              gapLeft,
              gapRight,
            });
          }
        }
      }
      if (currentHoveredIndex !== hoveredInsertionIndex) {
        console.log(
          "Updating hover index from",
          hoveredInsertionIndex,
          "to",
          currentHoveredIndex
        );
        setHoveredInsertionIndex(currentHoveredIndex);
      }
    },
    drop: (item) => {
      // Removed unused monitor parameter
      // This drop handler is specifically for drops *between* areas (in the gap)
      // Clear any inactivity timeout on drop
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
        inactivityTimeoutRef.current = null;
      }
      
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
          <div
            ref={dropRefCallback}
            className="w-full"
            data-drop-container="true"
          >
            {/* Use shorthand fragment syntax */}
            {filteredDropAreas.map((dropArea, index) => (
              <React.Fragment key={dropArea.id}>
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
              </React.Fragment>
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
