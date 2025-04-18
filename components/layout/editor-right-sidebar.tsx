/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable jsx-a11y/alt-text */
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSupabase } from "@/components/providers/supabase-provider";
import { toast } from "sonner";
import {
  ImageIcon,
  Film as VideoIcon,
  Music as AudioIcon,
  FileText as DocumentIcon,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { DraggableMediaItem } from "@/components/media/draggable-media-item";

// MediaItem Interface
interface MediaItem {
  id: string;
  file_name: string;
  file_type: string;
  url: string;
  uploaded_at: string;
  size: number;
  width?: number;
  height?: number;
  preview_url_512?: string | null;
  preview_url_128?: string | null;
}

// Funktion zum Rendern eines einzelnen Medienelements
// Nutzt jetzt DraggableMediaItem, um das Element ziehbar zu machen
const renderMediaItem = (item: MediaItem) => {
  let iconContent;
  const commonClasses = "h-8 w-8 text-foreground/80";

  // Für die Sidebar-Vorschau verwenden wir wieder preview_url_128
  const previewSrc = item.preview_url_128 || item.url;

  if (item.file_type.startsWith("image/")) {
    iconContent = (
      // Das Bild nutzt jetzt die volle Grid-Fläche, bleibt scharf und ist nicht zu klein
      <div className="relative w-full h-full aspect-square">
        <Image
          src={previewSrc}
          alt={item.file_name}
          fill // Bild füllt das Elternelement komplett aus
          className="object-cover rounded-lg"
          loading="lazy"
        />
      </div>
    );
  } else if (item.file_type.startsWith("video/")) {
    if (item.preview_url_128) {
      iconContent = (
        <div className="relative w-full h-full aspect-square">
          <Image
            src={item.preview_url_128}
            alt={`${item.file_name} preview`}
            fill
            className="object-cover rounded-lg"
            loading="lazy"
          />
        </div>
      );
    } else {
      iconContent = <VideoIcon className={commonClasses} />;
    }
  } else if (item.file_type.startsWith("audio/")) {
    iconContent = <AudioIcon className={commonClasses} />;
  } else {
    iconContent = <DocumentIcon className={commonClasses} />;
  }

  return (
    // Das visuelle Element wird von DraggableMediaItem umhüllt
    <DraggableMediaItem key={item.id} item={item}>
      {/* Der bisherige Container wird jetzt als Kind von DraggableMediaItem gerendert */}
      <div
        className="aspect-square flex items-center justify-center border border-border rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden hover:scale-105"
        title={item.file_name}
      >
        {iconContent}
      </div>
    </DraggableMediaItem>
  );
};

// Helper function to render a media category section (aus LeftSidebar kopiert)
const renderMediaCategorySection = (
  title: string,
  items: MediaItem[],
  displayedItems: MediaItem[],
  showAllState: boolean,
  setShowAllState: React.Dispatch<React.SetStateAction<boolean>>
) => {
  // Rendert die Kategorie-Sektion nur, wenn Elemente vorhanden sind
  if (items.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-5">{title}</h2>
      <div className="grid grid-cols-2 gap-3">
        {displayedItems.map(renderMediaItem)}
      </div>
      {items.length > 4 && (
        <button
          onClick={() => setShowAllState(!showAllState)}
          className="w-full mt-4 p-2 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors flex items-center justify-center gap-1"
        >
          {showAllState ? (
            <>
              Weniger anzeigen <ChevronUp size={16} />
            </>
          ) : (
            <>
              Mehr anzeigen ({items.length - 4}) <ChevronDown size={16} />
            </>
          )}
        </button>
      )}
    </div>
  );
};

// EditorRightSidebar component now contains the Media Library
export function EditorRightSidebar() {
  const { user, supabase } = useSupabase();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(true);

  // Separate state for expanding each media category
  const [showAllImages, setShowAllImages] = useState(false);
  const [showAllVideos, setShowAllVideos] = useState(false);
  const [showAllAudio, setShowAllAudio] = useState(false);
  const [showAllDocuments, setShowAllDocuments] = useState(false);

  // Fetch Media Items (aus LeftSidebar kopiert)
  useEffect(() => {
    if (!supabase || !user) {
      setIsLoadingMedia(false);
      return;
    }

    async function fetchMediaItems() {
      if (!supabase || !user) return;
      try {
        setIsLoadingMedia(true);
        const { data, error } = await supabase
          .from("media_items")
          .select("*")
          .eq("user_id", user.id)
          .order("uploaded_at", { ascending: false });

        if (error) throw error;
        setMediaItems(data || []);
      } catch (error) {
        console.error("Error fetching media items:", error);
        toast.error("Fehler beim Laden der Medien");
      } finally {
        setIsLoadingMedia(false);
      }
    }

    fetchMediaItems();

    // Real-time subscription (aus LeftSidebar kopiert)
    const channel = supabase
      .channel("media_items_right_sidebar_changes") // Eindeutiger Channel-Name für diese Sidebar
      .on<MediaItem>(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "media_items",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Right Sidebar Real-time update received:", payload);
          // Update state based on payload
          if (payload.eventType === "INSERT") {
            setMediaItems((currentItems) =>
              [payload.new as MediaItem, ...currentItems].sort(
                (a, b) =>
                  new Date(b.uploaded_at).getTime() -
                  new Date(a.uploaded_at).getTime()
              )
            );
          } else if (payload.eventType === "UPDATE") {
            setMediaItems((currentItems) =>
              currentItems.map((item) =>
                item.id === payload.old.id
                  ? { ...item, ...(payload.new as MediaItem) }
                  : item
              )
            );
          } else if (payload.eventType === "DELETE") {
            setMediaItems((currentItems) =>
              currentItems.filter((item) => item.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [supabase, user]);

  // Filter media items by type (aus LeftSidebar kopiert)
  const imageItems = mediaItems.filter((item) =>
    item.file_type.startsWith("image/")
  );
  const videoItems = mediaItems.filter((item) =>
    item.file_type.startsWith("video/")
  );
  const audioItems = mediaItems.filter((item) =>
    item.file_type.startsWith("audio/")
  );
  const documentItems = mediaItems.filter(
    (item) =>
      !item.file_type.startsWith("image/") &&
      !item.file_type.startsWith("video/") &&
      !item.file_type.startsWith("audio/")
  );

  // Determine which items to display for each category (aus LeftSidebar kopiert)
  const displayedImages = showAllImages ? imageItems : imageItems.slice(0, 4);
  const displayedVideos = showAllVideos ? videoItems : videoItems.slice(0, 4);
  const displayedAudio = showAllAudio ? audioItems : audioItems.slice(0, 4);
  const displayedDocuments = showAllDocuments
    ? documentItems
    : documentItems.slice(0, 4);

  return (
    // Angepasste Klassen für die rechte Sidebar
    <div className="w-[300px] bg-background border-l border-border flex flex-col h-full">
      {/* Container für den Inhalt mit Padding und Scroll-Verhalten */}
      <div className="flex-1 overflow-y-auto p-5 pt-20 flex flex-col gap-8">
        {/* Media Library Sections - Rendered individually */}
        {isLoadingMedia && (
          <div className="flex justify-center items-center h-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {/* Render media category sections using the helper function */}
        {renderMediaCategorySection(
          "Bilder",
          imageItems,
          displayedImages,
          showAllImages,
          setShowAllImages
        )}
        {renderMediaCategorySection(
          "Videos",
          videoItems,
          displayedVideos,
          showAllVideos,
          setShowAllVideos
        )}
        {renderMediaCategorySection(
          "Audio",
          audioItems,
          displayedAudio,
          showAllAudio,
          setShowAllAudio
        )}
        {renderMediaCategorySection(
          "Dokumente",
          documentItems,
          displayedDocuments,
          showAllDocuments,
          setShowAllDocuments
        )}

        {/* Display message if no media found at all after loading */}
        {!isLoadingMedia && mediaItems.length === 0 && (
          <p className="text-sm text-muted-foreground text-center">
            Keine Medien gefunden.
          </p>
        )}
      </div>
    </div>
  );
}
