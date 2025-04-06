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
    link: boolean;
    heading1: boolean;
    heading2: boolean;
    heading3: boolean;
    heading4: boolean;
    heading5: boolean;
    heading6: boolean;
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
    link: false,
    heading1: false,
    heading2: false,
    heading3: false,
    heading4: false,
    heading5: false,
    heading6: false,
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
        link: false,
        heading1: false,
        heading2: false,
        heading3: false,
        heading4: false,
        heading5: false,
        heading6: false,
      },
    }),
}));
