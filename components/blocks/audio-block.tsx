"use client";

import { useRef, useCallback, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { NativeTypes } from "react-dnd-html5-backend";
import { ItemTypes } from "@/lib/item-types";
import { Music, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBlocksStore } from "@/store/blocks-store";
import { useSupabase } from "@/components/providers/supabase-provider";
import { toast } from "sonner";
import { ModernAudioPlayer } from "@/components/ui/modern-audio-player";

// --- Hilfsfunktion zum Bereinigen von Dateinamen ---
const sanitizeFilename = (filename: string): string => {
  // Umlaute und ß ersetzen
  const umlautMap: { [key: string]: string } = {
    ä: "ae",
    ö: "oe",
    ü: "ue",
    Ä: "Ae",
    Ö: "Oe",
    Ü: "Ue",
    ß: "ss",
  };
  let sanitized = filename;
  for (const key in umlautMap) {
    sanitized = sanitized.replace(new RegExp(key, "g"), umlautMap[key]);
  }

  // Leerzeichen durch Unterstriche ersetzen und ungültige Zeichen entfernen
  return sanitized
    .replace(/\s+/g, "_") // Ersetzt ein oder mehrere Leerzeichen durch einen Unterstrich
    .replace(/[^a-zA-Z0-9._-]/g, ""); // Entfernt alle Zeichen außer Buchstaben, Zahlen, Punkt, Unterstrich, Bindestrich
};

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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { updateBlockContent } = useBlocksStore();
  const { supabase } = useSupabase();

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
    async (file: File) => {
      if (!supabase) {
        toast.error("Supabase Client nicht verfügbar.");
        setUploadError("Upload-Service nicht bereit.");
        return;
      }
      setIsUploading(true);
      setUploadError(null);

      const sanitizedFilename = sanitizeFilename(file.name);
      const filePath = `public/${blockId}-${sanitizedFilename}`;

      toast.info(`Lade ${sanitizedFilename} hoch...`);
      console.log(`AudioBlock (${blockId}): Starte Upload für ${sanitizedFilename} nach ${filePath}`);

      try {
        const { error } = await supabase.storage
          .from("audio")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true,
          });

        if (error) {
          throw error;
        }

        const { data: publicUrlData } = supabase.storage
          .from("audio")
          .getPublicUrl(filePath);

        if (!publicUrlData?.publicUrl) {
          throw new Error("Konnte öffentliche URL nicht abrufen.");
        }

        const newContentUrl = publicUrlData.publicUrl;
        console.log(`AudioBlock (${blockId}): Upload erfolgreich. URL: ${newContentUrl}`);

        updateBlockContent(blockId, dropAreaId, newContentUrl);
        toast.success(`${sanitizedFilename} erfolgreich hochgeladen!`);

      } catch (error) {
        console.error(`AudioBlock (${blockId}): Fehler beim Upload:`, error);
        const errorMessage = (error instanceof Error ? error.message : String(error)) || "Unbekannter Upload-Fehler.";
        setUploadError(`Fehler: ${errorMessage}`);
        toast.error(`Upload fehlgeschlagen: ${errorMessage}`);
      } finally {
        setIsUploading(false);
      }
    },
    [supabase, blockId, dropAreaId, updateBlockContent]
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
          (isDragging || isUploading) && "opacity-50",
          isSelected && "ring-2 ring-rose-600",
          uploadError && "border-red-500 bg-red-50"
        )}
        onClick={onSelect}
        role="button"
        aria-label="Audio Block Placeholder"
      >
        {isUploading ? (
          <div className="flex flex-col items-center justify-center text-center">
            <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
            <p className="mt-2 text-sm text-rose-600 font-medium">
              Lädt hoch...
            </p>
          </div>
        ) : uploadError ? (
           <div className="flex flex-col items-center justify-center space-y-2 text-center">
             <Music className="h-8 w-8 text-red-500"/>
             <p className="text-sm text-red-600 font-medium">
                Upload fehlgeschlagen
             </p>
             <p className="text-xs text-red-500">{uploadError}</p>
            </div>
        ) : (
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
        )}
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
      {isUploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-xl z-10">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
              <p className="mt-2 text-sm text-white font-medium">
                  Lädt hoch...
              </p>
          </div>
      )}
      <ModernAudioPlayer url={content} />

      {isActiveDrop && !isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-rose-500/30 rounded-xl">
          <p className="text-sm font-medium text-white bg-rose-600 px-2 py-1 rounded">
            Audio ersetzen
          </p>
        </div>
      )}
    </div>
  );
}
