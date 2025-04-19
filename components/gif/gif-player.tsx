"use client";

import { useState, useRef, useEffect } from "react";
import type { GifItem } from "@/types/gif";

interface GifPlayerProps {
  gif: GifItem;
  onHeightChange: (height: number) => void;
}

export default function GifPlayer({ gif, onHeightChange }: GifPlayerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Effect to update container height when image loads
  useEffect(() => {
    setIsLoaded(false);
    setLoadError(false);
  }, [gif]);

  const handleImageLoad = () => {
    setIsLoaded(true);

    // Calculate and set the appropriate height based on the image's aspect ratio
    if (imgRef.current && containerRef.current) {
      const img = imgRef.current;
      const container = containerRef.current;
      const containerWidth = container.clientWidth;

      // Calculate height based on aspect ratio
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      const calculatedHeight = containerWidth / aspectRatio;

      // Call the callback to update parent component
      onHeightChange(calculatedHeight);
    }
  };

  const handleImageError = () => {
    setLoadError(true);
    setIsLoaded(true);
    onHeightChange(300); // Default height for error state
  };

  return (
    <div
      ref={containerRef}
      className="w-full bg-gray-100 flex items-center justify-center overflow-hidden"
    >
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      )}

      {loadError ? (
        <div className="text-center text-gray-500 p-4">
          Failed to load GIF. Please try another one.
        </div>
      ) : (
        <img
          ref={imgRef}
          src={gif.url || "/placeholder.svg"}
          alt={gif.title}
          className={`w-full object-contain ${
            isLoaded ? "opacity-100" : "opacity-0"
          } border-b-xl`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
    </div>
  );
}
