"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useMediaLibrary } from "@/hooks/useMediaLibrary";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import MediaSearch from "./MediaSearch";
import MediaCategory from "./categories/MediaCategory";
import UploadZone from "./upload/UploadZone";

export default function MediathekView() {
  const { session } = useSupabase();
  const router = useRouter();

  const {
    mediaItems,
    filteredMedia,
    isLoading,
    searchQuery,
    setSearchQuery,
    handleDelete,
    fetchMediaItems,
    deletingItemId,
  } = useMediaLibrary();

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
            <div className="space-y-8">
              {mediaItems.length > 0 && (
                <>
                  <MediaCategory
                    type="image"
                    items={filteredMedia}
                    onDelete={handleDelete}
                    deletingItemId={deletingItemId}
                  />
                  <MediaCategory
                    type="video"
                    items={filteredMedia}
                    onDelete={handleDelete}
                    deletingItemId={deletingItemId}
                  />
                  <MediaCategory
                    type="audio"
                    items={filteredMedia}
                    onDelete={handleDelete}
                    deletingItemId={deletingItemId}
                  />
                  <MediaCategory
                    type="document"
                    items={filteredMedia}
                    onDelete={handleDelete}
                    deletingItemId={deletingItemId}
                  />
                  {filteredMedia.length === 0 && !isLoading && (
                    <p className="text-muted-foreground text-center py-4">
                      Keine Medien für Ihre Suche gefunden.
                    </p>
                  )}
                </>
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
        isEmpty={mediaItems.length === 0}
        processingProgress={processingProgress}
      />
    </>
  );
}
