import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useSupabase } from "@/components/providers/supabase-provider";

// Typdefinition für ein Medienelement, jetzt exportiert
export interface MediaItem {
  id: string;
  file_name: string;
  file_type: string;
  url: string;
  size: number;
  preview_url?: string | null; // Generische Vorschau-URL (z.B. für PDFs)
  preview_url_512?: string | null; // Spezifische Vorschau-URL für größere Bilder/Videos
  preview_url_128?: string | null; // Spezifische Vorschau-URL für kleinere Bilder/Videos
  user_id: string;
  uploaded_at: string;
  width?: number | null; // Breite (optional)
  height?: number | null; // Höhe (optional)
}

export const useMediaLibrary = (initialMediaItems?: MediaItem[]) => {
  const { user, supabase } = useSupabase();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(initialMediaItems ?? []);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  // Fetch media items
  const fetchMediaItems = useCallback(async () => {
    if (!supabase || !user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("media_items")
        .select("*")
        .eq("user_id", user.id)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      setMediaItems(data || []);
    } catch (error) {
      console.error("Error fetching media items:", error);
      toast.error("Fehler beim Laden der Medien");
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  // Initial fetch and subscription setup
  useEffect(() => {
    if (!supabase || !user) {
      setIsLoading(false);
      return;
    }

    fetchMediaItems();

    // Set up real-time subscription
    const channel = supabase
      .channel("media_items_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "media_items",
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          console.log("Real-time update received:", payload);
          await fetchMediaItems();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [supabase, user, fetchMediaItems]);

  // Gruppiere Medien nach Typ
  const groupedMedia = mediaItems.reduce((acc, item) => {
    const type = item.file_type.startsWith("image/")
      ? "image"
      : item.file_type.startsWith("video/")
      ? "video"
      : item.file_type.startsWith("audio/")
      ? "audio"
      : "document";

    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(item);
    return acc;
  }, {} as Record<string, MediaItem[]>);

  // Handle media deletion by calling the backend API route
  const handleDelete = useCallback(async (item: MediaItem) => {
    if (!user) { // No need to check supabase here, API handles auth
      toast.error("Sie müssen angemeldet sein, um Medien zu löschen");
      return;
    }

    setDeletingItemId(item.id);
    console.log(`[Frontend] Initiating delete for item: ${item.id}, Name: ${item.file_name}`);

    try {
      const response = await fetch('/api/delete-media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mediaItemId: item.id }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle API errors (e.g., 401, 403, 404, 500)
        console.error(`[Frontend] API Error deleting ${item.file_name}:`, response.status, result);
        toast.error(result.error || `Fehler beim Löschen von ${item.file_name} (Status: ${response.status})`);
        // Don't update local state if API call failed fundamentally
        setDeletingItemId(null); // Reset loading state even on failure
        return;
      }

      // Handle partial success (status 207) where DB record might be deleted but storage failed
      if (response.status === 207) {
        console.warn(`[Frontend] Partial success deleting ${item.file_name}:`, result.errors);
        toast.warning(`"${item.file_name}" gelöscht, aber Speicherbereinigung fehlgeschlagen.`, {
          description: result.errors?.join('; ') || 'Details siehe Konsole.',
          duration: 8000,
        });
        // Update local state as the DB record should be gone
        setMediaItems((prev) => prev.filter((i) => i.id !== item.id));
      } else {
        // Handle full success (status 200)
        console.log(`[Frontend] Successfully deleted ${item.file_name} via API.`);
        toast.success(`"${item.file_name}" wurde erfolgreich gelöscht`);
        // Update local state
        setMediaItems((prev) => prev.filter((i) => i.id !== item.id));
      }
    } catch (error) {
      console.error("Error deleting media item:", error);
      toast.error("Fehler beim Löschen des Medienelements");
    } finally {
      setDeletingItemId(null);
    }
  }, [user]);

  return {
    mediaItems,
    groupedMedia,
    isLoading,
    searchQuery,
    setSearchQuery,
    deletingItemId,
    handleDelete,
    fetchMediaItems,
  };
};
