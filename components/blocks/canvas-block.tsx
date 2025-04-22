/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useRef } from "react"; // Import useState and useRef
import { useBlocksStore } from "@/store/blocks-store";
import type {
  BlockType,
  ImageBlock as ImageBlockType,
  VideoBlock as VideoBlockType,
  AudioBlock as AudioBlockType,
  DocumentBlock as DocumentBlockType,
  HeadingBlock as HeadingBlockType,
  ParagraphBlock as ParagraphBlockType,
  GifBlock,
  FreepikBlock as FreepikBlockType,
} from "@/lib/types";
import type { ViewportType } from "@/lib/hooks/use-viewport";
import { Trash2, GripVertical } from "lucide-react";
import { useBlockDrag } from "@/lib/hooks/use-block-drag";
import { ParagraphBlock } from "./paragraph-block";
import { ImageBlock } from "./image-block"; // Import the new component
import { VideoBlock } from "./video-block";
import { AudioBlock } from "./audio-block";
import { DocumentBlock } from "./document-block";
import { GifBlockComponent } from "./gif-block";
import { FreepikBlock } from "./freepik-block";
import React from "react";

interface CanvasBlockProps {
  block: BlockType;
  viewport?: ViewportType;
  index: number; // Add index prop
  layoutId: string; // NEU: ID des Layout-Blocks
  zoneId: string; // NEU: ID der Content-Zone
  // Removed onSplit, canSplit props
  isOnlyBlockInArea?: boolean;
  isSelected: boolean; // NEU: Füge isSelected hinzu
}

export function CanvasBlock({
  block,
  index, // Destructure index
  layoutId, // NEU
  zoneId, // NEU
  viewport = "desktop",
  // Removed onSplit, canSplit props
  isOnlyBlockInArea = false,
  isSelected, // NEU: Füge isSelected hinzu
}: CanvasBlockProps) {
  const { selectBlock, deleteBlock } = useBlocksStore();
  const [isHovering, setIsHovering] = useState(false);
  const [canDragContent, setCanDragContent] = useState(false);

  // Verwende useBlockDrag mit canDrag und setCanDrag
  const { isDragging, drag } = useBlockDrag(
    block,
    index,
    layoutId,
    zoneId,
    canDragContent, // Pass state
    setCanDragContent // Pass setter
  );

  // Ref für den Hauptcontainer (um den Drag-Connector anzuwenden)
  const blockRef = useRef<HTMLDivElement>(null);

  // Verbinde Drag-Source mit dem Hauptcontainer
  drag(blockRef);

  // Globaler MouseUp-Listener zum Zurücksetzen von canDragContent
  useEffect(() => {
    const handleMouseUp = () => {
      if (canDragContent) {
        setCanDragContent(false);
      }
    };
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [canDragContent]);

  // Clear selection when dragging starts
  useEffect(() => {
    if (isDragging && isSelected) {
      selectBlock(null);
    }
  }, [isDragging, isSelected, selectBlock]);

  // Force hover state in dev mode for debugging
  useEffect(() => {
    // Log block info on mount
    console.log("Block mounted:", {
      id: block.id,
      type: block.type,
      layoutId,
      zoneId,
    });

    // Uncomment the line below to force hover state for all blocks (testing only)
    // setIsHovering(true);
  }, [block.id, block.type, layoutId, zoneId]);

  const handleBlockClick = () => {
    if (!isSelected) {
      selectBlock(block.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Deleting block:", {
      blockId: block.id,
      layoutId,
      zoneId,
      blockType: block.type,
    });
    // Verwende layoutId und zoneId statt block.dropAreaId
    deleteBlock(block.id, layoutId, zoneId);
    selectBlock(null);
  };

  // MouseDown-Handler für den Handle
  const handleMouseDownOnHandle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Verhindert handleBlockClick
    setCanDragContent(true); // Erlaube das Ziehen
  };

  return (
    <div className="mb-3">
      {" "}
      {/* Added margin for spacing between blocks */}
      {/* Main styled container - already has position: relative */}
      <div
        ref={blockRef} // Wende Ref hier an
        className={`p-4 bg-background border rounded-lg shadow-sm relative group
        ${
          isSelected ? "border-primary ring-2 ring-primary/20" : "border-border"
        }
        ${viewport === "mobile" ? "text-sm" : ""}
        transition-all duration-200 hover:shadow-md hover:border-blue-400
      `}
        onClick={handleBlockClick}
        onMouseEnter={() => {
          console.log("Block mouse enter:", block.id);
          setIsHovering(true);
        }}
        onMouseLeave={() => {
          console.log("Block mouse leave:", block.id);
          setIsHovering(false);
        }}
        data-id={block.id}
        data-block-id={block.id}
        data-layout-id={layoutId}
        data-zone-id={zoneId}
      >
        {/* Controls nur anzeigen, wenn nicht gezogen wird */}
        {!isDragging && (isHovering || isSelected) && (
          <BlockControls
            onDelete={handleDelete}
            showDeleteButton={!isOnlyBlockInArea}
            handleMouseDownOnHandle={handleMouseDownOnHandle}
          />
        )}
        <div>
          <BlockContent
            block={block}
            layoutId={layoutId}
            zoneId={zoneId}
            isSelected={isSelected}
          />
        </div>
      </div>
    </div>
  );
}

// Extracted component for block controls
function BlockControls({
  onDelete,
  showDeleteButton = true,
  handleMouseDownOnHandle,
}: {
  onDelete: (e: React.MouseEvent) => void;
  showDeleteButton?: boolean;
  handleMouseDownOnHandle: (e: React.MouseEvent) => void;
}) {
  console.log("Rendering BlockControls, showDeleteButton:", showDeleteButton);

  return (
    <>
      {/* Delete button */}
      <button
        className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md
                hover:bg-red-600 transition-colors duration-200 z-30"
        onClick={(e) => {
          e.stopPropagation();
          console.log("Delete button clicked");
          onDelete(e);
        }}
        title="Block löschen"
      >
        <Trash2 size={14} />
      </button>

      {/* Move handle */}
      <button
        onMouseDown={handleMouseDownOnHandle}
        className="absolute -top-2 -left-2 cursor-move p-1.5 text-white rounded-full bg-blue-500 hover:bg-blue-600 shadow-md transition-all duration-200 z-10"
        title="Zum Verschieben ziehen"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical size={16} />
      </button>
    </>
  );
}

// Extracted component for block content
interface BlockContentProps {
  block: BlockType;
  layoutId: string;
  zoneId: string;
  isSelected: boolean; // Füge isSelected hinzu
}

function BlockContent({
  block,
  layoutId,
  zoneId,
  isSelected,
}: BlockContentProps) {
  const { updateBlockContent } = useBlocksStore();

  // Handle Heading Change
  const handleHeadingChange = (data: { level: number; content: string }) => {
    updateBlockContent(block.id, layoutId, zoneId, data.content, {
      headingLevel: data.level as HeadingBlockType["headingLevel"],
    });
  };

  // Handle GIF Change
  const handleGifChange = (newContent: GifBlock["content"]) => {
    updateBlockContent(block.id, layoutId, zoneId, "", {
      content: newContent,
    });
  };

  // Render different block types
  if (block.type === "heading") {
    const headingBlock = block as HeadingBlockType;
    // Import the HeadingBlock dynamically (to avoid circular dependencies)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { HeadingBlock } = require("@/components/blocks/heading-block");

    return (
      <HeadingBlock
        content={headingBlock.content}
        level={headingBlock.headingLevel || 1}
        onChange={handleHeadingChange}
        isSelected={isSelected}
      />
    );
  }

  if (block.type === "image") {
    const imageBlock = block as ImageBlockType;
    return (
      <ImageBlock
        blockId={imageBlock.id}
        layoutId={layoutId}
        zoneId={zoneId}
        content={
          typeof imageBlock.content === "string"
            ? imageBlock.content
            : imageBlock.content?.src ?? null
        }
        altText={
          typeof imageBlock.content === "object"
            ? imageBlock.content?.alt
            : undefined
        }
        isSelected={isSelected}
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
        content={videoBlock.content}
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
        content={audioBlock.content}
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
        content={documentBlock.content?.src || ""}
        fileName={documentBlock.content?.fileName ?? undefined}
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
        content={paragraphBlock.content}
      />
    );
  }

  if (block.type === "gif") {
    const gifBlock = block as GifBlock;
    return <GifBlockComponent block={gifBlock} onChange={handleGifChange} />;
  }

  if (block.type === "freepik") {
    const freepikBlock = block as FreepikBlockType;
    return (
      <FreepikBlock
        blockId={freepikBlock.id}
        layoutId={layoutId}
        zoneId={zoneId}
        content={freepikBlock.content}
        isSelected={isSelected}
      />
    );
  }

  // Fallback for unknown block types
  console.warn("Rendering fallback for unknown block type:", block);
  return <div>Unknown block type: {(block as BlockType).type}</div>;
}
