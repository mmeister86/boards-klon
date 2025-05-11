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
import UpLoader from "@/components/uploading";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link as LinkIcon } from "lucide-react";
import WaveSurfer from "wavesurfer.js";
import Image from "next/image";

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
  layoutId: string;
  zoneId: string;
  content: string | null;
  isSelected?: boolean;
  onSelect?: () => void;
}

// --- Component Implementation ---
export function AudioBlock({
  blockId,
  layoutId,
  zoneId,
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

  // --- NEU: State für Upload-Fortschritt und Timeout ---
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // Prozentwert 0-100
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- NEU: State für URL-Eingabe und Fehler ---
  const [audioUrlInput, setAudioUrlInput] = useState("");
  const [placeholderError, setPlaceholderError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // --- NEU: Ref für Waveform-Container ---
  const waveformRef = useRef<HTMLDivElement | null>(null);
  // --- NEU: State für WaveSurfer-Instanz ---
  const [waveSurfer, setWaveSurfer] = useState<WaveSurfer | null>(null);

  // --- NEU: State für Cover-URL (MVP: aus Audio-URL ableiten, z.B. für MP3 mit ?cover=...) ---
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

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

  // --- NEU: Waveform-Initialisierung, wenn Audio-URL vorhanden ---
  useEffect(() => {
    if (state.audioUrl && waveformRef.current) {
      // Nur initialisieren, wenn keine Instanz existiert
      if (!waveSurfer) {
        const ws = WaveSurfer.create({
          container: waveformRef.current,
          waveColor: "#4F4A85",
          progressColor: "#383351",
          url: state.audioUrl,
          height: 48,
          barWidth: 2,
          barGap: 2,
          // Remove responsive property as it's not a valid WaveSurferOptions property
        });
        setWaveSurfer(ws);
      } else {
        // Wenn Instanz existiert, lade ggf. neue URL
        waveSurfer.load(state.audioUrl);
      }
    }
    // Cleanup: Instanz zerstören bei Unmount oder URL-Wechsel
    return () => {
      if (waveSurfer) {
        waveSurfer.destroy();
        setWaveSurfer(null);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.audioUrl]);

  // --- NEU: Cover-Logik (MVP: prüfe auf ?cover=... in der URL) ---
  useEffect(() => {
    if (state.audioUrl) {
      try {
        const urlObj = new URL(state.audioUrl);
        const coverParam = urlObj.searchParams.get("cover");
        if (coverParam) {
          setCoverUrl(coverParam);
        } else {
          setCoverUrl(null);
        }
      } catch {
        setCoverUrl(null);
      }
    } else {
      setCoverUrl(null);
    }
  }, [state.audioUrl]);

  const [{ isDragging }, drag] = useDrag(
    {
      type: ItemTypes.EXISTING_BLOCK,
      item: {
        id: blockId,
        type: "audio",
        content,
        sourceLayoutId: layoutId,
        sourceZoneId: zoneId,
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    },
    [blockId, content, layoutId, zoneId]
  );

  // --- Funktion zum Löschen des Audioinhalts ---
  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // Verhindert das Auswählen des Blocks
      if (!supabase || !state.audioUrl) return;

      // Optional: Datei auch aus Storage löschen (vorsichtig verwenden!)
      // const filePath = state.audioUrl.substring(state.audioUrl.indexOf('public/'));
      // supabase.storage.from('audio').remove([filePath]);

      updateBlockContent(blockId, layoutId, zoneId, "");
      setState({ status: "idle", error: null, audioUrl: null }); // Lokalen Zustand aktualisieren
      toast.info("Audio entfernt.");
    },
    [blockId, layoutId, zoneId, updateBlockContent, state.audioUrl, supabase]
  );

  // --- Angepasste Upload-Logik mit Fortschritts-Polling ---
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
      // --- Dateigrößenprüfung (max. 50MB) ---
      if (file.size > 50 * 1024 * 1024) {
        toast.error("Datei zu groß (max. 50MB).");
        setState((prev) => ({
          ...prev,
          status: "error",
          error: "Datei überschreitet 50MB-Limit.",
        }));
        return;
      }
      setIsUploading(true);
      setUploadProgress(0);
      setShowTimeoutMessage(false);
      setState((prev) => ({ ...prev, status: "uploading", error: null }));
      // --- Timeout-Feedback nach 5s ---
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setShowTimeoutMessage(true), 5000);
      // --- Fortschritts-Polling starten ---
      if (progressIntervalRef.current)
        clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = setInterval(async () => {
        try {
          const res = await fetch("/api/optimize-audio/progress");
          const data = await res.json();
          if (typeof data.progress === "number")
            setUploadProgress(data.progress);
        } catch {
          // Fehler beim Polling ignorieren
        }
      }, 500);

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

        updateBlockContent(blockId, layoutId, zoneId, newContentUrl);
        // --- Zustand auf "success" setzen ---
        setState((prev) => ({
          ...prev,
          status: "success",
          audioUrl: newContentUrl,
          error: null,
        }));
        toast.success(`${sanitizedFilename} erfolgreich hochgeladen!`);
        setUploadProgress(100);
        setIsUploading(false);
        setShowTimeoutMessage(false);
        if (progressIntervalRef.current)
          clearInterval(progressIntervalRef.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
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
        setIsUploading(false);
        setShowTimeoutMessage(false);
        if (progressIntervalRef.current)
          clearInterval(progressIntervalRef.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      }
    },
    [supabase, blockId, layoutId, zoneId, updateBlockContent]
  );

  // --- Cleanup bei Unmount ---
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current)
        clearInterval(progressIntervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

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
    [processDroppedFile]
  );

  drag(ref);
  drop(ref);

  const isActive = isOver && canDrop; // Umbenannt von isActiveDrop zu isActive für Konsistenz

  // --- Handler für URL-Eingabe ---
  const handleUrlSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    setPlaceholderError(null);
    const url = audioUrlInput.trim();
    if (!url) {
      setPlaceholderError("Bitte gib eine gültige Audio-URL ein.");
      return;
    }
    // Einfache Audio-URL-Validierung (mp3, ogg, wav, m4a, flac)
    if (!/^https?:\/\/.+\.(mp3|ogg|wav|m4a|flac)$/i.test(url)) {
      setPlaceholderError(
        "Nur direkte Audio-Links mit gängigen Formaten werden unterstützt."
      );
      return;
    }
    // (MVP) Cover/Metadaten könnten hier geladen werden
    updateBlockContent(blockId, layoutId, zoneId, url);
    setAudioUrlInput("");
  };

  // --- Drag&Drop für externe Links (z.B. MP3-Link auf Block ziehen) ---
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };
  const handleDropLink = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const url = e.dataTransfer.getData("text/plain");
    if (url && /^https?:\/\/.+\.(mp3|ogg|wav|m4a|flac)$/i.test(url)) {
      updateBlockContent(blockId, layoutId, zoneId, url);
    } else {
      setPlaceholderError(
        "Nur direkte Audio-Links mit gängigen Formaten werden unterstützt."
      );
    }
  };

  // --- Platzhalter-UI, wenn kein Audio vorhanden ---
  if (
    !state.audioUrl &&
    (state.status === "idle" || state.status === "error")
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          "group relative flex aspect-video min-h-[60px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-2 transition-colors duration-200",
          isDraggingOver
            ? "border-primary bg-primary/5"
            : isActive
            ? "border-primary bg-primary/10"
            : canDrop
            ? "border-primary/50"
            : "border-transparent bg-muted",
          isDragging && "opacity-50",
          isSelected && !isActive && "ring-2 ring-rose-500",
          state.status === "error" &&
            !isActive &&
            "border-destructive bg-destructive/10"
        )}
        onClick={onSelect}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDropLink}
        role="button"
        aria-label="Audio Block Platzhalter"
      >
        {/* --- Upload-Indikator (Overlay-Stil) --- */}
        {isUploading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
            <UpLoader />
            <p className="mt-2 text-sm text-primary font-medium">
              {uploadProgress > 0 ? `${uploadProgress}%` : "Lädt hoch..."}
            </p>
            {showTimeoutMessage && (
              <p className="text-xs text-muted-foreground mt-1">
                Optimierung kann etwas dauern...
              </p>
            )}
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
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground w-full">
            <UploadCloud
              className={cn(
                "h-10 w-10 mb-2 transition-colors",
                "text-muted-foreground/50"
              )}
            />
            <p className="text-sm font-medium">
              Audio hierher ziehen oder{" "}
              <span className="text-primary">hochladen</span>
            </p>
            {/* --- URL-Eingabe analog VideoBlock --- */}
            <div className="my-4 w-full flex flex-col items-center">
              <form
                onSubmit={handleUrlSubmit}
                className="flex gap-2 items-center w-full justify-center"
              >
                <LinkIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <Input
                  type="url"
                  placeholder="Audio-URL einfügen (z.B. https://... .mp3)"
                  value={audioUrlInput}
                  onChange={(e) => setAudioUrlInput(e.target.value)}
                  className="flex-grow"
                  disabled={isUploading}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={isUploading || !audioUrlInput.trim()}
                >
                  Hinzufügen
                </Button>
              </form>
              {/* Fehleranzeige für URL/Drag&Drop */}
              {placeholderError && (
                <p className="mt-2 text-center text-sm text-red-500">
                  {placeholderError}
                </p>
              )}
            </div>
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

      {/* --- Im Render-Teil: Zeige Cover, wenn vorhanden, sonst Waveform --- */}
      {state.audioUrl &&
        (coverUrl ? (
          <Image
            src={coverUrl}
            alt="Audio Cover"
            width={512}
            height={128}
            className="w-full h-32 object-cover rounded-md my-2"
            style={{ maxHeight: 128 }}
            priority={false}
          />
        ) : (
          <div ref={waveformRef} className="w-full h-12 my-2" />
        ))}
    </div>
  );
}
