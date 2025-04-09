Okay, let's design and implement the `ImageBlock` component based on your requirements.

**1. Update Block Type Definition**

First, let's potentially add `altText` to our block type definition if it's not implicitly handled by `content`. We'll assume `content` stores the image URL or is empty/null for the placeholder state.

```ts
// lib/types.ts (or wherever BlockType is defined)
export interface BlockType {
  id: string;
  type: string;
  content: string; // Will store the image URL or be empty/null
  dropAreaId: string;
  // ... other properties
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  altText?: string; // Optional: Add alt text specifically for images
}
```

**2. Create the `ImageBlock` Component**

This component will handle rendering the placeholder, the image, loading/error states, and the drop zone logic.

```tsx
// components/blocks/image-block.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDrop, DragObjectWithType } from "react-dnd";
import { NativeTypes } from "react-dnd-html5-backend";
import { ImageIcon, Loader2, AlertCircle, UploadCloud } from "lucide-react";
import { useBlocksStore } from "@/store/blocks-store";
import { cn } from "@/lib/utils";
import { ItemTypes } from "@/lib/item-types"; // Assuming you have ItemTypes defined

// --- Mock Upload Function (Replace with actual Supabase logic) ---
// Utility function to handle image uploads (e.g., to Supabase Storage)
// This should be moved to a utility file (e.g., lib/supabase/storage.ts)
async function uploadImageToStorage(file: File): Promise<string> {
  console.log(`Simulating upload for: ${file.name}`);
  // ** Placeholder: Replace with your actual Supabase upload logic **
  // 1. Get Supabase client
  // 2. Upload file to a designated bucket/path (e.g., `images/${Date.now()}-${file.name}`)
  // 3. Get the public URL of the uploaded file
  // Example structure:
  /*
  const supabase = getSupabase(); // Assuming you have a getSupabase() helper
  if (!supabase) throw new Error("Supabase client not available");
  const filePath = `public/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage
    .from('images') // Your image bucket name
    .upload(filePath, file);
  if (error) throw error;
  const { data } = supabase.storage.from('images').getPublicUrl(filePath);
  if (!data?.publicUrl) throw new Error("Could not get public URL");
  return data.publicUrl;
  */

  // --- Mock Implementation ---
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate a public URL - replace with actual URL from Supabase
      const mockUrl = URL.createObjectURL(file); // Use ObjectURL for quick local preview simulation
      console.log(`Simulated upload complete. URL: ${mockUrl}`);
      resolve(mockUrl);
      // Important: In a real scenario, you might want to revoke this ObjectURL later
      // URL.revokeObjectURL(mockUrl);
    }, 1500); // Simulate 1.5 second upload
  });
  // --- End Mock Implementation ---
}
// --- End Mock Upload Function ---

interface ImageBlockProps {
  blockId: string;
  dropAreaId: string;
  content: string | null; // Image URL or null/empty for placeholder
  altText?: string;
}

// Define accepted drop item types
interface FileDropItem {
  files: File[];
}
// Define your Media Library item type if it's different
interface MediaLibraryImageItem {
  type: typeof ItemTypes.MEDIA_IMAGE; // Example type
  url: string;
  alt?: string;
}

type AcceptedDropItem = FileDropItem | MediaLibraryImageItem;

export function ImageBlock({
  blockId,
  dropAreaId,
  content,
  altText,
}: ImageBlockProps) {
  const { updateBlockContent } = useBlocksStore();
  const [imageUrl, setImageUrl] = useState<string | null>(content);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update local state if block content changes from store
  useEffect(() => {
    setImageUrl(content);
    setIsLoading(!!content); // Assume loading if content exists initially
    setError(null); // Reset error on content change
  }, [content]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setError("Bild konnte nicht geladen werden.");
    // Optionally clear the invalid URL from the store
    // updateBlockContent(blockId, dropAreaId, "", { altText: "" });
  };

  const processDroppedFiles = useCallback(
    async (files: File[]) => {
      const imageFile = files.find((file) => file.type.startsWith("image/"));
      if (!imageFile) {
        setError("Nur Bilddateien werden akzeptiert.");
        setTimeout(() => setError(null), 3000);
        return;
      }

      setIsUploading(true);
      setError(null);
      try {
        const uploadedUrl = await uploadImageToStorage(imageFile);
        updateBlockContent(blockId, dropAreaId, uploadedUrl, {
          altText: altText || imageFile.name, // Use existing alt or filename
        });
        // ImageUrl state will update via useEffect when content prop changes
      } catch (uploadError: any) {
        console.error("Upload failed:", uploadError);
        setError(
          `Upload fehlgeschlagen: ${
            uploadError.message || "Unbekannter Fehler"
          }`
        );
      } finally {
        setIsUploading(false);
      }
    },
    [blockId, dropAreaId, updateBlockContent, altText]
  );

  const [{ isOver, canDrop }, drop] = useDrop<
    AcceptedDropItem, // Item type
    void, // Drop result (not needed here)
    { isOver: boolean; canDrop: boolean } // Collected props
  >({
    // Accept OS files and potentially items from your media library
    accept: [
      NativeTypes.FILE,
      ItemTypes.MEDIA_IMAGE /* Add your media library type */,
    ],
    drop: (item, monitor) => {
      if (monitor.getItemType() === NativeTypes.FILE) {
        const fileItem = item as FileDropItem;
        if (fileItem.files) {
          processDroppedFiles(fileItem.files);
        }
      } else if (monitor.getItemType() === ItemTypes.MEDIA_IMAGE) {
        // Handle drop from media library (assuming item has a 'url')
        const mediaItem = item as MediaLibraryImageItem;
        if (mediaItem.url) {
          updateBlockContent(blockId, dropAreaId, mediaItem.url, {
            altText: mediaItem.alt || altText || "", // Use alt from media item or existing
          });
        }
      }
    },
    canDrop: (item, monitor) => {
      // Allow drop only if it's a file or a specific media type
      const itemType = monitor.getItemType();
      if (itemType === NativeTypes.FILE) {
        // Optionally check file types here if possible, though full check happens on drop
        return true;
      }
      if (itemType === ItemTypes.MEDIA_IMAGE) {
        return true;
      }
      return false;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const isActive = isOver && canDrop;

  return (
    <div
      ref={drop}
      className={cn(
        "relative w-full border border-dashed border-transparent transition-colors duration-200",
        // Apply aspect ratio only for placeholder, not when image is loaded
        !imageUrl && "aspect-video",
        // Apply dropzone styling when active
        isActive
          ? "border-primary bg-primary/10"
          : canDrop
          ? "border-primary/50" // Indicate potential drop
          : "border-transparent",
        // Basic placeholder background
        !imageUrl && "bg-muted rounded-lg"
      )}
    >
      {/* Placeholder View */}
      {!imageUrl && !isUploading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-muted-foreground">
          <UploadCloud
            className={cn(
              "h-10 w-10 mb-2 transition-colors",
              isActive ? "text-primary" : "text-muted-foreground/50"
            )}
          />
          <p className="text-sm font-medium">
            Bild hierher ziehen oder{" "}
            <span className="text-primary">hochladen</span>
          </p>
          <p className="text-xs mt-1">Oder URL im Seitenmenü eingeben</p>
        </div>
      )}

      {/* Uploading State */}
      {isUploading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-background/80 rounded-lg">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-sm font-medium">Wird hochgeladen...</p>
        </div>
      )}

      {/* Image View */}
      {imageUrl && !isUploading && (
        <div className="relative w-full">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          {error && !isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/10 rounded-lg p-4 text-destructive">
              <AlertCircle className="h-6 w-6 mb-1" />
              <p className="text-xs text-center">{error}</p>
            </div>
          )}
          <img
            src={imageUrl}
            alt={altText || ""}
            onLoad={handleImageLoad}
            onError={handleImageError}
            // Fill width, height adjusts automatically, hide if loading/error
            className={cn(
              "block w-full h-auto rounded-lg object-cover", // object-cover ensures the image covers the area nicely
              (isLoading || error) && "opacity-0" // Hide broken/loading image
            )}
            // Add loading="lazy" for performance
            loading="lazy"
          />
        </div>
      )}

      {/* Drop Overlay (Visual feedback during drag) */}
      {isActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-primary/10 rounded-lg border-2 border-primary pointer-events-none">
          <UploadCloud className="h-10 w-10 mb-2 text-primary" />
          <p className="text-sm font-medium text-primary">Bild hier ablegen</p>
        </div>
      )}
    </div>
  );
}
```

**3. Integrate with `CanvasBlock`**

Modify `components/blocks/canvas-block.tsx` to render the new `ImageBlock`.

```tsx
// components/blocks/canvas-block.tsx
// ... other imports
import { ImageBlock } from "./image-block"; // Import the new component

// ... inside BlockContent component ...
function BlockContent({ block, viewport }: BlockContentProps) {
  // ... existing code for heading, paragraph ...

  if (block.type === "image") {
    return (
      <ImageBlock
        blockId={block.id}
        dropAreaId={block.dropAreaId}
        content={block.content} // Pass the URL (or null)
        altText={block.altText} // Pass alt text
      />
    );
  }

  // Default for other block types
  return <div className={blockStyle}>{block.content}</div>;
}

// ... rest of the file
```

**4. Integrate with `RightSidebar` (Configuration)**

This part requires modifying your existing `RightSidebar` component. The exact implementation depends on how your sidebar currently handles configuration, but here's the conceptual approach:

```tsx
// components/layout/right-sidebar.tsx (Conceptual)
"use client";

import { useBlocksStore } from "@/store/blocks-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
// ... other imports

export default function RightSidebar() {
  const { selectedBlockId, dropAreas, updateBlockContent } = useBlocksStore();

  // Find the selected block based on selectedBlockId and dropAreas state
  let selectedBlock = null;
  if (selectedBlockId) {
    for (const area of dropAreas) {
      // Need a recursive find function if you have nested drop areas
      const found = area.blocks.find((b) => b.id === selectedBlockId);
      if (found) {
        selectedBlock = found;
        break;
      }
      // Add recursive search in area.splitAreas if necessary
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedBlock) {
      updateBlockContent(
        selectedBlock.id,
        selectedBlock.dropAreaId,
        e.target.value
      );
    }
  };

  const handleAltTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedBlock) {
      updateBlockContent(
        selectedBlock.id,
        selectedBlock.dropAreaId,
        selectedBlock.content,
        {
          altText: e.target.value, // Update the altText property
        }
      );
    }
  };

  const handleClearImage = () => {
    if (selectedBlock) {
      updateBlockContent(selectedBlock.id, selectedBlock.dropAreaId, "", {
        altText: "",
      }); // Clear content and altText
    }
  };

  return (
    <div className="w-64 bg-card border-l border-border p-5 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-5">Properties</h2>

      {/* Conditionally render config based on selected block type */}
      {selectedBlock && selectedBlock.type === "image" && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={selectedBlock.content || ""}
              onChange={handleUrlChange}
            />
          </div>
          <div>
            <Label htmlFor="altText">Alt Text</Label>
            <Input
              id="altText"
              type="text"
              placeholder="Descriptive text for the image"
              value={selectedBlock.altText || ""}
              onChange={handleAltTextChange}
            />
          </div>
          <Button variant="outline" size="sm" onClick={handleClearImage}>
            Bild entfernen
          </Button>
        </div>
      )}

      {/* Add config panels for other block types here */}
      {selectedBlock && selectedBlock.type === "heading" && (
        <div>{/* Heading config... */}</div>
      )}
      {selectedBlock && selectedBlock.type === "paragraph" && (
        <div>{/* Paragraph config... */}</div>
      )}

      {!selectedBlock && (
        <p className="text-sm text-muted-foreground">
          Select a block to edit its properties.
        </p>
      )}
    </div>
  );
}
```

**5. Add `ItemTypes.MEDIA_IMAGE` (if needed)**

If your media library drag source uses a specific type, define it:

```ts
// lib/item-types.ts
export const ItemTypes = {
  SQUARE: "square",
  BLOCK: "block",
  EXISTING_BLOCK: "existing_block",
  MEDIA_IMAGE: "media_image", // Add type for media library images
} as const; // Use 'as const' for literal types

// ... rest of the file
```

**Explanation:**

1.  **`ImageBlock.tsx`:**
    - Manages internal state for `imageUrl`, `isLoading`, `isUploading`, and `error`.
    - Uses `useEffect` to sync `imageUrl` with the `content` prop from the store.
    - Implements `useDrop` to accept `NativeTypes.FILE` (OS drops) and `ItemTypes.MEDIA_IMAGE` (media library drops).
    - The `drop` handler determines the item type and either calls `processDroppedFiles` (for OS files) or directly updates the store with the URL (for media library items).
    - `processDroppedFiles` filters for image files, calls the (mock) `uploadImageToStorage`, handles loading/error states during upload, and updates the store via `updateBlockContent` on success.
    - Renders conditionally:
      - Placeholder with icon/text when `!imageUrl && !isUploading`.
      - Uploading indicator when `isUploading`.
      - The `<img>` tag when `imageUrl` is set. It includes `onLoad`/`onError` handlers and shows loading/error states overlayed if necessary.
    - Applies dynamic classes for dropzone feedback (`isActive`, `canDrop`).
    - The main `div` and `img` use `w-full` to fill horizontal space. `h-auto` on the `img` maintains aspect ratio. The placeholder uses `aspect-video` by default.
2.  **Upload Function:** The `uploadImageToStorage` function is crucial. The provided mock uses `URL.createObjectURL` for quick simulation, but **you must replace this with your actual Supabase Storage upload logic.**
3.  **`CanvasBlock` Integration:** Simple wiring to render `ImageBlock` when `block.type === 'image'`.
4.  **`RightSidebar` Integration:** Shows how to conditionally render input fields for "Image URL" (`block.content`) and "Alt Text" (`block.altText`) when an image block is selected. Changes trigger `updateBlockContent`. A "Clear Image" button is added.
5.  **Layout:** The `w-full` classes ensure the block tries to take up the available horizontal space defined by its parent container (`CanvasBlock` wrapper within the `DropArea`). The final width is determined by the `DropArea`'s layout context (full width, split column, etc.).

Remember to replace the mock upload function with your real Supabase implementation!
