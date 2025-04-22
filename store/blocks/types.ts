import type { BlockType } from "@/lib/types";
// Import ViewportType from the correct location or define it here if necessary
// import type { ViewportType } from "@/lib/hooks/use-viewport";

// Define ViewportType at the top level
export type ViewportType = "desktop" | "tablet" | "mobile";

// Neue Typen für Layout-Blöcke definieren
export interface LayoutBlockType {
  id: string;
  type: LayoutType;
  zones: ContentDropZoneType[];
}

export type LayoutType =
  | "single-column"
  | "two-columns"
  | "three-columns"
  | "grid-2x2"
  | "layout-1-2"
  | "layout-2-1";

// Typ für eine Inhaltszone innerhalb eines Layoutblocks
export interface ContentDropZoneType {
  id: string; // Eindeutige ID für die Zone innerhalb des Layoutblocks
  blocks: BlockType[]; // Verwenden das bestehende BlockType Array
}

// Base state properties
export interface BlocksBaseState {
  // Project state
  layoutBlocks: LayoutBlockType[];
  currentProjectId: string | null;
  currentProjectDatabaseId: string | null;
  currentProjectTitle: string;
  projectJustDeleted: boolean; // Added
  deletedProjectTitle: string | null; // Added

  // UI state
  selectedBlockId: string | null;
  previewMode: boolean;
  viewport: ViewportType;

  // Loading and saving state
  isLoading: boolean;
  isSaving: boolean;
  autoSaveEnabled: boolean; // Move to base state as it's a core state property
  lastSaved: Date | null;

  // Publishing state
  isPublishing: boolean;
  isPublished: boolean;
  publishedUrl: string | null;

  // Additional UI State not part of base actions
  canvasHoveredInsertionIndex: number | null;
}

// Actions interfaces
export interface BlockActions {
  addBlock: (
    block: Omit<BlockType, "id">,
    layoutId: string,
    zoneId: string,
    index: number
  ) => void;
  moveBlock: (
    blockId: string,
    source: { layoutId: string; zoneId: string },
    target: { layoutId: string; zoneId: string; index: number }
  ) => void;
  deleteBlock: (blockId: string, layoutId: string, zoneId: string) => void;
  updateBlockContent: (
    blockId: string,
    layoutId: string,
    zoneId: string,
    content: BlockType["content"],
    additionalProps?: Partial<BlockType>
  ) => void;
  reorderBlocks: (
    layoutId: string,
    zoneId: string,
    orderedBlockIds: string[]
  ) => void;
  selectBlock: (id: string | null) => void;
}

export interface LayoutActions {
  addLayoutBlock: (layoutType: LayoutType, targetIndex?: number) => string;
  deleteLayoutBlock: (id: string) => void;
  moveLayoutBlock: (sourceIndex: number, targetIndex: number) => void;
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

export interface PublishActions {
  publishBoard: () => Promise<boolean>;
  unpublishBoard: () => Promise<boolean>;
  checkPublishStatus: () => Promise<void>;
}

// UI Actions should cover all UI-related methods
export interface UIStateActions {
    triggerAutoSave: () => void; // Add triggerAutoSave here as it's an action
    setSelectedBlockId: (blockId: string | null) => void;
    setPreviewMode: (enabled: boolean) => void;
    togglePreviewMode: () => void;
    setAutoSaveEnabled: (enabled: boolean) => void;
    toggleAutoSave: () => void;
    setViewport: (viewport: ViewportType) => void;
    setIsLoading: (isLoading: boolean) => void;
    setIsSaving: (isSaving: boolean) => void;
    setLastSaved: (lastSaved: Date | null) => void;
    setCanvasHoveredInsertionIndex: (index: number | null) => void; // Move from direct object to actions
    resetAllHoverStates: () => void; // Move from direct object to actions
    setProjectJustDeleted: (deleted: boolean) => void; // Added
    setDeletedProjectTitle: (title: string | null) => void; // Added
}

// Combined state type
export type BlocksState = BlocksBaseState &
  BlockActions &
  LayoutActions &
  ProjectActions &
  PublishActions &
  UIStateActions;
