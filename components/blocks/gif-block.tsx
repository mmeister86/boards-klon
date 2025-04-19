"use client";

import React from "react";
import type { GifBlock } from "@/lib/types"; // Importiere den GifBlock-Typ
import type { GifItem } from "@/components/gif/giphy-api"; // Importiere den GifItem-Typ
import { GifCard } from "@/components/gif/gif-card"; // Importiere GifCard statt GifPicker
import GifPlayer from "@/components/gif/gif-player"; // Importiere den GifPlayer zum Anzeigen

interface GifBlockProps {
  block: GifBlock;
  onChange: (newContent: GifBlock["content"]) => void; // Funktion zum Aktualisieren des Blocks
  isSelected: boolean; // Ist der Block aktuell ausgewählt? (Für UI-Anpassungen)
}

/**
 * React-Komponente zur Darstellung und Bearbeitung eines GIF-Blocks im Editor.
 */
export const GifBlockComponent: React.FC<GifBlockProps> = ({
  block,
  onChange,
  isSelected,
}) => {
  // NEU: State, um den Bearbeitungsmodus (Picker anzeigen trotz Inhalt) zu steuern
  const [isEditing, setIsEditing] = React.useState(false);

  const handleSelectGif = (gif: GifItem) => {
    // Konvertiere das ausgewählte GifItem in das Format, das im GifBlock gespeichert wird
    const newContent: GifBlock["content"] = {
      id: gif.id,
      url: gif.url, // Annahme: gif.url ist die originale GIF-URL
      title: gif.title,
      images: {
        // Hier nehmen wir an, dass gif.url die Original-URL ist und previewUrl die Standbild-URL
        // Ggf. muss die Struktur von GifItem oder die Giphy-API-Antwort angepasst werden
        original: {
          url: gif.url,
          width: String(gif.width),
          height: String(gif.height),
        },
        fixed_height_still: { url: gif.previewUrl },
      },
      altText: gif.title, // Standard-Alt-Text
    };
    onChange(newContent);
    setIsEditing(false); // Bearbeitungsmodus nach Auswahl beenden
  };

  // 1. Block ist ausgewählt UND (hat keinen Inhalt ODER ist im Bearbeitungsmodus) -> Zeige GifCard
  if (isSelected && (!block.content || isEditing)) {
    // Konvertiere block.content (falls vorhanden) in GifItem für initialSelectedGif
    const initialGif = block.content
      ? {
          id: block.content.id,
          title: block.content.title,
          url: block.content.images.original.url,
          previewUrl: block.content.images.fixed_height_still.url,
          width: parseInt(block.content.images.original.width, 10),
          height: parseInt(block.content.images.original.height, 10),
        }
      : null;

    return (
      <GifCard
        onSelectGif={handleSelectGif}
        initialSelectedGif={initialGif}
        compact
      />
    );
  }

  // 2. Block hat Inhalt (und ist nicht im Bearbeitungsmodus) -> Zeige GifPlayer
  if (block.content) {
    const displayGif: GifItem = {
      id: block.content.id,
      title: block.content.title,
      url: block.content.images.original.url,
      previewUrl: block.content.images.fixed_height_still.url,
      width: parseInt(block.content.images.original.width, 10),
      height: parseInt(block.content.images.original.height, 10),
    };

    const handleHeightChange = (/* height: number */) => {
      // Im Editor-Kontext ist diese Höhenänderung eventuell nicht direkt nötig
      // console.log("GifPlayer height changed (ignored in editor):", height);
    };

    return (
      <div
        className={`relative ${
          isSelected ? "ring-2 ring-ring ring-offset-2 rounded-lg" : ""
        }`}
      >
        <GifPlayer gif={displayGif} onHeightChange={handleHeightChange} />
        {/* Zeige 'Ändern'-Button nur, wenn ausgewählt UND Inhalt vorhanden */}
        {isSelected && (
          <button
            // Beim Klick auf Ändern: Setze den Bearbeitungsmodus
            onClick={() => setIsEditing(true)}
            className="absolute top-2 right-2 bg-background/80 hover:bg-background text-foreground p-1 rounded border border-border shadow-md text-xs"
            aria-label="GIF ändern"
          >
            Ändern
          </button>
        )}
      </div>
    );
  }

  // 3. Block ist NICHT ausgewählt UND hat keinen Inhalt -> Zeige Platzhalter
  // (Die Bedingung !isSelected ist implizit, da wir oben schon isSelected && !block.content behandelt haben)
  return <GifCard onSelectGif={() => {}} />;
};

// Optional: Exportiere als Default, falls gewünscht
// export default GifBlockComponent;
