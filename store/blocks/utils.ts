import type { BlockType, DropAreaType } from "@/lib/types";

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
    const block = area.blocks.find((b) => b.id === blockId);
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
