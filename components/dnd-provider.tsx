"use client";

import type { ReactNode } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { CustomDragLayer } from "./canvas/custom-drag-layer"; // Import the custom layer

interface DragAndDropProviderProps {
  children: ReactNode;
}

export function DragAndDropProvider({ children }: DragAndDropProviderProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      {children}
      <CustomDragLayer /> {/* Render the custom layer */}
    </DndProvider>
  );
}
