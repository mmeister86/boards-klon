"use client";

import { useRef, useState, useEffect } from "react";
import ReactPlayer from "react-player/lazy"; // Import ReactPlayer (lazy load for performance)
import { useDrag } from "react-dnd";
import { ItemTypes } from "@/lib/item-types";
import { Film, Upload, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBlocksStore } from "@/store/blocks-store"; // Added Zustand store hook
import { useSupabase } from "@/components/providers/supabase-provider"; // Added Supabase hook
import { Input } from "@/components/ui/input"; // Added Input component
import { Button } from "@/components/ui/button"; // Added Button component
import { toast } from "sonner"; // Added toast notifications
import UpLoader from "@/components/uploading"; // Import the loading indicator
import { findContentBlockInLayout } from "../../lib/utils/layout-block-utils"; // NEU (relativer Pfad)

// --- Hilfsfunktion zum Bereinigen von Dateinamen (für zukünftige Upload-Logik) ---
const sanitizeFilename = (filename: string): string => {
  // Umlaute und ß ersetzen
  const umlautMap: { [key: string]: string } = {
    ä: "ae",
    ö: "oe",
    ü: "ue",
    Ä: "Ae",
    Ö: "Oe",
    Ü: "Ue",
    ß: "ss",
  };
  let sanitized = filename;
  for (const key in umlautMap) {
    sanitized = sanitized.replace(new RegExp(key, "g"), umlautMap[key]);
  }

  // Leerzeichen durch Unterstriche ersetzen und ungültige Zeichen entfernen
  return sanitized
    .replace(/\\s+/g, "_") // Ersetzt ein oder mehrere Leerzeichen durch einen Unterstrich
    .replace(/[^a-zA-Z0-9._-]/g, ""); // Entfernt alle Zeichen außer Buchstaben, Zahlen, Punkt, Unterstrich, Bindestrich
};

interface VideoBlockProps {
  blockId: string;
  layoutId: string;
  zoneId: string;
  content: string | null; // Allow content to be null for placeholder state
  isSelected?: boolean;
  onSelect?: () => void;
}

export function VideoBlock({
  blockId,
  layoutId,
  zoneId,
  content,
  isSelected,
  onSelect,
}: VideoBlockProps) {
  // const videoRef = useRef<HTMLVideoElement>(null); // No longer needed for native video element
  const dragRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(!!content);
  const [error, setError] = useState<string | null>(null);

  // New state for placeholder and upload/URL handling
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // Placeholder for potential detailed progress
  const [processingProgress, setProcessingProgress] = useState(0); // Placeholder for backend progress
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false); // Placeholder for timeout message
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [placeholderError, setPlaceholderError] = useState<string | null>(null);

  // Zustand store and Supabase hook
  const { updateBlockContent, layoutBlocks } = useBlocksStore();
  const { supabase: supabaseClient, user } = useSupabase();

  // Get block data from store to access thumbnailUrl
  const blockData = findContentBlockInLayout(
    layoutBlocks,
    layoutId,
    zoneId,
    blockId
  );
  // ThumbnailUrl ist jetzt ein Feld auf der Hauptebene des VideoBlock Objekts
  const thumbnailUrlFromStore =
    blockData?.type === "video" ? blockData.thumbnailUrl : undefined;

  // --- DEBUGGING ---
  console.log(`[VideoBlock ${blockId}] Block Data:`, blockData);
  console.log(
    `[VideoBlock ${blockId}] Thumbnail URL from Store:`,
    thumbnailUrlFromStore
  );
  // --- END DEBUGGING ---

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.EXISTING_BLOCK,
    item: {
      id: blockId,
      type: "video",
      content,
      sourceLayoutId: layoutId,
      sourceZoneId: zoneId,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  // Connect the drag ref
  drag(dragRef);

  // --- File Upload Handling ---
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!user || !supabaseClient) {
      setPlaceholderError("Login required to upload files.");
      toast.error("Du musst dich einloggen, um Dateien hochzuladen.");
      return;
    }

    const file = files[0];
    if (!file.type.startsWith("video/")) {
      setPlaceholderError("Bitte nur Videodateien hochladen.");
      toast.error("Nur Videodateien werden unterstützt.");
      return;
    }

    setIsUploading(true);
    setPlaceholderError(null);
    setUploadProgress(0); // Reset progress
    setProcessingProgress(0); // Reset backend progress
    setShowTimeoutMessage(false); // Reset timeout message
    const loadingToastId = toast.loading(`Lade ${file.name} hoch...`);

    // Show timeout message after a delay if still processing
    const timeoutId = setTimeout(() => {
      setShowTimeoutMessage(true);
    }, 15000); // 15 seconds

    try {
      const formData = new FormData();
      formData.append("video", file); // Key must match API endpoint expectation
      formData.append("userId", user.id);

      console.log(`VideoBlock: Calling /api/optimize-video for ${file.name}`);
      const response = await fetch("/api/optimize-video", {
        method: "POST",
        body: formData,
        credentials: "include",
        // You might need an AbortController for long uploads
        // Add progress tracking here if the API supports it or use a library
      });
      clearTimeout(timeoutId); // Clear timeout if fetch completes
      setShowTimeoutMessage(false); // Hide timeout message

      console.log(
        `VideoBlock: /api/optimize-video response status: ${response.status}`
      );
      const result = await response.json();
      console.log(
        `VideoBlock: Parsed JSON response from /api/optimize-video:`,
        JSON.stringify(result, null, 2)
      );

      if (!response.ok) {
        const errorMessage =
          result?.error || `Upload failed (Status: ${response.status})`;
        console.error(`VideoBlock: API fetch not ok.`, errorMessage);
        throw new Error(errorMessage);
      }

      const videoUrl = result.storageUrl ?? result.publicUrl; // Prioritize storageUrl if available
      if (!videoUrl) {
        throw new Error(
          "Video optimization succeeded but no URL was returned."
        );
      }

      // --- Update block in Zustand store ---
      // No thumbnailUrl for locally uploaded videos by default
      const additionalProps = thumbnailUrlFromStore
        ? { thumbnailUrl: thumbnailUrlFromStore }
        : undefined;
      updateBlockContent(blockId, layoutId, zoneId, videoUrl, additionalProps);

      toast.dismiss(loadingToastId);
      toast.success("Video erfolgreich hochgeladen und optimiert!");
      setIsLoading(true); // Set loading true as ReactPlayer needs to load the new URL
    } catch (err) {
      clearTimeout(timeoutId); // Clear timeout on error
      setShowTimeoutMessage(false);
      console.error("VideoBlock: Error handling video upload:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Fehler beim Hochladen des Videos.";
      setPlaceholderError(message);
      toast.dismiss(loadingToastId);
      toast.error(message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0); // Reset progress on completion or error
      setProcessingProgress(0); // Reset backend progress
    }
  };

  // --- URL Submit Handling ---
  const handleUrlSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    setPlaceholderError(null);
    const url = videoUrlInput.trim();
    if (!url) {
      setPlaceholderError("Bitte gib eine gültige Video-URL ein.");
      return;
    }

    let thumbnailUrl: string | undefined = undefined;
    let videoId: string | null = null;

    try {
      const parsedUrl = new URL(url);

      // Extract YouTube ID
      if (
        parsedUrl.hostname.includes("youtube.com") ||
        parsedUrl.hostname.includes("youtu.be")
      ) {
        if (parsedUrl.pathname === "/watch") {
          videoId = parsedUrl.searchParams.get("v");
        } else if (parsedUrl.pathname.length > 1) {
          videoId = parsedUrl.pathname.substring(1);
        }
        if (videoId) {
          thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        }
      }
      // Extract Vimeo ID
      else if (parsedUrl.hostname.includes("vimeo.com")) {
        const match = parsedUrl.pathname.match(/\/(\d+)/);
        if (match && match[1]) {
          videoId = match[1];
          // Vimeo thumbnail requires an API call or more complex parsing,
          // for simplicity, we'll stick to YouTube for now or let ReactPlayer handle it.
          // thumbnailUrl = await getVimeoThumbnail(videoId); // Placeholder for potential future enhancement
        }
      }

      // Update block content with video URL and potentially the thumbnail URL
      // Das thumbnailUrl-Feld wird jetzt ein direktes Feld auf dem Block-Objekt
      const additionalProps = thumbnailUrl
        ? { thumbnailUrl: thumbnailUrl }
        : undefined;
      updateBlockContent(blockId, layoutId, zoneId, url, additionalProps);

      setVideoUrlInput("");
      setIsLoading(true);
    } catch (error) {
      console.error("Error parsing video URL or updating block:", error);
      setPlaceholderError(
        "Die eingegebene URL ist ungültig oder wird nicht unterstützt."
      );
    }
  };

  // --- Drag and Drop Handlers for Placeholder ---
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  // --- Effect to reset loading state when content changes ---
  useEffect(() => {
    if (content) {
      setIsLoading(true);
      setError(null);
    } else {
      setIsLoading(false); // No content, not loading
      setError(null);
    }
  }, [content]);

  // --- Player Event Handlers ---
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReady = () => {
    console.log(`[VideoBlock ${blockId}] Player Ready (handleReady called)`);
    setIsLoading(false);
    setError(null);
  };

  const handleError = (e: Error | string | { type: string; data: unknown }) => {
    console.error(
      `[VideoBlock ${blockId}] Player Error (handleError called):`,
      e
    );
    setIsLoading(false);
    let errorMessage = "Fehler beim Laden des Videos.";
    if (typeof e === "string") {
      if (e.includes("fetching")) {
        errorMessage = "Fehler beim Laden des Videos von der URL.";
      } else {
        errorMessage = e;
      }
    } else if (e instanceof Error) {
      errorMessage = e.message;
    } else if (typeof e === "object" && e !== null && "type" in e) {
      // Handle potential ReactPlayer error objects
      errorMessage = `Player Error: ${e.type}`;
    }
    setError(errorMessage);
  };

  // --- Render Logic ---

  // Extract filename from URL if content exists
  const rawFileName = content ? content.split("/").pop() || "Video File" : "";
  const displayFileName = sanitizeFilename(rawFileName);

  // 1. Placeholder Rendering (if no content)
  if (!content) {
    return (
      <div
        ref={dragRef}
        className={cn(
          "group relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md min-h-[200px] flex flex-col justify-center",
          isDragging && "opacity-50",
          isSelected && "ring-2 ring-blue-500"
        )}
        onClick={(e) => {
          // Prevent triggering URL input click when clicking the general placeholder area
          // Only select if not clicking input/button elements within
          if (e.target === e.currentTarget) {
            onSelect?.();
          }
        }}
      >
        {/* Upload/Drop Zone */}
        <div
          className={cn(
            "flex-grow border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-200 flex flex-col items-center justify-center relative",
            isDraggingOver
              ? "border-primary bg-primary/5"
              : "border-border hover:border-muted-foreground/50",
            isUploading && "opacity-50 pointer-events-none" // Dim during upload
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() =>
            document.getElementById(`video-upload-${blockId}`)?.click()
          }
        >
          {isUploading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
              <div className="text-center">
                <UpLoader />
                <p className="text-sm text-muted-foreground mt-2">
                  {/* Show more detailed progress if available */}
                  {processingProgress > 0
                    ? `Optimiere Video... ${processingProgress}%`
                    : uploadProgress > 0
                    ? `${uploadProgress}% hochgeladen`
                    : "Verarbeite..."}
                </p>
                {showTimeoutMessage && !processingProgress && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Optimierung kann etwas dauern...
                  </p>
                )}
              </div>
            </div>
          )}
          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Video hierher ziehen oder{" "}
            <span className="text-primary font-medium">auswählen</span>
          </p>
          <input
            id={`video-upload-${blockId}`}
            type="file"
            className="hidden"
            accept="video/*"
            onChange={(e) => handleFileUpload(e.target.files)}
            disabled={isUploading}
          />
          <p className="text-xs text-muted-foreground mt-1">Max. 100MB</p>
        </div>

        {/* OR Separator */}
        <div className="my-4 flex items-center justify-center">
          <div className="flex-grow border-t border-border"></div>
          <span className="px-2 text-xs text-muted-foreground uppercase">
            Oder
          </span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        {/* URL Input */}
        <form onSubmit={handleUrlSubmit} className="flex gap-2 items-center">
          <LinkIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <Input
            type="url"
            placeholder="Video-URL einfügen (z.B. YouTube, Vimeo)"
            value={videoUrlInput}
            onChange={(e) => setVideoUrlInput(e.target.value)}
            className="flex-grow"
            disabled={isUploading}
          />
          <Button
            type="submit"
            size="sm"
            disabled={isUploading || !videoUrlInput.trim()}
          >
            Hinzufügen
          </Button>
        </form>

        {/* Placeholder Error Display */}
        {placeholderError && (
          <p className="mt-2 text-center text-sm text-red-500">
            {placeholderError}
          </p>
        )}
      </div>
    );
  }

  // 2. Player Rendering (if content exists)
  const lightPropValue = thumbnailUrlFromStore || true;
  // --- DEBUGGING ---
  console.log(
    `[VideoBlock ${blockId}] Value passed to light prop:`,
    lightPropValue
  );
  // --- END DEBUGGING ---

  return (
    <div
      ref={dragRef}
      className={cn(
        "group relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md",
        isDragging && "opacity-50",
        isSelected && "ring-2 ring-blue-500"
      )}
      onClick={onSelect}
    >
      {/* Loading Indicator for Player */}
      {isLoading && !error && (
        <div className="flex h-48 items-center justify-center bg-gray-100 rounded-md">
          <Film className="h-8 w-8 animate-pulse text-gray-400" />
        </div>
      )}

      {/* Error Indicator for Player */}
      {error && (
        <div className="flex h-48 items-center justify-center bg-red-50 text-red-500 rounded-md p-4">
          <Film className="mr-2 h-6 w-6 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* ReactPlayer */}
      <div
        className={cn(
          "player-wrapper relative pt-[56.25%]", // 16:9 Aspect Ratio
          (isLoading || error) && "hidden" // Hide wrapper when loading/error shown above
        )}
      >
        <ReactPlayer
          className="absolute top-0 left-0 rounded-md overflow-hidden" // Added rounded style
          url={content} // content is guaranteed to be string here
          width="100%"
          height="100%"
          playing={isPlaying}
          controls={true}
          light={lightPropValue}
          config={{
            youtube: {
              playerVars: {
                origin:
                  typeof window !== "undefined" ? window.location.origin : "",
              },
            },
          }}
          onReady={handleReady}
          onError={handleError}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />
      </div>

      {/* Display the sanitized filename (only if player loaded successfully) */}
      {!isLoading && !error && (
        <p
          className="mt-2 text-center text-sm text-gray-600 truncate"
          title={displayFileName}
        >
          {displayFileName}
        </p>
      )}

      {/* Conditional Hover Controls: Show only if using stored thumbnail */}
      {!isLoading && !error && thumbnailUrlFromStore && (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 rounded-lg"
          )}
        >
          <button
            onClick={handlePlayPause}
            className="rounded-full bg-white p-3 text-gray-900 shadow-lg hover:bg-gray-100"
          >
            {isPlaying ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 9v6m4-6v6"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
