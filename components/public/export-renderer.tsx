"use client";

import type { DropAreaType, BlockType } from "@/lib/types";
import { isDropAreaEmpty } from "@/lib/utils/drop-area-utils";
import Image from "next/image";

interface PublicDropAreaRendererProps {
  dropArea: DropAreaType;
}

export function PublicDropAreaRenderer({
  dropArea,
}: PublicDropAreaRendererProps) {
  // Basis Fall 1: Bereich ist leer -> Nichts rendern
  if (isDropAreaEmpty(dropArea)) {
    return null;
  }

  // Basis Fall 2: Bereich ist NICHT gesplittet -> Blöcke rendern
  if (!dropArea.isSplit || dropArea.splitAreas.length === 0) {
    return (
      <div className="w-full grid grid-cols-1 gap-4">
        {dropArea.blocks.map((block) => (
          <RenderBlock key={block.id} block={block} />
        ))}
      </div>
    );
  }

  // Rekursiver Fall: Bereich IST gesplittet -> Grid rendern

  // Filtere leere Sub-Areas heraus
  const renderableSubAreas = dropArea.splitAreas.filter(
    (subArea) => !isDropAreaEmpty(subArea)
  );

  // Check if this is a nested area
  const isNested = dropArea.splitLevel > 0;

  // Function to get grid classes for the second div
  const getGridClasses = (numColumns: number, isNested: boolean) => {
    const baseClass = "grid-cols-1";

    // Add lg:grid-cols-X based on actual number of columns
    const lgClass = numColumns >= 2 ? ` lg:grid-cols-${numColumns}` : "";

    // Only add md:grid-cols-2 for non-nested areas
    const mdClass = !isNested ? " md:grid-cols-2" : "";

    return `${baseClass}${mdClass}${lgClass}`;
  };

  return (
    <div className="w-full">
      <div
        className={`w-full grid gap-4 ${getGridClasses(
          renderableSubAreas.length,
          isNested
        )}`}
      >
        {renderableSubAreas.map((subArea) => (
          <PublicDropAreaRenderer key={subArea.id} dropArea={subArea} />
        ))}
      </div>
    </div>
  );
}

// Block-Rendering Komponente
function RenderBlock({ block }: { block: BlockType }) {
  const content = block.content || "";

  switch (block.type) {
    case "heading": {
      const Tag = `h${block.headingLevel || 1}` as keyof JSX.IntrinsicElements;
      return (
        <Tag
          className="preview-content not-prose" // Added not-prose
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }

    case "paragraph":
      return (
        <div
          className="preview-content text-base lg:text-xl font-sans not-prose" // Added not-prose
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );

    case "image":
      // Use width=0, height=0, sizes, and style for responsive auto-height image
      return (
        <Image
          src={block.content}
          alt={block.altText || ""}
          width={0} // Required for Next.js, but overridden by style
          height={0} // Required for Next.js, but overridden by style
          sizes="100vw" // Inform optimizer about expected size
          style={{ width: "100%", height: "auto" }} // Let browser determine height
          priority={false}
          className="rounded-lg shadow-sm md:shadow-md shadow-slate-500/70"
        />
      );

    case "video":
      return (
        <video
          src={block.content}
          controls
          style={{ maxWidth: "100%" }}
          preload="metadata"
        />
      );

    case "audio":
      return (
        <audio
          src={block.content}
          controls
          style={{ width: "100%" }}
          preload="metadata"
        />
      );

    case "document":
      if (block.previewUrl) {
        // Zeige Vorschau-Bild mit Link zur PDF
        return (
          <a href={block.content} target="_blank" rel="noopener noreferrer">
            <Image
              src={block.previewUrl}
              alt={`Vorschau für ${block.fileName || "Dokument"}`}
              width={0}
              height={0}
              sizes="100vw"
              style={{
                width: "100%",
                height: "auto",
                border: "1px solid #eee",
              }}
              priority={false}
              className="rounded-lg shadow-sm md:shadow-md shadow-slate-500/70"
            />
          </a>
        );
      } else {
        // Zeige einfachen Link
        return (
          <a href={block.content} target="_blank" rel="noopener noreferrer">
            {block.fileName || "Dokument ansehen"}
          </a>
        );
      }

    default:
      return <div>{block.content}</div>;
  }
}
