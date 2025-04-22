import { StateCreator } from 'zustand';
import { BlocksState, LayoutType, LayoutBlockType } from '../types';

// Helper zum Erstellen von Zonen für Layouts
const createZonesForLayout = (layoutType: LayoutType) => {
  switch (layoutType) {
    case "single-column":
      return [{ id: crypto.randomUUID(), blocks: [] }];
    case "two-columns":
    case "layout-1-2":
    case "layout-2-1":
      return [
        { id: crypto.randomUUID(), blocks: [] },
        { id: crypto.randomUUID(), blocks: [] },
      ];
    case "three-columns":
      return [
        { id: crypto.randomUUID(), blocks: [] },
        { id: crypto.randomUUID(), blocks: [] },
        { id: crypto.randomUUID(), blocks: [] },
      ];
    case "grid-2x2":
      return [
        { id: crypto.randomUUID(), blocks: [] },
        { id: crypto.randomUUID(), blocks: [] },
        { id: crypto.randomUUID(), blocks: [] },
        { id: crypto.randomUUID(), blocks: [] },
      ];
    default:
      console.warn(`Unknown layout type: ${layoutType}. Defaulting to single column.`);
      return [{ id: crypto.randomUUID(), blocks: [] }];
  }
};

export type LayoutActions = {
  addLayoutBlock: (type: LayoutType, targetIndex?: number) => string;
  deleteLayoutBlock: (id: string) => void;
  moveLayoutBlock: (sourceIndex: number, targetIndex: number) => void;
};

export const createLayoutActions: StateCreator<BlocksState, [], [], LayoutActions> = (set, get) => ({
  addLayoutBlock: (type, targetIndex) => {
    const state = get();
    const newLayoutBlockId = crypto.randomUUID();
    const newBlock: LayoutBlockType = {
      id: newLayoutBlockId,
      type: type,
      zones: createZonesForLayout(type),
    };

    // Check if we have a project ID - if not, create a new project first
    if (!state.currentProjectId) {
      console.log("[addLayoutBlock] No project ID found, auto-creating a project");
      (async () => {
        try {
          const newProjectId = await state.createNewProject("Unbenanntes Projekt");
          if (newProjectId) {
            console.log(`[addLayoutBlock] Created new project: ${newProjectId}`);

            // Now add the layout block
            set((state) => {
              const updatedLayoutBlocks = [...state.layoutBlocks];
              const insertAt =
                targetIndex !== undefined &&
                targetIndex >= 0 &&
                targetIndex <= updatedLayoutBlocks.length
                  ? targetIndex
                  : updatedLayoutBlocks.length;
              updatedLayoutBlocks.splice(insertAt, 0, newBlock);
              return { layoutBlocks: updatedLayoutBlocks };
            });

            // Trigger save after setting both project ID and layout block
            get().triggerAutoSave();
          } else {
            console.error("[addLayoutBlock] Failed to auto-create a project");
          }
        } catch (error) {
          console.error("[addLayoutBlock] Error creating project:", error);
        }
      })();
    } else {
      // Normal flow when we have a project ID
      set((state) => {
        const updatedLayoutBlocks = [...state.layoutBlocks];
        const insertAt =
          targetIndex !== undefined &&
          targetIndex >= 0 &&
          targetIndex <= updatedLayoutBlocks.length
            ? targetIndex
            : updatedLayoutBlocks.length;
        updatedLayoutBlocks.splice(insertAt, 0, newBlock);
        return { layoutBlocks: updatedLayoutBlocks };
      });
      get().triggerAutoSave();
    }

    return newLayoutBlockId;
  },

  deleteLayoutBlock: (id) => {
    set((state) => {
      const layoutToDelete = state.layoutBlocks.find((lb) => lb.id === id);
      if (!layoutToDelete) return {};

      const updatedLayoutBlocks = state.layoutBlocks.filter(
        (block) => block.id !== id
      );

      let newSelectedBlockId = state.selectedBlockId;
      if (state.selectedBlockId) {
        const blockWasInDeletedLayout = layoutToDelete.zones.some((z) =>
          z.blocks.some((b) => b.id === state.selectedBlockId)
        );
        if (blockWasInDeletedLayout) {
          newSelectedBlockId = null;
        }
      }

      return {
        layoutBlocks: updatedLayoutBlocks,
        selectedBlockId: newSelectedBlockId,
        canvasHoveredInsertionIndex: null,
      };
    });
    get().triggerAutoSave();
  },

  moveLayoutBlock: (sourceIndex, targetIndex) => {
    set((state) => {
      if (
        sourceIndex < 0 ||
        sourceIndex >= state.layoutBlocks.length ||
        targetIndex < 0 ||
        targetIndex > state.layoutBlocks.length
      ) {
        console.error("Invalid indices for moveLayoutBlock");
        return {};
      }

      const updatedLayoutBlocks = [...state.layoutBlocks];
      const [movedBlock] = updatedLayoutBlocks.splice(sourceIndex, 1);

      if (!movedBlock) {
        console.error(
          "Layout block to move not found at source index:",
          sourceIndex
        );
        return {};
      }

      const actualTargetIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
      const finalTargetIndex = Math.max(0, Math.min(actualTargetIndex, updatedLayoutBlocks.length));

      updatedLayoutBlocks.splice(finalTargetIndex, 0, movedBlock);

      return { layoutBlocks: updatedLayoutBlocks };
    });
    get().triggerAutoSave();
  },
});
