"use client";

import { useState } from "react";
import type { DropAreaType } from "@/lib/types";
import { DropArea } from "./drop-area";
import { MergeGapIndicator } from "./merge-gap-indicator";
import { useBlocksStore } from "@/store/blocks-store";
import { Trash2 } from "lucide-react";

interface DesktopDropAreaProps {
  dropArea: DropAreaType;
  showSplitIndicator: boolean;
}

export function DesktopDropArea({
  dropArea,
  showSplitIndicator,
}: DesktopDropAreaProps) {
  const { canMerge, mergeDropAreas, deleteDropArea } = useBlocksStore();
  const [showDeleteButton, setShowDeleteButton] = useState(false);

  if (!dropArea.isSplit || dropArea.splitAreas.length !== 2) {
    return (
      <DropArea
        dropArea={dropArea}
        showSplitIndicator={showSplitIndicator}
        viewport="desktop"
      />
    );
  }

  // Check if the two areas can be merged
  const leftAreaId = dropArea.splitAreas[0].id;
  const rightAreaId = dropArea.splitAreas[1].id;
  const areasCanMerge = canMerge(leftAreaId, rightAreaId);

  // Handler for merge gap click
  const handleMerge = () => {
    if (areasCanMerge) {
      mergeDropAreas(leftAreaId, rightAreaId);
    }
  };

  // Check if either split area has content
  const hasContent = 
    (dropArea.splitAreas[0].blocks.length > 0) || 
    (dropArea.splitAreas[1].blocks.length > 0);

  return (
    <div 
      className="group w-full flex items-center min-h-full relative"
      onMouseEnter={() => setShowDeleteButton(true)}
      onMouseLeave={() => setShowDeleteButton(false)}
    >
      <div className="flex-1">
        <DropArea
          dropArea={dropArea.splitAreas[0]}
          showSplitIndicator={true}
          viewport="desktop"
          hideInternalMergeIndicator={true}
        />
      </div>
      <div className="self-stretch">
        <MergeGapIndicator canMerge={areasCanMerge} onClick={handleMerge} />
      </div>
      <div className="flex-1">
        <DropArea
          dropArea={dropArea.splitAreas[1]}
          showSplitIndicator={true}
          viewport="desktop"
          hideInternalMergeIndicator={true}
        />
      </div>
      
      {/* Delete button for the entire split area */}
      {showDeleteButton && hasContent && (
        <button
          onClick={() => deleteDropArea(dropArea.id)}
          className="absolute -right-4 -top-4 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 z-20"
          title="Delete entire drop area"
          aria-label="Delete entire drop area"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}
