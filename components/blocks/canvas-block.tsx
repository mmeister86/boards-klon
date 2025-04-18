/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react"; // Import useState
import { useBlocksStore } from "@/store/blocks-store";
import type {
  BlockType,
  ImageBlock as ImageBlockType,
  VideoBlock as VideoBlockType,
  AudioBlock as AudioBlockType,
  DocumentBlock as DocumentBlockType,
  HeadingBlock as HeadingBlockType,
  ParagraphBlock as ParagraphBlockType,
} from "@/lib/types";
import type { ViewportType } from "@/lib/hooks/use-viewport";
import { Trash2, Move } from "@/lib/icons"; // Removed Split import
import { useBlockDrag } from "@/lib/hooks/use-block-drag";
import { ParagraphBlock } from "./paragraph-block";
import { ImageBlock } from "./image-block"; // Import the new component
import { VideoBlock } from "./video-block";
import { AudioBlock } from "./audio-block";
import { DocumentBlock } from "./document-block";
import React from "react";

interface CanvasBlockProps {
  block: BlockType;
  viewport?: ViewportType;
  index: number; // Add index prop
  layoutId: string; // NEU: ID des Layout-Blocks
  zoneId: string; // NEU: ID der Content-Zone
  // Removed onSplit, canSplit props
  isOnlyBlockInArea?: boolean;
}

export function CanvasBlock({
  block,
  index, // Destructure index
  layoutId, // NEU
  zoneId, // NEU
  viewport = "desktop",
  // Removed onSplit, canSplit props
  isOnlyBlockInArea = false,
}: CanvasBlockProps) {
  const { selectedBlockId, selectBlock, deleteBlock } = useBlocksStore();
  const isSelected = selectedBlockId === block.id;
  // Pass index to useBlockDrag
  // Verwende die neuen layoutId und zoneId für den Drag Hook
  const { isDragging, drag } = useBlockDrag(block, index, layoutId, zoneId);
  const [isHovering, setIsHovering] = useState(false); // Add hover state

  // Clear selection when dragging starts
  useEffect(() => {
    if (isDragging && isSelected) {
      selectBlock(null);
    }
  }, [isDragging, isSelected, selectBlock]);

  const handleBlockClick = () => {
    if (!isSelected) {
      selectBlock(block.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Verwende layoutId und zoneId statt block.dropAreaId
    deleteBlock(block.id, layoutId, zoneId);
    selectBlock(null);
  };

  return (
    <div>
      {/* Main styled container - already has position: relative */}
      <div
        className={`p-4 bg-background border rounded-lg shadow-sm relative group
        ${
          isSelected ? "border-primary ring-2 ring-primary/20" : "border-border"
        }
        ${viewport === "mobile" ? "text-sm" : ""}
        ${isDragging ? "opacity-60" : "opacity-100"}
        transition-all duration-200 hover:shadow-md
      `}
        onClick={handleBlockClick}
        onMouseEnter={() => setIsHovering(true)} // Add mouse enter handler
        onMouseLeave={() => setIsHovering(false)} // Add mouse leave handler
        data-id={block.id}
        data-drop-area-id={layoutId}
      >
        {/* Conditionally render controls based on hover or selection */}
        {(isHovering || isSelected) && (
          <BlockControls
            onDelete={handleDelete}
            // Removed onSplit and canSplit props
            isDragging={isDragging}
            drag={drag as any} // Pass drag ref down
            showDeleteButton={!isOnlyBlockInArea}
          />
        )}
        <div>
          <BlockContent block={block} layoutId={layoutId} zoneId={zoneId} />
        </div>
      </div>
    </div>
  );
}

// Extracted component for block controls
function BlockControls({
  onDelete,
  // Removed onSplit, canSplit
  isDragging,
  drag, // Destructure the passed drag ref
  showDeleteButton = true, // New prop with default value
}: {
  onDelete: (e: React.MouseEvent) => void;
  // Removed onSplit, canSplit types
  isDragging: boolean;
  drag: React.Ref<HTMLButtonElement>;
  showDeleteButton?: boolean; // Add to type definition
}) {
  // Don't show controls while dragging
  if (isDragging) return null;

  return (
    <>
      {/* Delete button - show if allowed */}
      {showDeleteButton && (
        <button
          className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md
                  hover:bg-red-600 transition-colors duration-200 z-10" // Removed opacity/group-hover
          onClick={onDelete}
          title="Block löschen"
        >
          <Trash2 size={14} />
        </button>
      )}

      {/* Move handle */}
      <button
        ref={drag}
        className="absolute -top-2 -left-2 bg-primary text-primary-foreground p-2 rounded-full
                  shadow-md hover:bg-primary/90 cursor-grab active:cursor-grabbing
                  ring-4 ring-background pulse-animation transition-colors z-20" // Removed opacity/group-hover
        title="Zum Verschieben ziehen"
        onClick={(e) => e.stopPropagation()} // Keep stopPropagation here
      >
        <Move size={16} />
      </button>
    </>
  );
}

// Extracted component for block content
interface BlockContentProps {
  block: BlockType;
  layoutId: string;
  zoneId: string;
}

function BlockContent({ block, layoutId, zoneId }: BlockContentProps) {
  const { updateBlockContent } = useBlocksStore();

  // Handle Heading Change (angepasst für spezifischen Typ)
  const handleHeadingChange = (data: { level: number; content: string }) => {
    // Update block content and heading level
    // Stelle sicher, dass block.content hier als string behandelt wird
    // (was für HeadingBlock korrekt sein sollte)
    updateBlockContent(block.id, layoutId, zoneId, data.content, {
      headingLevel: data.level as HeadingBlockType["headingLevel"],
    });
  };

  // Render different block types
  if (block.type === "heading") {
    const headingBlock = block as HeadingBlockType;
    // Import the HeadingBlock dynamically (to avoid circular dependencies)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { HeadingBlock } = require("@/components/blocks/heading-block");

    // Validate heading level before passing to component
    const validLevels = [1, 2, 3, 4, 5, 6] as const;
    const validatedLevel =
      headingBlock.headingLevel &&
      validLevels.includes(headingBlock.headingLevel)
        ? headingBlock.headingLevel
        : 1; // Default to 1 if undefined or invalid

    return (
      <HeadingBlock
        // Props für HeadingBlock prüfen und anpassen
        blockId={headingBlock.id}
        layoutId={layoutId} // Behalten, falls intern benötigt
        zoneId={zoneId} // Behalten, falls intern benötigt
        level={validatedLevel}
        content={headingBlock.content} // content ist string
        onChange={handleHeadingChange}
      />
    );
  }

  if (block.type === "image") {
    const imageBlock = block as ImageBlockType;
    return (
      <ImageBlock // Verwendet jetzt die vereinfachte Komponente
        // Keine blockId, layoutId, zoneId mehr nötig
        src={imageBlock.content.src} // Korrekt: src aus content
        altText={imageBlock.content.alt} // Korrekt: alt aus content
      />
    );
  }

  if (block.type === "video") {
    const videoBlock = block as VideoBlockType;
    return (
      <VideoBlock
        blockId={videoBlock.id}
        layoutId={layoutId}
        zoneId={zoneId}
        // Annahme: VideoBlock erwartet src-String in content-Prop
        content={videoBlock.content.src}
      />
    );
  }

  if (block.type === "audio") {
    const audioBlock = block as AudioBlockType;
    return (
      <AudioBlock
        blockId={audioBlock.id}
        layoutId={layoutId}
        zoneId={zoneId}
        // Annahme: AudioBlock erwartet src-String in content-Prop
        content={audioBlock.content.src}
      />
    );
  }

  if (block.type === "document") {
    const documentBlock = block as DocumentBlockType;
    return (
      <DocumentBlock
        blockId={documentBlock.id}
        layoutId={layoutId}
        zoneId={zoneId}
        // Annahme: DocumentBlock erwartet src-String in content-Prop
        content={documentBlock.content.src}
        // Übergebe fileName aus content
        fileName={documentBlock.content.fileName}
      />
    );
  }

  if (block.type === "paragraph") {
    const paragraphBlock = block as ParagraphBlockType;
    return (
      <ParagraphBlock
        blockId={paragraphBlock.id}
        layoutId={layoutId}
        zoneId={zoneId}
        content={paragraphBlock.content} // content ist string
      />
    );
  }

  // Default fallback für unbekannte oder 'never' Typen
  // Dies sollte den Linter-Fehler beheben
  console.warn("Rendering fallback for unknown block type:", block);
  return (
    <div className="p-4 bg-red-50 text-red-500 rounded">
      Unbekannter Block-Typ.
    </div>
  );
}
