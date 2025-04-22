import { createServerClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { ClientPage } from "./client-page";
import type { PageProps } from "./types";

// Generate metadata for the page (server-side)
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { projectId } = params;
  const supabase = await createServerClient(); // Create Supabase client for server-side operations

  try {
    // Check if board is published
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

// Server component that renders the client component
export default function PublicBoardPage(props: PageProps) {
  return <ClientPage {...props} />;
}
