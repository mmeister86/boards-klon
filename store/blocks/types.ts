import type { BlockType } from "@/lib/types";
import type { ViewportType } from "@/lib/hooks/use-viewport";

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

// Base state without actions
export interface BlocksBaseState {
  // Project state
  layoutBlocks: LayoutBlockType[];
  dropAreas: {
    id: string;
    blocks: BlockType[];
    isSplit: boolean;
    splitAreas: {
      id: string;
      blocks: BlockType[];
    }[];
    splitLevel: number;
  }[];
  currentProjectId: string | null;
  currentProjectDatabaseId: string | null;
  currentProjectTitle: string;

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

  // Publishing state
  isPublishing: boolean;
  isPublished: boolean;
  publishedUrl: string | null;
}

// Actions
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
  // Layout actions
  addLayoutBlock: (layoutType: LayoutType, index: number) => void;
  deleteLayoutBlock: (layoutId: string) => void;
  moveLayoutBlock: (dragIndex: number, hoverIndex: number) => void;
}

// Define LayoutActions if needed (addLayoutBlock, deleteLayoutBlock, etc.)
export interface LayoutActions {
  addLayoutBlock: (layoutType: LayoutType, index: number) => void;
  deleteLayoutBlock: (layoutId: string) => void;
  moveLayoutBlock: (dragIndex: number, hoverIndex: number) => void;
  // Potentially updateLayoutBlock if needed for resizing/custom classes etc.
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
  LayoutActions &
  ProjectActions &
  PublishActions &
  UIStateActions & {
    // UI State
    autoSaveEnabled: boolean;
    canvasHoveredInsertionIndex: number | null;

    // UI Actions
    setCanvasHoveredInsertionIndex: (index: number | null) => void;
    resetAllHoverStates: () => void;
  };
