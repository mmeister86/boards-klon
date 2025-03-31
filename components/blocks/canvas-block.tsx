"use client";

import type React from "react";
import { useEffect } from "react";
import { useBlocksStore } from "@/store/blocks-store";
import type { BlockType } from "@/lib/types";
import type { ViewportType } from "@/lib/hooks/use-viewport";
import { Trash2, Move, Split } from "@/lib/icons";
import { useBlockDrag } from "@/lib/hooks/use-block-drag";
import { getBlockStyle } from "@/lib/utils/block-utils";

interface CanvasBlockProps {
  block: BlockType;
  viewport?: ViewportType;
  onSplit?: () => void;
  canSplit?: boolean;
}

export function CanvasBlock({
  block,
  viewport = "desktop",
  onSplit,
  canSplit = true,
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

  const handleBlockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectBlock(block.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteBlock(block.id, block.dropAreaId);
    selectBlock(null);
  };

  return (
    <div
      ref={drag as unknown as React.LegacyRef<HTMLDivElement>}
      className={`p-4 bg-background border rounded-lg shadow-sm relative group
        ${
          isSelected ? "border-primary ring-2 ring-primary/20" : "border-border"
        }
        ${viewport === "mobile" ? "text-sm" : ""}
        ${isDragging ? "opacity-50" : "opacity-100"}
        transition-all duration-200 hover:shadow-md cursor-move
      `}
      onClick={handleBlockClick}
      data-id={block.id}
      data-drop-area-id={block.dropAreaId}
    >
      <BlockControls
        isSelected={isSelected}
        onDelete={handleDelete}
        onSplit={onSplit}
        canSplit={canSplit && !!onSplit}
        isDragging={isDragging}
      />

      <BlockContent block={block} viewport={viewport} />
    </div>
  );
}

// Extracted component for block controls
function BlockControls({
  isSelected,
  onDelete,
  onSplit,
  canSplit,
  isDragging,
}: {
  isSelected: boolean;
  onDelete: (e: React.MouseEvent) => void;
  onSplit?: () => void;
  canSplit?: boolean;
  isDragging: boolean;
}) {
  // Don't show controls while dragging
  if (isDragging) return null;

  return (
    <>
      {/* Delete button - show on hover */}
      <button
        className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md
                  hover:bg-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
        onClick={onDelete}
        title="Block löschen"
      >
        <Trash2 size={14} />
      </button>

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

      {/* Move handle - show when selected */}
      {isSelected && (
        <button
          className="absolute -top-2 -left-2 bg-primary text-primary-foreground p-1.5 rounded-full
                    shadow-md hover:bg-primary/90 transition-colors cursor-move"
          title="Zum Verschieben ziehen"
        >
          <Move size={14} />
        </button>
      )}
    </>
  );
}

// Extracted component for block content
function BlockContent({
  block,
  viewport,
}: {
  block: BlockType;
  viewport: ViewportType;
}) {
  const { updateBlockContent } = useBlocksStore();
  const blockStyle = getBlockStyle(block, viewport);

  const handleHeadingChange = (data: { level: number; content: string }) => {
    // Update block content and heading level
    updateBlockContent(block.id, block.dropAreaId, data.content, { headingLevel: data.level });
  };

  // Render different block types
  if (block.type === "heading") {
    // Import the HeadingBlock dynamically (to avoid circular dependencies)
    // Using dynamic import with React.lazy would be better, but for simplicity we'll handle it this way
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { HeadingBlock } = require("@/components/blocks/heading-block");
    return (
      <HeadingBlock 
        level={block.headingLevel || 1}
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
  
  // Default for other block types
  return (
    <div className={blockStyle}>
      {block.content}
    </div>
  );
}
