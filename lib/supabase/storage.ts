import { createClient } from "@/lib/supabase/client";
import type { DropAreaType } from "@/lib/types";
import type { ProjectData } from "@/lib/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

// Define the Project type for UI display
interface Project {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  blocks: number;
  thumbnail?: string;
}

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
  projectData: ProjectData
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) {
    return false;
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const isAuthenticated = !!sessionData.session;

    if (!isAuthenticated) {
      return false;
    }

    // Initialize storage and check bucket access
    const initResult = await initializeStorage();
    if (!initResult) {
      return false;
    }

    // Always update the modified timestamp
    projectData.updatedAt = new Date().toISOString();

    // Convert project data to JSON string with pretty formatting
    const jsonData = JSON.stringify(projectData, null, 2);

    // Create a buffer from the JSON string
    const jsonBuffer = new Uint8Array(new TextEncoder().encode(jsonData));

    // Attempt the upload with minimal options
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(`${projectData.id}.json`, jsonBuffer, {
        contentType: "application/json",
        upsert: true, // Overwrite if exists
      });

    if (error) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Load a project from Supabase storage with improved error handling
 */
export async function loadProjectFromStorage(
  projectId: string
): Promise<ProjectData | null> {
  const supabase = getSupabase();
  if (!supabase) {
    return null;
  }

  try {
    await supabase.auth.getSession();

    // Initialize storage and check access
    await initializeStorage();

    // Add a timestamp to avoid caching issues
    const timestamp = new Date().getTime();

    // Attempt to download the file directly
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(`${projectId}.json?t=${timestamp}`);

    if (error || !data) {
      return null;
    }

    // Process the downloaded data
    const jsonData = await data.text();
    return JSON.parse(jsonData) as ProjectData;
  } catch {
    return null;
  }
}

/**
 * List all projects from Supabase storage with improved error handling and caching control
 */
export async function listProjectsFromStorage(): Promise<Project[]> {
  const supabase = getSupabase();
  if (!supabase) {
    return [];
  }

  try {
    await supabase.auth.getSession();
    await initializeStorage();

    const { data, error } = await supabase.storage.from(BUCKET_NAME).list(``, {
      limit: 100,
      offset: 0,
      sortBy: { column: "updated_at", order: "desc" },
    });

    if (error || !data || data.length === 0) {
      return [];
    }

    // Filter for JSON files
    const projectFiles = data.filter((file) => file.name.endsWith(".json"));

    // Load each project's metadata
    const projects: Project[] = [];

    for (const file of projectFiles) {
      try {
        const projectId = file.name.replace(".json", "");
        const projectData = await loadProjectFromStorage(projectId);
        if (projectData) {
          let thumbnail: string | undefined = undefined;

          try {
            thumbnail = await getProjectThumbnail(projectId);
          } catch {
            // Ignore thumbnail errors
          }

          projects.push({
            id: projectData.id,
            title: projectData.title,
            description: projectData.description,
            createdAt: projectData.createdAt,
            updatedAt: projectData.updatedAt,
            blocks: countBlocks(projectData.dropAreas),
            thumbnail,
          });
        }
      } catch {
        continue;
      }
    }

    return projects;
  } catch {
    return [];
  }
}

/**
 * Delete a project from Supabase storage
 */
export async function deleteProjectFromStorage(
  projectId: string
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    // Delete the project file
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([`${projectId}.json`]);

    if (error) {
      return false;
    }

    // Also delete the thumbnail if it exists
    try {
      await supabase.storage
        .from(BUCKET_NAME)
        .remove([`thumbnails/${projectId}.png`]);
    } catch {
      // Ignore errors when deleting thumbnails
    }

    return true;
  } catch {
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

/**
 * Helper function to count the total number of blocks in a project
 */
function countBlocks(dropAreas: DropAreaType[]): number {
  let count = 0;

  for (const area of dropAreas) {
    // Count blocks in this area
    count += area.blocks.length;

    // Count blocks in split areas recursively
    if (area.isSplit && area.splitAreas.length > 0) {
      count += countBlocks(area.splitAreas);
    }
  }

  return count;
}

// Update the migrateMockProjects function to handle errors better
export async function migrateMockProjects(
  mockProjects: Project[]
): Promise<boolean> {
  try {
    // Initialize storage first
    await initializeStorage();

    let successCount = 0;

    // For each mock project, create a storage entry
    for (const project of mockProjects) {
      try {
        // Create a basic project structure
        const projectData: ProjectData = {
          id: project.id,
          title: project.title,
          description: project.description,
          dropAreas: [
            {
              id: "drop-area-1",
              blocks: [],
              isSplit: false,
              splitAreas: [],
              splitLevel: 0,
            },
          ],
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        };

        // Save the project to storage
        const saved = await saveProjectToStorage(projectData);
        if (saved) {
          successCount++;
        }
      } catch {
        continue;
      }
    }

    return successCount > 0;
  } catch {
    return true;
  }
}

// Constants for supported media types and their corresponding buckets
const BUCKET_MAPPING = {
  image: 'images',
  video: 'videos',
  audio: 'audio',
  document: 'documents'
} as const;

// --- NEU: Hilfsfunktion zum Bereinigen von Dateinamen (kopiert aus mediathek-view) ---
const sanitizeFilename = (filename: string): string => {
  // Umlaute und ß ersetzen
  const umlautMap: { [key: string]: string } = {
    ä: "ae", ö: "oe", ü: "ue", Ä: "Ae", Ö: "Oe", Ü: "Ue", ß: "ss",
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

  // --- MODIFIZIERT: Dateinamen bereinigen ---
  const sanitizedFileName = sanitizeFilename(file.name);
  const filePath = `${userId}/${Date.now()}-${sanitizedFileName}`;

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
 * @returns The created media item record or null if operation fails
 */
export async function addMediaItemToDatabase(
  file: File,
  url: string,
  userId: string,
  supabaseClient: SupabaseClient<Database>
): Promise<Database['public']['Tables']['media_items']['Row'] | null> {
  try {
    const mediaCategory = getMediaCategory(file.type);
    if (!mediaCategory) {
      return null;
    }

    let dimensions = undefined;
    if (mediaCategory === 'image') {
      dimensions = await getImageDimensions(file);
    }

    const mediaItem = {
      file_name: file.name,
      file_type: file.type,
      url: url,
      size: file.size,
      user_id: userId,
      uploaded_at: new Date().toISOString(),
      width: dimensions?.width ?? 0,
      height: dimensions?.height ?? 0
    };

    const { data, error } = await supabaseClient
      .from('media_items')
      .insert(mediaItem)
      .select()
      .single();

    if (error) {
      console.error('Error adding media item to database:', error);
      return null;
    }

    return data;
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
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(undefined);
      return;
    }

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
