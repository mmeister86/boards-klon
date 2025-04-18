/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, forwardRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Loader2, AlertCircle } from "lucide-react";

// Props für die vereinfachte Komponente
interface ImageBlockProps {
  // blockId, layoutId, zoneId werden nicht mehr direkt benötigt
  src: string | null | undefined; // Die Bild-URL
  altText?: string;
}

export const ImageBlock = forwardRef<HTMLDivElement, ImageBlockProps>(
  ({ src, altText }, ref) => {
    const [status, setStatus] = useState<"loading" | "success" | "error">(
      src ? "loading" : "error" // Initial status based on src
    );
    const [internalSrc, setInternalSrc] = useState<string | null>(src ?? null);

    // Update internal state if src prop changes
    useEffect(() => {
      setInternalSrc(src ?? null);
      setStatus(src ? "loading" : "error");
    }, [src]);

    // Wenn keine src vorhanden ist, zeige einen Platzhalter oder nichts
    if (!internalSrc) {
      return (
        <div
          ref={ref}
          className="flex items-center justify-center p-4 min-h-[100px] border border-dashed border-border rounded-md bg-muted/20 text-muted-foreground"
        >
          Kein Bild ausgewählt
        </div>
      );
    }

    // Rendering des Bildes mit Lade- und Fehlerstatus
    return (
      <div ref={ref} className="relative w-full min-h-[100px]">
        {status === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}
        {status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/10 text-destructive p-4">
            <AlertCircle className="w-8 h-8 mb-2" />
            <span>Bild konnte nicht geladen werden</span>
          </div>
        )}
        {/* Das eigentliche Bild wird immer gerendert, aber bei Bedarf überlagert */}
        <Image
          key={internalSrc} // Force re-render on src change
          src={internalSrc}
          alt={altText || "Bild"} // Default alt text
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={cn(
            "transition-opacity duration-300 ease-in-out object-contain",
            status === "loading" ? "opacity-50" : "opacity-100",
            status === "error" ? "opacity-0" : "opacity-100" // Hide if error overlay is shown
          )}
          onLoad={() => {
            console.log(`Image loaded: ${internalSrc}`);
            setStatus("success");
          }}
          onError={() => {
            console.error(`Error loading image: ${internalSrc}`);
            setStatus("error");
          }}
        />
      </div>
    );
  }
);

ImageBlock.displayName = "ImageBlock";
