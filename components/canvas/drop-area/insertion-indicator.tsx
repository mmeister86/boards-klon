"use client";

import React from "react";

interface InsertionIndicatorProps {
  isVisible: boolean;
}

export function InsertionIndicator({ isVisible }: InsertionIndicatorProps) {
  if (!isVisible) {
    return null;
  }

  // Use margin to create space, keep height minimal for the bar itself
  return (
    <div
      className={`transition-opacity duration-150 ease-out ${
        isVisible ? "opacity-100 my-2" : "opacity-0 h-0 my-0" // Use margin-y (my-2) for spacing
      }`}
      aria-hidden="true"
    >
      {/* Inner visual bar - give it a small height */}
      <div className="h-2 my-4 w-full rounded-full bg-primary/40" />{" "}
      {/* Use primary color */}
    </div>
  );
}
