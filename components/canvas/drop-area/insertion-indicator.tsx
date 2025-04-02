"use client";

import React from "react";

interface InsertionIndicatorProps {
  isVisible: boolean;
}

export function InsertionIndicator({ isVisible }: InsertionIndicatorProps) {
  if (!isVisible) {
    return null;
  }

  // When visible, render a div that takes up space to push content down
  // When not visible, render nothing (or a zero-height div if needed for transitions)
  return (
    <div
      className={`transition-all duration-200 ease-out overflow-hidden ${
        isVisible ? "h-10 py-1" : "h-0 py-0" // Use height and padding to create space
      }`}
      aria-hidden="true"
    >
      {/* Inner visual bar */}
      <div className="h-2 w-full rounded-full bg-green-500/20 gap-6" />
    </div>
  );
}
