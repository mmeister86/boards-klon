"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { DropAreaType, BlockType } from "@/lib/types";
import { isDropAreaEmpty } from "@/lib/utils/drop-area-utils";
import Image from "next/image";
import { Loader2, AlertCircle, Music } from "lucide-react";
import ReactPlayer from "react-player/lazy";
import { cn } from "@/lib/utils";

// Import types directly if needed, but avoid importing the main library statically
import type { PDFDocumentProxy, PDFPageProxy, PDFDocumentLoadingTask } from "pdfjs-dist";

// Define a type for the dynamically imported pdfjs-dist library
interface PdfJsLibType {
  GlobalWorkerOptions: {
    workerSrc: string;
  };
  getDocument: (
    src: string | URL | Uint8Array | import("pdfjs-dist/types/src/display/api").DocumentInitParameters
  ) => PDFDocumentLoadingTask;
}

// PDF worker setup remains conditional
if (typeof window !== "undefined") {
  // Dynamically set worker source if needed later or ensure build process copies it
  // The actual setting might move inside the dynamic import logic if library requires it
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
      <div className="w-full grid grid-cols-1 gap-2 items-start bg-white p-6 rounded-lg shadow-sm">
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
        className={`w-full grid gap-4 bg-white p-6 ${getGridClasses(
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

  // Ref to store the dynamically imported library with a specific type
  const pdfjsLibRef = useRef<PdfJsLibType | null>(null);

  const loadPdf = useCallback(async () => {
    // Ensure running only on client
    if (typeof window === "undefined" || !block.content || pdfDoc || isLoadingPdf) return;

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

      const loadingTask = pdfjsLibRef.current.getDocument(block.content);
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
      return <ModernAudioPlayer url={block.content} />;

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

// Add the ModernAudioPlayer component after the RenderBlock component
export function ModernAudioPlayer({ url }: { url: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // Attempt to play, handle potential errors
        audioRef.current.play().catch((playError) => {
          console.error("Error playing audio:", playError);
          setError("Audio konnte nicht abgespielt werden.");
          setIsPlaying(false); // Ensure state is correct on error
        });
      }
    }
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const time = parseFloat(event.target.value);
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number): string => {
    if (isNaN(time) || time === Infinity) {
      return "0:00";
    }
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Extract filename from URL as a placeholder title
  const displayFileName = decodeURIComponent(
    url?.split("/").pop() || "Audio Track"
  );

  useEffect(() => {
    // Reset state if URL changes
    setIsLoading(true);
    setError(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    // If the audio element exists, reset its state too
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = url; // Ensure src is updated if url changes
      // Load might be needed if src is reset late
      audioRef.current.load();
    }
  }, [url]);

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm w-full max-w-md mx-auto">
      {/* Error Display */}
      {error && (
        <div className="flex h-20 items-center justify-center text-red-500 text-sm">
          <AlertCircle className="mr-2 h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Placeholder - Adjusted */}
      {isLoading && !error && (
        <div className="flex h-20 items-center justify-center space-x-3 animate-pulse">
          <Music className="h-6 w-6 text-gray-400" />
          <div className="space-y-1">
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
            <div className="h-3 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      )}

      {/* Player UI - Hidden until loaded and no error */}
      <div className={cn("space-y-3", (isLoading || error) && "hidden")}>
        {/* Top Section: Info and Icons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Make icon and text clickable for play/pause */}
            <button
              onClick={handlePlayPause}
              className="flex items-center space-x-3 focus:outline-none group"
              aria-label={isPlaying ? "Pause Audio" : "Play Audio"}
            >
              <Music className="h-6 w-6 text-orange-500 group-hover:text-orange-600 transition-colors" />
              <div>
                <h3
                  className="font-semibold text-gray-900 truncate text-left group-hover:text-gray-700 transition-colors"
                  title={displayFileName}
                >
                  {displayFileName}
                </h3>
                <p className="text-sm text-gray-500 text-left">Audio File</p>{" "}
                {/* Platzhalter */}
              </div>
            </button>
          </div>
          {/* Icons (visual only for now) */}
          <div className="flex items-center space-x-2">
            <svg
              className="h-6 w-6 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              ></path>
            </svg>
            <svg
              className="h-6 w-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.539 1.118l-3.975-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              ></path>
            </svg>
          </div>
        </div>

        {/* Progress Bar and Time */}
        <div className="space-y-1">
          <div className="relative w-full h-1.5 bg-gray-200 rounded-full group">
            <div
              className="absolute h-1.5 bg-orange-500 rounded-full transition-all duration-75"
              style={{
                width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
              }}
            />
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Audio Seek Bar"
            />
          </div>
          <div className="flex justify-between text-xs font-medium text-gray-500">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={url}
        onLoadedData={() => {
          if (audioRef.current) {
            setIsLoading(false);
            setDuration(audioRef.current.duration);
            setError(null); // Clear any previous error on successful load
          }
        }}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onError={(e) => {
          console.error("Audio Error:", e);
          setIsLoading(false);
          setError("Audio konnte nicht geladen werden.");
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
        preload="metadata" // Important for getting duration quickly
      />
    </div>
  );
}
