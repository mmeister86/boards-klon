import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

interface FreepikPickerProps {
  onSelect: (media: FreepikMedia) => void;
  onClose: () => void;
}

interface FreepikMedia {
  id: string;
  type: "photo";
  title: string;
  thumbnail: string;
  url: string;
  author?: string;
  premium?: boolean;
  mediaItemId?: string; // ID des Medienelements in der Mediathek
}

export function FreepikPicker({ onSelect, onClose }: FreepikPickerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<FreepikMedia[]>([]);
  const [isDownloading, setIsDownloading] = useState<string | null>(null); // ID des Bildes, das gerade heruntergeladen wird
  
  // Debug-Effekt, der den Download-Status überwacht
  useEffect(() => {
    console.log("Download status changed:", isDownloading);
  }, [isDownloading]);
  const { toast } = useToast();

  // Suche nach Freepik-Medien
  const searchFreepik = async () => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/freepik/search?q=${encodeURIComponent(searchTerm)}`
      );
      const data = await response.json();

      if (data.error) {
        throw new Error(data.message);
      }

      setResults(data.items);
    } catch (err: unknown) {
      const error = err as Error;
      toast({
        title: "Fehler",
        description: error.message || "Beim Suchen ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handler für die Medienauswahl
  const handleSelect = async (media: FreepikMedia) => {
    // Download-Status setzen und dem Benutzer Feedback geben
    console.log("Downloading media:", media.id);
    setIsDownloading(media.id);
    toast({
      title: "Herunterladen...",
      description: "Das Bild wird heruntergeladen und optimiert",
    });
    
    try {
      const response = await fetch("/api/freepik/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: media.id }),
      });
      const data = await response.json();

      if (data.error) {
        // Spezielle Fehlerbehandlung (vereinfacht)
        if (data.error === "PREMIUM_CONTENT") {
          toast({
            title: "Fehler",
            description: data.message || "Fehler beim Laden des Bildes",
            variant: "destructive"
          });
          return; // Keinen weiteren Fehler werfen
        }
        throw new Error(data.message);
      }

      // Verarbeite erfolgreich heruntergeladene Bilder (auch teilweise erfolgreiche)
      if (data.downloadUrl) {
        // Wenn ein mediaItem in der Antwort enthalten ist, nutze dieses
        if (data.mediaItem) {
          onSelect({ 
            ...media, 
            url: data.downloadUrl,
            mediaItemId: data.mediaItem.id // Speichere die ID des Medienelements
          });
        } else {
          // Fallback auf Download-URL ohne Media-Item-ID
          console.log("Using fallback without mediaItemId:", data.partialSuccess ? "(partial success)" : "");
          onSelect({ ...media, url: data.downloadUrl });
        }
      } else {
        throw new Error("Keine Download-URL in der Antwort");
      }
      // Erfolgsmeldung anzeigen
      toast({
        title: "Erfolgreich",
        description: "Das Bild wurde in Ihrer Mediathek gespeichert",
        variant: "default",
      });
      
      onClose();
    } catch (err: unknown) {
      const error = err as Error;
      toast({
        title: "Fehler",
        description:
          error.message || "Das Medium konnte nicht heruntergeladen werden.",
        variant: "destructive",
      });
    } finally {
      // In jedem Fall den Download-Status zurücksetzen
      setIsDownloading(null);
    }
  };

  // Debug Ausgabe des aktuellen Status
  console.log("Current download state:", { 
    isDownloading, 
    itemsCount: results.length,
    itemsWithDownloadingState: results.filter(m => m.id === isDownloading).length
  });

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-medium">Freepik Bilder</h3>

      <div className="flex gap-2">
        <Input
          placeholder="Suche nach Medien..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && searchFreepik()}
        />
        <Button onClick={searchFreepik} disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin" /> : "Suchen"}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 max-h-[500px] overflow-y-auto">
        {results.map((media) => (
          <div
            key={media.id}
            className={`relative group aspect-video ${isDownloading === media.id ? 'cursor-wait opacity-70' : 'cursor-pointer'}`}
            onClick={() => isDownloading ? null : handleSelect(media)}
          >
            <Image
              src={media.thumbnail}
              alt={media.title}
              fill
              className="object-cover rounded-md"
              sizes="(max-width: 768px) 33vw, 20vw"
            />
            {media.type === "video" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white">▶</span>
              </div>
            )}
            {/* Hier ist ein bedingtes Rendering für den Ladezustand */}
            {isDownloading === media.id ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-8 w-8 rounded-full border-t-2 border-r-2 border-white animate-spin"></div>
                  <span className="text-white text-sm mt-2 font-medium">Verarbeite...</span>
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
