import { createClient } from "@/lib/supabase/client";
// import type { DropAreaType } from "@/lib/types"; // Veraltet
// Importiere die neuen Typen
import type { ProjectData, Project, LayoutBlockType } from "@/lib/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./database.types";
import { v4 as uuidv4 } from 'uuid';

// We now use the ProjectData type from lib/types

// Get a fresh Supabase client instance each time to avoid stale auth state and caching issues
const getSupabase = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const client = createClient();
  if (!client) {
    return null;
  }

  return client;
};

// The name of the storage bucket for projects
const BUCKET_NAME = "projects";

// Initialize storage and verify bucket access
export async function initializeStorage(): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) {
    return false;
  }

  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .list("", { limit: 1 });

    return !error;
  } catch {
    return false;
  }
}

// Save project data to Supabase storage with improved error handling
export async function saveProjectToStorage(
  projectData: ProjectData,
  userId: string
): Promise<boolean> {
  if (!projectData.id) {
     console.error("[Storage Save] Cannot save project without an ID.");
     return false;
  }
  if (!userId) {
    console.error("[Storage Save] userId is required to save project in user folder.");
    return false;
  }
  const supabase = getSupabase();
  if (!supabase) {
    console.error("[Storage Save] Supabase client not available");
    return false;
  }

  try {
    // Immer userId für den Pfad verwenden, damit Projekte im Nutzer-Ordner landen
    // Beispiel: userId/projectId.json
    const filePath = `${userId}/${projectData.id}.json`;
    console.log(`[Storage Save] Attempting to upload to path: ${filePath}`);

    // Always update the modified timestamp
    projectData.updatedAt = new Date().toISOString();

    // Convert project data to JSON string with pretty formatting
    const jsonData = JSON.stringify(projectData, null, 2);

    // Create a buffer from the JSON string
    const jsonBuffer = new Uint8Array(new TextEncoder().encode(jsonData));

    // Workaround für Linter: Verwende ?? '' obwohl id existieren sollte
    const idForPath = projectData.id ?? '';
    if (!idForPath) { // Zusätzliche Sicherheitsprüfung für den Fall der Fälle
         console.error("[Storage Save] ID is unexpectedly empty, cannot construct path.");
         return false;
    }

    // Upload mit dem bereits deklarierten filePath
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, jsonBuffer, {
        contentType: "application/json",
        upsert: true,
      });

    if (error) {
      console.error("[Storage Save] Upload error:", error);
      return false;
    }

    console.log(`[Storage Save] Successfully uploaded to ${filePath}`);
    return true;
  } catch (e) {
    console.error("[Storage Save] Unexpected error:", e);
    return false;
  }
}

/**
 * Load a project from Supabase storage from user-specific folder
 */
export async function loadProjectFromStorage(
  projectId: string,
  userId: string
): Promise<ProjectData | null> {
  const supabase = getSupabase();
  if (!supabase) {
    console.error("[Storage Load] Supabase client not available");
    return null;
  }
  if (!userId) {
     console.error("[Storage Load] userId is required but was not provided.");
     return null;
  }

  try {
    // Lade aus userId/projectId.json
    const filePath = `${userId}/${projectId}.json`;
    console.log(`[Storage Load] Attempting to download from path: ${filePath}`);

    // Attempt to download the file directly
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(filePath); // Verwende den neuen Pfad

    if (error) {
       console.error(`[Storage Load] Error downloading ${filePath}:`, error.message);
       // Unterscheide "Not Found" von anderen Fehlern
       if (error.message.includes("Object not found")) {
           console.log(`[Storage Load] Project file not found at ${filePath}.`);
       } else {
            // Logge andere Fehler detaillierter
           console.error("[Storage Load] Download failed with error:", error);
       }
       return null;
    }

    if (!data) {
       console.error(`[Storage Load] Download succeeded but no data received for ${filePath}.`);
      return null;
    }

    // Process the downloaded data
    console.log(`[Storage Load] Download successful for ${filePath}. Parsing data...`);
    const jsonData = await data.text();
    const parsedData = JSON.parse(jsonData) as ProjectData;
    console.log(`[Storage Load] Data parsed successfully for project ${projectId}.`);
    return parsedData;

  } catch (e) {
     console.error(`[Storage Load] Unexpected error for project ${projectId}:`, e);
    return null;
  }
}

/**
 * List all projects for a specific user from Supabase storage (userId folder)
 */
export async function listProjectsFromStorage(userId: string): Promise<Project[]> {
  const supabase = getSupabase();
  if (!supabase) {
    console.error("[ListStorage] Supabase client not available");
    return [];
  }
   if (!userId) {
     console.error("[ListStorage] userId is required but was not provided.");
     return [];
  }

  try {
    // Liste nur den Ordner des Benutzers
    const { data, error } = await supabase.storage.from(BUCKET_NAME).list(userId, {
      limit: 100,
      offset: 0,
      sortBy: { column: "updated_at", order: "desc" },
    });

    if (error) {
        console.error(`[ListStorage] Error listing files for user ${userId}:`, error);
        return [];
    }

    if (!data || data.length === 0) {
       console.log(`[ListStorage] No project files found for user ${userId}.`);
      return [];
    }

    // Filter for JSON files (sollten nur JSONs sein im User-Ordner)
    const projectFiles = data.filter((file) => file.name.endsWith(".json"));
    console.log(`[ListStorage] Found ${projectFiles.length} potential project files.`);

    // Load each project's metadata
    const projects: Project[] = [];
    const loadPromises: Promise<ProjectData | null>[] = [];

    for (const file of projectFiles) {
      const projectId = file.name.replace(".json", "");
      // Rufe loadProjectFromStorage mit userId und projectId auf
      loadPromises.push(loadProjectFromStorage(projectId, userId));
    }

    // Wait for all projects to load
    const loadedProjectsData = await Promise.all(loadPromises);

    // Convert ProjectData to Project, handling nulls
    for (const projectData of loadedProjectsData) {
      if (projectData) {
        const project: Project = {
          id: projectData.id ?? uuidv4(), // Fallback auf neue UUID, wenn ID fehlt
          title: projectData.title,
          description: projectData.description,
          createdAt: projectData.createdAt,
          updatedAt: projectData.updatedAt,
          // Verwende die neue countBlocks Funktion mit layoutBlocks
          blocks: countBlocks(projectData.layoutBlocks ?? []), // Geändert von dropAreas
          // thumbnail: Needs separate handling if required
        };
        projects.push(project);
      }
    }

    console.log(`[ListStorage] Successfully loaded ${projects.length} projects.`);
    return projects;
  } catch (e) {
    console.error("[ListStorage] Unexpected error:", e);
    return [];
  }
}

/**
 * Delete a project from Supabase storage (userId folder)
 */
export async function deleteProjectFromStorage(
  projectId: string,
  userId: string
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) {
    console.error("[Storage Delete] Supabase client not available");
    return false;
  }
  if (!userId || !projectId) {
       console.error("[Storage Delete] Both userId and projectId are required.");
       return false;
  }

  try {
    // Lösche userId/projectId.json
    const filePath = `${userId}/${projectId}.json`;
    console.log(`[Storage Delete] Attempting to delete file at path: ${filePath}`);

    // Lösche die Datei
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);

    if (error) {
       console.error(`[Storage Delete] Error deleting file ${filePath}:`, error);
      return false;
    }

    console.log(`[Storage Delete] Successfully deleted file ${filePath}`);
    return true;

  } catch (e) {
     console.error(`[Storage Delete] Unexpected error for project ${projectId}:`, e);
    return false;
  }
}

/**
 * Save a project thumbnail to Supabase storage
 */
export async function saveProjectThumbnail(
  projectId: string,
  thumbnailBlob: Blob
): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    // Upload the thumbnail to Supabase storage
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(`thumbnails/${projectId}.png`, thumbnailBlob, {
        cacheControl: "3600",
        upsert: true, // Overwrite if exists
      });

    if (error) {
      return null;
    }

    // Get the public URL for the thumbnail
    const {
      data: { publicUrl },
    } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(`thumbnails/${projectId}.png`);

    return publicUrl;
  } catch {
    return null;
  }
}

/**
 * Get a project thumbnail URL from Supabase storage
 */
export async function getProjectThumbnail(
  projectId: string
): Promise<string | undefined> {
  const supabase = getSupabase();
  if (!supabase) return undefined;

  try {
    // Check if the thumbnail exists
    const { data } = await supabase.storage
      .from(BUCKET_NAME)
      .list("thumbnails");

    const thumbnailExists = data?.some(
      (file) => file.name === `${projectId}.png`
    );

    if (!thumbnailExists) {
      return undefined;
    }

    // Get the public URL for the thumbnail
    const {
      data: { publicUrl },
    } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(`thumbnails/${projectId}.png`);

    return publicUrl;
  } catch {
    return undefined;
  }
}

// Helper function to count blocks in the new layout structure
function countBlocks(layoutBlocks: LayoutBlockType[]): number {
  let count = 0;
  if (!layoutBlocks) return 0;

  for (const layoutBlock of layoutBlocks) {
    if (layoutBlock.zones && Array.isArray(layoutBlock.zones)) {
      for (const zone of layoutBlock.zones) {
        if (zone.blocks && Array.isArray(zone.blocks)) {
          count += zone.blocks.length;
        }
      }
    }
  }
  return count;
}

/* // Veraltete countBlocks Funktion
function countBlocks(dropAreas: DropAreaType[]): number {
  let count = 0;

  for (const area of dropAreas) {
    count += area.blocks.length;
    if (area.isSplit && area.splitAreas.length > 0) {
      count += countBlocks(area.splitAreas);
    }
  }
  return count;
}
*/

// Update the migrateMockProjects function to handle errors better
export async function migrateMockProjects(
  mockProjects: Project[]
): Promise<boolean> {
  console.log("[MigrateMock] Starting migration of mock projects...");
  let allSuccess = true;

  for (const project of mockProjects) {
    try {
      // Construct ProjectData from mock Project
      const projectData: ProjectData = {
        id: project.id,
        title: project.title,
        description: project.description,
        layoutBlocks: [
          {
            id: "layout-block-1",
            type: "single-column",
            zones: [{ id: "zone-1", blocks: [] }],
          },
        ],
        createdAt: project.createdAt || new Date().toISOString(),
        updatedAt: project.updatedAt || new Date().toISOString(),
      };

      // Save each mock project to storage
      const success = await saveProjectToStorage(projectData, project.id);
      if (!success) {
        console.warn(`[MigrateMock] Failed to save mock project ${project.id} to storage.`);
        allSuccess = false;
      }
    } catch (error) {
      console.error(`[MigrateMock] Error migrating mock project ${project.id}:`, error);
      allSuccess = false;
    }
  }

  console.log("[MigrateMock] Mock project migration finished.");
  return allSuccess;
}

// Constants for supported media types and their corresponding buckets
const BUCKET_MAPPING = {
  image: 'images',
  video: 'videos',
  audio: 'audio',
  document: 'documents'
} as const;

// --- Hilfsfunktion zum Bereinigen von Dateinamen ---
// (Kopiert aus optimize-pdf API Route, da sie hier auch benötigt wird)
const sanitizeFilename = (filename: string): string => {
  const umlautMap: { [key: string]: string } = {
    ä: "ae", ö: "oe", ü: "ue", Ä: "Ae", Ö: "Oe", Ü: "Ue", ß: "ss",
  };
  let sanitized = filename;
  for (const key in umlautMap) {
    sanitized = sanitized.replace(new RegExp(key, "g"), umlautMap[key]);
  }
  return sanitized
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "");
};

/**
 * Get media type category from MIME type
 * @param mimeType The MIME type of the file
 * @returns The media category or null if unsupported
 */
function getMediaCategory(mimeType: string): keyof typeof BUCKET_MAPPING | null {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  // Consider common document types
  if (
    [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ].includes(mimeType)
  ) {
    return "document";
  }
  return null;
}

/**
 * Upload a media file to the appropriate Supabase storage bucket
 * @param file The file to upload
 * @param userId The ID of the user uploading the file
 * @param supabaseClient The Supabase client instance
 * @returns The public URL of the uploaded file or null if upload fails
 */
export async function uploadMediaFile(
  file: File,
  userId: string,
  supabaseClient: SupabaseClient<Database>
): Promise<string | null> {
  const category = getMediaCategory(file.type);
  if (!category) {
    console.error("Unsupported file type:", file.type);
    return null;
  }

  const bucket = BUCKET_MAPPING[category];

  // Bereinige den Dateinamen
  const sanitizedFileName = sanitizeFilename(file.name);
  const filePath = `${userId}/${uuidv4()}-${sanitizedFileName}`;

  try {
    console.log(
      `Attempting to upload ${file.name} (sanitized: ${sanitizedFileName}) to bucket ${bucket} at path ${filePath}`
    );

    const { error: uploadError } = await supabaseClient.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error(`Error uploading file ${file.name}:`, uploadError);
      throw uploadError; // Re-throw to be caught below
    }

    const { data } = supabaseClient.storage.from(bucket).getPublicUrl(filePath);

    if (!data?.publicUrl) {
      console.error(`Could not get public URL for ${filePath}`);
      return null;
    }

    console.log(`Upload successful for ${file.name}. URL: ${data.publicUrl}`);
    return data.publicUrl;
  } catch (error) {
    console.error(`Failed during upload process for ${file.name}:`, error);
    return null;
  }
}

/**
 * Add a media item to the database
 * @param file The original file
 * @param url The public URL of the uploaded file
 * @param userId The ID of the user
 * @param supabaseClient The Supabase client instance
 * @param previewUrl The optional preview URL
 * @returns The created media item record or null if operation fails
 */
export async function addMediaItemToDatabase(
  file: File,
  url: string,
  userId: string,
  supabaseClient: SupabaseClient<Database>,
  previewUrl?: string | null,
  previewUrl512?: string | null,
  previewUrl128?: string | null
): Promise<Database['public']['Tables']['media_items']['Row'] | null> {
  // Generate a unique ID for the media item
  const id = uuidv4();

  // Get image dimensions if it's an image file
  let dimensions: { width: number | null; height: number | null } = {
    width: null,
    height: null,
  };
  if (file.type.startsWith("image/")) {
    const dims = await getImageDimensions(file);
    if (dims) {
      dimensions = dims;
    }
  }

  // Prepare the data for insertion, using the original filename
  const mediaItemData: Database['public']['Tables']['media_items']['Insert'] = {
    id: id, // Use the generated UUID
    file_name: file.name, // Store the original filename
    file_type: file.type,
    url: url, // The public URL from storage
    size: file.size,
    width: dimensions.width ?? 0,
    height: dimensions.height ?? 0,
    user_id: userId,
    preview_url: previewUrl || null,
    preview_url_512: previewUrl512 || null,
    preview_url_128: previewUrl128 || null
  };

  try {
    const { data: insertedData, error } = await supabaseClient
      .from('media_items')
      .insert(mediaItemData)
      .select()
      .single();

    if (error) {
      console.error('Error adding media item to database:', error);
      return null;
    }

    return insertedData;
  } catch (error) {
    console.error('Error in addMediaItemToDatabase:', error);
    return null;
  }
}

/**
 * Get dimensions of an image file
 * @param file The image file
 * @returns Promise resolving to width and height or undefined if not possible
 */
async function getImageDimensions(file: File): Promise<{ width: number; height: number } | undefined> {
  // Serverside-Umgebung erkennen und einen Fallback zurückgeben
  if (typeof window === 'undefined') {
    console.log('Image dimensions calculation skipped on server side');
    return { width: 0, height: 0 }; // Standardwerte zurückgeben
  }

  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(undefined);
      return;
    }

    // Nur im Browser ausführen, wo Image verfügbar ist
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.width,
        height: img.height
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(undefined);
    };

    img.src = url;
  });
}
