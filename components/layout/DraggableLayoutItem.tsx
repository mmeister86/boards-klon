"use client";

import { useDrag, DragSourceMonitor } from "react-dnd";
import { ItemTypes } from "@/lib/dnd/itemTypes";
import type { LayoutType } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { getEmptyImage } from "react-dnd-html5-backend";

interface DraggableLayoutItemProps {
  type: LayoutType;
  icon: LucideIcon;
  label: string;
  description: string;
}

export function DraggableLayoutItem({
  type,
  icon: Icon,
  label,
  description,
}: DraggableLayoutItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag, dragPreview] = useDrag(() => ({
    type: ItemTypes.LAYOUT_BLOCK,
    item: {
      layoutType: type,
      icon: Icon,
      label,
    },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  drag(ref);

  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, [dragPreview]);

  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center justify-center p-3 border rounded-lg cursor-grab bg-background hover:bg-muted transition-colors",
        isDragging ? "opacity-50 ring-2 ring-primary" : ""
      )}
      title={description}
    >
      <Icon className="w-6 h-6 mb-1.5 text-muted-foreground" />
      <span className="text-xs font-medium text-center text-foreground">
        {label}
      </span>
    </div>
  );
}
