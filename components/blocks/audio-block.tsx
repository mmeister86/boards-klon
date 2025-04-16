"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";
import { NativeTypes } from "react-dnd-html5-backend";
import { ItemTypes } from "@/lib/item-types";
import { Loader2, UploadCloud, AlertCircle, X } from "lucide-react";
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

// --- Definiere Upload-Status-Typen ---
type UploadStatus = "idle" | "uploading" | "error" | "success";

interface AudioBlockState {
  status: UploadStatus;
  error: string | null;
  audioUrl: string | null;
}

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
  // --- Zustand für Upload-Status, Fehler und URL ---
  const [state, setState] = useState<AudioBlockState>(() => ({
    status: content ? "success" : "idle", // Initialstatus basierend auf content
    error: null,
    audioUrl: content || null,
  }));

  const { updateBlockContent } = useBlocksStore();
  const { supabase } = useSupabase();

  // --- Zustand bei Inhaltsänderung aktualisieren ---
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      status: content ? "success" : "idle",
      audioUrl: content || null,
      error: null, // Fehler zurücksetzen bei neuer URL
    }));
  }, [content]);

  // --- Zustand beim Unmount bereinigen ---
  useEffect(() => {
    return () => {
      setState({ status: "idle", error: null, audioUrl: null });
    };
  }, []);

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

  // --- Funktion zum Löschen des Audioinhalts ---
  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // Verhindert das Auswählen des Blocks
      if (!supabase || !state.audioUrl) return;

      // Optional: Datei auch aus Storage löschen (vorsichtig verwenden!)
      // const filePath = state.audioUrl.substring(state.audioUrl.indexOf('public/'));
      // supabase.storage.from('audio').remove([filePath]);

      updateBlockContent(blockId, dropAreaId, "");
      setState({ status: "idle", error: null, audioUrl: null }); // Lokalen Zustand aktualisieren
      toast.info("Audio entfernt.");
    },
    [blockId, dropAreaId, updateBlockContent, state.audioUrl, supabase]
  );

  const processDroppedFile = useCallback(
    async (file: File) => {
      if (!supabase) {
        toast.error("Supabase Client nicht verfügbar.");
        setState((prev) => ({
          ...prev,
          status: "error",
          error: "Upload-Service nicht bereit.",
        }));
        return;
      }
      // --- Zustand auf "uploading" setzen ---
      setState((prev) => ({ ...prev, status: "uploading", error: null }));

      const sanitizedFilename = sanitizeFilename(file.name);
      // --- Eindeutigen Dateipfad generieren (optional, aber empfohlen) ---
      // const uniqueId = uuidv4(); // Erfordert uuid Import: import { v4 as uuidv4 } from "uuid";
      const filePath = `public/${blockId}-${Date.now()}-${sanitizedFilename}`; // Zeitstempel für Eindeutigkeit hinzugefügt

      toast.info(`Lade ${sanitizedFilename} hoch...`);
      console.log(
        `AudioBlock (${blockId}): Starte Upload für ${sanitizedFilename} nach ${filePath}`
      );

      try {
        const { error } = await supabase.storage
          .from("audio")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false, // Upsert auf false setzen, um Überschreiben zu verhindern, wenn Dateiname gleich bleibt
          });

        if (error) {
          // --- Spezifische Fehlerbehandlung für Duplikate (optional) ---
          if (
            error.message.includes(
              "duplicate key value violates unique constraint"
            )
          ) {
            console.warn(
              `AudioBlock (${blockId}): Datei ${filePath} existiert bereits. Überspringe Upload.`
            );
            // Hier könnte man die URL der existierenden Datei abrufen, falls gewünscht
          } else {
            throw error;
          }
        }

        const { data: publicUrlData } = supabase.storage
          .from("audio")
          .getPublicUrl(filePath);

        if (!publicUrlData?.publicUrl) {
          throw new Error("Konnte öffentliche URL nicht abrufen.");
        }

        const newContentUrl = publicUrlData.publicUrl;
        console.log(
          `AudioBlock (${blockId}): Upload erfolgreich. URL: ${newContentUrl}`
        );

        updateBlockContent(blockId, dropAreaId, newContentUrl);
        // --- Zustand auf "success" setzen ---
        setState((prev) => ({
          ...prev,
          status: "success",
          audioUrl: newContentUrl,
          error: null,
        }));
        toast.success(`${sanitizedFilename} erfolgreich hochgeladen!`);
      } catch (error) {
        console.error(`AudioBlock (${blockId}): Fehler beim Upload:`, error);
        const errorMessage =
          (error instanceof Error ? error.message : String(error)) ||
          "Unbekannter Upload-Fehler.";
        // --- Zustand auf "error" setzen ---
        setState((prev) => ({
          ...prev,
          status: "error",
          error: `Fehler: ${errorMessage}`,
        }));
        toast.error(`Upload fehlgeschlagen: ${errorMessage}`);
      }
      // 'finally' wird nicht mehr benötigt, da der Status in try/catch gesetzt wird
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

  const isActive = isOver && canDrop; // Umbenannt von isActiveDrop zu isActive für Konsistenz

  // --- Fall: Kein Audioinhalt (Placeholder) ---
  if (
    !state.audioUrl &&
    (state.status === "idle" || state.status === "error")
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          "group relative flex aspect-video min-h-[60px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-2 transition-colors duration-200",
          // --- Styling an ImageBlock angepasst ---
          isActive
            ? "border-primary bg-primary/10" // Aktiv beim Hovern mit passender Datei
            : canDrop
            ? "border-primary/50" // Zeigt an, dass hier abgelegt werden kann
            : "border-transparent bg-muted", // Standard-Placeholder-Stil
          isDragging && "opacity-50",
          isSelected && !isActive && "ring-2 ring-rose-500", // Selektionsring (Rose beibehalten)
          state.status === "error" &&
            !isActive &&
            "border-destructive bg-destructive/10" // Fehlerstil
        )}
        onClick={onSelect}
        role="button"
        aria-label="Audio Block Platzhalter"
      >
        {/* --- Upload-Indikator (Overlay-Stil) --- */}
        {state.status === ("uploading" as string) && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm font-medium text-primary">
              Wird hochgeladen...
            </p>
          </div>
        )}

        {/* --- Fehleranzeige (Overlay-Stil) --- */}
        {state.status === "error" && !isActive && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 text-center text-destructive">
            <AlertCircle className="h-8 w-8 mb-1" />
            <p className="text-sm font-medium mb-1">Upload fehlgeschlagen</p>
            <p className="text-xs">{state.error}</p>
          </div>
        )}

        {/* --- Aktiver Drop-Bereich (Overlay) --- */}
        {canDrop && (
          <div
            className={cn(
              "absolute inset-0 z-30 flex flex-col items-center justify-center transition-opacity duration-200",
              isActive ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          >
            <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm rounded-lg border-2 border-primary"></div>
            <UploadCloud className="h-10 w-10 mb-2 text-primary" />
            <p className="text-sm font-medium text-primary">
              Audio hier ablegen
            </p>
          </div>
        )}

        {/* --- Standard-Placeholder-Inhalt (nur sichtbar wenn idle) --- */}
        {state.status === "idle" && !isActive && (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground">
            <UploadCloud
              className={cn(
                "h-10 w-10 mb-2 transition-colors",
                "text-muted-foreground/50" // Standardfarbe
              )}
            />
            <p className="text-sm font-medium">
              Audio hierher ziehen oder{" "}
              <span className="text-primary">hochladen</span>
            </p>
            {/* <p className="text-xs mt-1">Zusätzliche Info...</p> */}
          </div>
        )}
      </div>
    );
  }

  // --- Fall: Audioinhalt vorhanden ---
  return (
    <div
      ref={ref}
      className={cn(
        "group relative rounded-xl", // rounded-xl für Konsistenz
        isDragging && "opacity-50",
        // --- Selektions- und Drop-Hervorhebung ---
        isSelected && !isActive && "ring-2 ring-rose-500", // Rose beibehalten für Selektion
        isActive && "ring-2 ring-primary border-primary bg-primary/10" // Primärfarbe für Drop
      )}
      onClick={onSelect}
      aria-label="Audio Block Player Container"
    >
      {/* --- Löschen-Button --- */}
      {state.audioUrl && state.status !== "uploading" && (
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 z-40 p-1 bg-background/80 hover:bg-background rounded-full shadow-sm"
          aria-label="Audio löschen"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* --- Upload-Overlay (wenn über vorhandenes Audio hochgeladen wird) --- */}
      {state.status === "uploading" && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-primary font-medium">Lädt hoch...</p>
        </div>
      )}

      {/* --- Aktiver Drop-Bereich Overlay (über vorhandenem Player) --- */}
      {isActive && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-primary/20 backdrop-blur-sm rounded-xl border-2 border-primary">
          <UploadCloud className="h-10 w-10 mb-2 text-primary" />
          <p className="text-sm font-medium text-primary bg-primary/80 px-2 py-1 rounded">
            Audio ersetzen
          </p>
        </div>
      )}

      {/* --- Der eigentliche Audio-Player --- */}
      {state.audioUrl && (
        <ModernAudioPlayer url={state.audioUrl} key={state.audioUrl} /> // key hinzugefügt für sauberes Remounting bei URL-Änderung
      )}
    </div>
  );
}
