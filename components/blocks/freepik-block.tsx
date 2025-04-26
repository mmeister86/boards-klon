import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FreepikPicker } from "./freepik/FreepikPicker";
import { FreepikPlayer } from "./freepik/FreepikPlayer";
import { ImageIcon } from "lucide-react";
import type { FreepikBlock } from "@/lib/types";
import { useBlocksStore } from "@/store/blocks-store";

interface FreepikBlockProps {
  blockId: string;
  layoutId: string;
  zoneId: string;
  content: FreepikBlock["content"];
  isSelected?: boolean;
}

export function FreepikBlock({
  blockId,
  layoutId,
  zoneId,
  content,
  isSelected = false,
}: FreepikBlockProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const { updateBlockContent } = useBlocksStore();

  // Handler für die Medienauswahl
  const handleSelect = (media: NonNullable<FreepikBlock["content"]>) => {
    updateBlockContent(blockId, layoutId, zoneId, "", {
      content: media,
    });
    setIsPickerOpen(false);
  };

  // Refaktorieren: Den Dialog immer rendern, aber die Anzeige
  // des Buttons oder des Players vom 'content'-Status abhängig machen.
  return (
    <>
      {!content ? (
        // Wenn kein Inhalt da ist, zeige den Button
        <Button
          variant="outline"
          className="w-full h-32 flex flex-col items-center justify-center gap-2"
          onClick={(e) => {
            console.log("Freepik placeholder button clicked");
            e.stopPropagation();
            console.log("Event propagation stopped. Setting picker open...");
            setIsPickerOpen(true);
            console.log("Picker open state set to true");
          }}
        >
          <div className="flex gap-2">
            <ImageIcon className="w-6 h-6" />
          </div>
          <span>Wähle ein Stockfoto von Freepik aus</span>
        </Button>
      ) : (
        // Wenn Inhalt da ist, zeige den Player
        <div
          className="relative cursor-pointer"
          onClick={() => !isSelected && setIsPickerOpen(true)} // Erlaube auch hier, den Picker zum Ändern zu öffnen
        >
          <FreepikPlayer media={content} isPreview={!isSelected} />
          {!isSelected && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-white">Medium ändern</span>
            </div>
          )}
        </div>
      )}

      {/* Der Dialog wird jetzt immer gerendert, aber durch 'isPickerOpen' gesteuert */}
      <Dialog open={isPickerOpen} onOpenChange={setIsPickerOpen}>
        <DialogContent className="max-w-3xl">
          {/* Füge Header, Titel und Beschreibung für Barrierefreiheit hinzu */}
          <DialogHeader>
            <DialogTitle className="sr-only">
              Freepik Medium auswählen
            </DialogTitle>
            <DialogDescription className="sr-only">
              Suche nach Bildern oder Videos von Freepik und wähle eines aus, um
              es dem Inhalt hinzuzufügen.
            </DialogDescription>
          </DialogHeader>
          <FreepikPicker
            onSelect={handleSelect}
            onClose={() => setIsPickerOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
