// import { createClient } from "@/lib/supabase/client" // Entfernt, da nicht mehr benötigt
// import type { DropAreaType } from "@/lib/types" // Veraltet
import type { Project } from "@/lib/types"
import type { ProjectData } from "@/lib/types"
// Importiere den neuen Typ direkt oder über den Store (hier direkt, falls verschoben wird)
import type { LayoutBlockType } from "@/lib/types"; // Nur LayoutBlockType importieren
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

// Get a fresh Supabase client instance each time to avoid stale auth state
const getSupabase = () => {
  if (typeof window === "undefined") {
    console.warn("getSupabase from database.ts should only be called in browser environment. For server-side operations, use server.ts directly.");
    return null;
  }

  try {
    // Verwende die zentrale Singleton-Initialisierung
    return getSupabaseBrowserClient();
  } catch (error) {
    console.error("Error creating Supabase client:", error);
    return null;
  }
}

/**
 * Save or update project data in the Supabase database 'projects' table.
 */
export async function saveProjectToDatabase(
  projectData: ProjectData,
  userId: string
): Promise<{ success: boolean; projectId: string | null }> {
  const supabase = getSupabase()
  if (!supabase) {
    console.error("[DB Save] Supabase client not available")
    return { success: false, projectId: null }
  }

  console.log("[DB Save] Attempting to save project to database:", {
    id: projectData.id,
    title: projectData.title,
    userId: userId,
  })

  try {
    // Prepare data for upsert. Conditionally include 'id' and 'createdAt'.
    // Define a type for the data being sent to Supabase
    type UpsertPayload = {
      user_id: string;
      title: string;
      description?: string;
      project_data: string; // Expect a JSON string now
      updated_at: string;
      id?: string; // Optional ID
      created_at?: string; // Optional createdAt
    };

    const upsertData: UpsertPayload = {
      user_id: userId,
      title: projectData.title,
      description: projectData.description,
      project_data: JSON.stringify(projectData.layoutBlocks), // NEU: layoutBlocks speichern
      updated_at: new Date().toISOString(), // Keep updated_at for both insert/update
    }

    // Only include 'id' if it's a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    let isUpdate = false
    if (projectData.id && uuidRegex.test(projectData.id)) {
      console.log(`[DB Save] Valid UUID provided (${projectData.id}), performing upsert.`)
      upsertData.id = projectData.id
      // For updates, we don't set createdAt, DB keeps original or trigger handles it
      isUpdate = true
    } else {
      console.log("[DB Save] No valid UUID provided, performing insert. DB will generate ID.")
      // For inserts, explicitly set createdAt if DB doesn't have a default
      // Assuming DB has `DEFAULT timezone('utc'::text, now()) NOT NULL`
      // upsertData.created_at = new Date().toISOString();
    }

    // Use upsert to insert or update based on the primary key (id)
    const { data, error } = await supabase
      .from("projects")
      .upsert(upsertData, {
        onConflict: "id",
        ignoreDuplicates: false, // Important for upsert to perform update
      })
      .select("id")
      .single()

    if (error) {
      console.error("[DB Save] Error upserting project:", error)
      // Log the data we tried to send
      console.error("[DB Save] Data sent:", upsertData)
      return { success: false, projectId: null }
    }

    if (!data || !data.id) {
      console.error("[DB Save] Upsert operation completed but no ID returned.")
      return { success: false, projectId: null }
    }

    console.log(`[DB Save] Successfully saved project to database. Operation: ${isUpdate ? 'Update' : 'Insert'}. DB ID:`, data.id)
    return { success: true, projectId: data.id }
  } catch (error) {
    console.error("[DB Save] Unexpected error during database save:", error)
    return { success: false, projectId: null }
  }
}

/**
 * Load a project from Supabase database
 */
export async function loadProjectFromDatabase(projectId: string): Promise<ProjectData | null> {
  const supabase = getSupabase()
  if (!supabase) {
    console.error("Supabase client not available")
    return null
  }

  try {
    // Select the specific columns needed
    const { data, error } = await supabase
      .from("projects")
      .select(
        "id, title, description, created_at, updated_at, project_data" // Select all relevant fields
      )
      .eq("id", projectId)
      .single();

    if (error) {
      // Log specific Supabase error if available
      console.error(
        "Error loading project from database:",
        error.message || error
      );
      return null;
    }

    if (!data) {
      console.warn(`No project found with ID: ${projectId}`);
      return null;
    }

    // Check if project_data exists and is a string before parsing
    if (typeof data.project_data !== "string" || !data.project_data) {
      console.error(
        `Invalid or missing project_data for project ID: ${projectId}`
      );
      // Optionally, return partial data or handle differently
      // For now, returning null as the core structure is missing/invalid
      return null;
    }

    // Parse the JSON data
    try {
      // const parsedDropAreas = JSON.parse(data.project_data) as DropAreaType[]; // Veraltet
      const parsedLayoutBlocks = JSON.parse(data.project_data) as LayoutBlockType[]; // NEU: Als LayoutBlockType parsen

      // Construct the full ProjectData object
      const projectData: ProjectData = {
        id: data.id,
        title: data.title,
        description: data.description ?? "", // Handle potentially null description
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        // dropAreas: parsedDropAreas, // Veraltet
        layoutBlocks: parsedLayoutBlocks, // NEU: layoutBlocks zuweisen
      };

      return projectData;
    } catch (parseError) {
      console.error(
        `Error parsing project_data JSON for project ID: ${projectId}:`,
        parseError
      );
      // Log the problematic data if possible (be careful with large data)
      if (data.project_data.length < 500) {
        console.error("Problematic project_data:", data.project_data);
      } else {
        console.error(
          "Problematic project_data is too long to log completely."
        );
      }
      return null;
    }
  } catch (error) {
    console.error("Unexpected error loading project from database:", error);
    return null;
  }
}

/**
 * List all projects from Supabase database
 */
export async function listProjectsFromDatabase(): Promise<Project[]> {
  const supabase = getSupabase()
  if (!supabase) {
    console.error("Supabase client not available")
    return []
  }

  try {
    const { data, error } = await supabase
      .from("projects")
      .select("id, title, description, created_at, updated_at, project_data")
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Error listing projects:", error)
      return []
    }

    if (!data || data.length === 0) {
      return []
    }

    // Convert database records to Project objects
    const projects: Project[] = data
      .map((record): Project | null => {
        let blockCount = 0;
        // let parsedDropAreas: DropAreaType[] | null = null; // Veraltet
        let parsedLayoutBlocks: LayoutBlockType[] | null = null; // NEU

        // Try to parse project_data and count blocks
        if (typeof record.project_data === "string" && record.project_data) {
          try {
            // parsedDropAreas = JSON.parse(record.project_data); // Veraltet
            parsedLayoutBlocks = JSON.parse(record.project_data); // NEU
            blockCount = countBlocks(parsedLayoutBlocks ?? []); // Use parsed data (NEU)
          } catch (e) {
            console.warn(
              `Could not parse project_data for project ${record.id} to count blocks:`,
              e
            );
            // Optionally log the bad data snippet if small
            if (record.project_data.length < 100) {
              console.warn("Problematic data snippet:", record.project_data);
            }
            return null; // Return null if parsing fails
          }
        } else {
          console.warn(
            `Missing or invalid project_data type for project ${record.id}`
          );
          // Decide if this should also return null, or proceed with blockCount = 0
          // Current logic proceeds, which might be okay if project_data is optional
        }

        // Construct the Project object, handle optional fields
        const project: Project = {
          id: record.id,
          title: record.title,
          // Only include description if it exists and is not null
          ...(record.description && { description: record.description }),
          createdAt: record.created_at,
          updatedAt: record.updated_at,
          blocks: blockCount, // Use calculated block count
          // thumbnail is optional and not present here
        };
        return project; // Return the valid Project object
      })
      .filter((p): p is Project => p !== null); // Filter out the nulls

    return projects
  } catch (error) {
    console.error("Error listing projects from database:", error)
    return []
  }
}

/**
 * Delete a project from Supabase database
 */
export async function deleteProjectFromDatabase(projectId: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) {
    console.error("[DB Delete] Supabase client not available");
    return false;
  }

  console.log(`[DB Delete] Attempting to delete project with ID: ${projectId}`);

  try {
    // Perform the delete operation and request the count of deleted rows
    const { error, count } = await supabase
      .from("projects")
      .delete({ count: "exact" }) // Request the count
      .eq("id", projectId);

    if (error) {
      console.error("[DB Delete] Error during delete operation:", error);
      return false;
    }

    // Check if any rows were actually deleted
    if (count === 0) {
      console.warn(`[DB Delete] No project found with ID ${projectId} or RLS prevented deletion. Count: ${count}`);
      // Depending on requirements, you might treat this as a failure or success.
      // Returning true here assumes the goal is achieved if the record doesn't exist anymore.
      // If RLS might prevent deletion by an authorized user, returning false might be better.
      return true; // Or return false if RLS preventing deletion should be an error
    } else if (count && count > 0) {
      console.log(`[DB Delete] Successfully deleted ${count} project(s) with ID: ${projectId}`);
      return true;
    } else {
      // This case should ideally not happen with count: 'exact'
      console.warn(`[DB Delete] Delete operation returned an unexpected count: ${count} for project ID: ${projectId}`);
      return false; // Treat unexpected count as failure
    }

  } catch (error) {
    console.error("[DB Delete] Unexpected error during database delete:", error);
    return false;
  }
}

/**
 * Helper function to count the total number of blocks in a project
 */
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

/**
 * Initialize the database schema if it doesn't exist
 */
export async function initializeDatabase(): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) {
    console.error("Supabase client not available")
    return false
  }

  try {
    // Check if the projects table exists by trying to select from it
    const { error } = await supabase.from("projects").select("id").limit(1)

    if (error) {
      console.error("Error checking projects table:", error)
      console.warn("Projects table may not exist. Please run the SQL setup script.")
      return false
    }

    return true
  } catch (error) {
    console.error("Error initializing database:", error)
    return false
  }
}

/**
 * Migrate mock projects to Supabase database
 */
export async function migrateMockProjectsToDatabase(mockProjects: Project[]): Promise<boolean> {
  try {
    // Initialize database first
    const initialized = await initializeDatabase()
    if (!initialized) {
      console.warn("Database initialization failed, but continuing anyway")
    }

    let successCount = 0
    let failCount = 0

    // For each mock project, create a database entry
    for (const project of mockProjects) {
      try {
        // Construct ProjectData from mock Project
        const projectData: ProjectData = {
          id: project.id,
          title: project.title,
          description: project.description,
          layoutBlocks: [
            {
              id: "layout-block-1", // Beispiel-ID
              type: "single-column", // Füge den Typ hinzu
              zones: [{ id: "zone-1", blocks: [] }] // Füge eine leere Zone hinzu
            },
          ],
          createdAt: project.createdAt || new Date().toISOString(),
          updatedAt: project.updatedAt || new Date().toISOString(),
        }

        // Save the project to database
        const saved = await saveProjectToDatabase(projectData, "")
        if (saved.success) {
          successCount++
        } else {
          failCount++
          console.warn(`Failed to migrate project: ${project.id}, but continuing with others`)
        }
      } catch (projectError) {
        failCount++
        console.error(`Error migrating project ${project.id}:`, projectError)
        // Continue with other projects
      }
    }

    console.log(`Migration complete. Success: ${successCount}, Failed: ${failCount}`)
    return successCount > 0
  } catch (error) {
    console.error("Error migrating mock projects:", error)
    return false
  }
}

/**
 * Publish a board to make it publicly accessible
 */
export async function publishBoard(
  projectId: string,
  title: string,
  authorName: string,
  userId: string
): Promise<boolean> {
  console.log("[DB:publishBoard] Starting", {
    projectId,
    title,
    authorName,
    userId
  });

  const supabase = getSupabase();
  if (!supabase) {
    console.error("[DB:publishBoard] Supabase client not available");
    return false;
  }

  try {
    const now = new Date().toISOString();

    // Check if board is already published
    console.log("[DB:publishBoard] Checking if board exists");
    const { data: existingBoard, error: checkError } = await supabase
      .from("published_boards")
      .select("*")
      .eq("project_id", projectId)
      .maybeSingle();

    if (checkError) {
      console.error("[DB:publishBoard] Error checking published board:", checkError);
      return false;
    }

    if (existingBoard) {
      console.log("[DB:publishBoard] Updating existing board", existingBoard);
      // Update existing published board
      const { error: updateError } = await supabase
        .from("published_boards")
        .update({
          title,
          author_name: authorName,
          updated_at: now,
          is_published: true
        })
        .eq("project_id", projectId);

      if (updateError) {
        console.error("[DB:publishBoard] Error updating published board:", updateError);
        return false;
      }
    } else {
      console.log("[DB:publishBoard] Creating new board entry");
      // Create new published board
      const { error: insertError } = await supabase
        .from("published_boards")
        .insert({
          project_id: projectId,
          title,
          author_name: authorName,
          user_id: userId,
          published_at: now,
          updated_at: now,
          is_published: true
        });

      if (insertError) {
        console.error("[DB:publishBoard] Error publishing board:", insertError);
        return false;
      }
    }

    console.log("[DB:publishBoard] Successfully published board");
    return true;
  } catch (error) {
    console.error("[DB:publishBoard] Error publishing board:", error);
    return false;
  }
}

/**
 * Unpublish a board to make it private
 */
export async function unpublishBoard(projectId: string): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) {
    console.error("Supabase client not available")
    return false
  }

  try {
    const { error } = await supabase
      .from("published_boards")
      .update({ is_published: false })
      .eq("project_id", projectId)

    if (error) {
      console.error("Error unpublishing board:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error unpublishing board:", error)
    return false
  }
}

/**
 * Get published board information
 */
export async function getPublishedBoard(projectId: string) {
  const supabase = getSupabase()
  if (!supabase) {
    console.error("Supabase client not available")
    return null
  }

  try {
    const { data, error } = await supabase
      .from("published_boards")
      .select("*")
      .eq("project_id", projectId)
      .eq("is_published", true)
      .maybeSingle()

    if (error) {
      console.error("Error getting published board:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error getting published board:", error)
    return null
  }
}

/**
 * List all published boards for a user
 */
export async function listPublishedBoards(userId: string) {
  const supabase = getSupabase()
  if (!supabase) {
    console.error("Supabase client not available")
    return []
  }

  try {
    const { data, error } = await supabase
      .from("published_boards")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Error listing published boards:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error listing published boards:", error)
    return []
  }
}

/**
 * Delete a published board
 */
export async function deletePublishedBoard(boardId: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) {
    console.error("[DB:deletePublishedBoard] Supabase client not available");
    return false;
  }

  try {
    const { error } = await supabase
      .from("published_boards")
      .delete()
      .eq("id", boardId);

    if (error) {
      console.error("[DB:deletePublishedBoard] Error deleting board:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[DB:deletePublishedBoard] Error deleting board:", error);
    return false;
  }
}
