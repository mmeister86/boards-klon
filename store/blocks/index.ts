import { create } from "zustand";
import type { BlocksState, BlocksBaseState } from "./types";
import { createBlockActions } from "./block-actions";
import { createDropAreaActions } from "./drop-area-actions";
import { createProjectActions } from "./project-actions";
import { createUIStateActions } from "./ui-state-actions";
import { createPublishActions } from "./publish-actions";

// Auto-save debounce time in milliseconds
const AUTO_SAVE_DEBOUNCE = 2000;

export const useBlocksStore = create<BlocksState>((set, get) => {
  // Create a debounced auto-save function
  let autoSaveTimeout: NodeJS.Timeout | null = null;
  const triggerAutoSave = () => {
    if (!get().autoSaveEnabled) return;

    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    autoSaveTimeout = setTimeout(async () => {
      const { currentProjectTitle } = get();
      if (currentProjectTitle) {
        await get().saveProject(currentProjectTitle);
      }
    }, AUTO_SAVE_DEBOUNCE);
  };

  // Initial state
  const initialState: BlocksBaseState = {
    layoutBlocks: [],
    dropAreas: [
      {
        id: "drop-area-1",
        blocks: [],
        isSplit: false,
        splitAreas: [],
        splitLevel: 0,
      },
    ],
    currentProjectId: null,
    currentProjectDatabaseId: null,
    currentProjectTitle: "Untitled Project",
    selectedBlockId: null,
    previewMode: false,
    viewport: "desktop",
    isLoading: false,
    isSaving: false,
    autoSaveEnabled: true,
    lastSaved: null,
    triggerAutoSave,
    isPublishing: false,
    isPublished: false,
    publishedUrl: null,
  };

  // Create actions
  const blockActions = createBlockActions(set, get);
  const dropAreaActions = createDropAreaActions(set, get);
  const projectActions = createProjectActions(set, get);
  const uiStateActions = createUIStateActions(set, get);
  const publishActions = createPublishActions(set, get);

  // Additional UI state and actions
  const uiState = {
    canvasHoveredInsertionIndex: null,
    setCanvasHoveredInsertionIndex: (index: number | null) =>
      set({ canvasHoveredInsertionIndex: index }),
    resetAllHoverStates: () =>
      set({ canvasHoveredInsertionIndex: null }),
  };

  return {
    ...initialState,
    ...blockActions,
    ...dropAreaActions,
    ...projectActions,
    ...uiStateActions,
    ...publishActions,
    ...uiState,
  };
});
