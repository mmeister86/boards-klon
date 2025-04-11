"use client";

import { useState, useEffect } from "react";
import {
  Image as LucideImage,
  Video,
  Music,
  FileText,
  Search,
  Loader2,
  Upload,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useRouter } from "next/navigation";
import UpLoader from "@/components/uploading";

// Define expected API response types
interface OptimizeApiResponse {
  message: string;
  optimizedUrl?: string; // Optional for video API
  publicUrl?: string; // Optional for other API
  storageUrl?: string; // Optional for video API
}

interface ErrorApiResponse {
  error: string;
}

// Updated MediaItem type to match our database schema exactly
interface MediaItem {
  id: string; // UUID stored as string in TypeScript
  file_name: string;
  file_type: string;
  url: string;
  uploaded_at: string | null; // timestamp with time zone can be null
  size: number;
  width: number | null;
  height: number | null;
  user_id: string | null; // UUID stored as string in TypeScript
}

export default function MediathekView() {
  const { user, supabase, session } = useSupabase();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const router = useRouter();
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);

  console.log("MediathekView rendered:", {
    hasUser: !!user,
    userId: user?.id,
    hasSession: !!session,
    hasSupabase: !!supabase,
    timestamp: new Date().toISOString(),
  });

  // Fetch media items from Supabase
  useEffect(() => {
    async function fetchMediaItems() {
      if (!supabase || !user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
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
        setIsLoading(false);
      }
    }

    fetchMediaItems();
  }, [user, supabase]);

  // Redirect if no session
  useEffect(() => {
    if (!session && !isLoading) {
      router.push("/auth/login");
    }
  }, [session, isLoading, router]);

  // Filter media based on search query
  const filteredMedia = mediaItems.filter((item) =>
    item.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group media items by type
  const groupedMedia = mediaItems.reduce((acc, item) => {
    const type = item.file_type.startsWith("image/")
      ? "image"
      : item.file_type.startsWith("video/")
      ? "video"
      : item.file_type.startsWith("audio/")
      ? "audio"
      : "document";

    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(item);
    return acc;
  }, {} as Record<string, MediaItem[]>);

  // Render media preview with actual image URLs
  const renderMediaPreview = (item: MediaItem) => {
    const type = item.file_type.startsWith("image/")
      ? "image"
      : item.file_type.startsWith("video/")
      ? "video"
      : item.file_type.startsWith("audio/")
      ? "audio"
      : "document";

    const isDeleting = deletingItemId === item.id;

    const DeleteButton = () => (
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-4 right-4 z-50 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => handleDelete(item)}
        disabled={isDeleting}
      >
        {isDeleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </Button>
    );

    switch (type) {
      case "image":
        return (
          <div className="relative aspect-square bg-muted rounded-[30px] overflow-hidden">
            <Image
              src={item.url}
              alt={item.file_name}
              className="object-cover"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <DeleteButton />
          </div>
        );
      case "video":
        return (
          <div className="relative aspect-video bg-muted rounded-[30px] overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <Video className="h-8 w-8 text-muted-foreground" />
            </div>
            <DeleteButton />
          </div>
        );
      case "audio":
        return (
          <div className="relative aspect-square bg-muted rounded-[30px] overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <Music className="h-8 w-8 text-muted-foreground" />
            </div>
            <DeleteButton />
          </div>
        );
      case "document":
        return (
          <div className="relative aspect-square bg-muted rounded-[30px] overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <DeleteButton />
          </div>
        );
      default:
        return null;
    }
  };

  // Render-Funktion für eine Medienkategorie
  const renderMediaCategory = (
    type: string,
    title: string,
    icon: React.ReactNode
  ) => {
    const items = groupedMedia[type] || [];
    if (items.length === 0) return null;

    const displayItems = items.slice(0, 4);
    const hasMore = items.length > 4;

    return (
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          {icon}
          <h2 className="text-xl font-semibold">{title}</h2>
          <span className="text-sm text-muted-foreground">
            ({items.length})
          </span>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {displayItems.map((item) => (
            <div key={item.id} className="relative group">
              {renderMediaPreview(item)}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-b-[30px]">
                <p className="pl-4 text-sm truncate">{item.file_name}</p>
                {/* <p className="pl-4 text-xs opacity-75">
                  {(item.size / 1024 / 1024).toFixed(1)} MB
                </p> */}
              </div>
            </div>
          ))}
          {hasMore && (
            <Button
              variant="outline"
              className="aspect-square flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
            >
              mehr
            </Button>
          )}
        </div>
      </section>
    );
  };

  // Helper function to determine the appropriate bucket based on file type
  const getBucketForFile = (file: File): string => {
    if (file.type.startsWith("image/")) return "images";
    if (file.type.startsWith("video/")) return "videos";
    if (file.type.startsWith("audio/")) return "audio";
    return "documents";
  };

  // Helper function to get file dimensions (for images)
  const getImageDimensions = async (
    file: File
  ): Promise<{ width: number; height: number }> => {
    if (!file.type.startsWith("image/")) {
      return { width: 0, height: 0 };
    }

    return new Promise((resolve) => {
      const img = new (window.Image as { new (): HTMLImageElement })();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
        });
      };
      img.onerror = () => {
        resolve({ width: 0, height: 0 });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  // Handle file upload using the appropriate API route based on file type
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Declare timeoutTimer outside the try block
    let timeoutTimer: NodeJS.Timeout | null = null;

    try {
      if (!user || !session || !supabase) {
        toast.error("Sie müssen angemeldet sein, um Dateien hochzuladen");
        router.push("/auth/login");
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);
      setShowTimeoutMessage(false); // Reset timeout message on new upload

      const totalFiles = files.length;
      let uploadedCount = 0;

      // Start timeout for the message *if* any videos are being uploaded
      const hasVideos = Array.from(files).some((file) =>
        file.type.startsWith("video/")
      );
      if (hasVideos) {
        timeoutTimer = setTimeout(() => {
          // Only show if still uploading
          if (isUploading) {
            setShowTimeoutMessage(true);
          }
        }, 15000); // Show message after 15 seconds for videos
      }

      for (const file of Array.from(files)) {
        let publicUrl: string | null = null;
        let apiEndpoint: string;
        const formData = new FormData();
        let isVideo = false;

        try {
          // Check file size (50MB limit) - Client-side check remains useful
          if (file.size > 50 * 1024 * 1024) {
            toast.error(`${file.name} ist zu groß (Max: 50MB)`);
            uploadedCount++;
            setUploadProgress((uploadedCount / totalFiles) * 100);
            continue;
          }

          // --- Determine API endpoint and FormData based on file type ---
          if (file.type.startsWith("video/")) {
            console.log(`Mediathek: Preparing video upload for ${file.name}`);
            apiEndpoint = "/api/optimize-video";
            formData.append("video", file); // Use 'video' key for the video API
            if (user?.id) {
              formData.append("userId", user.id);
            } else {
              console.error(
                "Mediathek: User ID missing, cannot determine storage path."
              );
              throw new Error("Authentication error: User ID not found.");
            }
            isVideo = true;
          } else {
            // Assuming non-video files go to tinify/other optimization
            console.log(
              `Mediathek: Preparing non-video upload for ${file.name}`
            );
            apiEndpoint = "/api/tinify-upload";
            formData.append("file", file); // Use 'file' key for the tinify API
          }

          console.log(
            `Mediathek: Calling API route ${apiEndpoint} for ${file.name}`
          );

          // --- Call the determined API route ---
          const response = await fetch(apiEndpoint, {
            method: "POST",
            body: formData,
            credentials: "include",
          });

          // --- Robust Response Handling ---
          let result: OptimizeApiResponse | ErrorApiResponse;

          if (response.ok) {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              result = await response.json();
            } else {
              console.error(
                `Mediathek: API (${apiEndpoint}) returned OK status but non-JSON response. Content-Type: ${contentType}`
              );
              const responseText = await response.text();
              console.error(`Mediathek: API Response Text: ${responseText}`);
              throw new Error(
                `Server returned unexpected response format for ${file.name}.`
              );
            }
          } else {
            console.error(
              `Mediathek: API Route Error (${response.status}) at ${apiEndpoint}.`
            );
            let errorDetail = `Request failed with status ${response.status}`;
            try {
              // Try to parse error response as JSON
              const errorResult: ErrorApiResponse = await response.json();
              errorDetail = errorResult.error || JSON.stringify(errorResult);
            } catch (jsonError) {
              // Log the JSON parsing error
              console.warn(
                "Mediathek: Failed to parse error response as JSON:",
                jsonError
              );
              try {
                // Fallback to reading raw text response
                errorDetail = await response.text();
              } catch (textError) {
                // Log the text reading error
                console.warn(
                  "Mediathek: Failed to read error response text:",
                  textError
                );
              }
            }
            console.error(`Mediathek: API Error Detail: ${errorDetail}`);
            throw new Error(`Failed to process ${file.name}: ${errorDetail}`);
          }

          // --- Logic using the parsed 'result' (now typed) ---
          // Check if the result indicates an error even with a 2xx status
          if ("error" in result) {
            console.error(
              `Mediathek: API returned success status but error message: ${result.error}`
            );
            throw new Error(
              `API reported an error for ${file.name}: ${result.error}`
            );
          }

          // Proceed assuming a successful response structure (OptimizeApiResponse)
          if (isVideo) {
            // Expect 'storageUrl' from the API response now
            publicUrl = (result as OptimizeApiResponse).storageUrl ?? null;
            if (!publicUrl) {
              console.error(
                "Mediathek: Video optimize API response missing storageUrl."
              );
              throw new Error(
                `Video optimization successful for ${file.name}, but response lacked Supabase URL.`
              );
            }
            console.log(
              `Mediathek: Video API success (Supabase URL): ${publicUrl}`
            );
          } else {
            // Expect 'publicUrl' from the other API (e.g., tinify)
            publicUrl = (result as OptimizeApiResponse).publicUrl ?? null;
            if (!publicUrl) {
              console.error(
                "Mediathek: Non-video API response missing publicUrl."
              );
              throw new Error(
                `Upload successful for ${file.name}, but response lacked URL.`
              );
            }
            console.log(
              `Mediathek: Non-video API success for ${file.name}. URL: ${publicUrl}`
            );
          }

          // Get dimensions if it's an image
          const dimensions = await getImageDimensions(file);

          // Prepare the media item data (using the correct publicUrl from Supabase or other source)
          const mediaItemData: Omit<MediaItem, "uploaded_at"> & {
            uploaded_at: string;
          } = {
            id: uuidv4(),
            file_name: file.name,
            file_type: file.type,
            url: publicUrl, // This will now be the Supabase URL for videos
            size: file.size,
            width: dimensions.width || null,
            height: dimensions.height || null,
            user_id: user.id,
            uploaded_at: new Date().toISOString(),
          };

          // Insert into media_items table
          const { data: insertedData, error: dbError } = await supabase
            .from("media_items")
            .insert(mediaItemData)
            .select()
            .single();

          if (dbError) {
            console.error("Database error:", dbError);
            // Consider adding cleanup logic here if needed (e.g., delete from storage)
            throw dbError;
          }

          // Update local state
          setMediaItems((prev) => [insertedData as MediaItem, ...prev]);
          toast.success(
            `${file.name} erfolgreich ${
              isVideo ? "optimiert und" : ""
            } hochgeladen`
          );
        } catch (error) {
          console.error(
            `Mediathek: File processing error for ${file.name}:`,
            error
          );
          const message =
            error instanceof Error ? error.message : "Unbekannter Fehler";
          toast.error(`Fehler bei ${file.name}: ${message}`);
        } finally {
          // Update progress after each file attempt
          uploadedCount++;
          setUploadProgress((uploadedCount / totalFiles) * 100);
        }
      }
    } catch (error) {
      console.error("Mediathek: Upload process error:", error);
      toast.error("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    } finally {
      setIsUploading(false);
      // Ensure progress hits 100% and clear timeout
      setUploadProgress(100);
      if (timeoutTimer) clearTimeout(timeoutTimer); // Now accessible here
      setShowTimeoutMessage(false); // Hide message when done
      // Optional: Reset progress after a short delay
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  // Handle drag and drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files);
  };

  // Helper function to get file path from URL
  const getFilePathFromUrl = (url: string): string => {
    try {
      // Extract everything after /public/[bucket]/
      const matches = url.match(/\/public\/[^/]+\/(.+)$/);
      if (!matches || !matches[1]) {
        throw new Error("Invalid URL format");
      }
      return decodeURIComponent(matches[1]);
    } catch (error) {
      console.error("Error parsing URL:", error);
      throw new Error("Could not extract file path from URL");
    }
  };

  // Update the handleDelete function
  const handleDelete = async (item: MediaItem) => {
    try {
      if (!user || !supabase) {
        toast.error("Sie müssen angemeldet sein, um Medien zu löschen");
        return;
      }

      setDeletingItemId(item.id);

      // Determine bucket based on file type
      const bucket = getBucketForFile({ type: item.file_type } as File);
      const filePath = getFilePathFromUrl(item.url);

      console.log("Starting deletion process for:", {
        id: item.id,
        bucket,
        filePath,
        url: item.url,
        userId: user.id,
      });

      // Delete from storage first
      const { error: storageError } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (storageError) {
        console.error("Storage delete error:", storageError);
        throw storageError;
      }

      console.log(
        "Successfully deleted from storage, now deleting from database..."
      );

      // Delete from database with user_id check for security
      const { error: dbError } = await supabase
        .from("media_items")
        .delete()
        .match({
          id: item.id,
          user_id: user.id,
        });

      if (dbError) {
        console.error("Database delete error:", dbError);
        throw dbError;
      }

      // Update local state
      setMediaItems((prev) => prev.filter((i) => i.id !== item.id));
      toast.error(`${item.file_name} wurde gelöscht`, {
        description: "Die Datei wurde erfolgreich gelöscht.",
        style: {
          backgroundColor: "hsl(var(--destructive))",
          color: "white",
        },
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(`Fehler beim Löschen von ${item.file_name}`);
    } finally {
      setDeletingItemId(null);
    }
  };

  // Gemeinsame JSX-Elemente für beide Dropzone-Varianten
  const UploadIconContent = () => (
    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
      <Upload className="h-6 w-6 text-primary" />
    </div>
  );

  // Reset timeout message when upload starts/ends - This useEffect is replaced by logic within handleFileUpload
  // useEffect(() => { ... }, [isUploading]);

  const UploadingIndicator = () => (
    <>
      {isUploading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg z-20">
          {" "}
          {/* Ensure indicator is on top */}
          <div className="text-center">
            <div className="flex justify-center">
              <UpLoader />
            </div>
            {showTimeoutMessage && ( // Show message based on state
              <p className="text-sm text-muted-foreground mt-4">
                Das Optimieren deiner Videodatei kann etwas dauern.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );

  // Hidden File Input (needed for both dropzones)
  const HiddenFileInput = () => (
    <input
      id="file-upload" // ID muss konsistent sein für das Label
      type="file"
      multiple
      className="hidden"
      onChange={handleFileInputChange}
      accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
    />
  );

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mediathek</h1>
        <div className="relative w-full max-w-md ml-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Medien durchsuchen..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-8">
        {/* Linke Spalte: Medienkategorien */}
        <div className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Render categories only if there are items, otherwise the dropzone shows */}

              {mediaItems.length > 0 && (
                <>
                  {renderMediaCategory(
                    "image",
                    "Bilder",
                    <LucideImage className="h-5 w-5" />
                  )}
                  {renderMediaCategory(
                    "video",
                    "Videos",
                    <Video className="h-5 w-5" />
                  )}
                  {renderMediaCategory(
                    "audio",
                    "Audio",
                    <Music className="h-5 w-5" />
                  )}
                  {renderMediaCategory(
                    "document",
                    "Dokumente",
                    <FileText className="h-5 w-5" />
                  )}
                  {/* Display message if no media matches search AND library is not empty */}
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

      {/* Verstecktes Datei-Input-Feld für beide Dropzone-Typen */}
      <HiddenFileInput />

      {/* Konditionale Anzeige der Dropzone */}
      {mediaItems.length === 0 && !isLoading ? (
        // 1. Große Dropzone, wenn Mediathek leer ist
        <div className="mt-12 w-full">
          <div
            className={`
                  relative border-2 border-dashed rounded-lg p-8
                  flex flex-col items-center justify-center gap-4
                  transition-colors duration-200 h-[75vH] bg-gray-50/80
                  ${
                    isDragging ? "border-primary bg-primary/5" : "border-border"
                  }
                `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <UploadIconContent />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Dateien hierher ziehen oder
              </p>
              <label htmlFor="file-upload">
                <Button variant="link" className="mt-1" asChild>
                  <span>Dateien auswählen</span>
                </Button>
              </label>
            </div>
            <p className="text-xs text-muted-foreground">
              Maximale Dateigröße: 50MB
            </p>
            <UploadingIndicator />
          </div>
        </div>
      ) : mediaItems.length > 0 && !isLoading ? (
        // 2. Kleine, fixierte Dropzone, wenn Mediathek NICHT leer ist
        <label htmlFor="file-upload">
          {" "}
          {/* Label umschließt Button für Klickbarkeit */}
          <div
            className={`
              fixed bottom-8 right-8 z-50
              w-48 h-48 border-2 border-dashed rounded-xl {/* Größe und Ecken angepasst */}
              flex items-center justify-center
              cursor-pointer transition-all duration-200
              hover:scale-105 hover:border-primary hover:bg-primary/10 {/* Leicht veränderte Hover-Skalierung */}
              ${
                isDragging
                  ? "border-primary bg-primary/5 scale-105"
                  : "border-border bg-background/80 backdrop-blur-sm"
              } {/* Leicht veränderte Drag-Skalierung */}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            title="Dateien hochladen" // Tooltip
          >
            {/* Vereinfachter Inhalt für kleine Dropzone */}
            <Upload
              className={`h-8 w-8 transition-colors ${
                isDragging ? "text-primary" : "text-muted-foreground"
              }`}
            />
            <UploadingIndicator />
          </div>
        </label>
      ) : null}
    </>
  );
}
