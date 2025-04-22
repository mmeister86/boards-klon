import React, { useState, useEffect } from "react";
import Image from "next/image";
import type { GifBlock } from "@/lib/types";
import {
  isGifFavorite,
  addFavoriteGif,
  removeFavoriteGif,
} from "@/lib/gif-favorites";

interface GifPlayerProps {
  gif: GifBlock["content"];
  showFavoriteButton?: boolean;
}

/**
 * Zeigt das gewählte GIF groß an und optional einen Favoriten-Button
 * Favoriten werden global im localStorage gespeichert
 */
export const GifPlayer: React.FC<GifPlayerProps> = ({
  gif,
  showFavoriteButton = true,
}) => {
  // State für Favoritenstatus (optimistisches UI)
  const [favorite, setFavorite] = useState(false);

  // Beim Mount prüfen, ob das GIF Favorit ist
  useEffect(() => {
    if (showFavoriteButton) {
      setFavorite(isGifFavorite(gif.id));
    }
  }, [gif.id, showFavoriteButton]);

  // Handler für Favoriten-Button
  const handleToggleFavorite = () => {
    if (favorite) {
      removeFavoriteGif(gif.id);
      setFavorite(false);
    } else {
      // Für Favoriten wird ein GifItem benötigt, daher Felder mappen
      addFavoriteGif({
        id: gif.id,
        title: gif.title,
        url: gif.url,
        previewUrl: gif.images?.fixed_height_still?.url || gif.url,
        width: Number(gif.images?.original?.width) || 200,
        height: Number(gif.images?.original?.height) || 200,
      });
      setFavorite(true);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-4">
      <Image
        src={gif.url}
        alt={gif.title || "GIF"}
        width={0}
        height={0}
        sizes="100vw"
        className="w-full h-auto rounded shadow"
        style={{ background: "#eee" }}
      />
      {showFavoriteButton && (
        <button
          className={`mt-2 px-3 py-1 rounded border flex items-center gap-1 text-sm ${
            favorite
              ? "bg-yellow-100 border-yellow-400"
              : "bg-white border-gray-300"
          }`}
          onClick={handleToggleFavorite}
        >
          <span>{favorite ? "★" : "☆"}</span> Favorite
        </button>
      )}
    </div>
  );
};
