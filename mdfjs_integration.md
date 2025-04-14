Okay, let's integrate PDF.js into your public board view (`export-renderer.tsx`) to allow inline PDF viewing.

Here's the plan:

1.  **Install PDF.js:** Add the necessary library.
2.  **Modify `RenderBlock`:** Make the 'document' block rendering component stateful.
3.  **Initial State:** Display the preview image as before.
4.  **Click Handling:** When the preview is clicked, hide the image and show a loading state.
5.  **PDF Loading:** Load the PDF document using PDF.js.
6.  **Rendering:** Render each page of the PDF onto separate `<canvas>` elements within a scrollable container.
7.  **Worker Setup:** Configure the PDF.js worker.

---

**Step 1: Install PDF.js**

```bash
npm install pdfjs-dist
# or
yarn add pdfjs-dist
```

---

**Step 2: Set up PDF.js Worker**

PDF.js needs a worker file. The easiest way in Next.js is often to copy the worker file to your `public` directory during the build process or manually.

- Find the worker file: It's usually located at `node_modules/pdfjs-dist/build/pdf.worker.mjs`.
- Copy this file to your `/public` directory (e.g., `/public/pdf.worker.mjs`).

Alternatively, you can try importing it directly, but copying to `/public` avoids potential build/bundling issues. We'll use the `/public` path approach first.

---

**Step 3: Modify `components/public/export-renderer.tsx`**

We need to make the `RenderBlock` component stateful to handle the switch between the preview image and the PDF viewer.

```tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react"; // Import React hooks
import type { DropAreaType, BlockType } from "@/lib/types";
import { isDropAreaEmpty } from "@/lib/utils/drop-area-utils";
import Image from "next/image";
import { Loader2, AlertCircle } from "lucide-react"; // Import icons

// Import pdfjs-dist library and types
import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";

// Set worker source ONCE - adjust path if you didn't copy it to /public
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";
  // --- OR if importing directly (might need specific bundler config): ---
  // import * as pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs';
  // pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

// --- PublicDropAreaRenderer (Remains mostly the same) ---
interface PublicDropAreaRendererProps {
  dropArea: DropAreaType;
}

export function PublicDropAreaRenderer({
  dropArea,
}: PublicDropAreaRendererProps) {
  // Check if the area is completely empty (including nested splits)
  const isCompletelyEmpty = (area: DropAreaType): boolean => {
    if (area.blocks.length > 0) return false;
    if (
      area.isSplit &&
      area.splitAreas.some((subArea) => !isCompletelyEmpty(subArea))
    ) {
      return false;
    }
    return true;
  };

  if (isCompletelyEmpty(dropArea)) {
    return null;
  }

  // Basis Fall 2: Bereich ist NICHT gesplittet -> Blöcke rendern
  if (!dropArea.isSplit || dropArea.splitAreas.length === 0) {
    return (
      <div className="w-full space-y-4">
        {dropArea.blocks.map((block) => (
          <RenderBlock key={block.id} block={block} />
        ))}
      </div>
    );
  }

  // Rekursiver Fall: Bereich IST gesplittet -> Grid rendern
  else {
    // Filtere leere Sub-Areas heraus, bevor sie gerendert werden
    const renderableSubAreas = dropArea.splitAreas.filter(
      (subArea) => !isCompletelyEmpty(subArea)
    );

    const numCols = renderableSubAreas.length;
    const desktopCols = Math.min(numCols, 4);
    const tabletCols = Math.min(numCols, 2);

    const gridClasses = `grid grid-cols-1 md:grid-cols-${tabletCols} lg:grid-cols-${desktopCols} gap-4`;

    return (
      <div className="w-full">
        <div className={gridClasses}>
          {renderableSubAreas.map((subArea) => (
            <PublicDropAreaRenderer key={subArea.id} dropArea={subArea} />
          ))}
        </div>
      </div>
    );
  }
}

// --- RenderBlock Component (Modified for PDF.js) ---
function RenderBlock({ block }: { block: BlockType }) {
  const content = block.content || "";
  const [isPdfVisible, setIsPdfVisible] = useState(false);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null); // Ref for the PDF container

  const loadPdf = useCallback(async () => {
    if (!block.content || pdfDoc || isLoadingPdf) return;

    console.log(`[PDF Load] Starting load for: ${block.content}`);
    setIsLoadingPdf(true);
    setPdfError(null);

    try {
      const loadingTask = pdfjsLib.getDocument(block.content);
      const pdf = await loadingTask.promise;
      console.log(`[PDF Load] Document loaded: ${pdf.numPages} pages`);
      setPdfDoc(pdf);
      setNumPages(pdf.numPages);
    } catch (error) {
      console.error("[PDF Load] Error loading PDF:", error);
      const message =
        error instanceof Error ? error.message : "Unbekannter PDF-Fehler";
      setPdfError(`PDF konnte nicht geladen werden: ${message}`);
      setPdfDoc(null);
      setNumPages(0);
    } finally {
      setIsLoadingPdf(false);
    }
  }, [block.content, pdfDoc, isLoadingPdf]);

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default link behavior if it's an 'a' tag
    console.log("[PDF Click] Preview clicked, showing PDF viewer.");
    setIsPdfVisible(true);
    loadPdf(); // Start loading PDF when preview is clicked
  };

  // Cleanup PDF document on unmount or when PDF is hidden
  useEffect(() => {
    return () => {
      if (pdfDoc) {
        console.log("[PDF Cleanup] Destroying PDF document");
        pdfDoc.destroy();
      }
    };
  }, [pdfDoc]);

  // Render specific block types
  switch (block.type) {
    case "heading": {
      const Tag = `h${block.headingLevel || 1}` as keyof JSX.IntrinsicElements;
      return (
        <Tag
          className="preview-content not-prose font-bold" // Ensure font-bold is applied
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }
    case "paragraph":
      return (
        <div
          className="preview-content text-base lg:text-lg font-sans not-prose break-words" // Adjusted classes
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    case "image":
      return (
        <Image
          src={block.content}
          alt={block.altText || ""}
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: "100%", height: "auto" }}
          priority={false}
          className="rounded-lg shadow-sm" // Removed device-specific shadow
        />
      );
    case "video":
      return (
        <video
          src={block.content}
          controls
          style={{ maxWidth: "100%", borderRadius: "8px" }} // Added border radius
          preload="metadata"
        />
      );
    case "audio":
      return (
        <audio
          src={block.content}
          controls
          style={{ width: "100%" }}
          preload="metadata"
        />
      );
    case "document":
      // If PDF is visible, show the viewer, otherwise show the preview
      if (isPdfVisible) {
        return (
          <div
            ref={pdfContainerRef}
            className="pdf-viewer-container border border-gray-300 rounded-lg overflow-hidden bg-gray-50"
            style={{ maxHeight: "70vh", overflowY: "auto" }} // Ensure scrolling
          >
            {isLoadingPdf && (
              <div className="flex items-center justify-center p-10 text-gray-500">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                PDF wird geladen...
              </div>
            )}
            {pdfError && (
              <div className="flex flex-col items-center justify-center p-10 text-red-600">
                <AlertCircle className="h-8 w-8 mb-2" />
                <p className="text-center">{pdfError}</p>
                <button
                  onClick={() => setIsPdfVisible(false)} // Button to go back to preview
                  className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                >
                  Zurück zur Vorschau
                </button>
              </div>
            )}
            {pdfDoc &&
              numPages > 0 &&
              !pdfError &&
              // Render canvases for each page
              Array.from(new Array(numPages), (_, index) => (
                <PdfPage
                  key={`page_${index + 1}`}
                  pdfDoc={pdfDoc}
                  pageNumber={index + 1}
                  containerWidth={pdfContainerRef.current?.clientWidth} // Pass container width
                />
              ))}
          </div>
        );
      } else if (block.previewUrl) {
        // Show preview image as a clickable element
        return (
          <div
            onClick={handlePreviewClick}
            className="cursor-pointer group relative transition hover:shadow-lg"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handlePreviewClick(e);
            }}
          >
            <Image
              src={block.previewUrl}
              alt={`Vorschau für ${block.fileName || "Dokument"}`}
              width={0}
              height={0}
              sizes="100vw"
              style={{
                width: "100%",
                height: "auto",
                border: "1px solid #eee",
              }}
              priority={false}
              className="rounded-lg shadow-sm"
            />
            {/* Overlay to indicate click action */}
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100">
              <span className="text-white text-lg font-semibold bg-black/50 px-4 py-2 rounded">
                PDF anzeigen
              </span>
            </div>
          </div>
        );
      } else {
        // Fallback: Show simple link if no preview
        return (
          <a
            href={block.content}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {block.fileName || "Dokument öffnen"}
          </a>
        );
      }

    default:
      return (
        <div className="p-2 border rounded bg-gray-100 text-sm">
          {content || `Unbekannter Block: ${block.type}`}
        </div>
      );
  }
}

// --- Helper Component to Render a Single PDF Page ---
interface PdfPageProps {
  pdfDoc: PDFDocumentProxy;
  pageNumber: number;
  containerWidth?: number; // Optional container width for scaling
}

function PdfPage({ pdfDoc, pageNumber, containerWidth }: PdfPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let isMounted = true; // Flag to prevent updates on unmounted component

    const render = async () => {
      if (!pdfDoc || !canvasRef.current || !isMounted) return;

      try {
        const page = await pdfDoc.getPage(pageNumber);

        // Determine the scale based on container width, default to 1.5 if no width
        const desiredWidth = containerWidth ? containerWidth * 0.95 : 800; // Target 95% width or 800px
        const viewportBase = page.getViewport({ scale: 1 });
        const scale = desiredWidth / viewportBase.width;
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;
        // Optional: Add slight padding/margin via CSS if needed instead of adjusting canvas width directly
        // canvas.style.width = "100%"; // Make canvas responsive within its container
        // canvas.style.height = "auto";

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        console.log(
          `[PDF Render] Rendering page ${pageNumber} with scale ${scale.toFixed(
            2
          )}`
        );
        await page.render(renderContext).promise;
        console.log(`[PDF Render] Finished rendering page ${pageNumber}`);
      } catch (error) {
        console.error(
          `[PDF Render] Error rendering page ${pageNumber}:`,
          error
        );
        // Optionally display an error message on the canvas itself
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext("2d");
          if (ctx) {
            ctx.clearRect(
              0,
              0,
              canvasRef.current.width,
              canvasRef.current.height
            );
            ctx.fillStyle = "red";
            ctx.font = "16px Arial";
            ctx.fillText(`Fehler beim Rendern von Seite ${pageNumber}`, 10, 30);
          }
        }
      }
    };

    render();

    // Cleanup function
    return () => {
      isMounted = false;
      console.log(`[PDF Page Unmount] Cleanup for page ${pageNumber}`);
      // Optional: If pages hold large resources, consider releasing them,
      // but pdfDoc.destroy() in the parent should handle most cleanup.
    };
  }, [pdfDoc, pageNumber, containerWidth]); // Rerender if containerWidth changes

  return (
    <canvas
      ref={canvasRef}
      className="pdf-page-canvas block mx-auto my-2 shadow-md" // Center canvas and add margin/shadow
    ></canvas>
  );
}
```

**Explanation:**

1.  **Installation & Worker:** Installs `pdfjs-dist` and assumes you've copied `pdf.worker.mjs` to your `/public` folder and configured the `workerSrc`.
2.  **`RenderBlock` State:**
    - Added state variables (`isPdfVisible`, `isLoadingPdf`, `pdfDoc`, `numPages`, `pdfError`) to manage the PDF viewing state.
    - Added `pdfContainerRef` to get the width for scaling.
3.  **Click Handler (`handlePreviewClick`):**
    - Attached to the preview image container (`div` or `a`).
    - Sets `isPdfVisible` to `true`.
    - Calls `loadPdf` to start fetching the PDF data.
4.  **PDF Loading (`loadPdf`):**
    - Uses `pdfjsLib.getDocument(block.content).promise` to fetch and parse the PDF.
    - Updates state with the `pdfDoc` object and `numPages` on success.
    - Sets `pdfError` on failure.
    - Manages `isLoadingPdf` state.
5.  **Conditional Rendering (in 'document' case):**
    - If `isPdfVisible` is true, it renders the PDF viewer `div`.
      - Shows a loading indicator while `isLoadingPdf` is true.
      - Shows an error message if `pdfError` is set.
      - If `pdfDoc` is available, it maps over `numPages` and renders a `PdfPage` component for each page.
    - If `isPdfVisible` is false, it renders the preview `Image` (if `block.previewUrl` exists) wrapped in a clickable `div`. An overlay provides visual feedback on hover.
    - If no `previewUrl`, it renders a simple link as a fallback.
6.  **`PdfPage` Component:**
    - A dedicated component to render a single page onto a canvas.
    - Takes `pdfDoc` and `pageNumber` as props.
    - Uses `useEffect` to get the specific page, calculate the viewport scale based on the `containerWidth` (passed from `RenderBlock`), set canvas dimensions, and render the page using `page.render()`.
    - The `containerWidth` prop is used to make the PDF rendering responsive to its container.
7.  **Styling:**
    - The `pdf-viewer-container` div has `maxHeight: "70vh"` and `overflowY: "auto"` to enable scrolling.
    - Individual page canvases have `mx-auto`, `my-2`, and `shadow-md` for basic centering, spacing, and appearance.
8.  **Cleanup:** A `useEffect` hook in `RenderBlock` ensures that `pdfDoc.destroy()` is called when the component unmounts or the PDF is hidden, freeing up resources.

Now, when a user clicks the preview image of a document block on the public board, the image will be replaced by the interactive PDF viewer, allowing them to scroll through the pages directly within the board layout.
