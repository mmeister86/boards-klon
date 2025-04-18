/* eslint-disable @next/next/no-img-element */
"use client";

import type { BlockType } from "@/lib/types";
import { getBlockStyle } from "@/lib/utils/block-utils";
import ReactPlayer from "react-player/lazy";
// import Image from "next/image"; // Entferne ungenutzten Import
import { ModernAudioPlayer } from "@/components/ui/modern-audio-player"; // Importiere den neuen Player

interface PreviewBlockProps {
  block: BlockType;
  viewport: "mobile" | "tablet" | "desktop";
}

export function PreviewBlock({ block, viewport }: PreviewBlockProps) {
  const blockStyle = getBlockStyle(block, viewport);

  // Helper function to render the appropriate heading tag
  const renderHeadingContent = () => {
    const level = block.type === "heading" ? block.headingLevel || 1 : 1;
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
    const content = block.type === "paragraph" ? block.content : "";
    const textSizeClass =
      viewport === "mobile"
        ? "text-base"
        : viewport === "tablet"
        ? "text-lg"
        : "text-xl";

    return (
      <div
        className={`preview-content ${textSizeClass} whitespace-normal break-words not-prose`} // Added not-prose
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  };

  // Conditionally render wrapper for non-image blocks
  if (block.type === "image") {
    // Render only the image for image blocks, without the wrapper div
    return (
      <img
        src={block.content.src}
        alt={block.content.alt || ""}
        className="block w-full h-auto rounded-lg object-cover"
        loading="lazy"
      />
    );
  }

  // --- Spezielle Behandlung für Audio, kein Wrapper Div mehr ---
  if (block.type === "audio") {
    return <ModernAudioPlayer url={block.content.src} />;
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
      ) : // --- NEU: Spezifische Behandlung für Video-Blöcke ---
      block.type === "video" ? (
        <div className="player-wrapper relative pt-[56.25%] rounded-md overflow-hidden">
          <ReactPlayer
            className="absolute top-0 left-0"
            url={block.content.src}
            width="100%"
            height="100%"
            controls={true}
            light={block.content.thumbnailUrl || true}
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
        block.content.thumbnailUrl ? (
          <a href={block.content.src} target="_blank" rel="noopener noreferrer">
            <img
              src={block.content.thumbnailUrl}
              alt={`Vorschau von ${block.content.fileName || "Dokument"}`}
              className="block w-full h-auto rounded-lg object-contain border border-gray-200"
              loading="lazy"
            />
          </a>
        ) : (
          <a
            href={block.content.src}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline flex items-center space-x-2"
          >
            <span>
              {block.content.fileName ||
                block.content.src.split("/").pop() ||
                "Document"}
            </span>
          </a>
        )
      ) : (
        <div className="preview-content text-red-500">Unbekannter Blocktyp</div>
      )}
    </div>
  );
}
