"use client";

import React from "react";
import { useDragLayer, DragLayerMonitor } from "react-dnd";
import { ItemTypes as ContentItemTypes } from "@/lib/item-types"; // e.g., EXISTING_BLOCK, CONTENT_BLOCK
import { ItemTypes as DndItemTypes } from "@/lib/dnd/itemTypes"; // e.g., EXISTING_LAYOUT_BLOCK, LAYOUT_BLOCK, MEDIA_ITEM
import { Move, GripVertical } from "lucide-react"; // Import GripVertical
import type { LucideIcon } from "lucide-react"; // Import LucideIcon
import { cn } from "@/lib/utils"; // Import cn for styling sidebar previews
import type { MediaItemInput } from "@/components/media/draggable-media-item";

// Define specific types for the dragged items
// Interface for items dragged FROM the sidebar
interface SidebarContentDragItem {
  type: typeof DndItemTypes.CONTENT_BLOCK;
  blockType: string;
  content?: string | null;
  // Props needed for preview that match DraggableBlock
  icon?: LucideIcon;
  label?: string;
}

interface SidebarLayoutDragItem {
  type: typeof DndItemTypes.LAYOUT_BLOCK;
  layoutType: string;
  // Props needed for preview that match DraggableLayoutItem
  icon?: LucideIcon;
  label?: string;
}

// Interface for EXISTING content blocks dragged ON the canvas
interface ExistingBlockDragItem {
  id: string;
  type: typeof ContentItemTypes.EXISTING_BLOCK;
  originalType: string;
  content: unknown;
  sourceLayoutId: string;
  sourceZoneId: string;
  originalIndex: number;
  headingLevel?: number;
}

// Interface for EXISTING layout blocks dragged ON the canvas
interface ExistingLayoutDragItem {
  id: string;
  index: number;
  type: typeof DndItemTypes.EXISTING_LAYOUT_BLOCK;
}

// Union type for the item collected by the drag layer
type DragLayerItem =
  | SidebarContentDragItem
  | SidebarLayoutDragItem
  | ExistingBlockDragItem
  | ExistingLayoutDragItem
  | MediaItemInput;

// Preview component rendering logic
function ItemPreview({
  item,
  itemType,
}: {
  item: DragLayerItem;
  itemType: string | symbol | null;
}) {
  // Render preview for EXISTING Content Blocks (from Canvas)
  if (itemType === ContentItemTypes.EXISTING_BLOCK) {
    const existingItem = item as ExistingBlockDragItem;
    return (
      <div className="p-2 border rounded bg-white shadow text-xs flex items-center gap-1">
        <Move size={14} /> {existingItem.originalType}
      </div>
    );
  }

  // Render preview for EXISTING Layout Blocks (from Canvas)
  if (itemType === DndItemTypes.EXISTING_LAYOUT_BLOCK) {
    return (
      <div className="bg-blue-500 text-white p-1.5 rounded-full shadow-md opacity-75">
        <GripVertical size={16} />
      </div>
    );
  }

  // Render preview for NEW Content Blocks (from Sidebar)
  if (itemType === DndItemTypes.CONTENT_BLOCK) {
    const sidebarItem = item as SidebarContentDragItem;
    const Icon = sidebarItem.icon;
    // Replicate DraggableBlock appearance
    return (
      <div
        className={`aspect-square flex flex-col items-center justify-center gap-1 p-2 !bg-[#fef9ef]/80 border border-border rounded-lg shadow-sm opacity-75 w-[90px] h-[90px]`}
      >
        {Icon && <Icon className="h-8 w-8 text-slate-500" />}
        {sidebarItem.label && (
          <span className="text-xs text-center text-slate-500">
            {sidebarItem.label}
          </span>
        )}
      </div>
    );
  }

  // Render preview for NEW Layout Blocks (from Sidebar)
  if (itemType === DndItemTypes.LAYOUT_BLOCK) {
    const sidebarItem = item as SidebarLayoutDragItem;
    const Icon = sidebarItem.icon;
    // Replicate DraggableLayoutItem appearance
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center p-3 border rounded-lg bg-background shadow-sm opacity-75 w-[90px] h-[90px]"
        )}
      >
        {Icon && <Icon className="w-6 h-6 mb-1.5 text-muted-foreground" />}
        {sidebarItem.label && (
          <span className="text-xs font-medium text-center text-foreground">
            {sidebarItem.label}
          </span>
        )}
      </div>
    );
  }

  // Render minimal preview for MEDIA_ITEM to prevent fallback text
  if (itemType === DndItemTypes.MEDIA_ITEM) {
    // Render a tiny, transparent div to occupy the preview slot
    return <div style={{ width: 1, height: 1, opacity: 0 }} />;
  }

  // Fallback/Default preview
  return <div className="p-1 border rounded bg-gray-200 text-xs">Preview</div>;
}

const layerStyles: React.CSSProperties = {
  position: "fixed",
  pointerEvents: "none",
  zIndex: 100,
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
    return { display: "none" };
  }
  const { x, y } = currentOffset;
  const transform = `translate(${x + 10}px, ${y + 5}px)`; // Small offset from cursor
  return { transform, WebkitTransform: transform };
}

export function CustomDragLayer() {
  const { itemType, isDragging, item, initialOffset, currentOffset } =
    useDragLayer((monitor: DragLayerMonitor<DragLayerItem>) => ({
      item: monitor.getItem(),
      itemType: monitor.getItemType(),
      initialOffset: monitor.getInitialSourceClientOffset(),
      currentOffset: monitor.getSourceClientOffset(),
      isDragging: monitor.isDragging(),
    }));

  // Render the layer ONLY if dragging is in progress
  if (!isDragging) {
    return null;
  }

  return (
    <div style={layerStyles}>
      <div style={getItemStyles(initialOffset, currentOffset)}>
        {/* Render the appropriate preview based on item type */}
        {item && itemType && <ItemPreview item={item} itemType={itemType} />}
      </div>
    </div>
  );
}
