"use client";

import { useDrop } from "react-dnd";
import { ItemTypes } from "@/lib/item-types";
import { useState } from "react";
import { SquareSplitHorizontalIcon as SplitHorizontal, X } from "lucide-react";

interface DropTargetProps {
  onDrop: (zone: "main" | "left" | "right") => void;
  isDropped: boolean;
  dropZone: null | "main" | "left" | "right";
  onReset: () => void;
  isWider?: boolean;
}

export function DropTarget({
  onDrop,
  isDropped,
  dropZone,
  onReset,
  isWider = false,
}: DropTargetProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [isSplit, setIsSplit] = useState(false);

  // Handle splitting the drop area
  const handleSplit = () => {
    if (isDropped) {
      // If something is already dropped, reset it first
      onReset();
    }
    setIsSplit(true);
  };

  // Handle merging the split drop areas back
  const handleMerge = () => {
    if (isDropped) {
      // If something is already dropped, reset it first
      onReset();
    }
    setIsSplit(false);
  };

  // Main drop target (when not split)
  const [{ isOverMain, canDropMain }, dropMain] = useDrop({
    accept: ItemTypes.SQUARE,
    drop: () => {
      onDrop("main");
      return { name: "Main Drop Target" };
    },
    collect: (monitor) => ({
      isOverMain: !!monitor.isOver(),
      canDropMain: !!monitor.canDrop(),
    }),
  });

  // Left drop target (when split)
  const [{ isOverLeft, canDropLeft }, dropLeft] = useDrop({
    accept: ItemTypes.SQUARE,
    drop: () => {
      onDrop("left");
      return { name: "Left Drop Target" };
    },
    collect: (monitor) => ({
      isOverLeft: !!monitor.isOver(),
      canDropLeft: !!monitor.canDrop(),
    }),
  });

  // Right drop target (when split)
  const [{ isOverRight, canDropRight }, dropRight] = useDrop({
    accept: ItemTypes.SQUARE,
    drop: () => {
      onDrop("right");
      return { name: "Right Drop Target" };
    },
    collect: (monitor) => ({
      isOverRight: !!monitor.isOver(),
      canDropRight: !!monitor.canDrop(),
    }),
  });

  // Background colors for main drop target
  let backgroundColorMain = "bg-gray-200";
  if (isOverMain && canDropMain) {
    backgroundColorMain = "bg-green-200";
  } else if (canDropMain) {
    backgroundColorMain = "bg-yellow-100";
  }

  // Background colors for left drop target
  let backgroundColorLeft = "bg-gray-200";
  if (isOverLeft && canDropLeft) {
    backgroundColorLeft = "bg-green-200";
  } else if (canDropLeft) {
    backgroundColorLeft = "bg-yellow-100";
  }

  // Background colors for right drop target
  let backgroundColorRight = "bg-gray-200";
  if (isOverRight && canDropRight) {
    backgroundColorRight = "bg-green-200";
  } else if (canDropRight) {
    backgroundColorRight = "bg-yellow-100";
  }

  // Calculate width based on isWider prop
  const width = isWider ? "w-[192px] md:w-[576px]" : "w-64";

  return (
    <div
      className={`${width} relative`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Split control button */}
      {!isSplit && isHovering && !isDropped && (
        <button
          onClick={handleSplit}
          className="absolute top-2 right-2 z-10 bg-white p-1 rounded-full shadow-md hover:bg-gray-100 transition-colors"
          title="Ablagebereich teilen"
        >
          <SplitHorizontal size={16} />
        </button>
      )}

      {/* Merge control button */}
      {isSplit && isHovering && !isDropped && (
        <button
          onClick={handleMerge}
          className="absolute top-2 right-2 z-10 bg-white p-1 rounded-full shadow-md hover:bg-gray-100 transition-colors"
          title="Ablagebereiche zusammenführen"
        >
          <X size={16} />
        </button>
      )}

      {!isSplit ? (
        // Single drop area
        <div
          ref={dropMain}
          className={`h-64 ${backgroundColorMain} rounded-lg border-2 border-dashed border-gray-400 flex items-center justify-center transition-colors duration-200`}
        >
          {isDropped && dropZone === "main" ? (
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-blue-500 rounded-md flex items-center justify-center text-white font-medium mb-4">
                Abgelegt!
              </div>
              <button
                className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm"
                onClick={onReset}
              >
                Zurücksetzen
              </button>
            </div>
          ) : (
            <p className="text-gray-500">Hier ablegen</p>
          )}
        </div>
      ) : (
        // Split drop areas with gap
        <div className="flex gap-4">
          {/* Left drop target */}
          <div
            ref={dropLeft}
            className={`flex-1 h-64 ${backgroundColorLeft} rounded-lg border-2 border-dashed border-gray-400 flex items-center justify-center transition-colors duration-200`}
          >
            {isDropped && dropZone === "left" ? (
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-blue-500 rounded-md flex items-center justify-center text-white font-medium mb-4">
                  Links!
                </div>
                <button
                  className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm"
                  onClick={onReset}
                >
                  Zurücksetzen
                </button>
              </div>
            ) : (
              <p className="text-gray-500">Linke Zone</p>
            )}
          </div>

          {/* Right drop target */}
          <div
            ref={dropRight}
            className={`flex-1 h-64 ${backgroundColorRight} rounded-lg border-2 border-dashed border-gray-400 flex items-center justify-center transition-colors duration-200`}
          >
            {isDropped && dropZone === "right" ? (
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-blue-500 rounded-md flex items-center justify-center text-white font-medium mb-4">
                  Rechts!
                </div>
                <button
                  className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm"
                  onClick={onReset}
                >
                  Zurücksetzen
                </button>
              </div>
            ) : (
              <p className="text-gray-500">Rechte Zone</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
