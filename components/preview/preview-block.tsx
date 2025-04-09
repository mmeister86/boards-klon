/* eslint-disable @next/next/no-img-element */
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
    const textSizeClass =
      viewport === "mobile"
        ? "text-base"
        : viewport === "tablet"
        ? "text-lg"
        : "text-xl";

    const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;

    return (
      <HeadingTag
        className={`m-0 preview-content ${textSizeClass}`}
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
        className={`preview-content ${textSizeClass}`}
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
      ) : (
        // Default rendering for other types (if any)
        <div className="preview-content">{block.content}</div>
      )}
    </div>
  );
}
