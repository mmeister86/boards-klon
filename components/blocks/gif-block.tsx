import React, { useState } from "react";
import type { GifBlock, GifItem } from "@/lib/types";
import { GifPlayer } from "../gif/gif-player";
import { GifPickerDropdown } from "../gif/gif-picker-dropdown";

interface GifBlockComponentProps {
  block: GifBlock;
  onChange: (content: GifBlock["content"]) => void;
  isPreview?: boolean;
}

/**
 * Konvertiert ein GifItem in das Format für GifBlock["content"]
 */
const convertGifItemToBlockContent = (
  gifItem: GifItem
): GifBlock["content"] => {
  return {
    id: gifItem.id,
    url: gifItem.url,
    title: gifItem.title,
    images: {
      original: {
        url: gifItem.url,
        width: gifItem.width.toString(),
        height: gifItem.height.toString(),
      },
      fixed_height_still: {
        url: gifItem.previewUrl,
      },
    },
  };
};

/**
 * Block-Komponente für GIFs auf der Canvas
 * Zeigt das GIF und den Picker nebeneinander an
 */
export const GifBlockComponent: React.FC<GifBlockComponentProps> = ({
  block,
  onChange,
  isPreview = false,
}) => {
  // State: Steuert, ob das Dropdown (Picker) offen ist
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Handler für GIF-Auswahl aus dem Picker
  const handleGifSelect = (gif: GifItem) => {
    onChange(convertGifItemToBlockContent(gif));
    setDropdownOpen(false); // Nach Auswahl Dropdown schließen
  };

  // Im Preview-Modus nur den Player ohne Favoriten-Button anzeigen
  if (isPreview) {
    return block.content?.url ? (
      <div className="w-full bg-background rounded-lg shadow-sm">
        <GifPlayer gif={block.content} showFavoriteButton={false} />
      </div>
    ) : (
      <div className="w-full p-4 text-gray-400 text-center">
        Kein GIF ausgewählt
      </div>
    );
  }

  // Im Edit-Modus: Leiste zum Öffnen, Dropdown als Overlay, Player darunter
  return (
    <div className="relative w-full bg-background border rounded-lg shadow-sm p-4">
      {/* Leiste zum Öffnen des Dropdowns */}
      <button
        className="w-full text-left border rounded px-3 py-2 mb-2 bg-white"
        onClick={() => setDropdownOpen((open) => !open)}
      >
        {block.content?.title || "GIF auswählen"}
        <span className="float-right">▼</span>
      </button>

      {/* Dropdown als Overlay über dem Player */}
      {dropdownOpen && (
        <div className="absolute left-0 right-0 z-10">
          <GifPickerDropdown onSelect={handleGifSelect} />
        </div>
      )}

      {/* GIF Player */}
      {block.content?.url && (
        <div className="w-full">
          <GifPlayer gif={block.content} />
        </div>
      )}
    </div>
  );
};
