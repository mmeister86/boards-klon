import type { LayoutType, ContentDropZoneType, LayoutBlockType } from "@/lib/types";

// Debounce helper function
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Helper function to check if a zone is empty
export const isZoneEmpty = (zone: ContentDropZoneType): boolean => {
  return zone.blocks.length === 0;
};

// Helper function to check if a layout block is empty
export const isLayoutBlockEmpty = (layoutBlock: LayoutBlockType): boolean => {
  return layoutBlock.zones.every(isZoneEmpty);
};

// Helper function to check if a project is empty
export const isEmptyProject = (layoutBlocks: LayoutBlockType[]): boolean => {
  return layoutBlocks.every(isLayoutBlockEmpty);
};

// Helper function to create an empty content zone
export function createEmptyZone(id: string): ContentDropZoneType {
  return {
    id,
    blocks: [],
  };
}

// Helper function to create an empty layout block
export function createEmptyLayoutBlock(id: string, type: LayoutType): LayoutBlockType {
  const numZones = type === "single-column" ? 1 :
                  type === "two-columns" || type === "layout-1-2" || type === "layout-2-1" ? 2 :
                  type === "three-columns" ? 3 :
                  type === "grid-2x2" ? 4 : 1;

  return {
    id,
    type,
    zones: Array.from({ length: numZones }, (_, i) => createEmptyZone(`${id}-zone-${i}`)),
  };
}

// Helper function to find a layout block and zone by their IDs
export function findLayoutBlockAndZone(
  layoutBlocks: LayoutBlockType[],
  layoutId: string,
  zoneId: string
): { layoutBlock?: LayoutBlockType; zone?: ContentDropZoneType } {
  const layoutBlock = layoutBlocks.find(block => block.id === layoutId);
  if (!layoutBlock) return { layoutBlock: undefined, zone: undefined };

  const zone = layoutBlock.zones.find(zone => zone.id === zoneId);
  return { layoutBlock, zone };
}

// Helper function to update a layout block with new properties
export function updateLayoutBlock(
  layoutBlocks: LayoutBlockType[],
  layoutId: string,
  updates: Partial<LayoutBlockType>
): LayoutBlockType[] {
  return layoutBlocks.map(block =>
    block.id === layoutId ? { ...block, ...updates } : block
  );
}
