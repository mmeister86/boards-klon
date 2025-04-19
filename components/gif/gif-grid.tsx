"use client";

import { useRef, useCallback } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { isGifFavorite, type GifItem } from "./giphy-api";
import Image from "next/image";

interface GifGridProps {
  gifs: GifItem[];
  onSelect: (gif: GifItem) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  onToggleFavorite: (gif: GifItem) => void;
}

export default function GifGrid({
  gifs,
  onSelect,
  onLoadMore,
  hasMore,
  isLoading,
  onToggleFavorite,
}: GifGridProps) {
  const observer = useRef<IntersectionObserver | null>(null);
  const lastGifElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore();
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, onLoadMore]
  );

  if (gifs.length === 0 && !isLoading) {
    return (
      <div className="p-4 text-center text-gray-500">Keine GIFs gefunden</div>
    );
  }

  return (
    <div className="p-2 bg-gray-100">
      <div className="grid grid-cols-3 gap-2">
        {gifs.map((gif, index) => {
          const isLastElement = index === gifs.length - 1;
          const isFavorite = isGifFavorite(gif.id);

          return (
            <div
              key={`${gif.id}-${index}`}
              ref={isLastElement ? lastGifElementRef : null}
              className="aspect-square rounded-md overflow-hidden cursor-pointer border border-gray-200 bg-white hover:border-gray-400 transition-colors relative group"
              onClick={() => onSelect(gif)}
            >
              {/* Das GIF-Bild wird jetzt mit next/image optimiert geladen */}
              <Image
                src={gif.previewUrl || "/placeholder.svg"}
                alt={gif.title}
                className="w-full h-full object-cover"
                width={300} // Feste Breite für das Grid, kann angepasst werden
                height={300} // Feste Höhe für das Grid, kann angepasst werden
                loading="lazy"
                unoptimized={gif.previewUrl?.endsWith(".gif")} // GIFs werden nicht weiter optimiert, um Animation zu erhalten
                // priority kann gesetzt werden, falls gewünscht
              />

              {/* Favorite button */}
              <Button
                size="icon"
                variant="ghost"
                className={`absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity ${
                  isFavorite ? "text-yellow-500 opacity-100" : "text-white"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(gif);
                }}
              >
                <Star
                  className={`h-4 w-4 ${isFavorite ? "fill-yellow-500" : ""}`}
                />
              </Button>
            </div>
          );
        })}

        {isLoading &&
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="aspect-square rounded-md overflow-hidden"
            >
              <Skeleton className="w-full h-full" />
            </div>
          ))}
      </div>
    </div>
  );
}
