"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PublicLayoutRenderer } from "@/components/public/export-renderer";
import type { LayoutBlockType } from "@/lib/types";
import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";

// Types
interface PageProps {
  params: {
    projectId: string;
  };
}

interface ProjectContent {
  title: string;
  layoutBlocks: LayoutBlockType[];
}

interface PublishedBoard {
  author_name: string;
  updated_at: string;
  is_published: boolean;
  project_id: string;
  user_id: string;
}

export function ClientPage({ params }: PageProps) {
  const { projectId } = params;
  const [projectContent, setProjectContent] = useState<ProjectContent | null>(
    null
  );
  const [publishedBoard, setPublishedBoard] = useState<PublishedBoard | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function loadBoard() {
      console.log("[PublicBoard] Loading board", { projectId });
      setError(null);

      try {
        // Check if board is published
        console.log("[PublicBoard] Checking if board is published");
        const { data: publishedBoardData, error: publishError } = await supabase
          .from("published_boards")
          .select("*")
          .eq("project_id", projectId)
          .eq("is_published", true)
          .maybeSingle();

        if (publishError) {
          console.error("[PublicBoard] Error checking published board:", {
            error: publishError,
            projectId,
          });
          setError("Das Board konnte nicht geladen werden.");
          return;
        }

        if (!publishedBoardData) {
          console.log("[PublicBoard] Board not found or not published");
          setError(
            "Dieses Board wurde nicht gefunden oder ist nicht veröffentlicht."
          );
          return;
        }

        setPublishedBoard(publishedBoardData);
        console.log("[PublicBoard] Found published board", publishedBoardData);

        // Load project data - extract userId from published board data
        if (!publishedBoardData.user_id) {
          console.error("[PublicBoard] Published board is missing user_id:", publishedBoardData);
          setError("Die Board-Daten sind unvollständig. Bitte kontaktieren Sie den Administrator.");
          return;
        }
        
        const userId = publishedBoardData.user_id;
        
        console.log("[PublicBoard] Loading project data from storage", {
          bucket: "projects",
          path: `${userId}/${projectId}.json`,
          userId: userId
        });

        const timestamp = new Date().getTime();
        const { data: projectData, error: storageError } =
          await supabase.storage
            .from("projects")
            .download(`${userId}/${projectId}.json?t=${timestamp}`);

        if (storageError) {
          console.error("[PublicBoard] Error loading project data:", {
            error: storageError,
            projectId,
            userId,
            path: `${userId}/${projectId}.json`,
            message: storageError.message,
            name: storageError.name,
          });
          setError("Die Board-Daten konnten nicht geladen werden.");
          return;
        }

        if (!projectData) {
          console.log("[PublicBoard] Project data not found");
          setError("Die Board-Daten wurden nicht gefunden.");
          return;
        }

        // Parse project data
        console.log("[PublicBoard] Parsing project data");
        try {
          const content = JSON.parse(await projectData.text());
          console.log("[PublicBoard] Successfully parsed project data", {
            title: content.title,
            hasDropAreas: !!content.layoutBlocks,
          });
          setProjectContent(content);
        } catch (parseError) {
          console.error(
            "[PublicBoard] Error parsing project data:",
            parseError
          );
          setError("Die Board-Daten sind ungültig.");
          return;
        }
      } catch (error) {
        console.error("[PublicBoard] Unexpected error:", error);
        setError("Ein unerwarteter Fehler ist aufgetreten.");
      } finally {
        setIsLoading(false);
      }
    }

    loadBoard();
  }, [projectId, supabase]);

  if (isLoading) {
    return (
      <main className="container mx-auto p-4">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto p-4">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Fehler beim Laden des Boards
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
          >
            Zurück zum Editor
          </button>
        </div>
      </main>
    );
  }

  if (!projectContent || !publishedBoard) {
    return null;
  }

  // Filter empty top-level blocks
  console.log("[PublicBoard] Filtering blocks");
  const renderableBlocks = projectContent.layoutBlocks.filter(
    (block: LayoutBlockType) => {
      return block.zones.some((zone) => zone.blocks.length > 0);
    }
  );

  console.log("[PublicBoard] Rendering board", {
    title: projectContent.title,
    blocksCount: renderableBlocks.length,
  });

  if (renderableBlocks.length === 0) {
    console.log("[PublicBoard] No content to display");
    setError("This board has no content to display.");
    return null;
  }

  return (
    <main className="w-full min-h-screen flex flex-col items-center gap-8 py-8 px-0 sm:container sm:px-4 sm:mx-auto">
      {/* Logo */}
      <h1 className="text-4xl font-bold text-gray-800 mt-10 mb-4">
        Block Builder
      </h1>

      {/* Main content area */}
      <div className="w-full bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] sm:rounded-lg sm:max-w-[85rem]">
        <div className="board-content space-y-6 p-4 sm:p-8">
          {renderableBlocks.map((block: LayoutBlockType) => (
            <PublicLayoutRenderer key={block.id} layoutBlock={block} />
          ))}
        </div>
      </div>

      {/* Footer info */}
      <div className="text-center text-gray-600 text-sm">
        <p className="font-medium text-lg mb-1">{projectContent.title}</p>
        <p className="text-gray-500">
          {publishedBoard.author_name} |{" "}
          {new Date(publishedBoard.updated_at).toLocaleDateString()}
        </p>
      </div>
    </main>
  );
}
