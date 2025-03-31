"use client";

import React from "react";

interface InsertionIndicatorProps {
  isVisible: boolean;
}

export function InsertionIndicator({ isVisible }: InsertionIndicatorProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="h-10 my-2 rounded-full bg-green-500/80 transition-all duration-800 animate-pulse" // Increased height to h-3, margin to my-2
      aria-hidden="true"
    />
  );
}
