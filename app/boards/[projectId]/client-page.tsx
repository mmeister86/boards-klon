"use client";

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PublicDropAreaRenderer } from "@/components/public/export-renderer";
import type { DropAreaType } from "@/lib/types";
import { useState, useEffect } from "react";

// Types
interface PageProps {
  params: {
    projectId: string;
  };
}

interface ProjectContent {
  title: string;
  dropAreas: DropAreaType[];
}

interface PublishedBoard {
  author_name: string;
  updated_at: string;
  is_published: boolean;
  project_id: string;
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
  const supabase = createClient();

  useEffect(() => {
    async function loadBoard() {
      console.log("[PublicBoard] Loading board", { projectId });

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
          notFound();
          return;
        }

        if (!publishedBoardData) {
          console.log("[PublicBoard] Board not found or not published");
          notFound();
          return;
        }

        setPublishedBoard(publishedBoardData);
        console.log("[PublicBoard] Found published board", publishedBoardData);

        // Load project data
        console.log("[PublicBoard] Loading project data from storage", {
          bucket: "projects",
          path: `${projectId}.json`,
        });

        const timestamp = new Date().getTime();
        const { data: projectData, error: storageError } =
          await supabase.storage
            .from("projects")
            .download(`${projectId}.json?t=${timestamp}`);

        if (storageError) {
          console.error("[PublicBoard] Error loading project data:", {
            error: storageError,
            projectId,
            path: `${projectId}.json`,
            message: storageError.message,
            name: storageError.name,
          });
          notFound();
          return;
        }

        if (!projectData) {
          console.log("[PublicBoard] Project data not found");
          notFound();
          return;
        }

        // Parse project data
        console.log("[PublicBoard] Parsing project data");
        try {
          const content = JSON.parse(await projectData.text());
          console.log("[PublicBoard] Successfully parsed project data", {
            title: content.title,
            hasDropAreas: !!content.dropAreas,
          });
          setProjectContent(content);
        } catch (parseError) {
          console.error(
            "[PublicBoard] Error parsing project data:",
            parseError
          );
          notFound();
          return;
        }
      } catch (error) {
        console.error("[PublicBoard] Unexpected error:", error);
        notFound();
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

  if (!projectContent || !publishedBoard) {
    return null;
  }

  // Filter empty top-level areas
  console.log("[PublicBoard] Filtering areas");
  const renderableAreas = projectContent.dropAreas.filter(
    (area: DropAreaType) => {
      const hasBlocks = area.blocks.length > 0;
      const hasSplitContent =
        area.isSplit &&
        area.splitAreas.some(
          (subArea: DropAreaType) => subArea.blocks.length > 0
        );
      return hasBlocks || hasSplitContent;
    }
  );

  console.log("[PublicBoard] Rendering board", {
    title: projectContent.title,
    areasCount: renderableAreas.length,
  });

  return (
    <main className="w-full min-h-screen flex flex-col items-center gap-8 py-8 px-0 sm:container sm:px-4 sm:mx-auto">
      {/* Logo */}
      <h1 className="text-4xl font-bold text-gray-800 mt-10 mb-4">
        Block Builder
      </h1>

      {/* Main content area */}
      <div className="w-full bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] sm:rounded-lg sm:max-w-[85rem]">
        <div className="board-content space-y-6 p-4 sm:p-8">
          {renderableAreas.map((area: DropAreaType) => (
            <PublicDropAreaRenderer key={area.id} dropArea={area} />
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
