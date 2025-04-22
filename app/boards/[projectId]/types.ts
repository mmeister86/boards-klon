import type { LayoutBlockType } from "@/lib/types";

export interface PageProps {
  params: {
    projectId: string;
  };
}

export interface ProjectContent {
  title: string;
  dropAreas: LayoutBlockType[];
}

export interface PublishedBoard {
  author_name: string;
  updated_at: string;
  is_published: boolean;
  project_id: string;
  title: string;
}

export interface PublicProjectData {
  id: string;
  title: string;
  description?: string;
  layoutBlocks: LayoutBlockType[];
  createdAt: string;
  updatedAt: string;
}
