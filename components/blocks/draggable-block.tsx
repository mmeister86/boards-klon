"use client";

import { useDrag } from "react-dnd";
import { ItemTypes } from "@/lib/item-types";
import type { LucideIcon } from "lucide-react";

interface DraggableBlockProps {
  type: string;
  content: string;
  icon: LucideIcon;
  description: string;
}

export function DraggableBlock({
  type,
  content,
  icon: Icon,
  description,
}: DraggableBlockProps) {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.BLOCK,
    item: { type, content },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag as unknown as React.LegacyRef<HTMLDivElement>}
      className={`aspect-square flex flex-col items-center justify-center p-3 bg-background border border-border
                rounded-lg cursor-move shadow-sm hover:shadow-md transition-all
                ${
                  isDragging
                    ? "opacity-50 scale-95 border-primary"
                    : "opacity-100 scale-100"
                }`}
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
    </div>
  );
}
