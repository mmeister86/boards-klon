"use client";

import { useDrop } from "react-dnd";
import { useState } from "react";
import { ItemTypes } from "@/lib/item-types";
import { useBlocksStore } from "@/store/blocks-store";
import type { DropAreaType } from "@/lib/types";
import type { ViewportType } from "@/lib/hooks/use-viewport";
import { CanvasBlock } from "@/components/blocks/canvas-block";
import { SquareSplitHorizontalIcon as SplitHorizontal } from "lucide-react";

interface DropAreaProps {
  dropArea: DropAreaType;
  showSplitIndicator?: boolean;
  viewport: ViewportType;
}

export function DropArea({
  dropArea,
  showSplitIndicator = false,
  viewport,
}: DropAreaProps) {
  const { addBlock, splitDropArea, canSplit, moveBlock } = useBlocksStore();
  const [isHovering, setIsHovering] = useState(false);

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: [ItemTypes.BLOCK, ItemTypes.SQUARE, ItemTypes.EXISTING_BLOCK], // Accept existing blocks too
    drop: (item: {
      id?: string;
      type: string;
      content: string;
      sourceDropAreaId?: string;
    }) => {
      // Handle the drop event
      if (item.sourceDropAreaId) {
        // This is an existing block being moved
        moveBlock(item.id!, item.sourceDropAreaId, dropArea.id);
      } else {
        // This is a new block being added
        addBlock(
          {
            type: item.type || "square", // Default to square if type is not provided
            content: item.content || "Dropped Square", // Default content if not provided
            dropAreaId: dropArea.id,
          },
          dropArea.id
        );
      }
      return { name: `Drop Area ${dropArea.id}` };
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });

  // Determine visual cues based on drop state
  const getDropAreaStyles = () => {
    let baseClasses =
      "w-full min-h-[120px] rounded-xl border-2 relative bento-box transition-all duration-200";

    // Empty drop area has dashed border
    if (dropArea.blocks.length === 0) {
      baseClasses += " border-dashed";
    } else {
      baseClasses += " border-transparent";
    }

    // Visual cues for drag operations
    if (isOver && canDrop) {
      // Active drop target - strong visual cue
      baseClasses += " border-primary bg-primary/10 scale-[1.02] shadow-lg";
    } else if (canDrop) {
      // Potential drop target - subtle visual cue
      baseClasses += " border-primary/50 bg-primary/5";
    } else {
      // Default state
      baseClasses += " border-border";
    }

    return baseClasses;
  };

  const handleSplit = () => {
    if (canSplit(dropArea.id, viewport)) {
      splitDropArea(dropArea.id);
    }
  };

  // Only show split indicator if:
  // 1. showSplitIndicator is true
  // 2. The area is being hovered
  // 3. The area is not currently being dragged over
  // 4. The area doesn't have any blocks yet
  // 5. The area is not already split
  // 6. The area can be split (based on split level restrictions)
  const shouldShowSplitIndicator =
    showSplitIndicator &&
    isHovering &&
    !isOver &&
    dropArea.blocks.length === 0 &&
    !dropArea.isSplit &&
    canSplit(dropArea.id, viewport);

  // For mobile viewport, always stack vertically
  if (
    viewport === "mobile" &&
    dropArea.isSplit &&
    dropArea.splitAreas.length === 2
  ) {
    return (
      <div className="w-full space-y-4">
        <DropArea
          dropArea={dropArea.splitAreas[0]}
          showSplitIndicator={false}
          viewport={viewport}
        />
        <DropArea
          dropArea={dropArea.splitAreas[1]}
          showSplitIndicator={false}
          viewport={viewport}
        />
      </div>
    );
  }

  // For tablet viewport with 2x2 grid layout
  if (
    viewport === "tablet" &&
    dropArea.isSplit &&
    dropArea.splitAreas.length === 2
  ) {
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
                viewport={viewport}
              />
              <DropArea
                dropArea={dropArea.splitAreas[0].splitAreas[1]}
                showSplitIndicator={false}
                viewport={viewport}
              />
            </>
          ) : (
            <DropArea
              dropArea={dropArea.splitAreas[0]}
              showSplitIndicator={showSplitIndicator}
              viewport={viewport}
            />
          )}

          {/* Render the second split area */}
          {dropArea.splitAreas[1].isSplit ? (
            <>
              <DropArea
                dropArea={dropArea.splitAreas[1].splitAreas[0]}
                showSplitIndicator={false}
                viewport={viewport}
              />
              <DropArea
                dropArea={dropArea.splitAreas[1].splitAreas[1]}
                showSplitIndicator={false}
                viewport={viewport}
              />
            </>
          ) : (
            <DropArea
              dropArea={dropArea.splitAreas[1]}
              showSplitIndicator={showSplitIndicator}
              viewport={viewport}
            />
          )}
        </div>
      );
    }

    // First-level split for tablet - side by side
    return (
      <div className="w-full flex gap-4">
        <div className="flex-1 bento-box">
          <DropArea
            dropArea={dropArea.splitAreas[0]}
            showSplitIndicator={showSplitIndicator}
            viewport={viewport}
          />
        </div>
        <div className="flex-1 bento-box">
          <DropArea
            dropArea={dropArea.splitAreas[1]}
            showSplitIndicator={showSplitIndicator}
            viewport={viewport}
          />
        </div>
      </div>
    );
  }

  // For desktop with up to 4-in-a-row layout
  if (
    viewport === "desktop" &&
    dropArea.isSplit &&
    dropArea.splitAreas.length === 2
  ) {
    return (
      <div className="w-full flex gap-4">
        <div className="flex-1 bento-box">
          <DropArea
            dropArea={dropArea.splitAreas[0]}
            showSplitIndicator={showSplitIndicator}
            viewport={viewport}
          />
        </div>
        <div className="flex-1 bento-box">
          <DropArea
            dropArea={dropArea.splitAreas[1]}
            showSplitIndicator={showSplitIndicator}
            viewport={viewport}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={drop}
      className={getDropAreaStyles()}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Drop indicator - show when dragging over */}
      {isOver && canDrop && (
        <div className="absolute inset-0 border-2 border-primary rounded-xl pointer-events-none z-10 flex items-center justify-center">
          <div className="bg-primary/20 rounded-lg px-3 py-1.5 text-sm font-medium text-primary">
            Drop here
          </div>
        </div>
      )}

      {/* Split indicator - only show under specific conditions */}
      {shouldShowSplitIndicator && (
        <button
          onClick={handleSplit}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-background p-2 rounded-full shadow-md hover:bg-secondary transition-colors"
          title="Split drop area horizontally"
        >
          <SplitHorizontal size={16} className="text-primary" />
        </button>
      )}

      {dropArea.blocks.length === 0 ? (
        <div className="h-full flex items-center justify-center text-muted-foreground p-8">
          <p className="text-sm">Lege deine Elemente hier ab</p>
        </div>
      ) : (
        <div className="space-y-4 p-4">
          {dropArea.blocks.map((block) => (
            <CanvasBlock key={block.id} block={block} viewport={viewport} />
          ))}
        </div>
      )}
    </div>
  );
}
