"use client";

import { useDrag, DragSourceMonitor } from "react-dnd";
import { ItemTypes } from "@/lib/dnd/itemTypes";
import type { LayoutType } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import React from "react";

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
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.LAYOUT_BLOCK,
    item: { layoutType: type },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    // @ts-expect-error - Type mismatch for react-dnd drag ref, but functionally correct.
    <div
      ref={drag}
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
