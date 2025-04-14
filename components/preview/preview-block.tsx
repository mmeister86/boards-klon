/* eslint-disable @next/next/no-img-element */
"use client";

import type { BlockType } from "@/lib/types";
import { getBlockStyle } from "@/lib/utils/block-utils";
import ReactPlayer from "react-player/lazy";
import Image from "next/image";

interface PreviewBlockProps {
  block: BlockType;
  viewport: "mobile" | "tablet" | "desktop";
}

export function PreviewBlock({ block, viewport }: PreviewBlockProps) {
  const blockStyle = getBlockStyle(block, viewport);

  // Helper function to render the appropriate heading tag
  const renderHeadingContent = () => {
    const level = block.headingLevel || 1;
    const textSizeClass =
      viewport === "mobile"
        ? "text-base"
        : viewport === "tablet"
        ? "text-lg"
        : "text-xl";

    const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;

    return (
      <HeadingTag
        className={`m-0 preview-content ${textSizeClass} not-prose`} // Added not-prose
        dangerouslySetInnerHTML={{ __html: block.content }}
      />
    );
  };

  // Helper function to render paragraph content with HTML
  const renderParagraphContent = () => {
    const textSizeClass =
      viewport === "mobile"
        ? "text-base"
        : viewport === "tablet"
        ? "text-lg"
        : "text-xl";

    return (
      <div
        className={`preview-content ${textSizeClass} whitespace-normal break-words not-prose`} // Added not-prose
        dangerouslySetInnerHTML={{ __html: block.content }}
      />
    );
  };

  // Conditionally render wrapper for non-image blocks
  if (block.type === "image") {
    // Render only the image for image blocks, without the wrapper div
    return (
      <img
        src={block.content} // Use block content as image URL
        alt={block.altText || ""} // Use altText or empty string
        className="block w-full h-auto rounded-lg object-cover" // Basic styling, ensure it fills container if needed
        loading="lazy" // Add lazy loading
      />
    );
  }

  // For other block types, render with the wrapper div
  return (
    <div
      className={`${blockStyle} p-4 bg-background border rounded-lg shadow-sm ${
        viewport === "mobile" ? "text-sm" : ""
      }`}
    >
      {block.type === "heading" ? (
        renderHeadingContent()
      ) : block.type === "paragraph" ? (
        renderParagraphContent()
      ) : // --- NEU: Spezifische Behandlung für Audio-Blöcke ---
      block.type === "audio" ? (
        <audio
          src={block.content}
          controls
          className="w-full"
          preload="metadata" // Lade Metadaten (wie Dauer) vorab
        />
      ) : // --- NEU: Spezifische Behandlung für Video-Blöcke ---
      block.type === "video" ? (
        <div className="player-wrapper relative pt-[56.25%] rounded-md overflow-hidden">
          <ReactPlayer
            className="absolute top-0 left-0"
            url={block.content}
            width="100%"
            height="100%"
            controls={true}
            light={(block.type === "video" && block.thumbnailUrl) || true}
            config={{
              youtube: {
                playerVars: {
                  origin:
                    typeof window !== "undefined" ? window.location.origin : "",
                },
              },
            }}
          />
        </div>
      ) : // --- NEU: Spezifische Behandlung für Dokument-Blöcke ---
      block.type === "document" ? (
        block.previewUrl ? (
          // Wenn eine Vorschau-URL vorhanden ist, zeige sie als Bild an und verlinke auf die eigentliche PDF
          <a href={block.content} target="_blank" rel="noopener noreferrer">
            <img
              // Verwende previewUrl als Bildquelle
              src={block.previewUrl}
              // Aktualisierter Alt-Text
              alt={`Vorschau von ${block.fileName || "Dokument"}`}
              className="block w-full h-auto rounded-lg object-contain border border-gray-200" // object-contain, damit ganze Seite sichtbar ist
              loading="lazy"
            />
          </a>
        ) : (
          // Wenn kein Vorschaubild vorhanden ist, zeige den Link wie bisher
          <a
            href={block.content}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline flex items-center space-x-2"
          >
            {/* Optional: Icon hinzufügen, muss aber importiert werden */}
            {/* <FileText className="h-5 w-5 flex-shrink-0" /> */}
            <span>
              {block.fileName || block.content.split("/").pop() || "Document"}
            </span>
          </a>
        )
      ) : (
        // Default rendering for other types (if any)
        <div className="preview-content">{block.content}</div>
      )}
    </div>
  );
}
