import React from "react";
import type { LayoutBlockType } from "@/lib/types";
import { RenderBlock } from "./export-renderer"; // Import from the existing file
import type { ViewportType } from "@/lib/hooks/use-viewport"; // Importiere ViewportType

interface RenderLayoutBlockProps {
  layoutBlock: LayoutBlockType;
  viewport: ViewportType; // NEU: Viewport Prop hinzufügen
}

// Helper function to get layout CSS classes (nimmt jetzt viewport)
const getLayoutClasses = (
  type: LayoutBlockType["type"],
  viewport: ViewportType // Typisierung hier auch anpassen
): string => {
  // Erzwinge einspaltiges Layout für Mobile
  if (viewport === "mobile") {
    return "flex flex-col gap-4"; // Einfaches Stack-Layout mit Lücke
  }

  // Standard-Logik für andere Viewports
  switch (type) {
    case "single-column":
      return "flex flex-col";
    case "two-columns":
      return "grid grid-cols-1 md:grid-cols-2 gap-4";
    case "three-columns":
      return "grid grid-cols-1 md:grid-cols-3 gap-4";
    case "layout-1-2":
      return "grid grid-cols-1 md:grid-cols-3 gap-4";
    case "layout-2-1":
      return "grid grid-cols-1 md:grid-cols-3 gap-4";
    case "grid-2x2":
      return "grid grid-cols-1 sm:grid-cols-2 gap-4";
    default:
      return "flex flex-col";
  }
};

// Helper function to get zone CSS classes (nimmt jetzt viewport)
const getZoneClasses = (
  type: LayoutBlockType["type"],
  zoneIndex: number,
  viewport: ViewportType // Typisierung hier auch anpassen
): string => {
  // Keine speziellen Klassen für Mobile (da einspaltig)
  if (viewport === "mobile") {
    return "";
  }

  // Standard-Logik für andere Viewports
  if (type === "layout-1-2") {
    return zoneIndex === 0 ? "md:col-span-1" : "md:col-span-2";
  }
  if (type === "layout-2-1") {
    return zoneIndex === 0 ? "md:col-span-2" : "md:col-span-1";
  }
  return "";
};

export function RenderLayoutBlock({
  layoutBlock,
  viewport,
}: RenderLayoutBlockProps) {
  // Füge viewport zur Destrukturierung hinzu
  // const hasContent = layoutBlock.zones.some((zone) => zone.blocks.length > 0); // Removed unused variable

  // Optional: Don't render the block at all if it has no content.
  // if (!hasContent) {
  //   return null;
  // }

  return (
    <div className="mb-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm export-layout-block">
      {/* Übergebe viewport an die Hilfsfunktionen */}
      <div className={` ${getLayoutClasses(layoutBlock.type, viewport)}`}>
        {layoutBlock.zones.map((zone, zoneIndex) => (
          <div
            key={zone.id}
            className={`export-zone ${getZoneClasses(
              layoutBlock.type,
              zoneIndex,
              viewport // Übergebe viewport
            )}`}
          >
            {/* Render blocks within the zone */}
            <div className="space-y-4 export-zone-content">
              {zone.blocks.map((block) => (
                <RenderBlock key={block.id} block={block} />
              ))}
              {/* Optional: Placeholder if zone is empty? */}
              {/* {zone.blocks.length === 0 && <div className="p-4 border border-dashed min-h-[50px] text-center text-gray-400">Empty Zone</div>} */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
