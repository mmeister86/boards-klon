"use client";

import { useState, useEffect, useRef } from "react";
import { Music, AlertCircle, Play, Pause } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Volume2, VolumeX } from "lucide-react";
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
  const [volume, setVolume] = useState(1);
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

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    const newVolume = volume === 0 ? 0.5 : 0;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
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
      audioRef.current.volume = volume;
      // Load might be needed if src is reset late
      audioRef.current.load();
    }

    return () => {
      // Cleanup logic (if any needed beyond component unmount)
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        {/* Top Section: Icon and Text */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePlayPause}
              className="flex items-center space-x-3 focus:outline-none group"
              aria-label={isPlaying ? "Pause Audio" : "Play Audio"}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6 text-orange-500 group-hover:text-orange-600 transition-colors" />
              ) : (
                <Play className="h-6 w-6 text-orange-500 group-hover:text-orange-600 transition-colors" />
              )}
              {/* <div>
                <p className="text-sm text-gray-500 text-left">Audio File</p>
              </div> */}
            </button>
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

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMute}
            aria-label={volume === 0 ? "Unmute" : "Mute"}
          >
            {volume === 0 ? (
              <VolumeX className="h-5 w-5 text-gray-500 hover:text-gray-700" />
            ) : (
              <Volume2 className="h-5 w-5 text-gray-500 hover:text-gray-700" />
            )}
          </button>
          <Slider
            value={[volume]}
            onValueChange={handleVolumeChange}
            max={1}
            step={0.01}
            className="w-full"
            aria-label="Volume"
          />
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
