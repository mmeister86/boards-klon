"use client";

// import { useState } from "react"; // Entfernt, da nicht mehr genutzt
import { DraggableBlock } from "@/components/blocks/draggable-block";
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
} from "lucide-react";

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
    description: "Füge ein Bild ein",
  },
  {
    type: "video",
    content: null,
    label: "Video",
    icon: VideoIcon,
    description: "Füge ein Video hinzu (Upload oder URL)",
  },
  {
    type: "audio",
    content: null,
    label: "Audio",
    icon: AudioIcon,
    description: "Füge eine Audiodatei hinzu (Upload oder URL)",
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
    description: "Füge eine klickbare Schaltfläche hinzu",
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
    description: "Erstelle ein Formularelement",
  },
];

export default function LeftSidebar() {
  return (
    <div className="w-64 bg-card border-r border-border overflow-y-auto p-5 pt-24">
      {/* Blocks Section */}
      <div>
        <h2 className="text-lg font-semibold mb-5">Blöcke</h2>
        <div className="grid grid-cols-2 gap-3">
          {blockTypes.map((block) => (
            <DraggableBlock
              key={block.type}
              type={block.type}
              content={block.content}
              icon={block.icon}
              description={block.description}
              label={block.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
