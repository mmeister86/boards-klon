import type { ViewportType } from "@/lib/hooks/use-viewport"; // Moved import to top
import type { BlocksState } from "./types";
import type { DropAreaType } from "@/lib/types";
import { findDropAreaById, isDropAreaEmpty } from "./utils";

export const createDropAreaActions = (
  set: (fn: (state: BlocksState) => Partial<BlocksState>) => void,
  get: () => BlocksState
) => ({
  splitDropArea: (dropAreaId: string) => {
    const { dropAreas } = get();
    const dropAreaIndex = dropAreas.findIndex(
      (area: DropAreaType) => area.id === dropAreaId
    );
    if (dropAreaIndex === -1) return;

    const newDropAreas = [...dropAreas];
    const targetArea = { ...newDropAreas[dropAreaIndex] };

    // Create two new split areas
    const splitArea1: DropAreaType = {
      id: `${dropAreaId}-split-1`,
      blocks: [],
      isSplit: false,
      splitAreas: [],
      splitLevel: targetArea.splitLevel + 1,
      parentId: targetArea.id, // Set parent ID
    };

    const splitArea2: DropAreaType = {
      id: `${dropAreaId}-split-2`,
      blocks: [],
      isSplit: false,
      splitAreas: [],
      splitLevel: targetArea.splitLevel + 1,
      parentId: targetArea.id, // Set parent ID
    };

    // Move existing blocks to the first split area
    splitArea1.blocks = [...targetArea.blocks];

    // Update the target area
    const updatedTargetArea: DropAreaType = {
      id: targetArea.id,
      blocks: [], // Blocks are moved to splitArea1
      isSplit: true,
      splitAreas: [splitArea1, splitArea2], // Assign actual objects
      splitLevel: targetArea.splitLevel,
    };

    // Update the target area in the array
    newDropAreas[dropAreaIndex] = updatedTargetArea;
    // Do NOT splice the split areas into the main array

    set((state) => ({ ...state, dropAreas: newDropAreas }));
    get().triggerAutoSave();
  },

  mergeDropAreas: (dropAreaId: string, mergeTargetId: string = "") => {
    const { dropAreas } = get();

    // If mergeTargetId is provided, find the parent of both areas
    if (mergeTargetId) {
      // Find both areas
      const area1 = findDropAreaById(dropAreas, dropAreaId);
      const area2 = findDropAreaById(dropAreas, mergeTargetId);

      if (!area1 || !area2) return;

      // Find parent by checking if its splitAreas contain the IDs
      const parentArea = dropAreas.find(
        (area) =>
          area.isSplit &&
          area.splitAreas.some((sa) => sa.id === area1.id) &&
          area.splitAreas.some((sa) => sa.id === area2.id)
      );

      if (parentArea) {
        // Use the parent area ID for the merge operation
        dropAreaId = parentArea.id;
      }
    }

    // Continue with the original logic
    const dropArea = findDropAreaById(dropAreas, dropAreaId);
    if (!dropArea || !dropArea.isSplit) return;

    // Get the actual split area objects directly
    const splitAreas = dropArea.splitAreas;

    // Merge blocks from all split areas into the parent area
    const mergedBlocks = splitAreas.flatMap((area) => area.blocks);
    const updatedDropArea: DropAreaType = {
      id: dropArea.id,
      blocks: mergedBlocks,
      isSplit: false,
      splitAreas: [],
      splitLevel: dropArea.splitLevel,
    };

    // Update the parent area in the main array
    const updatedDropAreas = dropAreas.map((area) =>
      area.id === dropAreaId ? updatedDropArea : area
    );

    set((state) => ({ ...state, dropAreas: updatedDropAreas }));
    // Removed misplaced import from here

    get().triggerAutoSave();
  },

  canSplit: (dropAreaId: string, viewport: ViewportType) => {
    const { dropAreas } = get();
    const dropArea = findDropAreaById(dropAreas, dropAreaId);
    if (!dropArea) {
      console.warn(`canSplit: Drop area ${dropAreaId} not found.`);
      return false;
    }

    // Define max split levels per viewport
    const maxSplitLevel: Record<ViewportType, number> = {
      mobile: 0, // No splitting on mobile
      tablet: 1, // Max 1 split (2 columns) on tablet
      desktop: 2, // Max 2 splits (4 columns) on desktop
    };

    const canSplitResult =
      !dropArea.isSplit && dropArea.splitLevel < maxSplitLevel[viewport];

    // console.log(
    //   `canSplit check for ${dropAreaId} (Level ${dropArea.splitLevel}) in ${viewport}: ${canSplitResult} (Max Level: ${maxSplitLevel[viewport]}, IsSplit: ${dropArea.isSplit})`
    // );

    return canSplitResult;
  },

  canMerge: (dropAreaId: string) => {
    const { dropAreas } = get();
    const dropArea = findDropAreaById(dropAreas, dropAreaId);
    if (!dropArea) return false;

    // Can only merge if it's split
    return dropArea.isSplit;
  },

  cleanupEmptyDropAreas: () => {
    const { dropAreas } = get();
    const newDropAreas = [...dropAreas];

    // Remove consecutive empty areas, keeping at least one
    let i = 0;
    while (i < newDropAreas.length - 1) {
      const currentArea = newDropAreas[i];
      const nextArea = newDropAreas[i + 1];

      if (isDropAreaEmpty(currentArea) && isDropAreaEmpty(nextArea)) {
        newDropAreas.splice(i + 1, 1);
      } else {
        i++;
      }
    }

    // Ensure at least one empty area at the end
    const lastArea = newDropAreas[newDropAreas.length - 1];
    if (!isDropAreaEmpty(lastArea)) {
      const newArea: DropAreaType = {
        id: `drop-area-${Date.now()}`,
        blocks: [],
        isSplit: false,
        splitAreas: [],
        splitLevel: 0,
      };
      newDropAreas.push(newArea);
    }

    set((state) => ({ ...state, dropAreas: newDropAreas }));
    get().triggerAutoSave();
  },
});
