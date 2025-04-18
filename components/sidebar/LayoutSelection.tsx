import React from "react";
import { useDrag } from "react-dnd";
import { LayoutType } from "@/lib/types"; // Importiere LayoutType
import { ItemTypes } from "@/lib/dnd/itemTypes"; // Annahme: ItemTypes sind zentral definiert

// Definiere die verfügbaren Layouts mit Labels (und ggf. Icons)
const availableLayouts: { type: LayoutType; label: string; icon?: string }[] = [
  { type: "single-column", label: "Eine Spalte" },
  { type: "two-columns", label: "Zwei Spalten" },
  { type: "three-columns", label: "Drei Spalten" },
  { type: "layout-1-2", label: "1:2 Spalten" },
  { type: "layout-2-1", label: "2:1 Spalten" },
  { type: "grid-2x2", label: "2x2 Grid" },
  // Füge hier bei Bedarf weitere Layouts hinzu
];

interface LayoutOptionProps {
  layout: { type: LayoutType; label: string; icon?: string };
}

// Komponente für eine einzelne Layout-Option (Draggable)
const LayoutOption: React.FC<LayoutOptionProps> = ({ layout }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.LAYOUT_BLOCK, // Definiert den Drag-Typ
    item: { type: layout.type }, // Das Objekt, das beim Draggen übergeben wird
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  // Korrektur für den Ref-Typ
  const dragRef = drag as unknown as React.Ref<HTMLDivElement>;

  return (
    <div
      ref={dragRef} // Referenz für react-dnd (korrigierter Typ)
      className={`p-2 border rounded cursor-grab mb-2 ${
        isDragging ? "opacity-50" : "opacity-100"
      } hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600`}
      title={`Layout: ${layout.label}`}
    >
      {/* Hier könnte ein Icon oder eine visuelle Repräsentation des Layouts hin */}
      {layout.label}
    </div>
  );
};

// Hauptkomponente für die Layout-Auswahl
export const LayoutSelection: React.FC = () => {
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-3">Layouts</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Ziehen Sie ein Layout auf den Canvas, um einen neuen Bereich zu
        erstellen.
      </p>
      <div>
        {availableLayouts.map((layout) => (
          <LayoutOption key={layout.type} layout={layout} />
        ))}
      </div>
    </div>
  );
};
