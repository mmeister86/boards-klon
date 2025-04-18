import React, { useRef, useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";
import { ItemTypes } from "@/lib/dnd/itemTypes";
import { ContentDropZone } from "./ContentDropZone";
import { useBlocksStore } from "@/store/blocks-store";
import { useViewport } from "@/lib/hooks/use-viewport";
import { Trash2, GripVertical } from "lucide-react";
import type { LayoutBlockType } from "@/lib/types";
import clsx from "clsx";

// Typ für ein gezogenes LayoutBlock-Element
interface LayoutDragItem {
  id: string;
  index: number;
  type: string;
}

interface LayoutBlockProps {
  layoutBlock: LayoutBlockType;
  index: number; // Index der LayoutBlock im Array
  moveLayoutBlock: (dragIndex: number, hoverIndex: number) => void;
}

// Verwende React.forwardRef, um den Ref an das DOM-Element weiterzuleiten
const LayoutBlock = React.forwardRef<
  HTMLDivElement, // Typ des DOM-Elements, an das der Ref weitergeleitet wird
  LayoutBlockProps // Typ der Props der Komponente
>(({ layoutBlock, index, moveLayoutBlock }, ref) => {
  // Internen Ref für das DOM-Element erstellen, den react-dnd benötigt
  const internalRef = useRef<HTMLDivElement>(null);

  // Kombiniere den weitergeleiteten Ref und den internen Ref
  useEffect(() => {
    if (ref) {
      if (typeof ref === "function") {
        ref(internalRef.current);
      } else {
        ref.current = internalRef.current;
      }
    }
  }, [ref]);

  const {
    // Holen der benötigten Funktionen und Zustände aus dem Store
    selectBlock,
    selectedBlockId,
    deleteLayoutBlock,
  } = useBlocksStore();
  const { viewport } = useViewport();
  const isSelected = selectedBlockId === layoutBlock.id;

  // react-dnd Hook für das Ziehen des gesamten LayoutBlocks
  const [{ isDragging }, drag] = useDrag(
    {
      type: ItemTypes.EXISTING_LAYOUT_BLOCK,
      item: {
        id: layoutBlock.id,
        index,
        type: ItemTypes.EXISTING_LAYOUT_BLOCK,
      },
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    },
    [layoutBlock.id, index]
  );

  // react-dnd Hook für das Droppen auf einen LayoutBlock (zum Neuanordnen)
  const [{ handlerId }, drop] = useDrop<
    LayoutDragItem,
    void,
    { handlerId: string | symbol | null }
  >(
    {
      accept: ItemTypes.EXISTING_LAYOUT_BLOCK,
      collect(monitor) {
        return { handlerId: monitor.getHandlerId() };
      },
      hover(item: LayoutDragItem, monitor) {
        // Verwende den internen Ref für DOM-Operationen
        const domNode = internalRef.current;
        if (!domNode) return;

        const dragIndex = item.index;
        const hoverIndex = index;
        if (dragIndex === hoverIndex) return;

        const hoverBoundingRect = domNode.getBoundingClientRect();
        const hoverMiddleY =
          (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        const clientOffset = monitor.getClientOffset();
        if (!clientOffset) return;
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;

        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

        moveLayoutBlock(dragIndex, hoverIndex);
        item.index = hoverIndex;
      },
    },
    // Abhängigkeit von `ref` (dem weitergeleiteten) ist hier nicht ideal,
    // aber `internalRef` ist stabil. moveLayoutBlock und index sind wichtig.
    [index, moveLayoutBlock]
  );

  // Verbinde Drag-Source und Drop-Target mit dem internen Ref
  drag(drop(internalRef));

  // Funktion zum Bestimmen der CSS-Klassen für das Layout basierend auf Typ und Viewport
  const getLayoutClasses = (
    type: LayoutBlockType["type"],
    viewport: ReturnType<typeof useViewport>["viewport"]
  ): string => {
    if (viewport === "mobile") {
      return "flex flex-col gap-4"; // Immer einspaltig auf Mobile
    }
    switch (type) {
      case "single-column":
        return "flex flex-col";
      case "two-columns":
        return "grid grid-cols-1 md:grid-cols-2 gap-4";
      case "three-columns":
        return "grid grid-cols-1 md:grid-cols-3 gap-4";
      case "layout-1-2":
        return "grid grid-cols-1 md:grid-cols-3 gap-4";
      case "layout-2-1":
        return "grid grid-cols-1 md:grid-cols-3 gap-4";
      case "grid-2x2":
        return "grid grid-cols-1 sm:grid-cols-2 gap-4";
      default:
        return "flex flex-col";
    }
  };

  // Funktion zum Bestimmen der CSS-Klassen für einzelne Zonen (für spezielle Layouts)
  const getZoneClasses = (
    type: LayoutBlockType["type"],
    zoneIndex: number,
    viewport: ReturnType<typeof useViewport>["viewport"]
  ): string => {
    if (viewport === "mobile") {
      return ""; // Keine speziellen Klassen auf Mobile
    }
    if (type === "layout-1-2") {
      return zoneIndex === 0 ? "md:col-span-1" : "md:col-span-2";
    }
    if (type === "layout-2-1") {
      return zoneIndex === 0 ? "md:col-span-2" : "md:col-span-1";
    }
    return "";
  };

  const opacity = isDragging ? 0.3 : 1;

  const handleSelect = (e: React.MouseEvent) => {
    e.preventDefault(); // Verhindert Standardverhalten
    e.stopPropagation(); // Verhindert Bubbling
    selectBlock(layoutBlock.id);
  };

  return (
    // Verwende den internen Ref für das DOM-Element
    <div
      ref={internalRef}
      style={{
        opacity,
        paddingTop: layoutBlock.customClasses?.padding?.top ?? undefined,
        paddingRight: layoutBlock.customClasses?.padding?.right ?? undefined,
        paddingBottom: layoutBlock.customClasses?.padding?.bottom ?? undefined,
        paddingLeft: layoutBlock.customClasses?.padding?.left ?? undefined,
        backgroundColor:
          layoutBlock.customClasses?.backgroundColor ?? undefined,
      }}
      data-handler-id={handlerId}
      className={clsx(
        "relative p-2 group rounded-xl border-2 transition-all duration-150 ease-in-out mb-4",
        "bg-white",
        isSelected
          ? "border-blue-500 border-solid shadow-lg ring-2 ring-blue-200"
          : "border-gray-200 border-dashed hover:border-blue-400 hover:shadow-md",
        layoutBlock.customClasses?.margin
      )}
      onClick={handleSelect}
    >
      {/* Drag Handle */}
      <div
        className={clsx(
          "absolute -top-2 -left-2 cursor-move p-1.5 text-white rounded-full bg-blue-500 hover:bg-blue-600 shadow-md",
          "opacity-0 group-hover:opacity-100 transition-all duration-200",
          isSelected && "opacity-100"
        )}
        title="Layoutblock verschieben"
      >
        <GripVertical size={16} />
      </div>

      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          deleteLayoutBlock(layoutBlock.id);
        }}
        className={clsx(
          "absolute -top-2 -right-2 p-1.5 text-white bg-red-500 hover:bg-red-600 rounded-full shadow-md transition-all z-10",
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
        title="Layoutblock löschen"
      >
        <Trash2 size={16} />
      </button>

      {/* Layout-Struktur und Zonen - Wiederhergestellt */}
      <div className={getLayoutClasses(layoutBlock.type, viewport)}>
        {/* Annahme: layoutBlockType enthält 'zones' Array */}
        {layoutBlock.zones.map((zone, zoneIndex) => (
          <div
            key={zone.id} // Verwende zone.id als Key
            className={getZoneClasses(layoutBlock.type, zoneIndex, viewport)}
          >
            {/* Wiederhergestellte Props für ContentDropZone */}
            <ContentDropZone
              zoneId={zone.id} // zone.id übergeben
              layoutId={layoutBlock.id} // layoutBlock.id übergeben
              blocks={zone.blocks} // zone.blocks übergeben
            />
          </div>
        ))}
      </div>
    </div>
  );
});

LayoutBlock.displayName = "LayoutBlock";

export default LayoutBlock;
