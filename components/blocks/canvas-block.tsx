/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react"; // Import useState
import { useBlocksStore } from "@/store/blocks-store";
import type { BlockType } from "@/lib/types";
import type { ViewportType } from "@/lib/hooks/use-viewport";
import { Trash2, Move } from "@/lib/icons"; // Removed Split import
import { useBlockDrag } from "@/lib/hooks/use-block-drag";
import { ParagraphBlock } from "./paragraph-block";
import { ImageBlock } from "./image-block"; // Import the new component
import { getBlockStyle } from "@/lib/utils/block-utils";
import React from "react";

interface CanvasBlockProps {
  block: BlockType;
  viewport?: ViewportType;
  index: number; // Add index prop
  // Removed onSplit, canSplit props
  isOnlyBlockInArea?: boolean;
}

export function CanvasBlock({
  block,
  index, // Destructure index
  viewport = "desktop",
  // Removed onSplit, canSplit props
  isOnlyBlockInArea = false,
}: CanvasBlockProps) {
  const { selectedBlockId, selectBlock, deleteBlock } = useBlocksStore();
  const isSelected = selectedBlockId === block.id;
  // Pass index to useBlockDrag
  // Use the drag hook directly - our tracking system will prevent duplicate drags
  const { isDragging, drag } = useBlockDrag(block, index);
  const [isHovering, setIsHovering] = useState(false); // Add hover state

  // Clear selection when dragging starts
  useEffect(() => {
    if (isDragging && isSelected) {
      selectBlock(null);
    }
  }, [isDragging, isSelected, selectBlock]);

  const handleBlockClick = () => {
    if (!isSelected) {
      selectBlock(block.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteBlock(block.id, block.dropAreaId);
    selectBlock(null);
  };

  return (
    <div>
      {/* Main styled container - already has position: relative */}
      <div
        className={`p-4 bg-background border rounded-lg shadow-sm relative group
        ${
          isSelected ? "border-primary ring-2 ring-primary/20" : "border-border"
        }
        ${viewport === "mobile" ? "text-sm" : ""}
        ${isDragging ? "opacity-60" : "opacity-100"}
        transition-all duration-200 hover:shadow-md
      `}
        onClick={handleBlockClick}
        onMouseEnter={() => setIsHovering(true)} // Add mouse enter handler
        onMouseLeave={() => setIsHovering(false)} // Add mouse leave handler
        data-id={block.id}
        data-drop-area-id={block.dropAreaId}
      >
        {/* Conditionally render controls based on hover or selection */}
        {(isHovering || isSelected) && (
          <BlockControls
            onDelete={handleDelete}
            // Removed onSplit and canSplit props
            isDragging={isDragging}
            drag={drag as any} // Pass drag ref down
            showDeleteButton={!isOnlyBlockInArea}
          />
        )}
        <div>
          <BlockContent block={block} viewport={viewport} />
        </div>
      </div>
    </div>
  );
}

// Extracted component for block controls
function BlockControls({
  onDelete,
  // Removed onSplit, canSplit
  isDragging,
  drag, // Destructure the passed drag ref
  showDeleteButton = true, // New prop with default value
}: {
  onDelete: (e: React.MouseEvent) => void;
  // Removed onSplit, canSplit types
  isDragging: boolean;
  drag: React.Ref<HTMLButtonElement>;
  showDeleteButton?: boolean; // Add to type definition
}) {
  // Don't show controls while dragging
  if (isDragging) return null;

  return (
    <>
      {/* Delete button - show if allowed */}
      {showDeleteButton && (
        <button
          className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md
                  hover:bg-red-600 transition-colors duration-200 z-10" // Removed opacity/group-hover
          onClick={onDelete}
          title="Block löschen"
        >
          <Trash2 size={14} />
        </button>
      )}

      {/* Move handle */}
      <button
        ref={drag}
        className="absolute -top-2 -left-2 bg-primary text-primary-foreground p-2 rounded-full
                  shadow-md hover:bg-primary/90 cursor-grab active:cursor-grabbing
                  ring-4 ring-background pulse-animation transition-colors z-20" // Removed opacity/group-hover
        title="Zum Verschieben ziehen"
        onClick={(e) => e.stopPropagation()} // Keep stopPropagation here
      >
        <Move size={16} />
      </button>
    </>
  );
}

// Extracted component for block content
interface BlockContentProps {
  block: BlockType;
  viewport: ViewportType;
}

function BlockContent({ block, viewport }: BlockContentProps) {
  const { updateBlockContent } = useBlocksStore();
  const blockStyle = getBlockStyle(block, viewport);

  const handleHeadingChange = (data: { level: number; content: string }) => {
    // Ensure the level is valid before updating
    const validLevels = [1, 2, 3, 4, 5, 6] as const;
    type ValidHeadingLevel = (typeof validLevels)[number];
    const validatedLevel = validLevels.includes(data.level as ValidHeadingLevel)
      ? (data.level as ValidHeadingLevel)
      : 1;

    // Update block content and heading level
    updateBlockContent(block.id, block.dropAreaId, data.content, {
      headingLevel: validatedLevel,
    });
  };

  // Render different block types
  if (block.type === "heading") {
    // Import the HeadingBlock dynamically (to avoid circular dependencies)
    // Using dynamic import with React.lazy would be better, but for simplicity we'll handle it this way
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { HeadingBlock } = require("@/components/blocks/heading-block");

    // Validate heading level before passing to component
    const validLevels = [1, 2, 3, 4, 5, 6] as const;
    type ValidHeadingLevel = (typeof validLevels)[number];
    const headingLevel = block.headingLevel;
    const validatedLevel: ValidHeadingLevel =
      headingLevel && validLevels.includes(headingLevel as ValidHeadingLevel)
        ? (headingLevel as ValidHeadingLevel)
        : 1; // Default to 1 if undefined or invalid

    return (
      <HeadingBlock
        blockId={block.id}
        dropAreaId={block.dropAreaId}
        level={validatedLevel}
        content={block.content}
        onChange={handleHeadingChange}
      />
    );
  }

  if (block.type === "image") {
    return (
      <ImageBlock
        blockId={block.id}
        dropAreaId={block.dropAreaId}
        content={block.content} // Pass the URL (or null)
        altText={block.altText} // Pass alt text
      />
    );
  }

  if (block.type === "paragraph") {
    return (
      <ParagraphBlock
        blockId={block.id}
        dropAreaId={block.dropAreaId}
        content={block.content}
        viewport={viewport}
      />
    );
  }

  // Default for other block types
  return <div className={blockStyle}>{block.content}</div>;
}
