"use client";

import { useBlocksStore } from "@/store/blocks-store";
import { useViewport } from "@/lib/hooks/use-viewport";
import LayoutBlock from "./LayoutBlock";
import { ViewportSelector } from "./viewport-selector";
import React, { useEffect, useRef, createRef } from "react";
import { getViewportStyles } from "@/lib/utils/viewport-utils";
import clsx from "clsx";
import { useDrop } from "react-dnd";
import { ItemTypes } from "@/lib/dnd/itemTypes";
import Preview from "@/components/preview/preview";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LayoutType, BlockType } from "@/lib/types";
import { FeatureErrorBoundary } from "@/lib/errors/boundaries/FeatureErrorBoundary";

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

function CanvasContent() {
  const {
    layoutBlocks,
    addLayoutBlock,
    moveLayoutBlock,
    previewMode,
    setPreviewMode,
    canvasHoveredInsertionIndex,
    setCanvasHoveredInsertionIndex,
  } = useBlocksStore();
  const { viewport } = useViewport();

  const layoutBlockRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);
  const placeholderRef = useRef<HTMLDivElement>(null);
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

  // Das folgende useEffect wurde entfernt, damit beim Anlegen eines neuen Projekts
  // die Canvas wirklich leer bleibt und nicht automatisch ein LayoutBlock erscheint.
  //
  // useEffect(() => {
  //   if (layoutBlocks.length === 0) {
  //     addLayoutBlock("single-column", 0);
  //   }
  // }, []);

  const [{ isOver }, drop] = useDrop<
    AcceptedCanvasDropItem,
    void,
    { isOver: boolean }
  >(
    {
      accept: [ItemTypes.LAYOUT_BLOCK, ItemTypes.EXISTING_LAYOUT_BLOCK],
      hover: (item, monitor) => {
        console.log("DnD Event: hover", {
          type: monitor.getItemType(),
          isOver: monitor.isOver(),
          isOverCurrent: monitor.isOver({ shallow: true }),
          didDrop: monitor.didDrop(),
          item,
        });

        const clientOffset = monitor.getClientOffset();
        if (!clientOffset) {
          console.log("DnD Event: Keine Mausposition in hover");
          return;
        }

        if (!monitor.isOver({ shallow: true })) {
          console.log("DnD Event: Verlasse Drop-Zone in hover");
          if (
            canvasHoveredInsertionIndex !== null &&
            !hideIndicatorTimeoutRef.current
          ) {
            console.log("DnD Event: Starte Timeout für Indikator-Reset");
            hideIndicatorTimeoutRef.current = setTimeout(() => {
              console.log("DnD Event: Timeout ausgeführt - Reset Indikator");
              setCanvasHoveredInsertionIndex(null);
              hideIndicatorTimeoutRef.current = null;
            }, 300);
          }
          return;
        }

        let currentHoveredIndex: number | null = null;
        const layoutCount = layoutBlocks.length;
        console.log("Canvas: Anzahl Layouts:", layoutCount);

        if (layoutCount === 0) {
          if (placeholderRef.current) {
            const placeholderRect =
              placeholderRef.current.getBoundingClientRect();
            const extendedRect = {
              top: placeholderRect.top - 50,
              bottom: placeholderRect.bottom + 50,
              left: placeholderRect.left - 50,
              right: placeholderRect.right + 50,
            };

            if (
              clientOffset.y >= extendedRect.top &&
              clientOffset.y <= extendedRect.bottom &&
              clientOffset.x >= extendedRect.left &&
              clientOffset.x <= extendedRect.right
            ) {
              currentHoveredIndex = 0;
              if (hideIndicatorTimeoutRef.current) {
                clearTimeout(hideIndicatorTimeoutRef.current);
                hideIndicatorTimeoutRef.current = null;
              }
            }
          }
        } else {
          if (layoutBlockRefs.current[0]?.current) {
            const firstRect =
              layoutBlockRefs.current[0].current.getBoundingClientRect();
            if (clientOffset.y < firstRect.top + firstRect.height / 2) {
              currentHoveredIndex = 0;
            }
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
          console.log("Canvas: Berechneter Index:", currentHoveredIndex);
          if (hideIndicatorTimeoutRef.current) {
            clearTimeout(hideIndicatorTimeoutRef.current);
            hideIndicatorTimeoutRef.current = null;
          }
          if (currentHoveredIndex !== canvasHoveredInsertionIndex) {
            setCanvasHoveredInsertionIndex(currentHoveredIndex);
          }
        } else {
          console.log("Canvas: Kein gültiger Index gefunden");
          if (
            canvasHoveredInsertionIndex !== null &&
            !hideIndicatorTimeoutRef.current
          ) {
            hideIndicatorTimeoutRef.current = setTimeout(() => {
              setCanvasHoveredInsertionIndex(null);
              hideIndicatorTimeoutRef.current = null;
            }, 300);
          }
        }
      },
      drop: (item, monitor) => {
        console.log("DnD Event: drop", {
          type: monitor.getItemType(),
          isOver: monitor.isOver(),
          isOverCurrent: monitor.isOver({ shallow: true }),
          didDrop: monitor.didDrop(),
          item,
          targetIndex: canvasHoveredInsertionIndex,
        });

        if (hideIndicatorTimeoutRef.current) {
          console.log("DnD Event: Lösche Timeout beim Drop");
          clearTimeout(hideIndicatorTimeoutRef.current);
          hideIndicatorTimeoutRef.current = null;
        }

        const targetIndex = canvasHoveredInsertionIndex;
        setCanvasHoveredInsertionIndex(null);

        if (targetIndex === null) {
          console.log("DnD Event: Drop abgebrochen - Kein gültiger Index");
          return undefined;
        }

        const itemType = monitor.getItemType();

        if (itemType === ItemTypes.LAYOUT_BLOCK) {
          const layoutInput = item as NewLayoutDragItem;
          if (layoutInput.layoutType) {
            console.log("DnD Event: Füge neues Layout hinzu", {
              type: layoutInput.layoutType,
              index: targetIndex,
            });
            addLayoutBlock(layoutInput.layoutType, targetIndex);
          } else {
            console.error(
              "DnD Event: Fehlendes layoutType im NewLayoutDragItem",
              item
            );
          }
        } else if (itemType === ItemTypes.EXISTING_LAYOUT_BLOCK) {
          console.log("DnD Event: Verschiebe bestehendes Layout");
        } else {
          console.log(
            `Canvas: Unerwarteter Item-Typ gedropped: ${itemType?.toString()}`
          );
          console.log("Dropped Item Data:", item);
        }

        return undefined;
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver({ shallow: true }),
      }),
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

  const viewportStyles = getViewportStyles(viewport);

  if (previewMode) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col overflow-auto">
        {/* Controls container: give background, border, padding, z-index */}
        <div className="px-6 py-4 border-b bg-background sticky top-0 z-10">
          <div className="relative flex justify-center items-center">
            <ViewportSelector />
            {/* Adjusted button positioning */}
            <div className="absolute right-0 flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewMode(false)}
              >
                <EyeOff className="h-4 w-4 mr-2" />
                Vorschau beenden
              </Button>
            </div>
          </div>
        </div>
        {/* Preview component takes remaining space (it has flex-1 internally) */}
        <Preview />
      </div>
    );
  }

  return (
    <div
      className="flex-1 bg-white h-full pt-24 overflow-y-auto"
      data-drop-container="true"
      ref={dropRefCallback}
    >
      <div className="px-6">
        <div className="relative flex justify-center items-center mb-6">
          <ViewportSelector />
          <div className="absolute right-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewMode(true)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Vorschau
            </Button>
          </div>
        </div>
      </div>

      <div
        className="mx-auto transition-all duration-300 ease-in-out relative pb-20 bg-white rounded-xl p-4 py-10"
        style={viewportStyles}
      >
        {layoutBlocks.map((block, index) => (
          <React.Fragment key={block.id}>
            {canvasHoveredInsertionIndex === 0 && index === 0 && (
              <div
                className={clsx(
                  "h-16 border-2 border-dashed rounded-lg my-1 transition-colors",
                  isOver ? "border-blue-500 bg-blue-100" : "border-transparent"
                )}
              ></div>
            )}
            {canvasHoveredInsertionIndex === index && index !== 0 && (
              <div
                className={clsx(
                  "h-16 border-2 border-dashed rounded-lg my-1 transition-colors",
                  isOver ? "border-blue-500 bg-blue-100" : "border-transparent"
                )}
              ></div>
            )}

            <LayoutBlock
              ref={layoutBlockRefs.current[index]}
              key={block.id}
              layoutBlock={block}
              index={index}
              moveLayoutBlock={moveLayoutBlock}
            />
            {canvasHoveredInsertionIndex === layoutBlocks.length &&
              index === layoutBlocks.length - 1 && (
                <div
                  className={clsx(
                    "h-16 border-2 border-dashed rounded-lg my-1 transition-colors",
                    isOver
                      ? "border-blue-500 bg-blue-100"
                      : "border-transparent"
                  )}
                ></div>
              )}
          </React.Fragment>
        ))}

        {layoutBlocks.length === 0 && (
          <div
            ref={placeholderRef}
            className={clsx(
              "text-center py-20 border-2 rounded-lg transition-colors cursor-pointer",
              isOver
                ? "border-dashed border-blue-500 bg-blue-100"
                : "border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            )}
          >
            <p className="text-gray-500">
              Ziehe ein Layout aus der Seitenleiste hierhin,
              <br />
              um zu beginnen.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Canvas() {
  return (
    <FeatureErrorBoundary feature="Canvas-Editor">
      <CanvasContent />
    </FeatureErrorBoundary>
  );
}
