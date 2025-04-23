"use client";

import type { ReactNode } from "react";
import { DndProvider } from "react-dnd";
import { MultiBackend } from "react-dnd-multi-backend";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { CustomDragLayer } from "./canvas/custom-drag-layer"; // Import the custom layer

const HTML5toTouch = {
  backends: [
    {
      id: "html5",
      backend: HTML5Backend,
      transition: (e: TouchEvent) => {
        return !e.touches;
      },
    },
    {
      id: "touch",
      backend: TouchBackend,
      options: { enableMouseEvents: true },
      preview: true,
      transition: (e: TouchEvent) => {
        return !!e.touches;
      },
    },
  ],
};

interface DragAndDropProviderProps {
  children: ReactNode;
}

export function DragAndDropProvider({ children }: DragAndDropProviderProps) {
  return (
    <DndProvider backend={MultiBackend} options={HTML5toTouch}>
      {children}
      <CustomDragLayer /> {/* Render the custom layer */}
    </DndProvider>
  );
}
