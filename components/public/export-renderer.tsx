"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { DropAreaType, BlockType } from "@/lib/types";
import { isDropAreaEmpty } from "@/lib/utils/drop-area-utils";
import Image from "next/image";
import { Loader2, AlertCircle } from "lucide-react";
import ReactPlayer from "react-player/lazy";

// Import pdfjs-dist library and types
import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";

// Set worker source
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";
}

interface PublicDropAreaRendererProps {
  dropArea: DropAreaType;
}

export function PublicDropAreaRenderer({
  dropArea,
}: PublicDropAreaRendererProps) {
  // Basis Fall 1: Bereich ist leer -> Nichts rendern
  if (isDropAreaEmpty(dropArea)) {
    return null;
  }

  // Basis Fall 2: Bereich ist NICHT gesplittet -> Blöcke rendern
  if (!dropArea.isSplit || dropArea.splitAreas.length === 0) {
    return (
      <div className="w-full grid grid-cols-1 gap-2 items-start">
        {dropArea.blocks.map((block) => (
          <RenderBlock key={block.id} block={block} />
        ))}
      </div>
    );
  }

  // Rekursiver Fall: Bereich IST gesplittet -> Grid rendern

  // Filtere leere Sub-Areas heraus
  const renderableSubAreas = dropArea.splitAreas.filter(
    (subArea) => !isDropAreaEmpty(subArea)
  );

  // Check if this is a nested area
  const isNested = dropArea.splitLevel > 0;

  // Function to get grid classes for the second div
  const getGridClasses = (numColumns: number, isNested: boolean) => {
    const baseClass = "grid-cols-1";

    // Add lg:grid-cols-X based on actual number of columns
    const lgClass = numColumns >= 2 ? ` lg:grid-cols-${numColumns}` : "";

    // Only add md:grid-cols-2 for non-nested areas
    const mdClass = !isNested ? " md:grid-cols-2" : "";

    return `${baseClass}${mdClass}${lgClass}`;
  };

  return (
    <div className="w-full">
      <div
        className={`w-full grid gap-4 ${getGridClasses(
          renderableSubAreas.length,
          isNested
        )}`}
      >
        {renderableSubAreas.map((subArea) => (
          <PublicDropAreaRenderer key={subArea.id} dropArea={subArea} />
        ))}
      </div>
    </div>
  );
}

// Block-Rendering Komponente
function RenderBlock({ block }: { block: BlockType }) {
  const content = block.content || "";
  const [isPdfVisible, setIsPdfVisible] = useState(false);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  const loadPdf = useCallback(async () => {
    if (!block.content || pdfDoc || isLoadingPdf) return;

    setIsLoadingPdf(true);
    setPdfError(null);

    try {
      const loadingTask = pdfjsLib.getDocument(block.content);
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
      return (
        <Image
          src={block.content}
          alt={block.altText || ""}
          width={0} // Required for Next.js, but overridden by style
          height={0} // Required for Next.js, but overridden by style
          sizes="100vw" // Inform optimizer about expected size
          style={{ width: "100%", height: "auto" }} // Let browser determine height
          priority={false}
          className="rounded-lg shadow-sm md:shadow-md shadow-slate-500/70"
        />
      );

    case "video":
      return (
        <div className="player-wrapper relative pt-[56.25%] rounded-lg overflow-hidden shadow-md">
          <ReactPlayer
            className="absolute top-0 left-0"
            url={block.content}
            width="100%"
            height="100%"
            controls={true}
            light={(block.type === "video" && block.thumbnailUrl) || true}
            config={{
              youtube: {
                playerVars: {
                  origin:
                    typeof window !== "undefined" ? window.location.origin : "",
                },
              },
            }}
          />
        </div>
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
      } else if (block.previewUrl) {
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
              className="rounded-lg shadow-sm md:shadow-md shadow-slate-500/70"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100">
              <span className="text-white text-lg font-semibold bg-black/50 px-4 py-2 rounded">
                PDF anzeigen
              </span>
            </div>
          </div>
        );
      } else {
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
      return <div>{block.content}</div>;
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
    let isMounted = true;

    const render = async () => {
      if (!pdfDoc || !canvasRef.current || !isMounted) return;

      try {
        const page = await pdfDoc.getPage(pageNumber);
        const desiredWidth = containerWidth ? containerWidth * 0.95 : 800;
        const viewportBase = page.getViewport({ scale: 1 });
        const scale = desiredWidth / viewportBase.width;
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;
      } catch (error) {
        console.error(`Error rendering page ${pageNumber}:`, error);
      }
    };

    render();

    return () => {
      isMounted = false;
    };
  }, [pdfDoc, pageNumber, containerWidth]);

  return (
    <canvas
      ref={canvasRef}
      className="pdf-page-canvas block mx-auto my-2 shadow-md"
    />
  );
}
