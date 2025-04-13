// Typen für die Mediathek-Komponente

// Typ für die API-Antwort bei der Optimierung von Medien
export interface OptimizeApiResponse {
  message: string;
  optimizedUrl?: string; // Optional für Video-API
  publicUrl?: string; // Optional für andere API
  storageUrl?: string; // Optional für Video/Audio/PDF API
  previewUrl?: string; // Optional für PDF API
  previewUrl512?: string | null; // Optional für Bild API
  previewUrl128?: string | null; // Optional für Bild API
}

// Typ für API-Fehlerantworten
export interface ErrorApiResponse {
  error: string;
}

// Haupttyp für Medienelemente
export interface MediaItem {
  id: string;
  file_name: string;
  file_type: string;
  url: string;
  uploaded_at: string | null;
  size: number;
  width: number | null;
  height: number | null;
  user_id: string | null;
  preview_url?: string | null;
  preview_url_512?: string | null;
  preview_url_128?: string | null;
}

// Typ für die verschiedenen Medienkategorien
export type MediaCategory = 'image' | 'video' | 'audio' | 'document';

// Props für die MediaPreview-Komponente
export interface MediaPreviewProps {
  item: MediaItem;
  onDelete: (item: MediaItem) => Promise<void>;
  isDeleting: boolean;
}

// Props für die UploadZone-Komponente
export interface UploadZoneProps {
  onUpload: (files: FileList | null) => Promise<void>;
  isUploading: boolean;
  progress: number;
  showTimeoutMessage: boolean;
  isEmpty: boolean;
  processingProgress: number;
}

// Props für die MediaSearch-Komponente
export interface MediaSearchProps {
  query: string;
  onQueryChange: (query: string) => void;
}

// Props für die MediaCategory-Komponente
export interface MediaCategoryProps {
  type: MediaCategory;
  items: MediaItem[];
  onDelete: (item: MediaItem) => Promise<void>;
}
