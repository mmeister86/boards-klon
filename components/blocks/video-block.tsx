"use client";

import { useRef, useState } from "react";
import { useDrag } from "react-dnd";
import { ItemTypes } from "@/lib/item-types";
import { Film } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoBlockProps {
  blockId: string;
  dropAreaId: string;
  content: string; // URL to the video
  isSelected?: boolean;
  onSelect?: () => void;
}

export function VideoBlock({
  blockId,
  dropAreaId,
  content,
  isSelected,
  onSelect,
}: VideoBlockProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.EXISTING_BLOCK,
    item: {
      id: blockId,
      type: "video",
      content,
      sourceDropAreaId: dropAreaId,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  // Connect the drag ref
  drag(dragRef);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleLoadedData = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleError = () => {
    setIsLoading(false);
    setError("Failed to load video");
  };

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
      {isLoading && (
        <div className="flex h-48 items-center justify-center bg-gray-100">
          <Film className="h-8 w-8 animate-pulse text-gray-400" />
        </div>
      )}

      {error && (
        <div className="flex h-48 items-center justify-center bg-red-50 text-red-500">
          <Film className="mr-2 h-6 w-6" />
          <span>{error}</span>
        </div>
      )}

      <video
        ref={videoRef}
        src={content}
        className={cn(
          "w-full rounded-md",
          isLoading && "hidden",
          error && "hidden"
        )}
        controls
        onLoadedData={handleLoadedData}
        onError={handleError}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity",
          "group-hover:opacity-100",
          (isLoading || error) && "hidden"
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
    </div>
  );
}
