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
      className="min-h-[120px] my-2 rounded-xl border-2 border-dashed border-border bg-primary/5 transition-all duration-200"
      aria-hidden="true"
    />
  );
}
