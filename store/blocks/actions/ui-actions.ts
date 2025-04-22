import { StateCreator } from 'zustand';
import { BlocksState, ViewportType } from '../types';

export type UIActions = {
  setSelectedBlockId: (blockId: string | null) => void;
  setPreviewMode: (enabled: boolean) => void;
  togglePreviewMode: () => void;
  setAutoSaveEnabled: (enabled: boolean) => void;
  toggleAutoSave: () => void;
  setViewport: (viewport: ViewportType) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsSaving: (isSaving: boolean) => void;
  setLastSaved: (lastSaved: Date | null) => void;
  setCanvasHoveredInsertionIndex: (index: number | null) => void;
  resetAllHoverStates: () => void;
  setProjectJustDeleted: (deleted: boolean) => void; // Added
  setDeletedProjectTitle: (title: string | null) => void; // Added
};

export const createUIActions: StateCreator<
  BlocksState,
  [],
  [],
  UIActions
> = (set) => ({
  setSelectedBlockId: (blockId) => set({ selectedBlockId: blockId }),
  setPreviewMode: (enabled) => set({ previewMode: enabled }),
  togglePreviewMode: () => set((state) => ({ previewMode: !state.previewMode })),
  setAutoSaveEnabled: (enabled) => set({ autoSaveEnabled: enabled }),
  toggleAutoSave: () => set((state) => ({ autoSaveEnabled: !state.autoSaveEnabled })),
  setViewport: (viewport) => set({ viewport }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsSaving: (isSaving) => set({ isSaving }),
  setLastSaved: (lastSaved) => set({ lastSaved }),
  setCanvasHoveredInsertionIndex: (index) => set({ canvasHoveredInsertionIndex: index }),
  resetAllHoverStates: () => set({
    canvasHoveredInsertionIndex: null,
  }),
  setProjectJustDeleted: (deleted) => set({ projectJustDeleted: deleted }), // Added
  setDeletedProjectTitle: (title) => set({ deletedProjectTitle: title }), // Added
});
