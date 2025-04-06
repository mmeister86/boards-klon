"use client";

import React from "react";
import { useDragLayer } from "react-dnd";
import { ItemTypes } from "@/lib/item-types";
import type { BlockType } from "@/lib/types";
import { Move } from "@/lib/icons";
import { getBlockStyle } from "@/lib/utils/block-utils";

// Preview component that exactly mirrors the CanvasBlock component
function BlockPreview({ item }: { item: BlockType }) {
  // Get the same block style that's used in BlockContent
  const blockStyle = getBlockStyle(item, "desktop");

  return (
    <div className="relative">
      {/* This mirrors the exact container in CanvasBlock */}
      <div
        className="p-4 bg-background border rounded-lg shadow-sm relative
        border-border
        transition-all duration-200 hover:shadow-md"
        style={{
          width: "300px",
          maxHeight: "200px",
          overflow: "hidden",
        }}
      >
        {/* Image block */}
        {item.type === "image" && (
          <div className="bg-gray-100 aspect-video flex items-center justify-center rounded-md">
            <span className="text-muted-foreground">Bild</span>
          </div>
        )}

        {/* Heading block */}
        {item.type === "heading" && (
          <div
            className={`${blockStyle} prose prose-sm max-w-none`} // Added prose classes
            dangerouslySetInnerHTML={{ __html: item.content || "Überschrift" }}
          />
        )}

        {/* Paragraph block - match the editor styling */}
        {item.type === "paragraph" && (
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{
              __html: item.content || "Paragraph text",
            }}
          />
        )}

        {/* Default for other block types */}
        {item.type !== "heading" &&
          item.type !== "paragraph" &&
          item.type !== "image" && (
            <div className={blockStyle}>{item.content || item.type}</div>
          )}
      </div>
    </div>
  );
}

// Simple preview for the drag handle itself (fallback or other types)
function HandlePreview() {
  return (
    <div className="bg-primary text-primary-foreground p-1.5 rounded-full shadow-md opacity-75">
      <Move size={14} />
    </div>
  );
}

const layerStyles: React.CSSProperties = {
  position: "fixed",
  pointerEvents: "none",
  zIndex: 100, // Ensure it's above everything else
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
};

function getItemStyles(
  initialOffset: { x: number; y: number } | null,
  currentOffset: { x: number; y: number } | null
) {
  if (!initialOffset || !currentOffset) {
    return {
      display: "none",
    };
  }

  const { x, y } = currentOffset;

  // Use a smaller offset to keep it close to the cursor
  const offsetX = 10;
  const offsetY = 5;

  const transform = `translate(${x + offsetX}px, ${y + offsetY}px)`;
  return {
    transform,
    WebkitTransform: transform,
  };
}

export function CustomDragLayer() {
  const { itemType, isDragging, item, initialOffset, currentOffset } =
    useDragLayer((monitor) => ({
      item: monitor.getItem(),
      itemType: monitor.getItemType(),
      initialOffset: monitor.getInitialSourceClientOffset(),
      currentOffset: monitor.getSourceClientOffset(),
      isDragging: monitor.isDragging(),
    }));

  // Enhanced logging with timestamp for tracking drag previews
  // if (isDragging) { // Removed log block
  //   console.log(`🔵 [${new Date().toISOString()}] DRAG PREVIEW RENDERING:`);
  //   console.log(`Item type: ${String(itemType)}`);
  //   console.log("Item data:", item);
  //   console.log("Current offset:", currentOffset);
  // }
  if (isDragging && itemType === ItemTypes.EXISTING_BLOCK) {
    console.log('Drag Layer Item:', item); // <-- ADDED LOG
  }

  // Only show for existing block items from the canvas
  if (!isDragging || itemType !== ItemTypes.EXISTING_BLOCK) {
    return null;
  }

  function renderPreview() {
    if (item && typeof item === "object" && "type" in item) {
      return <BlockPreview item={item as BlockType} />;
    }
    return <HandlePreview />;
  }

  return (
    <div style={layerStyles}>
      <div style={getItemStyles(initialOffset, currentOffset)}>
        {renderPreview()}
      </div>
    </div>
  );
}
