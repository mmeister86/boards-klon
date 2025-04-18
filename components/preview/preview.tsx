"use client";

import React, { useState, useEffect } from "react"; // Added React
import { useBlocksStore } from "@/store/blocks-store";
import { useViewport } from "@/lib/hooks/use-viewport";
import { RenderLayoutBlock } from "../public/RenderLayoutBlock";
import { Signal, Wifi, Battery, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getViewportStyles } from "@/lib/utils/viewport-utils"; // Importiere wieder

// ===== PreviewContent Component =====
function PreviewContent() {
  const { layoutBlocks } = useBlocksStore();
  const { viewport } = useViewport();

  const getFrameStyles = () => {
    switch (viewport) {
      case "mobile":
        return {
          width: "min(90vw, 375px)",
          height: "min(calc(90vw * 2.16), 812px)",
        };
      case "tablet":
        return {
          width: "min(95vw, 834px)",
          height: "auto",
          minHeight: "600px",
          maxHeight: "85vh",
        };
      default:
        return {
          width: "1400px",
          maxWidth: "1400px",
          height: "auto",
          minHeight: "600px",
        };
    }
  };

  const getFrameClasses = () => {
    let classes =
      "relative bg-white overflow-hidden transition-all duration-300";
    switch (viewport) {
      case "mobile":
        classes += " rounded-[2.5rem] border-[14px] border-black";
        break;
      case "tablet":
        classes += " rounded-[2rem] border-[14px] border-black";
        break;
      default:
        classes += " rounded-[2rem] shadow-lg";
        break;
    }
    return classes;
  };

  const getContentPadding = () => {
    switch (viewport) {
      case "mobile":
        return "px-4";
      case "tablet":
        return "p-6";
      default:
        return "p-8";
    }
  };

  const [time, setTime] = useState(
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 bg-gray-50 overflow-auto p-6 flex justify-center items-center">
      <div
        className={`${getFrameClasses()} flex flex-col`}
        style={getFrameStyles()}
      >
        {(viewport === "mobile" || viewport === "tablet") && (
          <div
            className={`flex justify-between items-center text-xs font-medium pb-2 bg-gray-700 text-white mb-2 ${
              viewport === "mobile" ? "px-4 py-2" : "px-6 py-2"
            }`}
          >
            <div>{time}</div>
            <div
              className={`flex items-center ${
                viewport === "mobile" ? "gap-1" : "gap-2"
              }`}
            >
              {viewport === "mobile" && <Signal className="w-3.5 h-3.5" />}
              <Wifi
                className={viewport === "mobile" ? "w-3.5 h-3.5" : "w-4 h-4"}
              />
              <Battery
                className={viewport === "mobile" ? "w-4 h-4" : "w-5 h-5"}
                stroke="white"
                fill="green"
              />
            </div>
          </div>
        )}
        <div
          className={`flex-1 overflow-y-auto min-h-0 relative ${getContentPadding()}`}
        >
          <div
            className={`${viewport === "desktop" ? "space-y-6" : "space-y-4"}`}
          >
            {layoutBlocks.map((layoutBlock) => (
              <RenderLayoutBlock
                key={layoutBlock.id}
                layoutBlock={layoutBlock}
                viewport={viewport}
              />
            ))}
            {layoutBlocks.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                Kein Inhalt vorhanden.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Main Canvas/Preview Component =====
// Importiere zusätzliche benötigte Komponenten und Hooks für den Editor-Modus
import { LayoutBlock } from "../canvas/LayoutBlock";
import { ViewportSelector } from "../canvas/viewport-selector";
import { useRef, createRef } from "react"; // Hinzugefügt für Editor-Refs
import { useDrop } from "react-dnd"; // Hinzugefügt für Editor-Drop
import { ItemTypes } from "@/lib/dnd/itemTypes"; // Hinzugefügt für Editor-Drop
import type { LayoutType, BlockType } from "@/lib/types"; // Hinzugefügt für Editor-Drop

// Typen für Editor-Drop (kopiert aus vorheriger Canvas-Version)
interface NewLayoutDragItem {
  layoutType: LayoutType;
}
interface NewBlockDragItem {
  type: BlockType["type"];
  content: string;
}
interface ExistingBlockDragItem {
  id: string;
  index: number;
  layoutId: string;
  zoneId: string;
  type: string;
}
interface ExistingLayoutDragItem {
  id: string;
  index: number;
  type: string;
}
type AcceptedCanvasDropItem =
  | NewLayoutDragItem
  | NewBlockDragItem
  | ExistingBlockDragItem
  | ExistingLayoutDragItem;

export default function Canvas() {
  const {
    previewMode,
    setPreviewMode,
    layoutBlocks,
    addLayoutBlock,
    moveLayoutBlock,
    canvasHoveredInsertionIndex,
    setCanvasHoveredInsertionIndex,
  } = useBlocksStore();
  const { viewport } = useViewport(); // Wird hier und in PreviewContent benötigt

  // State und Refs für den Editor-Modus (kopiert aus vorheriger Canvas-Version)
  const layoutBlockRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);
  const hideIndicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    layoutBlockRefs.current = layoutBlocks.map(
      (_, i) => layoutBlockRefs.current[i] ?? createRef<HTMLDivElement>()
    );
  }, [layoutBlocks]);

  useEffect(() => {
    return () => {
      const hideIndicatorTimeout = hideIndicatorTimeoutRef.current;
      if (hideIndicatorTimeout) {
        clearTimeout(hideIndicatorTimeout);
      }
    };
  }, []);

  // Drop-Handler für den Editor-Modus (kopiert aus vorheriger Canvas-Version)
  const [, drop] = useDrop<AcceptedCanvasDropItem, void, { isOver: boolean }>(
    {
      accept: [ItemTypes.LAYOUT_BLOCK, ItemTypes.EXISTING_LAYOUT_BLOCK],
      hover: (item, monitor) => {
        const clientOffset = monitor.getClientOffset();
        if (!clientOffset) return;
        if (!monitor.isOver({ shallow: true })) {
          if (
            canvasHoveredInsertionIndex !== null &&
            !hideIndicatorTimeoutRef.current
          ) {
            hideIndicatorTimeoutRef.current = setTimeout(() => {
              setCanvasHoveredInsertionIndex(null);
              hideIndicatorTimeoutRef.current = null;
            }, 150);
          }
          return;
        }
        let currentHoveredIndex: number | null = null;
        const layoutCount = layoutBlocks.length;
        if (layoutCount > 0 && layoutBlockRefs.current[0]?.current) {
          const firstRect =
            layoutBlockRefs.current[0].current.getBoundingClientRect();
          if (clientOffset.y < firstRect.top + firstRect.height / 2) {
            currentHoveredIndex = 0;
          }
        }
        if (currentHoveredIndex === null) {
          for (let i = 0; i < layoutCount - 1; i++) {
            const topBlockRef = layoutBlockRefs.current[i];
            const bottomBlockRef = layoutBlockRefs.current[i + 1];
            if (!topBlockRef?.current || !bottomBlockRef?.current) continue;
            const topRect = topBlockRef.current.getBoundingClientRect();
            const bottomRect = bottomBlockRef.current.getBoundingClientRect();
            const gapThreshold = 20;
            const midPointY =
              topRect.bottom + (bottomRect.top - topRect.bottom) / 2;
            if (Math.abs(clientOffset.y - midPointY) < gapThreshold) {
              const gapLeft = Math.min(topRect.left, bottomRect.left);
              const gapRight = Math.max(topRect.right, bottomRect.right);
              if (clientOffset.x >= gapLeft && clientOffset.x <= gapRight) {
                currentHoveredIndex = i + 1;
                break;
              }
            }
          }
        }
        if (currentHoveredIndex === null && layoutCount > 0) {
          const lastBlockRef = layoutBlockRefs.current[layoutCount - 1];
          if (lastBlockRef?.current) {
            const lastRect = lastBlockRef.current.getBoundingClientRect();
            if (clientOffset.y > lastRect.top + lastRect.height / 2) {
              currentHoveredIndex = layoutCount;
            }
          }
        }
        if (currentHoveredIndex !== null) {
          if (hideIndicatorTimeoutRef.current) {
            clearTimeout(hideIndicatorTimeoutRef.current);
            hideIndicatorTimeoutRef.current = null;
          }
          if (currentHoveredIndex !== canvasHoveredInsertionIndex) {
            setCanvasHoveredInsertionIndex(currentHoveredIndex);
          }
        } else {
          if (
            canvasHoveredInsertionIndex !== null &&
            !hideIndicatorTimeoutRef.current
          ) {
            hideIndicatorTimeoutRef.current = setTimeout(() => {
              setCanvasHoveredInsertionIndex(null);
              hideIndicatorTimeoutRef.current = null;
            }, 150);
          }
        }
      },
      drop: (item, monitor) => {
        if (hideIndicatorTimeoutRef.current) {
          clearTimeout(hideIndicatorTimeoutRef.current);
          hideIndicatorTimeoutRef.current = null;
        }
        const targetIndex = canvasHoveredInsertionIndex;
        setCanvasHoveredInsertionIndex(null);
        if (targetIndex === null) {
          console.log("Canvas: Drop nicht in gültigem Bereich.");
          return undefined;
        }
        const itemType = monitor.getItemType();
        if (itemType === ItemTypes.LAYOUT_BLOCK) {
          const layoutInput = item as NewLayoutDragItem;
          if (layoutInput.layoutType) {
            console.log(
              `Canvas: Neues Layout ${layoutInput.layoutType} an Index ${targetIndex} hinzufügen.`
            );
            addLayoutBlock(layoutInput.layoutType, targetIndex);
          } else {
            console.error(
              "Canvas: Fehlendes layoutType im NewLayoutDragItem",
              item
            );
          }
        } else if (itemType === ItemTypes.EXISTING_LAYOUT_BLOCK) {
          console.log(
            `Canvas: Drop von bestehendem LayoutBlock (wurde bereits durch hover verschoben).`
          );
        } else {
          console.log(
            `Canvas: Unerwarteter Item-Typ gedropped: ${itemType?.toString()}`
          );
          console.log("Dropped Item Data:", item);
        }
        return undefined;
      },
      collect: (monitor) => ({ isOver: !!monitor.isOver({ shallow: true }) }),
    },
    [
      layoutBlocks,
      addLayoutBlock,
      moveLayoutBlock,
      canvasHoveredInsertionIndex,
      setCanvasHoveredInsertionIndex,
    ]
  );

  const dropRefCallback = (node: HTMLDivElement | null) => {
    if (node) {
      drop(node);
    }
  };

  // ----- MODUS-AUSWAHL -----
  if (previewMode) {
    return (
      <div className="flex flex-col flex-1 h-full relative bg-gray-50">
        <div className="px-6 pt-6">
          <div className="relative flex justify-center items-center mb-6">
            <ViewportSelector />
            <div className="absolute right-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewMode(false)}
                className="bg-white/80 hover:bg-white"
              >
                <EyeOff className="h-4 w-4 mr-2" />
                Vorschau beenden
              </Button>
            </div>
          </div>
        </div>
        <PreviewContent />
      </div>
    );
  }

  // ----- EDITOR-MODUS -----
  return (
    <div
      className="flex-1 bg-muted h-full pt-24 overflow-y-auto"
      data-drop-container="true"
      ref={dropRefCallback} // Drop-Zone für Editor
    >
      <div className="px-6">
        <div className="relative flex justify-center items-center mb-6">
          <ViewportSelector />
          <div className="absolute right-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewMode(true)} // Button zum Starten der Vorschau
            >
              <Eye className="h-4 w-4 mr-2" />
              Vorschau
            </Button>
          </div>
        </div>
      </div>

      <div
        className="mx-auto transition-all duration-300 ease-in-out relative pb-20"
        style={getViewportStyles(viewport)} // Verwende Editor-Viewport Styles
      >
        {layoutBlocks.map((block, index) => (
          <React.Fragment key={block.id}>
            {canvasHoveredInsertionIndex === index && index !== 0 && (
              <div className="h-2 bg-blue-500 rounded my-1"></div>
            )}
            {canvasHoveredInsertionIndex === 0 && index === 0 && (
              <div className="h-2 bg-blue-500 rounded my-1"></div>
            )}
            <LayoutBlock // Editor-Komponente
              ref={layoutBlockRefs.current[index]}
              key={block.id}
              layoutBlock={block}
              index={index}
              moveLayoutBlock={moveLayoutBlock}
            />
            {canvasHoveredInsertionIndex === layoutBlocks.length &&
              index === layoutBlocks.length - 1 && (
                <div className="h-2 bg-blue-500 rounded my-1"></div>
              )}
          </React.Fragment>
        ))}
        {layoutBlocks.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">
              Ziehen Sie ein Layout aus der Seitenleiste hierhin,
              <br />
              um zu beginnen.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
