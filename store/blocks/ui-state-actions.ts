import type { BlocksState } from "./types";
import type { ViewportType } from "@/lib/hooks/use-viewport";

export const createUIStateActions = (
  set: (fn: (state: BlocksState) => Partial<BlocksState>) => void,
  get: () => BlocksState
) => ({
  // Block selection
  setSelectedBlockId: (blockId: string | null) => {
    set((state) => ({ ...state, selectedBlockId: blockId }));
  },

  // Preview mode
  setPreviewMode: (enabled: boolean) => {
    set((state) => ({ ...state, previewMode: enabled }));
  },

  togglePreviewMode: () => {
    const { previewMode } = get();
    set((state) => ({ ...state, previewMode: !previewMode }));
  },

  // Auto-save
  setAutoSaveEnabled: (enabled: boolean) => {
    set((state) => ({ ...state, autoSaveEnabled: enabled }));
  },

  toggleAutoSave: () => {
    const { autoSaveEnabled } = get();
    set((state) => ({ ...state, autoSaveEnabled: !autoSaveEnabled }));
  },

  // Viewport
  setViewport: (viewport: ViewportType) => {
    set((state) => ({ ...state, viewport }));
  },

  // Loading and saving states
  setIsLoading: (isLoading: boolean) => {
    set((state) => ({ ...state, isLoading }));
  },

  setIsSaving: (isSaving: boolean) => {
    set((state) => ({ ...state, isSaving }));
  },

  setLastSaved: (lastSaved: Date | null) => {
    set((state) => ({ ...state, lastSaved }));
  },
});
