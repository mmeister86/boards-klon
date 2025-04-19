"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { BlockType } from "@/lib/types";
import Image from "next/image";
import { Loader2, AlertCircle } from "lucide-react";
import ReactPlayer from "react-player/lazy";
import { ModernAudioPlayer } from "@/components/ui/modern-audio-player";

// Import types directly if needed, but avoid importing the main library statically
import type {
  PDFDocumentProxy,
  PDFPageProxy,
  PDFDocumentLoadingTask,
} from "pdfjs-dist";

// Define a type for the dynamically imported pdfjs-dist library
interface PdfJsLibType {
  GlobalWorkerOptions: {
    workerSrc: string;
  };
  getDocument: (
    src:
      | string
      | URL
      | Uint8Array
      | import("pdfjs-dist/types/src/display/api").DocumentInitParameters
  ) => PDFDocumentLoadingTask;
}

// PDF worker setup remains conditional
if (typeof window !== "undefined") {
  // Dynamically set worker source if needed later or ensure build process copies it
  // The actual setting might move inside the dynamic import logic if library requires it
}

// Block-Rendering Komponente - JETZT EXPORTIERT
export function RenderBlock({ block }: { block: BlockType }) {
  const content = block.content || "";
  const [isPdfVisible, setIsPdfVisible] = useState(false);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  // Ref to store the dynamically imported library with a specific type
  const pdfjsLibRef = useRef<PdfJsLibType | null>(null);

  const loadPdf = useCallback(async () => {
    // Ensure running only on client
    if (
      typeof window === "undefined" ||
      !block.content ||
      pdfDoc ||
      isLoadingPdf
    )
      return;

    setIsLoadingPdf(true);
    setPdfError(null);

    try {
      // Dynamically import the library
      if (!pdfjsLibRef.current) {
        const pdfjs = await import("pdfjs-dist");
        // Set worker source *after* import and *before* getDocument
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";
        pdfjsLibRef.current = pdfjs;
      }

      // Prüfen, ob content ein Objekt mit 'src' ist, bevor darauf zugegriffen wird
      const pdfSrc =
        typeof block.content === "object" &&
        block.content &&
        "src" in block.content
          ? block.content.src
          : null;
      if (!pdfSrc || typeof pdfSrc !== "string") {
        throw new Error("Invalid PDF source provided.");
      }

      const loadingTask = pdfjsLibRef.current.getDocument(pdfSrc);
      const pdf = await loadingTask.promise;
      setPdfDoc(pdf);
      setNumPages(pdf.numPages);
    } catch (error) {
      console.error("Error loading PDF:", error);
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
    e.preventDefault();
    setIsPdfVisible(true);
    loadPdf();
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, numPages));
  };

  // Cleanup PDF document on unmount or when PDF is hidden
  useEffect(() => {
    return () => {
      if (pdfDoc) {
        pdfDoc.destroy();
      }
    };
  }, [pdfDoc]);

  switch (block.type) {
    case "heading": {
      const Tag = `h${block.headingLevel || 1}` as keyof JSX.IntrinsicElements;
      return (
        <Tag
          className="preview-content not-prose h-auto"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }

    case "paragraph":
      return (
        <div
          className="preview-content text-base lg:text-xl font-sans not-prose h-auto"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );

    case "image":
      // Use width=0, height=0, sizes, and style for responsive auto-height image
      if (
        block.content &&
        typeof block.content === "object" &&
        "src" in block.content
      ) {
        return (
          <Image
            src={block.content.src}
            alt={block.content.alt || "Bild"}
            width={0}
            height={0}
            sizes="100vw"
            style={{ width: "100%", height: "auto" }}
            priority={false}
            className="rounded-lg shadow-sm md:shadow-md shadow-slate-500/70"
          />
        );
      }
      return <div>Ungültiger Bild-Inhalt</div>;

    case "video":
      if (
        block.content &&
        typeof block.content === "object" &&
        "src" in block.content
      ) {
        return (
          <div className="player-wrapper relative pt-[56.25%] rounded-lg overflow-hidden shadow-md">
            <ReactPlayer
              className="absolute top-0 left-0"
              url={block.content.src}
              width="100%"
              height="100%"
              controls={true}
              light={block.content.thumbnailUrl || true}
              config={{
                youtube: {
                  playerVars: {
                    origin:
                      typeof window !== "undefined"
                        ? window.location.origin
                        : "",
                  },
                },
              }}
            />
          </div>
        );
      }
      return <div>Ungültiger Video-Inhalt</div>;

    case "audio":
      if (
        block.content &&
        typeof block.content === "object" &&
        "src" in block.content
      ) {
        return <ModernAudioPlayer url={block.content.src} />;
      }
      return <div>Ungültiger Audio-Inhalt</div>;

    case "gif":
      if (
        block.content &&
        typeof block.content === "object" &&
        "images" in block.content
      ) {
        const stillUrl =
          block.content.images?.fixed_height_still?.url ||
          block.content.images?.original?.url;
        const altText =
          block.content.altText || block.content.title || "Animiertes GIF";
        return (
          <Image
            src={stillUrl}
            alt={altText}
            width={0}
            height={0}
            sizes="100vw"
            style={{ width: "100%", height: "auto" }}
            className="rounded-lg shadow-sm md:shadow-md shadow-slate-500/70"
            priority={false}
          />
        );
      }
      return <div>Ungültiger GIF-Inhalt</div>;

    case "document":
      if (isPdfVisible) {
        return (
          <div
            ref={pdfContainerRef}
            className="pdf-viewer-container border border-gray-300 rounded-lg overflow-hidden bg-gray-50"
          >
            {isLoadingPdf && (
              <div className="flex items-center justify-center p-10 text-gray-500">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                <span>PDF wird geladen...</span>
              </div>
            )}
            {pdfError && (
              <div className="flex flex-col items-center justify-center p-10 text-red-600">
                <AlertCircle className="h-8 w-8 mb-2" />
                <p className="text-center">{pdfError}</p>
                <button
                  onClick={() => setIsPdfVisible(false)}
                  className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                >
                  Zurück zur Vorschau
                </button>
              </div>
            )}
            {pdfDoc && numPages > 0 && !pdfError && (
              <div className="flex flex-col items-center">
                <div
                  className="w-full overflow-auto"
                  style={{ maxHeight: "70vh" }}
                >
                  <PdfPage
                    key={`page_${currentPage}`}
                    pdfDoc={pdfDoc}
                    pageNumber={currentPage}
                    containerWidth={pdfContainerRef.current?.clientWidth}
                  />
                </div>
                <div className="flex items-center justify-center gap-4 py-4 bg-gray-50 border-t border-gray-200 w-full sticky bottom-0">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage <= 1}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Vorherige
                  </button>
                  <span className="text-sm text-gray-600">
                    Seite {currentPage} von {numPages}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage >= numPages}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Nächste
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      } else if (
        block.content &&
        typeof block.content === "object" &&
        "thumbnailUrl" in block.content &&
        block.content.thumbnailUrl
      ) {
        // Verwende thumbnailUrl als Vorschau, wenn vorhanden
        return (
          <div
            onClick={handlePreviewClick}
            className="cursor-pointer group relative transition hover:shadow-lg"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsPdfVisible(true);
                loadPdf();
              }
            }}
          >
            <Image
              src={block.content.thumbnailUrl}
              alt={`Vorschau für ${block.content.fileName || "Dokument"}`}
              width={0}
              height={0}
              sizes="100vw"
              style={{
                width: "100%",
                height: "auto",
                border: "1px solid #eee",
              }}
              priority={false}
              className="rounded-lg shadow-sm md:shadow-md shadow-slate-500/70"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100">
              <span className="text-white text-lg font-semibold bg-black/50 px-4 py-2 rounded">
                PDF anzeigen
              </span>
            </div>
          </div>
        );
      } else if (
        block.content &&
        typeof block.content === "object" &&
        "src" in block.content
      ) {
        // Fallback auf direkten Link, wenn keine Vorschau vorhanden
        return (
          <a
            href={block.content.src}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {block.content.fileName || "Dokument öffnen"}
          </a>
        );
      }
      return <div>Ungültiger Dokumenten-Inhalt</div>;

    default:
      // Dieser Fall sollte idealerweise nicht eintreten, wenn alle Blocktypen behandelt werden.
      // Füge hier eine explizite Behandlung oder einen Fehler hinzu.
      console.warn("Unbehandelter Blocktyp:", block);
      // const _exhaustiveCheck: never = block; // Uncomment for exhaustive check
      return <div>Unbekannter Blocktyp</div>;
  }
}

// PdfPage Component for rendering individual PDF pages
interface PdfPageProps {
  pdfDoc: PDFDocumentProxy;
  pageNumber: number;
  containerWidth?: number;
}

function PdfPage({ pdfDoc, pageNumber, containerWidth }: PdfPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const render = async () => {
      if (!pdfDoc || !canvasRef.current || !containerWidth) return;

      try {
        const page: PDFPageProxy = await pdfDoc.getPage(pageNumber);
        const desiredWidth = containerWidth;
        const viewport = page.getViewport({ scale: 1 });
        const scale = desiredWidth / viewport.width;
        const scaledViewport = page.getViewport({ scale: scale });

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.height = scaledViewport.height;
        canvas.width = scaledViewport.width;
        canvas.style.width = `${scaledViewport.width}px`;
        canvas.style.height = `${scaledViewport.height}px`;

        const renderContext = {
          canvasContext: context,
          viewport: scaledViewport,
        };
        await page.render(renderContext).promise;
      } catch (error) {
        console.error(`Error rendering PDF page ${pageNumber}:`, error);
      }
    };

    render();

    // Cleanup function if needed (though page proxy cleanup might not be necessary here)
    // return () => { page?.cleanup?.(); };
  }, [pdfDoc, pageNumber, containerWidth]);

  return (
    <canvas
      ref={canvasRef}
      className="pdf-page-canvas block mx-auto my-2 shadow-md"
    />
  );
}
