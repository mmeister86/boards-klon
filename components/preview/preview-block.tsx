"use client";

import type { BlockType } from "@/lib/types";
import { getBlockStyle } from "@/lib/utils/block-utils";

interface PreviewBlockProps {
  block: BlockType;
  viewport: "mobile" | "tablet" | "desktop";
}

export function PreviewBlock({ block, viewport }: PreviewBlockProps) {
  const blockStyle = getBlockStyle(block, viewport);

  // Helper function to render the appropriate heading tag
  const renderHeadingContent = () => {
    const level = block.headingLevel || 1;

    switch (level) {
      case 1:
        return <h1 className="m-0">{block.content}</h1>;
      case 2:
        return <h2 className="m-0">{block.content}</h2>;
      case 3:
        return <h3 className="m-0">{block.content}</h3>;
      case 4:
        return <h4 className="m-0">{block.content}</h4>;
      case 5:
        return <h5 className="m-0">{block.content}</h5>;
      case 6:
        return <h6 className="m-0">{block.content}</h6>;
      default:
        return <h1 className="m-0">{block.content}</h1>;
    }
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
        className={`preview-content ${textSizeClass}`}
        dangerouslySetInnerHTML={{ __html: block.content }}
      />
    );
  };

  return (
    <div
      className={`${blockStyle} p-4 bg-background border rounded-lg shadow-sm ${
        viewport === "mobile" ? "text-sm" : ""
      }`}
    >
      {block.type === "image" ? (
        <span className="text-muted-foreground">Bildblock</span>
      ) : block.type === "heading" ? (
        renderHeadingContent()
      ) : block.type === "paragraph" ? (
        renderParagraphContent()
      ) : (
        block.content
      )}
    </div>
  );
}
