import { StateCreator } from 'zustand';
import { BlocksState } from '../types';

export type UIActions = Pick<BlocksState,
  | 'setPreviewMode'
  | 'togglePreviewMode'
  | 'toggleAutoSave'
  | 'setCanvasHoveredInsertionIndex'
  | 'resetAllHoverStates'
>;

export const createUIActions: StateCreator<
  BlocksState,
  [],
  [],
  UIActions
> = (set) => ({
  // Toggle preview mode
  setPreviewMode: (enabled: boolean) => set({ previewMode: enabled }),
  togglePreviewMode: () => set((state) => ({ previewMode: !state.previewMode })),

  // Auto-save handling
  toggleAutoSave: () => set((state) => ({ autoSaveEnabled: !state.autoSaveEnabled })),

  // Canvas hover states
  setCanvasHoveredInsertionIndex: (index: number | null) =>
    set({ canvasHoveredInsertionIndex: index }),

  // Reset all hover states
  resetAllHoverStates: () => set({
    canvasHoveredInsertionIndex: null
  })
});
