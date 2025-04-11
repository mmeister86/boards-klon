import { createClient } from "@/lib/supabase/client"
import type { DropAreaType, Project } from "@/lib/types"

// Define the project data structure for database
export interface ProjectData {
  id: string
  title: string
  description?: string
  dropAreas: DropAreaType[]
  createdAt: string
  updatedAt: string
}

// Create a singleton instance of the Supabase client
const getSupabase = () => {
  if (typeof window === "undefined") return null
  return createClient()
}

/**
 * Save a project to Supabase database
 */
export async function saveProjectToDatabase(projectData: ProjectData): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) {
    console.error("Supabase client not available")
    return false
  }

  try {
    // First, check if the project exists
    const { data: existingProject, error: checkError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectData.id)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 is "not found" error
      console.error("Error checking if project exists:", checkError)
      return false
    }

    // Convert the project data to a format suitable for the database
    const projectRecord = {
      id: projectData.id,
      title: projectData.title,
      description: projectData.description,
      created_at: projectData.createdAt,
      updated_at: projectData.updatedAt,
      project_data: JSON.stringify(projectData), // Store the entire project data as JSON
    }

    if (existingProject) {
      // Update existing project
      const { error: updateError } = await supabase.from("projects").update(projectRecord).eq("id", projectData.id)

      if (updateError) {
        console.error("Error updating project:", updateError)
        return false
      }
    } else {
      // Insert new project
      const { error: insertError } = await supabase.from("projects").insert(projectRecord)

      if (insertError) {
        console.error("Error inserting project:", insertError)
        return false
      }
    }

    return true
  } catch (error) {
    console.error("Error saving project to database:", error)
    return false
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
    const { data, error } = await supabase.from("projects").select("project_data").eq("id", projectId).single()

    if (error) {
      console.error("Error loading project:", error)
      return null
    }

    if (!data || !data.project_data) {
      console.error("No project data found")
      return null
    }

    // Parse the JSON data
    try {
      const projectData = JSON.parse(data.project_data) as ProjectData
      return projectData
    } catch (parseError) {
      console.error("Error parsing project data:", parseError)
      return null
    }
  } catch (error) {
    console.error("Error loading project from database:", error)
    return null
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
    const projects: Project[] = data.map((record) => {
      let blockCount = 0

      // Try to count blocks from project_data
      try {
        const projectData = JSON.parse(record.project_data)
        blockCount = countBlocks(projectData.dropAreas)
      } catch (e) {
        console.warn("Could not parse project data to count blocks:", e)
      }

      return {
        id: record.id,
        title: record.title,
        description: record.description,
        createdAt: record.created_at,
        updatedAt: record.updated_at,
        blocks: blockCount,
        thumbnail: undefined, // No thumbnail in database approach
      }
    })

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
  const supabase = getSupabase()
  if (!supabase) return false

  try {
    const { error } = await supabase.from("projects").delete().eq("id", projectId)

    if (error) {
      console.error("Error deleting project:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error deleting project:", error)
    return false
  }
}

/**
 * Helper function to count the total number of blocks in a project
 */
function countBlocks(dropAreas: DropAreaType[]): number {
  let count = 0

  for (const area of dropAreas) {
    // Count blocks in this area
    count += area.blocks.length

    // Count blocks in split areas recursively
    if (area.isSplit && area.splitAreas.length > 0) {
      count += countBlocks(area.splitAreas)
    }
  }

  return count
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
        }

        // Save the project to database
        const saved = await saveProjectToDatabase(projectData)
        if (saved) {
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
  const supabase = getSupabase()
  if (!supabase) {
    console.error("Supabase client not available")
    return false
  }

  try {
    const now = new Date().toISOString()

    // Check if board is already published
    const { data: existingBoard } = await supabase
      .from("published_boards")
      .select("id")
      .eq("project_id", projectId)
      .single()

    if (existingBoard) {
      // Update existing published board
      const { error: updateError } = await supabase
        .from("published_boards")
        .update({
          title,
          author_name: authorName,
          updated_at: now,
          is_published: true
        })
        .eq("project_id", projectId)

      if (updateError) {
        console.error("Error updating published board:", updateError)
        return false
      }
    } else {
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
        })

      if (insertError) {
        console.error("Error publishing board:", insertError)
        return false
      }
    }

    return true
  } catch (error) {
    console.error("Error publishing board:", error)
    return false
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
      .single()

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
