import type { ViewportType } from "@/lib/hooks/use-viewport";

// Define a partial type for the block properties needed by getBlockStyle
type BlockStyleProps = {
  type: string;
  headingLevel?: number;
};

// Get block style based on block type and viewport
export const getBlockStyle = (
  block: BlockStyleProps, // Use the partial type
  viewport: ViewportType = "desktop"
) => {
  const baseStyle = (() => {
    switch (block.type) {
      case "heading": {
        // Get heading level or default to 1
        const headingLevel = block.headingLevel || 1;

        // Different styles based on heading level
        const headingStyles = {
          1: "text-4xl font-bold",
          2: "text-3xl font-bold",
          3: "text-2xl font-bold",
          4: "text-xl font-bold",
          5: "text-lg font-bold",
          6: "text-base font-bold",
        };

        return (
          headingStyles[headingLevel as keyof typeof headingStyles] ||
          headingStyles[1]
        );
      }
      case "paragraph":
        return "text-base";
      case "image":
        return "bg-secondary aspect-video flex items-center justify-center";
      case "button":
        return "inline-block bg-primary text-primary-foreground px-4 py-2 rounded-lg";
      case "form":
        return "bg-secondary p-4 rounded-lg border border-border";
      case "divider":
        return "border-t border-border w-full h-0 my-2";
      default:
        return "";
    }
  })();

  // Apply viewport adjustments if needed
  if (block.type === "heading" && viewport !== "desktop") {
    // For headings on smaller viewports, we keep the style as is
    // Already handled in the base style with specific level styling
    return baseStyle;
  }

  // Optionally add responsive adjustments for other block types here
  // For example: if (viewport === "mobile" && block.type === "paragraph") return `${baseStyle} text-sm`;

  // For non-heading blocks or when no specific viewport adjustments are needed
  return baseStyle;
};
