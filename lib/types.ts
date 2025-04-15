// import type { DropResult } from "react-beautiful-dnd"; // Removed unused import
import type { Level } from "@tiptap/extension-heading"; // Import Level type

export interface BlockType {
  id: string;
  type: 'heading' | 'paragraph' | 'image' | 'video' | 'audio' | 'document';
  content: string;
  dropAreaId: string;
  // Additional properties for specific block types
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  altText?: string; // For images
  fileName?: string; // For documents
  thumbnailUrl?: string; // NEU: For document previews
  previewUrl?: string; // Added preview URL
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
  id?: string;
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

// Base Block Type
export interface BaseBlock {
  id: string;
  type: BlockType['type'];
  content: string | null;
  dropAreaId: string;
}

// Specific Block Types extending BaseBlock
export interface HeadingBlockType extends BaseBlock {
  type: "heading";
  content: string;
  headingLevel?: Level;
}

export interface ParagraphBlockType extends BaseBlock {
  type: "paragraph";
  content: string;
}

export interface ImageBlockType extends BaseBlock {
  type: "image";
  content: string;
  altText?: string;
  previewUrl512?: string;
  previewUrl128?: string;
}

export interface VideoBlockType extends BaseBlock {
  type: "video";
  content: string;
  thumbnailUrl?: string;
  previewUrl512?: string;
  previewUrl128?: string;
}

export interface AudioBlockType extends BaseBlock {
    type: "audio";
    content: string;
}
