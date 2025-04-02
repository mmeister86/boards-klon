import { create } from "zustand";

interface EditorState {
  // Editor state
  isFocused: boolean;
  activeFormats: {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    paragraph: boolean;
    bulletList: boolean;
    orderedList: boolean;
    blockquote: boolean;
  };
  // Actions
  setFocus: (focused: boolean) => void;
  updateActiveFormats: (formats: Partial<EditorState["activeFormats"]>) => void;
  resetFormats: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  // Initial state
  isFocused: false,
  activeFormats: {
    bold: false,
    italic: false,
    underline: false,
    paragraph: false,
    bulletList: false,
    orderedList: false,
    blockquote: false,
  },

  // Actions
  setFocus: (focused) => set({ isFocused: focused }),
  updateActiveFormats: (formats) =>
    set((state) => ({
      activeFormats: { ...state.activeFormats, ...formats },
    })),
  resetFormats: () =>
    set({
      activeFormats: {
        bold: false,
        italic: false,
        underline: false,
        paragraph: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
      },
    }),
}));
