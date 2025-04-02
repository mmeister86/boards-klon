import type { DropAreaType, BlockType } from "@/lib/types";

// Helper function to find a drop area by ID (including nested areas)
export const findDropAreaById = (
  areas: DropAreaType[],
  id: string
): DropAreaType | null => {
  for (const area of areas) {
    if (area.id === id) return area;

    if (area.isSplit && area.splitAreas.length > 0) {
      const found = findDropAreaById(area.splitAreas, id);
      if (found) return found;
    }
  }
  return null;
};

// Helper function to find a block by ID in any drop area
export const findBlockById = (
  areas: DropAreaType[],
  blockId: string
): {
  block: BlockType | null;
  dropAreaId: string | null;
} => {
  for (const area of areas) {
    // Check blocks in this area
    const block = area.blocks.find((block) => block.id === blockId);
    if (block) {
      return { block, dropAreaId: area.id };
    }

    // Check blocks in split areas
    if (area.isSplit && area.splitAreas.length > 0) {
      const result = findBlockById(area.splitAreas, blockId);
      if (result.block) {
        return result;
      }
    }
  }
  return { block: null, dropAreaId: null };
};

// Helper function to update a drop area by ID (including nested areas)
export const updateDropAreaById = (
  areas: DropAreaType[],
  id: string,
  updater: (area: DropAreaType) => DropAreaType
): DropAreaType[] => {
  return areas.map((area) => {
    if (area.id === id) {
      return updater(area);
    }

    if (area.isSplit && area.splitAreas.length > 0) {
      return {
        ...area,
        splitAreas: updateDropAreaById(area.splitAreas, id, updater),
      };
    }

    return area;
  });
};

// Helper function to check if a drop area is empty (no blocks and not split)
export const isDropAreaEmpty = (area: DropAreaType): boolean => {
  if (area.blocks.length > 0) return false;
  if (
    area.isSplit &&
    area.splitAreas.some((subArea) => !isDropAreaEmpty(subArea))
  )
    return false;
  return true;
};

// Filter out empty drop areas for preview
export const filterNonEmptyDropAreas = (
  dropAreas: DropAreaType[]
): DropAreaType[] => {
  return dropAreas.filter(
    (area) =>
      area.blocks.length > 0 ||
      (area.isSplit &&
        area.splitAreas.some(
          (subArea) =>
            subArea.blocks.length > 0 ||
            (subArea.isSplit &&
              subArea.splitAreas.some(
                (nestedArea) => nestedArea.blocks.length > 0
              ))
        ))
  );
};

// Find the parent drop area that contains the two specified areas as split areas
export const findParentOfSplitAreas = (
  areas: DropAreaType[],
  firstAreaId: string,
  secondAreaId: string
): DropAreaType | null => {
  for (const area of areas) {
    if (area.isSplit && area.splitAreas.length === 2) {
      const hasFirstArea = area.splitAreas.some(
        (splitArea) => splitArea.id === firstAreaId
      );
      const hasSecondArea = area.splitAreas.some(
        (splitArea) => splitArea.id === secondAreaId
      );

      // If both areas are found in this parent's split areas, return the parent
      if (hasFirstArea && hasSecondArea) {
        return area;
      }
    }

    // Recursively check any split areas
    if (area.isSplit && area.splitAreas.length > 0) {
      const parent = findParentOfSplitAreas(
        area.splitAreas,
        firstAreaId,
        secondAreaId
      );
      if (parent) return parent;
    }
  }

  return null;
};

// Check if two areas can be merged
export const canMergeAreas = (
  areas: DropAreaType[],
  firstAreaId: string,
  secondAreaId: string
): boolean => {
  // Find the two areas
  const firstArea = findDropAreaById(areas, firstAreaId);
  const secondArea = findDropAreaById(areas, secondAreaId);

  if (!firstArea || !secondArea) return false;

  // Check if both areas are empty or if one is empty and one has content
  // Areas that are already split cannot be merged
  const firstAreaEmpty = firstArea.blocks.length === 0 && !firstArea.isSplit;
  const secondAreaEmpty = secondArea.blocks.length === 0 && !secondArea.isSplit;

  // Allow merge if at least one area is empty and neither area is already split
  const validContents =
    (firstAreaEmpty || secondAreaEmpty) &&
    !firstArea.isSplit &&
    !secondArea.isSplit;

  if (!validContents) {
    // Debug log: this might be why we can't merge
    console.log(
      `Cannot merge ${firstAreaId} and ${secondAreaId}: invalid contents`,
      {
        firstAreaEmpty,
        firstAreaBlocks: firstArea.blocks.length,
        firstAreaSplit: firstArea.isSplit,
        secondAreaEmpty,
        secondAreaBlocks: secondArea.blocks.length,
        secondAreaSplit: secondArea.isSplit,
      }
    );
    return false;
  }

  // Find the parent that contains both areas as split areas
  const parent = findParentOfSplitAreas(areas, firstAreaId, secondAreaId);

  // The areas must be siblings (have the same parent)
  const canMerge = parent !== null;

  if (!canMerge) {
    console.log(
      `Cannot merge ${firstAreaId} and ${secondAreaId}: not siblings`
    );
  }

  return canMerge;
};
