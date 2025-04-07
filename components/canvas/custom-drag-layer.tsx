"use client";

import React from "react";
import { useDragLayer, DragLayerMonitor } from "react-dnd"; // Import DragLayerMonitor
import { ItemTypes } from "@/lib/item-types";
import { Move } from "@/lib/icons";
import { getBlockStyle } from "@/lib/utils/block-utils";
// Import the actual block components
import { HeadingBlock } from "@/components/blocks/heading-block";
import { ParagraphBlock } from "@/components/blocks/paragraph-block";
import type { Level } from "@tiptap/extension-heading"; // Import Level type

// Define specific types for the dragged items
interface SidebarDragItem {
  type: string; // The block type (e.g., 'heading')
  content: string;
  isSidebarItem: true;
}

interface BlockDragItem {
  id: string;
  type: typeof ItemTypes.EXISTING_BLOCK;
  originalType: string; // The actual block type (e.g., 'heading')
  content: string;
  sourceDropAreaId: string;
  originalIndex: number;
  headingLevel?: number;
}

// Union type for the item collected by the drag layer
type DragLayerItem = SidebarDragItem | BlockDragItem;

// Preview component rendering logic
function BlockPreview({
  item,
  itemType,
}: {
  item: DragLayerItem; // Use the specific union type
  itemType: string | symbol | null;
}) {
  const isExistingBlock = itemType === ItemTypes.EXISTING_BLOCK;
  // Determine the type based on whether it's an existing block or a sidebar item
  const blockTypeToRender = isExistingBlock
    ? (item as BlockDragItem).originalType
    : item.type;
  // Get base style - remove 'as any' cast
  const blockStyle = getBlockStyle(item, "desktop");

  // Render actual components for existing blocks
  if (isExistingBlock) {
    const existingItem = item as BlockDragItem; // Type assertion
    if (blockTypeToRender === "heading") {
      // Validate and cast headingLevel to Level
      const validLevels: Level[] = [1, 2, 3, 4, 5, 6];
      const level = (
        validLevels.includes((existingItem.headingLevel || 1) as Level)
          ? existingItem.headingLevel || 1
          : 1
      ) as Level;

      return (
        <HeadingBlock
          blockId={existingItem.id}
          dropAreaId={existingItem.sourceDropAreaId}
          content={existingItem.content}
          level={level} // Pass validated level
          readOnly={true}
          onChange={() => {}} // Dummy onChange for readOnly
        />
      );
    }
    if (blockTypeToRender === "paragraph") {
      return (
        <ParagraphBlock
          blockId={existingItem.id}
          dropAreaId={existingItem.sourceDropAreaId}
          content={existingItem.content}
          readOnly={true}
          // viewport prop might not be needed for preview
        />
      );
    }
    // Add cases for other existing block types if needed
  }

  // --- Fallback / Sidebar Item Previews ---
  const sidebarItem = item as SidebarDragItem; // Type assertion

  // Image block (applies to both sidebar and existing if not handled above)
  if (blockTypeToRender === "image") {
    return (
      <div className="bg-gray-100 aspect-video flex items-center justify-center rounded-md">
        <span className="text-muted-foreground">Bild</span>
      </div>
    );
  }

  // Sidebar Heading/Paragraph Preview (simple HTML)
  if (
    !isExistingBlock &&
    (blockTypeToRender === "heading" || blockTypeToRender === "paragraph")
  ) {
    return (
      <div
        className={
          blockTypeToRender === "heading"
            ? `${blockStyle} prose prose-sm max-w-none`
            : "prose prose-sm max-w-none"
        }
        dangerouslySetInnerHTML={{
          __html:
            sidebarItem.content ||
            (blockTypeToRender === "heading"
              ? "Überschrift"
              : "Paragraph text"),
        }}
      />
    );
  }

  // Default for other block types (e.g., button, form, divider from sidebar)
  // Or fallback for existing blocks not explicitly handled above
  return (
    <div className={blockStyle}>{sidebarItem.content || blockTypeToRender}</div>
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
    useDragLayer((monitor: DragLayerMonitor<DragLayerItem>) => ({
      // Use specific item type
      // Use DragLayerMonitor type
      item: monitor.getItem(),
      itemType: monitor.getItemType(),
      initialOffset: monitor.getInitialSourceClientOffset(),
      currentOffset: monitor.getSourceClientOffset(),
      isDragging: monitor.isDragging(),
    }));

  // Re-enable the condition to only show the layer when dragging an existing block
  // or potentially other types if needed in the future.
  // For now, we only care about EXISTING_BLOCK previews being accurate.
  // Only render preview for existing blocks being dragged on the canvas
  if (!isDragging || itemType !== ItemTypes.EXISTING_BLOCK) {
    return null;
  }

  function renderPreview() {
    // Check item and itemType before rendering BlockPreview
    if (item && itemType) {
      // Render the preview within the styled container
      return (
        <div
          className="p-4 bg-background border rounded-lg shadow-lg relative border-border"
          style={{
            width: "300px", // Fixed width for preview
            maxHeight: "200px", // Max height
            overflow: "hidden", // Hide overflow
            // Add pointer-events: none? Maybe not needed due to layerStyles
          }}
        >
          <BlockPreview item={item} itemType={itemType} />
        </div>
      );
    }
    // Fallback if item/itemType is somehow invalid during drag
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
