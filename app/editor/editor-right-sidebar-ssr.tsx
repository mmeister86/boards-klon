// Server-Komponente für SSR der Editor-Right-Sidebar
// Lädt die Medien des eingeloggten Users im Server-Kontext und übergibt sie an die Client-Komponente
import { createClient } from "@/utils/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import { EditorRightSidebar } from "@/components/layout/editor-right-sidebar";
import type { MediaItem } from "@/hooks/useMediaLibrary";

export default async function EditorRightSidebarSSR() {
  // Supabase-Client für Server-Komponenten mit unserer neuen Funktion initialisieren
  const supabase = createClient();

  // Session auslesen (enthält User-UUID)
  // ALT: const { data: { session }, } = await supabase.auth.getSession();
  // NEU: Sicherer Abruf des Users über getUser (authentifiziert gegen Supabase-Server)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;

  // Definiere den Typ für initialMediaItems basierend darauf, was EditorRightSidebar erwartet.
  let initialMediaItems: MediaItem[] = [];

  if (userId) {
    const { data: dbMediaItems, error } = await supabase
      .from("media_items")
      .select("*")
      .eq("user_id", userId)
      .order("uploaded_at", { ascending: false });

    if (error) {
      console.error("Error fetching media items for sidebar:", error);
      // initialMediaItems bleibt leer
    } else {
      initialMediaItems = (dbMediaItems ?? []).map(
        (item: Database["public"]["Tables"]["media_items"]["Row"]) => ({
          ...item,
          id: item.id,
          file_name: item.file_name ?? "Unbenanntes Medium",
          file_type: item.file_type ?? "unknown",
          file_size: item.size ?? 0,
          url: item.url ?? "",
          uploaded_at: item.uploaded_at ?? new Date().toISOString(),
          user_id: item.user_id ?? "",
          width: item.width === null ? undefined : item.width,
          height: item.height === null ? undefined : item.height,
          preview_url: item.preview_url === null ? undefined : item.preview_url,
          preview_url_128:
            item.preview_url_128 === null ? undefined : item.preview_url_128,
          preview_url_512:
            item.preview_url_512 === null ? undefined : item.preview_url_512,
        })
      );
    }
  }
  // Übergib die geladenen Medien an die Client-Komponente
  return <EditorRightSidebar initialMediaItems={initialMediaItems} />;
}
