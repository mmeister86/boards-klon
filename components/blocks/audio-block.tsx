"use client";

import { useRef, useCallback } from "react";
import { useDrag, useDrop } from "react-dnd";
import { NativeTypes } from "react-dnd-html5-backend";
import { ItemTypes } from "@/lib/item-types";
import { Music } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBlocksStore } from "@/store/blocks-store";
import { useSupabase } from "@/components/providers/supabase-provider";
import { toast } from "sonner";
import { ModernAudioPlayer } from "../public/export-renderer";

// --- Types for Dropped Items ---
interface FileDropItem {
  type: typeof NativeTypes.FILE;
  files: File[];
}

type AcceptedDropItem = FileDropItem;

// --- Component Props ---
interface AudioBlockProps {
  blockId: string;
  dropAreaId: string;
  content: string | null;
  isSelected?: boolean;
  onSelect?: () => void;
}

// --- Component Implementation ---
export function AudioBlock({
  blockId,
  dropAreaId,
  content,
  isSelected,
  onSelect,
}: AudioBlockProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { updateBlockContent } = useBlocksStore();
  useSupabase();

  const [{ isDragging }, drag] = useDrag(
    {
      type: ItemTypes.EXISTING_BLOCK,
      item: {
        id: blockId,
        type: "audio",
        content,
        sourceDropAreaId: dropAreaId,
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    },
    [blockId, content, dropAreaId]
  );

  const processDroppedFile = useCallback(
    (file: File) => {
      console.log(
        `AudioBlock (${blockId}): processDroppedFile called for ${file.name}. Temporarily skipping API call.`
      );
      toast.info(`Simulating processing for: ${file.name}`);
      // Der Rest ist auskommentiert
      /* ... */
    },
    [blockId]
  );

  const [{ isOver, canDrop }, drop] = useDrop<
    AcceptedDropItem,
    void,
    { isOver: boolean; canDrop: boolean }
  >(
    () => ({
      accept: [NativeTypes.FILE],

      canDrop: (item, monitor) => {
        const itemType = monitor.getItemType();
        if (itemType === NativeTypes.FILE) {
          const fileItem = item as FileDropItem;
          return (
            fileItem.files?.some((file) => file.type.startsWith("audio/")) ??
            false
          );
        }
        return false;
      },

      drop: (item, monitor) => {
        if (monitor.didDrop()) {
          return;
        }

        const itemType = monitor.getItemType();
        if (itemType === NativeTypes.FILE) {
          const fileItem = item as FileDropItem;
          const audioFile = fileItem.files?.find((file) =>
            file.type.startsWith("audio/")
          );
          if (audioFile) {
            processDroppedFile(audioFile);
          }
        }
      },

      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [blockId, dropAreaId, updateBlockContent, processDroppedFile]
  );

  drag(ref);
  drop(ref);

  const isActiveDrop = isOver && canDrop;

  if (!content) {
    return (
      <div
        ref={ref}
        className={cn(
          "group relative flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-all",
          "border-gray-300 hover:border-gray-400",
          isActiveDrop && "border-rose-500 bg-rose-50 ring-2 ring-rose-300",
          isDragging && "opacity-50",
          isSelected && "ring-2 ring-rose-600"
        )}
        onClick={onSelect}
        role="button"
        aria-label="Audio Block Placeholder"
      >
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <Music
            className={cn(
              "h-8 w-8 text-gray-400 group-hover:text-gray-500",
              isActiveDrop && "text-rose-500"
            )}
          />
          <p
            className={cn(
              "text-sm text-gray-500",
              isActiveDrop && "text-rose-600 font-medium"
            )}
          >
            {canDrop ? "Audio hier ablegen" : "Audiodatei hierher ziehen"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        "group relative",
        isDragging && "opacity-50",
        isSelected && "ring-2 ring-rose-500 rounded-xl",
        isActiveDrop && "ring-2 ring-rose-300 border-rose-400 rounded-xl"
      )}
      onClick={onSelect}
      aria-label="Audio Block Player Container"
    >
      <ModernAudioPlayer url={content} />

      {isActiveDrop && (
        <div className="absolute inset-0 flex items-center justify-center bg-rose-500/30 rounded-xl">
          <p className="text-sm font-medium text-white bg-rose-600 px-2 py-1 rounded">
            Audio ersetzen
          </p>
        </div>
      )}
    </div>
  );
}
