export interface BlockType {
  id: string;
  type: string;
  content: string;
  dropAreaId: string;
  // Additional properties for specific block types
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  altText?: string; // Optional: Add alt text specifically for images
  // Add more properties for other block types as needed
}

export interface DropAreaType {
  id: string;
  blocks: BlockType[];
  isSplit: boolean;
  splitAreas: DropAreaType[]; // Changed from string[]
  splitLevel: number;
  parentId?: string | null; // Added parent ID
}

export interface ProjectData {
  id: string;
  title: string;
  description?: string;
  dropAreas: DropAreaType[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  blocks: number;
  thumbnail?: string;
}

// Media Library Types
export interface MediaItem {
  id: string;
  url: string;
  fileName: string;
  fileType: string;
  uploadedAt: Date;
  size: number;
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface MediaLibraryState {
  items: MediaItem[];
  isLoading: boolean;
  error: string | null;
  // Pagination state
  page: number;
  hasMore: boolean;
  itemsPerPage: number;
}
