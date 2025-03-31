"use client";

import type { DropAreaType } from "@/lib/types";
import { DropArea } from "./drop-area";
import { MergeGapIndicator } from "./merge-gap-indicator";
import { useBlocksStore } from "@/store/blocks-store";

interface DesktopDropAreaProps {
  dropArea: DropAreaType;
  showSplitIndicator: boolean;
}

export function DesktopDropArea({
  dropArea,
  showSplitIndicator,
}: DesktopDropAreaProps) {
  const { canMerge, mergeDropAreas } = useBlocksStore();

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

  return (
    <div className="w-full flex items-stretch min-h-full">
      <div className="flex-1">
        <DropArea
          dropArea={dropArea.splitAreas[0]}
          showSplitIndicator={true}
          viewport="desktop"
          hideInternalMergeIndicator={true}
        />
      </div>
      <MergeGapIndicator canMerge={areasCanMerge} onClick={handleMerge} />
      <div className="flex-1">
        <DropArea
          dropArea={dropArea.splitAreas[1]}
          showSplitIndicator={true}
          viewport="desktop"
          hideInternalMergeIndicator={true}
        />
      </div>
    </div>
  );
}
