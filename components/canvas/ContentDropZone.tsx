import React, { useRef } from "react";
import { useDrop, DropTargetMonitor } from "react-dnd";
import { BlockType } from "@/lib/types";
import { ItemTypes } from "@/lib/dnd/itemTypes";
import { useBlocksStore } from "@/store/blocks-store";
// Importiere die CanvasBlock Komponente (Pfad ggf. anpassen)
import { CanvasBlock } from "../blocks/canvas-block";
// Importiere den Typ für MediaItemInput
import { MediaItemInput } from "@/components/media/draggable-media-item"; // Pfad ggf. anpassen
import clsx from "clsx";

// Typ für das Item, das von der *Block*-Sidebar kommt (Annahme: hat type und content)
/* interface NewBlockDragItem {
  type: BlockType["type"]; // z.B. 'text', 'heading'
  content: unknown; // Inhalt variiert je nach Blocktyp
  // Ggf. weitere block-spezifische Daten
} */

// Typ für das Item eines existierenden Blocks, der verschoben wird
interface ExistingBlockDragItem {
  id: string;
  index: number;
  layoutId: string;
  zoneId: string;
  type: typeof ItemTypes.EXISTING_BLOCK; // Expliziter Typ
}

// Typ für ein Media Item aus der Sidebar
/* interface MediaItemDragObject {
  type: typeof ItemTypes.MEDIA_ITEM; // Expliziter Typ
  // Das eigentliche Item ist MediaItemInput
  id: string;
  file_name: string;
  file_type: string;
  url: string;
  uploaded_at: string;
  size: number;
  width?: number;
  height?: number;
  preview_url_512?: string | null;
  preview_url_128?: string | null;
} */

// Typ für ein neues Content Block Item aus der Sidebar
interface NewContentBlockDragObject {
  type: typeof ItemTypes.CONTENT_BLOCK; // Expliziter Typ
  blockType: BlockType["type"]; // Der eigentliche Blocktyp (z.B. 'text')
  content: unknown; // Der Inhalt für den neuen Block
  // Ggf. weitere initiale Daten
}

interface ContentBlockDragItem {
  type: typeof ItemTypes.CONTENT_BLOCK;
  content: unknown;
}

interface ExistingBlockDragItem {
  type: typeof ItemTypes.EXISTING_BLOCK;
  id: string;
  content: unknown;
}

type DropItem = ContentBlockDragItem | ExistingBlockDragItem | MediaItemInput;

interface ContentDropZoneProps {
  zoneId: string;
  layoutId: string;
  blocks: BlockType[];
}

export function ContentDropZone({
  zoneId,
  layoutId,
  blocks,
}: ContentDropZoneProps) {
  const { addBlock, moveBlock, reorderBlocks } = useBlocksStore();
  const dropRef = useRef<HTMLDivElement>(null);

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: [
        ItemTypes.CONTENT_BLOCK,
        ItemTypes.EXISTING_BLOCK,
        ItemTypes.MEDIA_ITEM,
      ],
      drop: (item: DropItem, monitor) => {
        if (!monitor.didDrop()) {
          const itemType = monitor.getItemType(); // Typ vom Monitor holen!
          const droppedItem = monitor.getItem(); // Das tatsächliche Item-Objekt holen

          console.log(`[ContentDropZone Drop] Item Type: ${String(itemType)}`);
          console.log("[ContentDropZone Drop] Dropped Item:", droppedItem);

          // Zielindex bestimmen (für neue Items am Ende, sonst aus hover)
          // Annahme: 'index' ist nur bei ExistingBlockDragItem im Item während hover gesetzt
          let targetIndex = blocks.length;
          if (
            itemType === ItemTypes.EXISTING_BLOCK &&
            droppedItem &&
            typeof droppedItem === "object" &&
            "index" in droppedItem
          ) {
            targetIndex = (droppedItem as ExistingBlockDragItem).index;
          }
          console.log(`[ContentDropZone Drop] Target Index: ${targetIndex}`);

          switch (itemType) {
            case ItemTypes.EXISTING_BLOCK: {
              console.log("[ContentDropZone Drop] Handling EXISTING_BLOCK");
              // Cast to the type including source properties
              const dragItem = droppedItem as ExistingBlockDragItem & {
                originalIndex: number;
                sourceLayoutId: string;
                sourceZoneId: string;
              };

              // Check if the necessary source properties exist
              if (
                typeof dragItem.sourceLayoutId === "undefined" ||
                typeof dragItem.sourceZoneId === "undefined"
              ) {
                console.error(
                  "[ContentDropZone Drop] Missing sourceLayoutId or sourceZoneId in EXISTING_BLOCK dragItem:",
                  dragItem
                );
                return; // Abort if properties are missing
              }

              // Nur verschieben, wenn sich Zone/Layout ODER Index geändert hat
              // Das Reordering innerhalb derselben Zone wurde im hover() behandelt
              // Hier im Drop müssen wir den Fall behandeln, dass in eine *andere* Zone gedroppt wird.
              // Der hover-Handler hat bereits den korrekten Ziel-`index` in `dragItem.index` gespeichert.
              if (
                dragItem.sourceLayoutId !== layoutId || // Use sourceLayoutId
                dragItem.sourceZoneId !== zoneId // Use sourceZoneId
              ) {
                console.log(
                  `Moving block ${dragItem.id} from ${dragItem.sourceLayoutId}/${dragItem.sourceZoneId} to ${layoutId}/${zoneId} at index ${targetIndex}` // Use source properties
                );
                moveBlock(
                  dragItem.id,
                  {
                    layoutId: dragItem.sourceLayoutId,
                    zoneId: dragItem.sourceZoneId,
                  }, // Use source properties
                  { layoutId: layoutId, zoneId: zoneId, index: targetIndex }
                );
              } else {
                // Drop fand in derselben Zone statt. Das Reordering wurde bereits
                // in der hover-Funktion durch `reorderBlocks` erledigt.
                // Hier ist nichts weiter zu tun.
                console.log(
                  "[ContentDropZone Drop] Drop in same zone, reordering handled by hover. No move action needed."
                );
              }
              break;
            }

            case ItemTypes.CONTENT_BLOCK: {
              // Neuer Block aus der Block-Sidebar
              console.log(
                "[ContentDropZone Drop] Handling CONTENT_BLOCK (New)"
              );
              const newItem = droppedItem as NewContentBlockDragObject;
              if (!newItem || typeof newItem.blockType === "undefined") {
                console.error(
                  "[ContentDropZone Drop] Invalid NewContentBlockDragObject:",
                  newItem
                );
                return;
              }
              console.log(
                `Adding new block of type ${newItem.blockType} to ${layoutId}/${zoneId} at index ${targetIndex}`
              );

              // Determine initial content based on block type
              let initialContent: BlockType["content"];

              switch (newItem.blockType) {
                case "heading":
                case "paragraph":
                  initialContent =
                    typeof newItem.content === "string" ||
                    typeof newItem.content === "number"
                      ? String(newItem.content)
                      : "";
                  break;
                case "image":
                case "video":
                case "audio":
                case "document":
                case "gif":
                case "freepik":
                  // Assign null directly if the initial content from sidebar is null
                  if (newItem.content === null) {
                    initialContent = null;
                  } else {
                    // Handle cases where sidebar might provide non-null content for these types (unlikely now but for future)
                    // For now, default to null if not explicitly null.
                    initialContent = null;
                  }
                  break;
                default:
                  // const _exhaustiveCheck: never = newItem.blockType;
                  initialContent = "";
              }

              const blockData: Omit<BlockType, "id"> = {
                type: newItem.blockType,
                content: initialContent, // No 'as any' needed now
              };

              addBlock(blockData, layoutId, zoneId, targetIndex);
              break;
            }

            case ItemTypes.MEDIA_ITEM: {
              // Neues Media Item aus der Medien-Sidebar
              console.log("[ContentDropZone Drop] Handling MEDIA_ITEM (New)");
              const mediaItem = droppedItem as MediaItemInput; // Korrekter Typ für das Item
              if (!mediaItem || typeof mediaItem.url === "undefined") {
                console.error(
                  "[ContentDropZone Drop] Invalid MediaItemInput:",
                  mediaItem
                );
                return;
              }
              console.log(
                `Adding new image block from media item ${mediaItem.id} (${mediaItem.file_name}) to ${layoutId}/${zoneId} at index ${targetIndex}`
              );
              console.log("[ContentDropZone] MediaItem Drop Details:", {
                mediaItemId: mediaItem.id,
                fileName: mediaItem.file_name,
                targetLayout: layoutId,
                targetZone: zoneId,
                targetIndex,
              });
              // Erstelle spezifisch einen 'image' Block
              const blockData: Omit<BlockType, "id"> = {
                type: "image",
                content: {
                  // Struktur für Bildinhalte annehmen
                  src: mediaItem.url,
                  alt: mediaItem.file_name || "Uploaded image", // Fallback für Alt-Text
                  width: mediaItem.width,
                  height: mediaItem.height,
                  // Ggf. Referenz zur mediaItemId speichern? z.B. mediaItemId: mediaItem.id
                },
                // Hier könnten weitere Standardwerte für Image-Blöcke gesetzt werden
              };
              addBlock(blockData, layoutId, zoneId, targetIndex);
              break;
            }

            default:
              console.warn(
                `[ContentDropZone Drop] Received unhandled item type: ${String(
                  itemType
                )}`
              );
          }
        } else {
          console.log(
            "[ContentDropZone Drop] Monitor reported drop was already handled."
          );
        }
      },
      hover: (item: unknown, monitor: DropTargetMonitor<unknown, void>) => {
        // --- Reorder-Logik ---
        if (!dropRef.current) return;

        const itemType = monitor.getItemType();
        const currentItem = monitor.getItem();

        // Reordering ist nur für existierende Blöcke innerhalb derselben Zone relevant
        if (
          itemType !== ItemTypes.EXISTING_BLOCK ||
          !currentItem ||
          typeof currentItem !== "object"
        )
          return;

        // Cast to a type that includes the source properties
        const dragItem = currentItem as ExistingBlockDragItem & {
          originalIndex: number;
          sourceLayoutId: string;
          sourceZoneId: string;
        };

        // Stelle sicher, dass dragItem alle nötigen Properties hat (wichtig wegen 'unknown')
        if (
          typeof dragItem.id === "undefined" ||
          typeof dragItem.originalIndex === "undefined" ||
          typeof dragItem.sourceLayoutId === "undefined" ||
          typeof dragItem.sourceZoneId === "undefined"
        ) {
          console.error(
            "[ContentDropZone Hover] Invalid ExistingBlockDragItem in hover (check properties):",
            dragItem
          );
          return;
        }

        // Nur reordern, wenn Quelle und Ziel dieselbe Zone ist
        if (
          dragItem.sourceLayoutId !== layoutId ||
          dragItem.sourceZoneId !== zoneId
        ) {
          // Wenn die Zone unterschiedlich ist, brauchen wir hier kein Reordering,
          // der 'drop'-Handler kümmert sich um das Verschieben zwischen Zonen.
          // Es könnte aber sinnvoll sein, den 'index' im Item für den Drop zu aktualisieren.
          // Berechnung des hoverIndex auch hier durchführen:

          const clientOffset = monitor.getClientOffset();
          if (!clientOffset) return;

          const hoverBoundingRect = dropRef.current.getBoundingClientRect();
          const hoverClientY = clientOffset.y - hoverBoundingRect.top;

          let hoverIndex = blocks.length; // Default: am Ende
          const children = dropRef.current.children;
          for (let i = 0; i < children.length; i++) {
            const blockElement = children[i] as HTMLElement;
            if (!blockElement || !blockElement.dataset.blockId) continue;

            const blockRect = blockElement.getBoundingClientRect();
            const elementTopInZone = blockElement.offsetTop;
            const elementMiddleYInZone =
              elementTopInZone + blockRect.height / 2;

            if (hoverClientY < elementMiddleYInZone) {
              hoverIndex = i;
              break;
            }
            if (
              i === children.length - 1 &&
              hoverClientY >= elementMiddleYInZone
            ) {
              hoverIndex = i + 1;
            }
          }
          hoverIndex = Math.max(0, Math.min(hoverIndex, blocks.length));

          // Aktualisiere den Zielindex im Drag-Item für den Drop-Handler
          (item as ExistingBlockDragItem).index = hoverIndex;

          // Beende die Hover-Funktion hier, da kein Reorder in DIESER Zone stattfindet
          return;
        }

        // --- Ab hier: Reordering innerhalb derselben Zone ---

        const dragIndex = dragItem.originalIndex;

        // --- Berechnung des hoverIndex basierend auf Mausposition ---
        const clientOffset = monitor.getClientOffset();
        if (!clientOffset) return;

        const hoverBoundingRect = dropRef.current.getBoundingClientRect();
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;

        let hoverIndex = blocks.length; // Default: am Ende
        const children = dropRef.current.children;
        for (let i = 0; i < children.length; i++) {
          // Prüfe, ob das Kind ein HTMLElement ist und ein CanvasBlock sein könnte
          const blockElement = children[i] as HTMLElement;
          // Überspringe Elemente, die keine Blöcke sind (z.B. der Platzhaltertext)
          if (!blockElement || !blockElement.dataset.blockId) continue;

          const blockRect = blockElement.getBoundingClientRect();
          // Berechne die Mitte relativ zum ContentDropZone-Container
          const elementTopInZone = blockElement.offsetTop;
          const elementMiddleYInZone = elementTopInZone + blockRect.height / 2;

          // Wenn der Mauszeiger über der oberen Hälfte des Elements ist
          if (hoverClientY < elementMiddleYInZone) {
            hoverIndex = i;
            break; // Gefunden, Schleife verlassen
          }
          // Wenn wir beim letzten Element sind und der Mauszeiger darunter ist
          if (
            i === children.length - 1 &&
            hoverClientY >= elementMiddleYInZone
          ) {
            hoverIndex = i + 1;
          }
        }
        // Stelle sicher, dass der Index gültig ist (0 bis blocks.length)
        hoverIndex = Math.max(0, Math.min(hoverIndex, blocks.length));

        // --- Ende Berechnung hoverIndex ---

        // Nichts tun, wenn sich der Index nicht ändert
        if (dragIndex === hoverIndex) {
          return;
        }

        console.log(
          `ContentZone Hover: Reorder block ${dragItem.id} from index ${dragIndex} to ${hoverIndex} in ${layoutId}/${zoneId}`
        );

        // Führe das Reordering direkt im Store aus
        const reorderedIds = [...blocks.map((b) => b.id)];
        // Stelle sicher, dass der zu ziehende Block auch in der ID-Liste ist (nutze dragIndex)
        if (
          !reorderedIds[dragIndex] ||
          reorderedIds[dragIndex] !== dragItem.id
        ) {
          console.error(
            `[ContentDropZone Hover] Dragged block ID ${dragItem.id} mismatch at original index ${dragIndex}. Blocks:`,
            blocks
          );
          return; // Verhindere Fehler
        }

        const [draggedId] = reorderedIds.splice(dragIndex, 1);
        if (draggedId) {
          reorderedIds.splice(hoverIndex, 0, draggedId);
          reorderBlocks(layoutId, zoneId, reorderedIds);
        } else {
          console.error(
            "[ContentDropZone Hover] Dragged block ID not found during reorder hover."
          );
        }

        // WICHTIG: Aktualisiere den Index im Drag-Item für den nächsten Hover/Drop
        // Type assertion ist hier notwendig, da wir wissen, dass es ExistingBlockDragItem ist
        // Wir müssen *beide* Index-Properties aktualisieren, falls vorhanden/nötig.
        // 'originalIndex' sollte konstant bleiben, aber der 'index' für den Drop muss aktualisiert werden.
        (item as ExistingBlockDragItem).index = hoverIndex;
        // Es ist wichtig, dass das Item-Objekt, das DND intern verwaltet,
        // konsistent bleibt. Wenn useDrag 'originalIndex' setzt, bleibt es dabei.
        // Wir fügen hier 'index' für den Drop hinzu/aktualisieren es.
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [zoneId, layoutId, blocks, addBlock, moveBlock, reorderBlocks]
  );

  drop(dropRef);

  return (
    <div
      ref={dropRef}
      className={clsx(
        "min-h-[50px] rounded-lg transition-colors duration-200",
        isOver && canDrop && "bg-primary/10 border-primary",
        !isOver && canDrop && "border-primary/50",
        "border-2 border-dashed p-2"
      )}
      // Removed onClick={(e) => e.stopPropagation()} as it might interfere with child text selection
    >
      {blocks.map((block, index) => (
        <CanvasBlock
          key={block.id}
          block={block}
          index={index}
          layoutId={layoutId}
          zoneId={zoneId}
          isOnlyBlockInArea={false} // Always allow deletion of blocks
          isSelected={false}
        />
      ))}
    </div>
  );
}
