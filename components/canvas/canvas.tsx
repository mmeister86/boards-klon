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

  const [{ isOver }, drop] = useDrop<
    AcceptedCanvasDropItem,
    void,
    { isOver: boolean }
  >(
    {
      accept: [ItemTypes.LAYOUT_BLOCK, ItemTypes.EXISTING_LAYOUT_BLOCK],
      hover: (item, monitor) => {
        const clientOffset = monitor.getClientOffset();

        if (!clientOffset) {
          return;
        }

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

        if (layoutCount === 0) {
          if (placeholderRef.current) {
            const placeholderRect =
              placeholderRef.current.getBoundingClientRect();
            if (
              clientOffset.y >= placeholderRect.top &&
              clientOffset.y <= placeholderRect.bottom &&
              clientOffset.x >= placeholderRect.left &&
              clientOffset.x <= placeholderRect.right
            ) {
              currentHoveredIndex = 0;
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
      <div className="flex-1 h-full bg-background text-foreground">
        <div className="absolute top-4 right-4 z-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPreviewMode(false)}
          >
            <EyeOff className="h-4 w-4 mr-2" />
            Vorschau beenden
          </Button>
        </div>
        <Preview />
      </div>
    );
  }

  return (
    <div
      className="flex-1 bg-muted h-full pt-24 overflow-y-auto"
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
        className="mx-auto transition-all duration-300 ease-in-out relative pb-20"
        style={viewportStyles}
      >
        {layoutBlocks.map((block, index) => (
          <React.Fragment key={block.id}>
            {canvasHoveredInsertionIndex === index && index !== 0 && (
              <div
                ref={placeholderRef}
                className={clsx(
                  "h-36 border-2 border-dashed rounded-lg my-1 py-4 transition-colors",
                  isOver
                    ? "border-blue-500 bg-blue-100 dark:bg-blue-900/30"
                    : "border-blue-200"
                )}
              ></div>
            )}
            {canvasHoveredInsertionIndex === 0 && index === 0 && (
              <div
                ref={placeholderRef}
                className={clsx(
                  "h-36 border-2 border-dashed rounded-lg my-1 py-4 transition-colors",
                  isOver
                    ? "border-blue-500 bg-blue-100 dark:bg-blue-900/30"
                    : "border-blue-200"
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
                  ref={placeholderRef}
                  className={clsx(
                    "h-36 border-2 border-dashed rounded-lg my-1 py-4 transition-colors",
                    isOver
                      ? "border-blue-500 bg-blue-100 dark:bg-blue-900/30"
                      : "border-blue-200"
                  )}
                ></div>
              )}
          </React.Fragment>
        ))}

        {layoutBlocks.length === 0 && (
          <div
            ref={placeholderRef}
            className={clsx(
              "text-center py-20 border-2 rounded-lg transition-colors",
              canvasHoveredInsertionIndex === 0 && isOver
                ? "border-dashed border-blue-500 dark:bg-blue-900/30"
                : "border-dashed border-gray-300 dark:border-gray-600"
            )}
          >
            <p className="text-gray-500 dark:text-gray-400">
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
