"use client";

import { DraggableBlock } from "@/components/blocks/draggable-block";
import {
  Heading,
  PenLineIcon as ParagraphIcon,
  ImageIcon,
  BoxIcon as ButtonIcon,
  FormInput,
  SeparatorHorizontal,
} from "lucide-react";
import { useBlocksStore } from "@/store/blocks-store";

// Define the available block types with icons
const blockTypes = [
  {
    type: "heading",
    content: "Überschrift",
    icon: Heading,
    description: "Füge eine Überschrift hinzu",
  },
  {
    type: "paragraph",
    content: "Absatz",
    icon: ParagraphIcon,
    description: "Füge einen Textabsatz hinzu",
  },
  {
    type: "image",
    content: "Bild",
    icon: ImageIcon,
    description: "Füge ein Bild ein",
  },
  {
    type: "button",
    content: "Schaltfläche",
    icon: ButtonIcon,
    description: "Füge eine klickbare Schaltfläche hinzu",
  },
  {
    type: "form",
    content: "Formular",
    icon: FormInput,
    description: "Erstelle ein Formularelement",
  },
  {
    type: "divider",
    content: "Trennlinie",
    icon: SeparatorHorizontal,
    description: "Füge eine horizontale Trennlinie hinzu",
  },
];

export default function LeftSidebar() {
  const { previewMode } = useBlocksStore();

  if (previewMode) return null;

  return (
    <div
      className={`
        w-64 bg-card border-r border-border overflow-y-auto p-5
        transform transition-all duration-300 ease-in-out
        ${previewMode ? "-translate-x-full" : "translate-x-0"}
      `}
    >
      <h2 className="text-lg font-semibold mb-5">Blöcke</h2>
      <div className="grid grid-cols-2 gap-3">
        {blockTypes.map((block) => (
          <DraggableBlock
            key={block.type}
            type={block.type}
            content={block.content}
            icon={block.icon}
            description={block.description}
          />
        ))}
      </div>
    </div>
  );
}
