import { createServerClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { ClientPage } from "./client-page";
import type { PageProps } from "./types";

// Optional: Erzwinge dynamisches Rendering, falls die Daten oft wechseln
export const dynamic = "force-dynamic";

// Generiere Metadaten für die Seite (serverseitig)
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { projectId } = params;
  const supabase = await createServerClient();

  try {
    // Prüfe, ob das Board veröffentlicht ist
    const { data: publishedBoard } = await supabase
      .from("published_boards")
      .select("*")
      .eq("project_id", projectId)
      .eq("is_published", true)
      .maybeSingle();

    if (!publishedBoard) {
      return {
        title: "Board nicht gefunden",
      };
    }

    return {
      title: publishedBoard.title,
      description: `${publishedBoard.title} - Created by ${publishedBoard.author_name}`,
    };
  } catch (error) {
    console.error("Error loading board metadata:", error);
    return {
      title: "Error",
      description: "Failed to load board",
    };
  }
}

// Server-Komponente: Lädt Board-Daten direkt beim Request und reicht sie an die Client-Komponente weiter
export default async function PublicBoardPage({ params }: PageProps) {
  const { projectId } = params;
  const supabase = await createServerClient();

  // Lade publishedBoard aus der Datenbank
  const { data: publishedBoard, error: publishError } = await supabase
    .from("published_boards")
    .select("*")
    .eq("project_id", projectId)
    .eq("is_published", true)
    .maybeSingle();

  if (publishError || !publishedBoard) {
    // Fehlerbehandlung: Board nicht gefunden oder nicht veröffentlicht
    return <div>Board nicht gefunden oder nicht veröffentlicht.</div>;
  }

  // Lade die eigentlichen Board-Daten aus dem Storage
  const userId = publishedBoard.user_id;
  const { data: projectData, error: storageError } = await supabase.storage
    .from("projects")
    .download(`${userId}/${projectId}.json`);

  if (storageError || !projectData) {
    // Fehlerbehandlung: Board-Daten fehlen
    return <div>Board-Daten konnten nicht geladen werden.</div>;
  }

  // Parse die JSON-Daten
  let content;
  try {
    content = JSON.parse(await projectData.text());
  } catch (e) {
    return <div>Board-Daten sind ungültig.</div>;
  }

  // Übergib die geladenen Daten als Props an die Client-Komponente
  return (
    <ClientPage projectContent={content} publishedBoard={publishedBoard} />
  );
}
