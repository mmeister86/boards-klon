import { create } from "zustand";
import type { BlocksState } from "./blocks/types";
import { createUIActions } from "./blocks/actions/ui-actions";
import { createStorageActions } from "./blocks/actions/storage-actions";
import { createBlockActions } from "./blocks/actions/block-actions";
import { createLayoutActions } from "./blocks/actions/layout-actions";
import { createPublishActions } from "./blocks/actions/publish-actions";

// Create the store
export const useBlocksStore = create<BlocksState>((set, get, store) => ({
  // Initial state
  layoutBlocks: [],
  selectedBlockId: null,
  previewMode: false,
  currentProjectId: null,
  currentProjectDatabaseId: null,
  currentProjectTitle: "Untitled Project",
  isLoading: false,
  isSaving: false,
  autoSaveEnabled: true,
  lastSaved: null,
  projectJustDeleted: false,
  deletedProjectTitle: null,
  isPublishing: false,
  isPublished: false,
  publishedUrl: null,
  canvasHoveredInsertionIndex: null,
  viewport: 'desktop',

  // Combine all actions
  ...createUIActions(set, get, store),
  ...createStorageActions(set, get, store),
  ...createBlockActions(set, get, store),
  ...createLayoutActions(set, get, store),
  ...createPublishActions(set, get, store),
}));
