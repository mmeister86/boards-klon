import { create } from "zustand";
import type { BlocksState, BlocksBaseState } from "./types";
import { createBlockActions } from "./actions/block-actions";
import { createStorageActions } from "./actions/storage-actions";
import { createUIActions } from "./actions/ui-actions";
import { createPublishActions } from "./actions/publish-actions";
import { createLayoutActions } from "./actions/layout-actions";
import { createEmptyLayoutBlock } from "./utils";

export const useBlocksStore = create<BlocksState>()((set, get, api) => {
  // Initial state
  const initialState: BlocksBaseState = {
    layoutBlocks: [createEmptyLayoutBlock(`layout-${Date.now()}`, "single-column")],
    currentProjectId: null,
    currentProjectDatabaseId: null,
    currentProjectTitle: "Untitled Project",
    projectJustDeleted: false, // Added initial value
    deletedProjectTitle: null, // Added initial value
    selectedBlockId: null,
    previewMode: false,
    viewport: "desktop",
    isLoading: false,
    isSaving: false,
    autoSaveEnabled: true,
    lastSaved: null,
    isPublishing: false,
    isPublished: false,
    publishedUrl: null,
    canvasHoveredInsertionIndex: null,
  };

  // Create actions, passing set, get, and api
  const blockActions = createBlockActions(set, get, api);
  const storageActions = createStorageActions(set, get, api);
  const uiActions = createUIActions(set, get, api);
  const publishActions = createPublishActions(set, get, api);
  const layoutActions = createLayoutActions(set, get, api);

  // Combine initial state and actions
  return {
    ...initialState,
    ...blockActions,
    ...storageActions,
    ...uiActions,
    ...publishActions,
    ...layoutActions,
  };
});
