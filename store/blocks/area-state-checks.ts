import type { BlocksState } from "./types";
import type { ViewportType } from "@/lib/hooks/use-viewport";
import {
  isDropAreaEmpty,
  canMergeAreas,
  findDropAreaById,
} from "@/lib/utils/drop-area-utils";
import { createEmptyDropArea } from "./utils";

export const createAreaStateChecks = (
  set: (fn: (state: BlocksState) => Partial<BlocksState>) => void,
  get: () => BlocksState
) => ({
  canMerge: (firstAreaId: string, secondAreaId: string) => {
    const { dropAreas } = get();
    return canMergeAreas(dropAreas, firstAreaId, secondAreaId);
  },

  canSplit: (dropAreaId: string, viewport: ViewportType) => {
    const { dropAreas } = get();
    const area = findDropAreaById(dropAreas, dropAreaId);
    if (!area) return false;

    if (viewport === "mobile") return false;
    if (viewport === "tablet" && area.splitLevel >= 1) return false;
    if (viewport === "desktop" && area.splitLevel >= 2) return false;

    return true;
  },

  cleanupEmptyDropAreas: () => {
    set((state) => {
      const rootAreas = [...state.dropAreas];
      if (rootAreas.length <= 1) return state;

      const hasPopulatedAreas = rootAreas.some(
        (area) =>
          !isDropAreaEmpty(area) ||
          (area.isSplit && area.splitAreas.some((a) => !isDropAreaEmpty(a)))
      );

      if (hasPopulatedAreas) {
        rootAreas.sort((a, b) => {
          const aEmpty =
            isDropAreaEmpty(a) &&
            (!a.isSplit || a.splitAreas.every(isDropAreaEmpty));
          const bEmpty =
            isDropAreaEmpty(b) &&
            (!b.isSplit || b.splitAreas.every(isDropAreaEmpty));
          return aEmpty === bEmpty ? 0 : aEmpty ? 1 : -1;
        });
      }

      // Remove consecutive empty areas
      for (let i = 0; i < rootAreas.length - 1; i++) {
        if (
          isDropAreaEmpty(rootAreas[i]) &&
          isDropAreaEmpty(rootAreas[i + 1])
        ) {
          rootAreas.splice(i + 1, 1);
          i--;
        }
      }

      // Ensure one empty area at the end if needed
      const lastArea = rootAreas[rootAreas.length - 1];
      if (!isDropAreaEmpty(lastArea)) {
        rootAreas.push(createEmptyDropArea(`drop-area-${Date.now()}`));
      }

      return { ...state, dropAreas: rootAreas };
    });
  },
});
