"use client";

// import { useState } from "react"; // Entfernt, da nicht mehr genutzt
import { DraggableBlock } from "@/components/blocks/draggable-block";
import { DraggableLayoutItem } from "./DraggableLayoutItem";
import {
  Heading,
  PenLineIcon as ParagraphIcon,
  ImageIcon,
  BoxIcon as ButtonIcon,
  FormInput,
  SeparatorHorizontal,
  Film as VideoIcon,
  Music as AudioIcon,
  FileText as DocumentIcon,
  Columns as TwoColumnsIcon,
  Rows as SingleColumnIcon,
  Grid as GridIcon,
  SquareStack as LayoutIcon,
  type LucideIcon,
  GiftIcon,
  Image as FreepikIcon,
} from "lucide-react";
import type { LayoutType } from "@/lib/types"; // Stelle sicher, dass LayoutType importiert ist

// Define the available block types with icons
const blockTypes = [
  {
    type: "heading",
    content: "Überschrift",
    label: "Überschrift",
    icon: Heading,
    description: "Füge eine Überschrift hinzu",
  },
  {
    type: "paragraph",
    content: "Absatz",
    label: "Text",
    icon: ParagraphIcon,
    description: "Füge einen Textabsatz hinzu",
  },
  {
    type: "image",
    content: null,
    label: "Bild",
    icon: ImageIcon,
    description: "Füge ein Platzhalterbild hinzu",
  },
  {
    type: "freepik",
    content: null,
    label: "Freepik",
    icon: FreepikIcon,
    description: "Füge Stockfotos oder Vektorgrafiken von Freepik ein",
  },
  {
    type: "video",
    content: null,
    label: "Video",
    icon: VideoIcon,
    description: "Füge ein Video hinzu",
  },
  {
    type: "gif",
    content: null,
    label: "GIF",
    icon: GiftIcon,
    description: "Füge ein animiertes GIF hinzu",
  },
  {
    type: "audio",
    content: null,
    label: "Audio",
    icon: AudioIcon,
    description: "Füge eine Audiodatei hinzu",
  },
  {
    type: "document",
    content: null,
    label: "Dokument",
    icon: DocumentIcon,
    description: "Füge ein Dokument hinzu (z.B. PDF)",
  },
  {
    type: "button",
    content: "Schaltfläche",
    label: "Button",
    icon: ButtonIcon,
    description: "Füge einen klickbaren Button hinzu",
  },
  {
    type: "divider",
    content: "Trennlinie",
    label: "Trenner",
    icon: SeparatorHorizontal,
    description: "Füge eine horizontale Trennlinie hinzu",
  },
  {
    type: "form",
    content: "Formular",
    label: "Formular",
    icon: FormInput,
    description: "Füge ein Formularelement hinzu",
  },
];

// NEU: Definiere die verfügbaren Layout-Typen mit expliziter Typisierung
const layoutTypes: {
  type: LayoutType;
  label: string;
  icon: LucideIcon;
  description: string;
}[] = [
  {
    type: "single-column",
    label: "1 Spalte",
    icon: SingleColumnIcon,
    description: "Ein einzelner, voller Breitenbereich",
  },
  {
    type: "two-columns",
    label: "2 Spalten",
    icon: TwoColumnsIcon,
    description: "Zwei gleich breite Spalten nebeneinander",
  },
  {
    type: "three-columns",
    label: "3 Spalten",
    icon: LayoutIcon, // Placeholder
    description: "Drei gleich breite Spalten nebeneinander",
  },
  {
    type: "layout-1-2",
    label: "1/3 + 2/3",
    icon: LayoutIcon, // Placeholder
    description: "Linke Spalte schmal, rechte Spalte breit",
  },
  {
    type: "layout-2-1",
    label: "2/3 + 1/3",
    icon: LayoutIcon, // Placeholder
    description: "Linke Spalte breit, rechte Spalte schmal",
  },
  {
    type: "grid-2x2",
    label: "2x2 Grid",
    icon: GridIcon,
    description: "Ein Vierer-Raster",
  },
];

export default function LeftSidebar() {
  return (
    <div className="w-64 bg-card border-r border-border overflow-y-auto p-5 pt-24 space-y-8">
      {/* Blocks Section */}
      <div>
        <h2 className="text-lg font-semibold mb-5">Blöcke</h2>
        <div className="grid grid-cols-2 gap-3">
          {blockTypes.map((block) => (
            <DraggableBlock
              key={block.type}
              blockType={block.type}
              content={block.content}
              icon={block.icon}
              description={block.description}
              label={block.label}
            />
          ))}
        </div>
      </div>

      {/* NEU: Layouts Section */}
      <div>
        <h2 className="text-lg font-semibold mb-5">Layouts</h2>
        <div className="grid grid-cols-2 gap-3">
          {layoutTypes.map((layout) => (
            <DraggableLayoutItem
              key={layout.type}
              type={layout.type}
              icon={layout.icon}
              label={layout.label}
              description={layout.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
