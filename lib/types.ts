// import type { DropResult } from "react-beautiful-dnd"; // Removed unused import
import type { Level } from "@tiptap/extension-heading"; // Import Level type
// Alte Store-Import entfernt, da Typen jetzt hier leben und exportiert werden
// import type { LayoutBlockType } from "../store/blocks-store";

// --- Block Typ Definitionen --- START ---

// Interface für den Inhalt eines Bild-Blocks
export interface ImageContent {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  // Ggf. mediaItemId?: string; // Optionale Referenz zum Media Item
}

// Neuer Union Type für die Namen der Blocktypen
export type BlockTypeUnion =
  | "heading"
  | "paragraph"
  | "image"
  | "video"
  | "audio"
  | "document"
  | "gif";

// Basis BlockType (allgemeiner content)
export interface BaseBlockType {
  id: string;
  type: BlockTypeUnion;
  content: unknown; // Allgemeiner Typ für die Basis
}

// Spezifische Typen, die BaseBlockType erweitern
export interface HeadingBlock extends BaseBlockType {
  type: "heading";
  content: string; // Spezifischer Typ für heading
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface ParagraphBlock extends BaseBlockType {
  type: "paragraph";
  content: string; // Spezifischer Typ für paragraph
}

export interface ImageBlock extends BaseBlockType {
  type: "image";
  content: ImageContent; // Spezifischer Typ für image
}

// TODO: Spezifische Typen für video, audio, document hinzufügen
export interface VideoBlock extends BaseBlockType {
  type: "video";
  content: { src: string; thumbnailUrl?: string }; // Beispielstruktur
}
export interface AudioBlock extends BaseBlockType {
  type: "audio";
  content: { src: string }; // Beispielstruktur
}
export interface DocumentBlock extends BaseBlockType {
  type: "document";
  content: { src: string; fileName?: string; thumbnailUrl?: string }; // Beispielstruktur
}

// NEU: Schnittstelle für GIF-Blöcke
export interface GifBlock extends BaseBlockType {
  type: "gif";
  // Der Inhalt wird wahrscheinlich ein Objekt sein, das die URL und andere Metadaten von Giphy enthält
  content: {
    id: string; // Giphy ID
    url: string; // Direkte URL zum GIF
    title: string; // Titel/Beschreibung des GIFs
    images: {
      original: { url: string; width: string; height: string; }; // Original-GIF
      fixed_height_still: { url: string; }; // Standbild für Vorschau
      // Weitere Bildformate von Giphy könnten hier hinzugefügt werden
    };
    altText?: string; // Optionaler Alternativtext
  };
}

// Union Type aller möglichen spezifischen Block-Typen
export type BlockType =
  | HeadingBlock
  | ParagraphBlock
  | ImageBlock
  | VideoBlock
  | AudioBlock
  | DocumentBlock
  | GifBlock;

// --- Block Typ Definitionen --- ENDE ---

// --- NEUE TYPEN --- Hier hinzugefügt und exportiert
export type LayoutType =
  | "single-column"
  | "two-columns"
  | "three-columns"
  | "grid-2x2"
  | "layout-1-2" // Beispiel: Eine Spalte links (1/3), eine rechts (2/3)
  | "layout-2-1"; // Beispiel: Eine Spalte links (2/3), eine rechts (1/3)

// Typ für eine Inhaltszone innerhalb eines Layoutblocks
export interface ContentDropZoneType {
  id: string; // Eindeutige ID für die Zone innerhalb des Layoutblocks
  blocks: BlockType[]; // Verwenden das bestehende BlockType Array
}

// Typ für einen Layoutblock auf dem Canvas
export interface LayoutBlockType {
  id: string; // Eindeutige ID für den Layoutblock
  type: LayoutType; // Der Typ des Layouts (z.B. 'two-columns')
  zones: ContentDropZoneType[]; // Die Inhaltszonen, die dieses Layout definiert
  customClasses?: { // Optionale benutzerdefinierte CSS-Klassen
    margin?: string;
    padding?: { top?: string; right?: string; bottom?: string; left?: string };
    backgroundColor?: string;
  };
}
// --- ENDE NEUE TYPEN ---

/* // Veraltet, wird durch LayoutBlockType ersetzt
export interface DropAreaType {
  id: string;
  blocks: BlockType[];
  isSplit: boolean;
  splitAreas: DropAreaType[]; // Changed from string[]
  splitLevel: number;
  parentId?: string | null; // Added parent ID
}
*/

export interface ProjectData {
  id?: string; // ID ist optional, da sie bei der Erstellung noch nicht existiert
  title: string;
  description?: string;
  // dropAreas: DropAreaType[]; // Ersetzt
  layoutBlocks: LayoutBlockType[]; // Neuer Schlüssel für die Layout-Struktur
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
  // dropAreaId: string; // Entfernt
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
