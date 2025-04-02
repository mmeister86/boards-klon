import type { BlockType, DropAreaType } from "@/lib/types";
import type { ViewportType } from "@/lib/hooks/use-viewport";

// Base state without actions
export interface BlocksBaseState {
  // Project state
  dropAreas: DropAreaType[];
  currentProjectId: string | null;
  currentProjectTitle: string | null;

  // UI state
  selectedBlockId: string | null;
  previewMode: boolean;
  viewport: ViewportType;

  // Loading and saving state
  isLoading: boolean;
  isSaving: boolean;
  autoSaveEnabled: boolean;
  lastSaved: Date | null;
  triggerAutoSave: () => void;
}

// Actions
export interface BlockActions {
  addBlock: (block: Omit<BlockType, "id">, dropAreaId: string) => void;
  moveBlock: (
    blockId: string,
    sourceAreaId: string,
    targetAreaId: string
  ) => void;
  deleteBlock: (blockId: string, dropAreaId: string) => void;
  updateBlockContent: (
    blockId: string,
    dropAreaId: string,
    content: string,
    additionalProps?: Partial<BlockType>
  ) => void;
}

export interface DropAreaActions {
  splitDropArea: (dropAreaId: string) => void;
  mergeDropAreas: (dropAreaId: string) => void;
  canSplit: (dropAreaId: string, viewport: ViewportType) => boolean; // Updated signature
  canMerge: (dropAreaId: string) => boolean;
  cleanupEmptyDropAreas: () => void;
}

export interface ProjectActions {
  loadProject: (projectId: string) => Promise<boolean>;
  saveProject: (projectTitle: string, description?: string) => Promise<boolean>;
  createNewProject: (
    title: string,
    description?: string
  ) => Promise<string | null>;
  setProjectTitle: (title: string) => void;
}

export interface UIStateActions {
  setSelectedBlockId: (blockId: string | null) => void;
  setPreviewMode: (enabled: boolean) => void;
  togglePreviewMode: () => void;
  setAutoSaveEnabled: (enabled: boolean) => void;
  toggleAutoSave: () => void;
  setViewport: (viewport: ViewportType) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsSaving: (isSaving: boolean) => void;
  setLastSaved: (lastSaved: Date | null) => void;
}

// Combined state type
export type BlocksState = BlocksBaseState &
  BlockActions &
  DropAreaActions &
  ProjectActions &
  UIStateActions;
