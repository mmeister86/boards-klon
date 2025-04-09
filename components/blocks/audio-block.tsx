"use client";

import { useRef, useState } from "react";
import { useDrag } from "react-dnd";
import { ItemTypes } from "@/lib/item-types";
import { Music } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioBlockProps {
  blockId: string;
  dropAreaId: string;
  content: string; // URL to the audio file
  isSelected?: boolean;
  onSelect?: () => void;
}

export function AudioBlock({
  blockId,
  dropAreaId,
  content,
  isSelected,
  onSelect,
}: AudioBlockProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.EXISTING_BLOCK,
    item: {
      id: blockId,
      type: "audio",
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
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleLoadedData = () => {
    setIsLoading(false);
    setError(null);
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleError = () => {
    setIsLoading(false);
    setError("Failed to load audio");
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
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
        <div className="flex h-24 items-center justify-center bg-gray-100">
          <Music className="h-8 w-8 animate-pulse text-gray-400" />
        </div>
      )}

      {error && (
        <div className="flex h-24 items-center justify-center bg-red-50 text-red-500">
          <Music className="mr-2 h-6 w-6" />
          <span>{error}</span>
        </div>
      )}

      <div className={cn("space-y-2", (isLoading || error) && "hidden")}>
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePlayPause}
            className="rounded-full bg-gray-100 p-3 text-gray-900 hover:bg-gray-200"
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

          <div className="flex-1">
            <input
              type="range"
              min={0}
              max={duration}
              value={currentTime}
              onChange={(e) => {
                const time = parseFloat(e.target.value);
                if (audioRef.current) {
                  audioRef.current.currentTime = time;
                  setCurrentTime(time);
                }
              }}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        <audio
          ref={audioRef}
          src={content}
          onLoadedData={handleLoadedData}
          onTimeUpdate={handleTimeUpdate}
          onError={handleError}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      </div>
    </div>
  );
}
