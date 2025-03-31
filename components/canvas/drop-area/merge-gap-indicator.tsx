"use client";

import { Merge } from "lucide-react";

interface MergeGapIndicatorProps {
  canMerge: boolean;
  onClick: () => void;
}

export function MergeGapIndicator({
  canMerge,
  onClick,
}: MergeGapIndicatorProps) {
  // Always render gap div to maintain spacing, even if merge isn't available
  if (!canMerge) {
    return <div className="w-4"></div>;
  }

  return (
    <div className="w-4 h-full relative group">
      {/* Simple highlight that appears on hover */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-full h-12 bg-transparent group-hover:bg-green-100/50 transition-colors rounded-md" />
      </div>

      {/* Merge button - use same positioning as split button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10
          p-2 rounded-full bg-green-500 shadow-md hover:bg-green-600
          transition-all text-white opacity-0 group-hover:opacity-100"
        title="Merge drop areas"
        aria-label="Merge drop areas"
      >
        <Merge size={16} />
      </button>
    </div>
  );
}
