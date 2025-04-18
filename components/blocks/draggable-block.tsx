"use client";

import { useDrag } from "react-dnd";
import { ItemTypes } from "@/lib/dnd/itemTypes";
import type { LucideIcon } from "lucide-react";
import { useEffect } from "react";
import { getEmptyImage } from "react-dnd-html5-backend";

interface DraggableBlockProps {
  blockType: string;
  content: string | null;
  icon: LucideIcon;
  description: string;
  label: string;
}

export function DraggableBlock({
  blockType,
  content,
  icon: Icon,
  description,
  label,
}: DraggableBlockProps) {
  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: ItemTypes.CONTENT_BLOCK,
    item: {
      blockType,
      content,
      icon: Icon,
      label,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, [dragPreview]);

  return (
    <div
      ref={drag as unknown as React.LegacyRef<HTMLDivElement>}
      className={`group aspect-square flex flex-col items-center justify-center gap-1 p-2 !bg-[#fef9ef]/80 hover:!bg-slate-500/80 border border-border
                rounded-lg cursor-move shadow-sm transition-all ease-in-out duration-300
                ${
                  isDragging
                    ? "opacity-50 scale-95 border-primary"
                    : "opacity-100 scale-100"
                }`}
      title={description}
    >
      <Icon className="h-8 w-8 text-slate-500 group-hover:!text-[#fef9ef]/80 " />
      <span className="text-xs text-center text-slate-500 group-hover:!text-[#fef9ef]/80">
        {label}
      </span>
    </div>
  );
}
