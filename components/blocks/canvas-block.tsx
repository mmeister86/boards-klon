/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import { useBlocksStore } from "@/store/blocks-store";
import type { BlockType } from "@/lib/types";
import type { ViewportType } from "@/lib/hooks/use-viewport";
import { Trash2, Move, Split } from "@/lib/icons";
import { useBlockDrag } from "@/lib/hooks/use-block-drag";
import { ParagraphBlock } from "./paragraph-block";
import { getBlockStyle } from "@/lib/utils/block-utils";
import React from "react";

interface CanvasBlockProps {
  block: BlockType;
  viewport?: ViewportType;
  onSplit?: () => void;
  canSplit?: boolean;
  isOnlyBlockInArea?: boolean;
}

export function CanvasBlock({
  block,
  viewport = "desktop",
  onSplit,
  canSplit = true,
  isOnlyBlockInArea = false,
}: CanvasBlockProps) {
  const { selectedBlockId, selectBlock, deleteBlock } = useBlocksStore();
  const isSelected = selectedBlockId === block.id;
  const { isDragging, drag } = useBlockDrag(block);

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
        data-id={block.id}
        data-drop-area-id={block.dropAreaId}
      >
        <BlockControls
          onDelete={handleDelete}
          onSplit={onSplit}
          canSplit={canSplit && !!onSplit}
          isDragging={isDragging}
          drag={drag as any} // Pass drag ref down
          showDeleteButton={!isOnlyBlockInArea}
        />
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
  onSplit,
  canSplit,
  isDragging,
  drag, // Destructure the passed drag ref
  showDeleteButton = true, // New prop with default value
}: {
  onDelete: (e: React.MouseEvent) => void;
  onSplit?: () => void;
  canSplit?: boolean;
  isDragging: boolean;
  drag: React.Ref<HTMLButtonElement>;
  showDeleteButton?: boolean; // Add to type definition
}) {
  // Don't show controls while dragging
  if (isDragging) return null;

  return (
    <>
      {/* Delete button - show on hover, only if showDeleteButton is true */}
      {showDeleteButton && (
        <button
          className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md
                  hover:bg-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
          onClick={onDelete}
          title="Block löschen"
        >
          <Trash2 size={14} />
        </button>
      )}

      {/* Split button - show on hover if splitting is allowed */}
      {canSplit && onSplit && (
        <button
          className="absolute top-6 -right-2 bg-blue-500 text-white p-1.5 rounded-full shadow-md
                    hover:bg-blue-600 transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
          onClick={(e) => {
            e.stopPropagation();
            onSplit();
          }}
          title="Bereich teilen"
        >
          <Split size={14} />
        </button>
      )}

      {/* Move handle - only show on hover */}
      <button
        ref={drag}
        className="absolute -top-2 -left-2 bg-primary text-primary-foreground p-2 rounded-full
                  shadow-md hover:bg-primary/90 cursor-grab active:cursor-grabbing
                  ring-4 ring-background pulse-animation transition-all opacity-0 group-hover:opacity-100 z-20"
        title="Zum Verschieben ziehen"
        onClick={(e) => e.stopPropagation()}
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
        level={validatedLevel} // Use validated level
        content={block.content}
        onChange={handleHeadingChange}
      />
    );
  }

  if (block.type === "image") {
    return (
      <div className={blockStyle}>
        <span className="text-muted-foreground">Bildblock</span>
      </div>
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
