import type { BlockType, DropAreaType, LayoutType, ContentDropZoneType, LayoutBlockType } from "@/lib/types";

// Debounce helper function
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export const findDropAreaById = (
  dropAreas: DropAreaType[],
  id: string
): DropAreaType | null => {
  for (const area of dropAreas) {
    if (area.id === id) return area;
  }
  return null;
};

export const findBlockById = (
  dropAreas: DropAreaType[],
  blockId: string
): BlockType | null => {
  for (const area of dropAreas) {
    const block = area.blocks.find((block: BlockType) => block.id === blockId);
    if (block) return block;
  }
  return null;
};

export const isDropAreaEmpty = (dropArea: DropAreaType): boolean => {
  return dropArea.blocks.length === 0 && !dropArea.isSplit;
};

export const isEmptyProject = (dropAreas: DropAreaType[]): boolean => {
  return dropAreas.length === 1 && isDropAreaEmpty(dropAreas[0]);
};

export const canMergeAreas = (
  firstArea: DropAreaType,
  secondArea: DropAreaType
): boolean => {
  return firstArea.splitLevel === secondArea.splitLevel;
};

// Helper function to create a new empty drop area
export function createEmptyDropArea(id: string): DropAreaType {
  return {
    id,
    blocks: [],
    isSplit: false,
    splitAreas: [],
    splitLevel: 0,
  };
}

// Helper function to create a trace ID for logging
export function createTraceId(operation: string): string {
  return `${operation}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

// Helper function to find a layout block and zone by their IDs
export const findLayoutBlockAndZone = (
  layoutBlocks: LayoutBlockType[],
  layoutId: string,
  zoneId: string
): { layoutBlock: LayoutBlockType | null; zone: ContentDropZoneType | null } => {
  const layoutBlock = layoutBlocks.find((block) => block.id === layoutId) || null;
  const zone = layoutBlock?.zones.find((zone) => zone.id === zoneId) || null;
  return { layoutBlock, zone };
};

// Helper function to update a layout block
export const updateLayoutBlock = (
  layoutBlocks: LayoutBlockType[],
  layoutId: string,
  updates: Partial<LayoutBlockType>
): LayoutBlockType[] => {
  return layoutBlocks.map((block) =>
    block.id === layoutId ? { ...block, ...updates } : block
  );
};
