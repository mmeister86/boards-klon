"use client";

import { useState, useEffect, useRef } from "react";
import { Music, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  url: string;
}

export function ModernAudioPlayer({ url }: AudioPlayerProps) {
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
    console.log("ModernAudioPlayer EFFECT START for url:", url);
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

    return () => {
      console.log("ModernAudioPlayer EFFECT CLEANUP for url:", url);
      // Cleanup logic (if any needed beyond component unmount)
    };
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

      {/* Loading Placeholder */}
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
                <p className="text-sm text-gray-500 text-left">Audio File</p>
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
