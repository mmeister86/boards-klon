import type { DropAreaType } from "@/lib/types";

export interface PageProps {
  params: {
    projectId: string;
  };
}

export interface ProjectContent {
  title: string;
  dropAreas: DropAreaType[];
}

export interface PublishedBoard {
  author_name: string;
  updated_at: string;
  is_published: boolean;
  project_id: string;
  title: string;
}
