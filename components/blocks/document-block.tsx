"use client";

import { useRef } from "react";
import { useDrag } from "react-dnd";
import { ItemTypes } from "@/lib/item-types";
import { FileText, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentBlockProps {
  blockId: string;
  dropAreaId: string;
  content: string; // URL to the document
  fileName?: string;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function DocumentBlock({
  blockId,
  dropAreaId,
  content,
  fileName,
  isSelected,
  onSelect,
}: DocumentBlockProps) {
  const dragRef = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.EXISTING_BLOCK,
    item: {
      id: blockId,
      type: "document",
      content,
      sourceDropAreaId: dropAreaId,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  // Connect the drag ref
  drag(dragRef);

  // Extract filename from URL if not provided
  const displayName = fileName || content.split("/").pop() || "Document";

  return (
    <div
      ref={dragRef}
      className={cn(
        "group relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md",
        isDragging && "opacity-50",
        isSelected && "ring-2 ring-blue-500"
      )}
      onClick={onSelect}
    >
      <a
        href={content}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-3 text-gray-700 hover:text-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <FileText className="h-8 w-8 flex-shrink-0 text-gray-400" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{displayName}</p>
          <p className="text-xs text-gray-500">Click to open</p>
        </div>
        <ExternalLink className="h-5 w-5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      </a>
    </div>
  );
}
