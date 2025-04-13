import { useState, useCallback } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useRouter } from "next/navigation";
import { MediaItem, OptimizeApiResponse, ErrorApiResponse } from "@/types/mediathek";
import { getImageDimensions, isFileSizeValid } from "@/utils/media";

export const useMediaUpload = (onUploadComplete?: () => void) => {
  const { user, supabase } = useSupabase();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const router = useRouter();

  const handleUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    let timeoutTimer: NodeJS.Timeout | null = null;
    let progressTimer: NodeJS.Timeout | null = null;

    try {
      if (!user || !supabase) {
        toast.error("Sie müssen angemeldet sein, um Dateien hochzuladen");
        router.push("/auth/login");
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);
      setProcessingProgress(0);
      setShowTimeoutMessage(false);

      const totalFiles = files.length;
      let uploadedCount = 0;

      // Zeige Timeout-Nachricht für Video/Audio-Uploads
      const hasSlowUploads = Array.from(files).some(
        (file) => file.type.startsWith("video/") || file.type.startsWith("audio/")
      );
      if (hasSlowUploads) {
        timeoutTimer = setTimeout(() => {
          if (isUploading) {
            setShowTimeoutMessage(true);
          }
        }, 10000); // Reduced to 10 seconds
      }

      for (const file of Array.from(files)) {
        try {
          // Größenprüfung
          if (!isFileSizeValid(file)) {
            toast.error(`${file.name} ist zu groß (Max: 100MB)`);
            continue;
          }

          // Start progress polling for video files
          if (file.type.startsWith("video/")) {
            const progressStartTime = Date.now();
            progressTimer = setInterval(async () => {
              try {
                const response = await fetch("/api/optimize-video/progress");
                if (!response.ok) {
                  console.error("Progress fetch failed:", response.status);
                  return;
                }
                const data = await response.json();

                if (data.progress !== undefined) {
                  const progress = parseInt(data.progress);
                  if (!isNaN(progress)) {
                    setProcessingProgress(progress);
                  }
                }

                // Check timeout conditions OUTSIDE of the progress check
                const timeElapsed = Date.now() - progressStartTime;
                if (timeElapsed > 10000 || (data.progress && data.progress >= 30)) {
                  setShowTimeoutMessage(true);
                }
              } catch (error) {
                console.error("Error fetching progress:", error);
              }
            }, 1000);
          }

          const result = await uploadFile(file);
          if (result) {
            toast.success(
              `${file.name} erfolgreich ${
                file.type.startsWith("video/") ||
                file.type.startsWith("audio/") ||
                file.type === "application/pdf"
                  ? "optimiert und"
                  : ""
              } hochgeladen`
            );
          }
        } catch (error) {
          console.error(`Upload error for ${file.name}:`, error);
          const message = error instanceof Error ? error.message : "Unbekannter Fehler";
          toast.error(`Fehler bei ${file.name}: ${message}`);
        } finally {
          uploadedCount++;
          setUploadProgress((uploadedCount / totalFiles) * 100);
          if (progressTimer) {
            clearInterval(progressTimer);
            progressTimer = null;
          }
        }
      }

      // Call onUploadComplete callback after all files are processed
      onUploadComplete?.();
    } catch (error) {
      console.error("Upload process error:", error);
      toast.error("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    } finally {
      setIsUploading(false);
      setUploadProgress(100);
      setProcessingProgress(0);
      if (timeoutTimer) clearTimeout(timeoutTimer);
      if (progressTimer) clearInterval(progressTimer);
      setShowTimeoutMessage(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, supabase, router, onUploadComplete]);

  const uploadFile = async (file: File): Promise<MediaItem | null> => {
    if (!supabase) {
      throw new Error("Supabase client is not initialized");
    }

    let publicUrl: string | null = null;
    let apiEndpoint: string;
    const formData = new FormData();

    // Bestimme API-Endpunkt basierend auf Dateityp
    if (file.type.startsWith("video/")) {
      apiEndpoint = "/api/optimize-video";
      formData.append("video", file);
    } else if (file.type.startsWith("audio/")) {
      apiEndpoint = "/api/optimize-audio";
      formData.append("audio", file);
    } else if (file.type === "application/pdf") {
      apiEndpoint = "/api/optimize-pdf";
      formData.append("pdf", file);
    } else {
      apiEndpoint = "/api/optimize-image";
      formData.append("file", file);
    }

    if (user?.id) {
      formData.append("userId", user.id);
    }

    const response = await fetch(apiEndpoint, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }

    const result = await response.json() as OptimizeApiResponse | ErrorApiResponse;

    if ("error" in result) {
      throw new Error(result.error);
    }

    // Extrahiere URLs aus der API-Antwort
    if (file.type.startsWith("video/") ||
        file.type.startsWith("audio/") ||
        file.type === "application/pdf") {
      publicUrl = result.storageUrl ?? null;
    } else {
      publicUrl = result.publicUrl ?? null;
    }

    if (!publicUrl) {
      throw new Error("No URL received from server");
    }

    // Hole Bilddimensionen wenn nötig
    const dimensions = await getImageDimensions(file);

    // Erstelle Medienelement
    const mediaItem: MediaItem = {
      id: uuidv4(),
      file_name: file.name,
      file_type: file.type,
      url: publicUrl,
      size: file.size,
      width: dimensions.width || null,
      height: dimensions.height || null,
      user_id: user?.id || null,
      uploaded_at: new Date().toISOString(),
      preview_url: file.type === "application/pdf" ? result.previewUrl : null,
      preview_url_512: result.previewUrl512 || null,
      preview_url_128: result.previewUrl128 || null,
    };

    // Speichere in Datenbank
    const { error: dbError } = await supabase
      .from("media_items")
      .insert(mediaItem);

    if (dbError) {
      throw dbError;
    }

    return mediaItem;
  };

  return {
    handleUpload,
    isUploading,
    uploadProgress,
    processingProgress,
    showTimeoutMessage,
  };
};
