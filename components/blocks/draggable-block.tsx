"use client";

import { useDrag } from "react-dnd";
import { ItemTypes } from "@/lib/item-types";
import type { LucideIcon } from "lucide-react";

interface DraggableBlockProps {
  type: string;
  content: string | null;
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
    item: {
      type,
      content,
      isSidebarItem: true,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag as unknown as React.LegacyRef<HTMLDivElement>}
      className={`group aspect-square flex items-center justify-center p-3 !bg-[#fef9ef]/80 hover:!bg-slate-500/80 border border-border
                rounded-lg cursor-move shadow-sm transition-all ease-in-out duration-300
                ${
                  isDragging
                    ? "opacity-50 scale-95 border-primary"
                    : "opacity-100 scale-100"
                }`}
      title={description}
    >
      <Icon className="h-10 w-10 text-slate-500 group-hover:!text-[#fef9ef]/80 " />
    </div>
  );
}
