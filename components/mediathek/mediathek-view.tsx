"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useMediaLibrary, type MediaItem } from "@/hooks/useMediaLibrary";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import MediaSearch from "./MediaSearch";
import MediaCategory from "./categories/MediaCategory";
import UploadZone from "./upload/UploadZone";

export default function MediathekView({
  initialMediaItems,
}: {
  initialMediaItems?: MediaItem[];
}) {
  const { session } = useSupabase();
  const router = useRouter();

  const {
    mediaItems,
    groupedMedia,
    isLoading,
    searchQuery,
    setSearchQuery,
    handleDelete,
    fetchMediaItems,
    deletingItemId,
  } = useMediaLibrary(initialMediaItems);

  const {
    handleUpload,
    isUploading,
    uploadProgress,
    showTimeoutMessage,
    processingProgress,
  } = useMediaUpload(fetchMediaItems);

  // Redirect wenn keine Session
  useEffect(() => {
    if (!session && !isLoading) {
      router.push("/auth/login");
    }
  }, [session, isLoading, router]);

  // Filtere die gruppierten Medien basierend auf der Suchanfrage
  const filterGroupedMedia = (
    grouped: Record<string, MediaItem[]>,
    query: string
  ): Record<string, MediaItem[]> => {
    if (!query) {
      return grouped; // Wenn keine Suche, gib die ursprüngliche Gruppierung zurück
    }
    const lowerCaseQuery = query.toLowerCase();
    const filteredGrouped: Record<string, MediaItem[]> = {};
    for (const type in grouped) {
      filteredGrouped[type] = grouped[type].filter((item) =>
        item.file_name.toLowerCase().includes(lowerCaseQuery)
      );
    }
    return filteredGrouped;
  };

  const displayMedia = filterGroupedMedia(groupedMedia, searchQuery);

  const hasAnyMedia = Object.values(displayMedia).some((arr) => arr.length > 0);

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mediathek</h1>
        <MediaSearch query={searchQuery} onQueryChange={setSearchQuery} />
      </div>

      <div className="flex gap-8">
        <div className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-6 mt-10">
              {mediaItems.length > 0 ? (
                <>
                  <MediaCategory
                    type="image"
                    items={displayMedia.image || []}
                    onDelete={handleDelete}
                    deletingItemId={deletingItemId}
                  />
                  <MediaCategory
                    type="video"
                    items={displayMedia.video || []}
                    onDelete={handleDelete}
                    deletingItemId={deletingItemId}
                  />
                  <MediaCategory
                    type="audio"
                    items={displayMedia.audio || []}
                    onDelete={handleDelete}
                    deletingItemId={deletingItemId}
                  />
                  <MediaCategory
                    type="document"
                    items={displayMedia.document || []}
                    onDelete={handleDelete}
                    deletingItemId={deletingItemId}
                  />
                  {searchQuery && !hasAnyMedia && !isLoading && (
                    <p className="text-muted-foreground text-center py-4">
                      Keine Medien für Deine Suche gefunden.
                    </p>
                  )}
                </>
              ) : (
                !isUploading && (
                  <p className="text-muted-foreground text-center py-4">
                    Deine Mediathek ist leer. Du kannst hier Bilder, Videos,
                    Audios und Dokumente hochladen.
                  </p>
                )
              )}
            </div>
          )}
        </div>
      </div>

      <UploadZone
        onUpload={handleUpload}
        isUploading={isUploading}
        progress={uploadProgress}
        showTimeoutMessage={showTimeoutMessage}
        isEmpty={mediaItems.length === 0 && !isLoading}
        processingProgress={processingProgress}
      />
    </>
  );
}
