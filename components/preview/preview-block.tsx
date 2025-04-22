/* eslint-disable @next/next/no-img-element */
"use client";

import type {
  BlockType,
  GifBlock,
  VideoBlock,
  AudioBlock,
  HeadingBlock,
  FreepikBlock,
} from "@/lib/types";
import { getBlockStyle } from "@/lib/utils/block-utils";
import ReactPlayer from "react-player/lazy";
// import Image from "next/image"; // Entferne ungenutzten Import
import { ModernAudioPlayer } from "@/components/ui/modern-audio-player"; // Importiere den neuen Player
import { GifPlayer } from "@/components/gif/gif-player";
import { FreepikPlayer } from "@/components/blocks/freepik/FreepikPlayer";

interface PreviewBlockProps {
  block: BlockType;
  viewport: "mobile" | "tablet" | "desktop";
}

export function PreviewBlock({ block, viewport }: PreviewBlockProps) {
  const blockStyle = getBlockStyle(block, viewport);

  // Helper functions for rendering specific block types
  const renderHeadingContent = () => {
    if (block.type !== "heading") return null;
    const headingBlock = block as HeadingBlock;
    const Tag = `h${
      headingBlock.headingLevel || 1
    }` as keyof JSX.IntrinsicElements;
    return <Tag className="font-bold">{headingBlock.content}</Tag>;
  };

  const renderParagraphContent = () => {
    if (typeof block.content !== "string") return null;
    return <p>{block.content}</p>;
  };

  // Render block content based on type
  const renderContent = () => {
    switch (block.type) {
      case "heading":
        return renderHeadingContent();
      case "paragraph":
        return renderParagraphContent();
      case "video":
        const videoBlock = block as VideoBlock;
        // Prüfen, ob Content vorhanden ist
        if (!videoBlock.content) {
          return <div className="text-amber-600">Kein Video ausgewählt</div>;
        }
        return (
          <div className="player-wrapper relative pt-[56.25%] rounded-md overflow-hidden">
            <ReactPlayer
              className="absolute top-0 left-0"
              url={videoBlock.content}
              width="100%"
              height="100%"
              controls={true}
              light={videoBlock.thumbnailUrl || true}
              config={{
                youtube: {
                  playerVars: {
                    origin:
                      typeof window !== "undefined"
                        ? window.location.origin
                        : "",
                  },
                },
              }}
            />
          </div>
        );
      case "audio":
        const audioBlock = block as AudioBlock;
        // Prüfen, ob Content vorhanden ist
        if (!audioBlock.content) {
          return (
            <div className="text-amber-600">Keine Audiodatei ausgewählt</div>
          );
        }
        return <ModernAudioPlayer url={audioBlock.content} />;
      case "gif": {
        const gifBlock = block as GifBlock;
        // Prüfen, ob Content vorhanden ist
        if (!gifBlock.content) {
          return <div className="text-amber-600">Kein GIF ausgewählt</div>;
        }
        // Spielt das GIF animiert ab, abgerundete Ecken im Preview-Modus
        return (
          <div className="rounded-lg overflow-hidden">
            <GifPlayer gif={gifBlock.content} showFavoriteButton={false} />
          </div>
        );
      }
      case "freepik": {
        const freepikBlock = block as FreepikBlock;
        // Zeigt das Freepik-Medium an (Bild oder Video)
        if (!freepikBlock.content) {
          return (
            <div className="text-amber-600">Kein Freepik-Medium ausgewählt</div>
          );
        }
        return (
          <div className="rounded-lg overflow-hidden">
            <FreepikPlayer media={freepikBlock.content} isPreview={true} />
          </div>
        );
      }
      default:
        return (
          <div className="preview-content text-red-500">
            Unbekannter Blocktyp
          </div>
        );
    }
  };

  // For other block types, render with the wrapper div
  return (
    <div
      className={`${blockStyle} p-4 bg-background border rounded-lg shadow-sm ${
        viewport === "mobile" ? "text-sm" : ""
      }`}
    >
      {renderContent()}
    </div>
  );
}
