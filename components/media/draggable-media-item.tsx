"use client";

import React from "react";
import { useDrag } from "react-dnd";
import { ItemTypes } from "@/lib/dnd/itemTypes";

// Lokale Interface-Definition, die der Struktur aus editor-right-sidebar entspricht
// Wird jetzt exportiert, damit sie in useDropArea wiederverwendet werden kann
export interface MediaItemInput {
  id: string;
  file_name: string;
  file_type: string;
  url: string;
  uploaded_at: string;
  size: number;
  width?: number;
  height?: number;
  preview_url_512?: string | null;
  preview_url_128?: string | null;
}

interface DraggableMediaItemProps {
  item: MediaItemInput; // Verwendung der lokalen Interface-Definition
  children: React.ReactNode;
}

// Definieren als Standard-Funktionskomponente statt React.FC
export function DraggableMediaItem({
  item,
  children,
}: DraggableMediaItemProps) {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ItemTypes.MEDIA_ITEM,
      // Das item wird direkt übergeben, react-dnd fügt intern 'type' hinzu
      item: item,
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [item]
  );

  return (
    <div
      // @ts-expect-error // Korrekter Typ-Ignore für ref={drag}
      ref={drag} // Verbindet das DOM-Element mit dem Drag-Source-Handler
      style={{ opacity: isDragging ? 0.5 : 1 }} // Visuelles Feedback beim Ziehen
      className="cursor-grab" // Zeigt an, dass das Element greifbar ist
      title={`Ziehen: ${item.file_name}`} // Tooltip mit korrektem Feldnamen
    >
      {children}
    </div>
  );
}
