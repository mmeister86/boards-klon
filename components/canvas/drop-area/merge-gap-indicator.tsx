"use client";

import { Merge } from "lucide-react";
import { useState } from "react";

interface MergeGapIndicatorProps {
  canMerge: boolean;
  onClick: () => void;
}

export function MergeGapIndicator({
  canMerge,
  onClick,
}: MergeGapIndicatorProps) {
  const [isHovering, setIsHovering] = useState(false);

  // Always render gap div to maintain spacing, even if merge isn't available
  if (!canMerge) {
    return <div className="w-4"></div>;
  }

  return (
    <div
      className={`w-4 min-h-full self-stretch flex items-center justify-center relative
        hover:bg-green-100/50 transition-colors z-10 group`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Only show the button when hovering */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className={`p-2 rounded-full bg-green-500 shadow-md hover:bg-green-600
          transition-all text-white opacity-0 group-hover:opacity-100 absolute
          z-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}
        title="Merge drop areas"
        aria-label="Merge drop areas"
      >
        <Merge size={16} />
      </button>
    </div>
  );
}
