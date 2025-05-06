import MediathekView from "@/components/mediathek/mediathek-view";
import { createClient } from "@/utils/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import type { MediaItem } from "@/hooks/useMediaLibrary";

// Diese Seite rendert die Mediathekansicht unter /dashboard/mediathek
// SSR: Lade NUR die Medien des eingeloggten Users, indem die Session im Server-Kontext ausgelesen wird
// Context7: Nutze @supabase/auth-helpers-nextjs, um die User-UUID aus den Cookies zu extrahieren
export default async function MediathekPage() {
  // Supabase-Client für Server-Komponenten mit unserer neuen Funktion initialisieren
  const supabase = createClient();

  // Session auslesen (enthält User-UUID)
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  // Wenn keine Session vorhanden, gib leere Mediathek zurück
  if (!userId) {
    return <MediathekView initialMediaItems={[]} />;
  }

  // Nur Medien des eingeloggten Users laden
  const { data: mediaItems, error } = await supabase
    .from("media_items")
    .select("*")
    .eq("user_id", userId)
    .order("uploaded_at", { ascending: false });

  // Fehlerbehandlung (optional: Logging, Error Boundary)
  if (error) {
    console.error("Error fetching media items:", error);
    return <MediathekView initialMediaItems={[]} />;
  }

  // Context7: Mappe user_id auf string (kein null), um Typfehler zu vermeiden
  const safeMediaItems: MediaItem[] = (mediaItems ?? []).map(
    (item: Database["public"]["Tables"]["media_items"]["Row"]) => ({
      ...item,
      id: item.id,
      file_name: item.file_name ?? "Unbenanntes Medium",
      file_type: item.file_type ?? "unknown",
      file_size: item.size ?? 0,
      url: item.url ?? "",
      uploaded_at: item.uploaded_at ?? new Date().toISOString(),
      user_id: item.user_id ?? "",
      width: item.width ?? null,
      height: item.height ?? null,
      preview_url: item.preview_url ?? null,
      preview_url_128: item.preview_url_128 ?? null,
      preview_url_512: item.preview_url_512 ?? null,
    })
  );

  // Übergib die geladenen Medien als Props an die View-Komponente
  return <MediathekView initialMediaItems={safeMediaItems} />;
}
