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
        "group flex flex-col items-center justify-center p-3 border rounded-lg cursor-grab bg-background hover:!bg-slate-500/80  transition-all ease-in-out duration-300",
        isDragging ? "opacity-50 ring-2 ring-primary" : ""
      )}
      title={description}
    >
      <Icon className="w-6 h-6 mb-1.5 text-slate-500 group-hover:!text-[#fef9ef]/80" />
      <span className="text-xs font-medium text-center text-slate-500 group-hover:!text-[#fef9ef]/80">
        {label}
      </span>
    </div>
  );
}
