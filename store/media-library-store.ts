import { create } from "zustand";
import type { MediaItem, MediaLibraryState } from "@/lib/types";
import { supabase } from "@/lib/supabase";

interface MediaLibraryStore extends MediaLibraryState {
  // Media Item Actions
  addItem: (item: MediaItem) => void;
  removeItem: (id: string) => void;

  // Fetch Actions
  fetchItems: (page?: number) => Promise<void>;
  searchItems: (query: string) => Promise<MediaItem[]>;

  // State Actions
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  resetState: () => void;
}

const ITEMS_PER_PAGE = 20;

export const useMediaLibraryStore = create<MediaLibraryStore>((set, get) => ({
  // Initial state
  items: [],
  isLoading: false,
  error: null,
  page: 1,
  hasMore: true,
  itemsPerPage: ITEMS_PER_PAGE,

  // Media Item Actions
  addItem: (item) => {
    set((state) => ({
      items: [item, ...state.items],
    }));
  },

  removeItem: async (id) => {
    try {
      // First remove from Supabase storage
      const item = get().items.find((i) => i.id === id);
      if (item) {
        // Extract file path from URL
        const filePath = new URL(item.url).pathname.split("/").pop();
        if (filePath) {
          const { error } = await supabase.storage
            .from("images")
            .remove([filePath]);

          if (error) throw error;
        }
      }

      // Then remove from store
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      }));
    } catch (error) {
      console.error("Error removing item:", error);
      set({ error: "Failed to remove item from media library" });
    }
  },

  // Fetch Actions
  fetchItems: async (page = 1) => {
    try {
      set({ isLoading: true, error: null });

      // Calculate offset based on page
      const offset = (page - 1) * ITEMS_PER_PAGE;

      // Fetch items from Supabase
      const { data, error } = await supabase
        .from("media_items")
        .select("*")
        .order("uploadedAt", { ascending: false })
        .range(offset, offset + ITEMS_PER_PAGE - 1);

      if (error) throw error;

      // Update state
      set((state) => ({
        items: page === 1 ? data : [...state.items, ...data],
        page,
        hasMore: data.length === ITEMS_PER_PAGE,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error fetching media items:", error);
      set({
        error: "Failed to fetch media items",
        isLoading: false,
      });
    }
  },

  searchItems: async (query) => {
    try {
      set({ isLoading: true, error: null });

      // Search in Supabase
      const { data, error } = await supabase
        .from("media_items")
        .select("*")
        .ilike("fileName", `%${query}%`)
        .order("uploadedAt", { ascending: false })
        .limit(ITEMS_PER_PAGE);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error searching media items:", error);
      set({
        error: "Failed to search media items",
        isLoading: false,
      });
      return [];
    } finally {
      set({ isLoading: false });
    }
  },

  // State Actions
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  resetState: () =>
    set({
      items: [],
      isLoading: false,
      error: null,
      page: 1,
      hasMore: true,
    }),
}));
