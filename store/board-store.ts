import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

export type Item = {
  id: string;
  content: string;
  columnId: string;
};

export type Column = {
  id: string;
  title: string;
  items: Item[];
};

export type Board = {
  columns: Column[];
};

interface BoardState {
  board: Board;
  isLoading: boolean;
  fetchBoard: () => Promise<void>;
  moveItem: (
    itemId: string,
    sourceColumnId: string,
    destinationColumnId: string
  ) => void;
  addItem: (columnId: string, content: string) => Promise<void>;
}

export const useBoardStore = create<BoardState>((set, get) => {
  // Get the Supabase client - only in browser
  const getSupabase = () => {
    if (typeof window === "undefined") return null;
    return createClient();
  };

  return {
    board: {
      columns: [],
    },
    isLoading: false,

    fetchBoard: async () => {
      set({ isLoading: true });
      const supabase = getSupabase();
      if (!supabase) {
        set({ isLoading: false });
        return;
      }

      try {
        // Fetch columns
        const { data: columns, error: columnsError } = await supabase
          .from("columns")
          .select("*")
          .order("position");

        if (columnsError) throw columnsError;

        // Fetch items
        const { data: items, error: itemsError } = await supabase
          .from("items")
          .select("*");

        if (itemsError) throw itemsError;

        // Organize items into columns
        const columnsWithItems = columns.map((column: any) => ({
          id: column.id,
          title: column.title,
          items: items
            .filter((item: any) => item.column_id === column.id)
            .map((item: any) => ({
              id: item.id,
              content: item.content,
              columnId: item.column_id,
            })),
        }));

        set({
          board: {
            columns: columnsWithItems,
          },
          isLoading: false,
        });
      } catch (error) {
        console.error("Error fetching board:", error);
        set({ isLoading: false });
      }
    },

    moveItem: (itemId, sourceColumnId, destinationColumnId) => {
      const board = get().board;
      const sourceColumnIndex = board.columns.findIndex(
        (col) => col.id === sourceColumnId
      );
      const destinationColumnIndex = board.columns.findIndex(
        (col) => col.id === destinationColumnId
      );

      if (sourceColumnIndex === -1 || destinationColumnIndex === -1) return;

      const sourceColumn = board.columns[sourceColumnIndex];
      const itemIndex = sourceColumn.items.findIndex(
        (item) => item.id === itemId
      );

      if (itemIndex === -1) return;

      // Create a copy of the board
      const newBoard = { ...board };

      // Remove the item from the source column
      const [movedItem] = newBoard.columns[sourceColumnIndex].items.splice(
        itemIndex,
        1
      );

      // Update the item's columnId
      movedItem.columnId = destinationColumnId;

      // Add the item to the destination column
      newBoard.columns[destinationColumnIndex].items.push(movedItem);

      // Update the state
      set({ board: newBoard });

      // Update in Supabase
      const supabase = getSupabase();
      if (supabase) {
        supabase
          .from("items")
          .update({ column_id: destinationColumnId })
          .eq("id", itemId)
          .then(({ error }) => {
            if (error) throw new Error(`Error updating item: ${error.message}`);
          });
      }
    },

    addItem: async (columnId, content) => {
      const supabase = getSupabase();
      if (!supabase) return;

      try {
        const { data, error } = await supabase
          .from("items")
          .insert([{ content, column_id: columnId }])
          .select();

        if (error) throw new Error(`Error adding item: ${error.message}`);

        const newItem = {
          id: data[0].id,
          content: data[0].content,
          columnId: data[0].column_id,
        };

        const board = get().board;
        const columnIndex = board.columns.findIndex(
          (col) => col.id === columnId
        );

        if (columnIndex === -1) return;

        const newBoard = { ...board };
        newBoard.columns[columnIndex].items.push(newItem);

        set({ board: newBoard });
      } catch (error) {
        console.error("Error adding item:", error);
      }
    },
  };
});
