import { createClient } from "@/lib/supabase/client"
import type { DropAreaType } from "@/lib/types"
import type { ProjectData } from "@/lib/types"

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
    console.warn("getSupabase can only be used in browser environment")
    return null
  }
  
  // Create a fresh client each time to ensure latest auth state
  const client = createClient()
  
  // Log issues when client can't be created
  if (!client) {
    console.error("Failed to create Supabase client")
    return null
  }
  
  // Log successful client creation to help with debugging
  console.log("Created fresh Supabase client instance:", !!client)
  
  return client
}

// The name of the storage bucket for projects
const BUCKET_NAME = "projects"

// Initialize storage and verify bucket access
export async function initializeStorage(): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) {
    console.error("Failed to initialize Supabase client")
    return false
  }

  try {
    // Check if the user is authenticated - needed for storage access
    const { data: sessionData } = await supabase.auth.getSession()
    const isAuthenticated = !!sessionData.session

    if (!isAuthenticated) {
      console.warn("User not authenticated. Some storage operations may fail.")
    }
    
    // Try a simple list operation to verify bucket access
    console.log(`Checking access to "${BUCKET_NAME}" bucket...`)
    
    // Following Supabase docs: https://supabase.com/docs/guides/storage/
    try {
      // Simple operation to check if we can access the bucket
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list("", { limit: 1 })
      
      if (error) {
        // Just log the error and continue - storage access is optional
        console.warn(`Note: Limited bucket access - ${error.message}`)
        console.log("Some storage operations may fail. Will use localStorage as needed.")
        return false
      }
      
      console.log(`Successfully accessed "${BUCKET_NAME}" bucket. Found ${data?.length || 0} files.`)
      return true
    } catch (listError) {
      console.warn(`Error accessing bucket: ${listError}`)
      console.log("Will use localStorage as fallback if needed.")
      return false
    }
  } catch (error) {
    console.error("Error initializing storage:", error)
    console.log("Will use localStorage as fallback if needed.")
    return false
  }
}

// Save project data to Supabase storage with improved error handling
export async function saveProjectToStorage(projectData: ProjectData): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) {
    console.error("Supabase client not available")
    return false
  }

  try {
    // Check if user is authenticated - required for storage writes
    const { data: sessionData } = await supabase.auth.getSession()
    const isAuthenticated = !!sessionData.session
    
    if (!isAuthenticated) {
      console.warn("User not authenticated. Will attempt to save using localStorage.")
      // Try localStorage fallback immediately
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          console.log(`Saving project ${projectData.id} to localStorage (authentication fallback)`)
          localStorage.setItem(`project_${projectData.id}`, JSON.stringify(projectData))
          console.log(`Successfully saved project ${projectData.id} to localStorage`)
          return true
        }
      } catch (localStorageError) {
        console.error(`Error saving to localStorage:`, localStorageError)
        return false
      }
    }
    
    // Initialize storage and check bucket access
    const initResult = await initializeStorage()
    if (!initResult) {
      console.warn("Limited storage access, using localStorage as fallback")
      // Try localStorage fallback
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          console.log(`Saving project ${projectData.id} to localStorage (fallback)`)
          localStorage.setItem(`project_${projectData.id}`, JSON.stringify(projectData))
          console.log(`Successfully saved project ${projectData.id} to localStorage`)
          return true
        }
      } catch (localStorageError) {
        console.error(`Error saving to localStorage:`, localStorageError)
        return false
      }
      return false
    }

    // Always update the modified timestamp
    projectData.updatedAt = new Date().toISOString()
    
    // Convert project data to JSON string with pretty formatting 
    const jsonData = JSON.stringify(projectData, null, 2)

    console.log(`Preparing to save project ${projectData.id} (${jsonData.length} chars)`)
    
    try {
      // Simplified upload approach following Supabase docs
      console.log(`Uploading project data for ${projectData.id}.json`)
      
      // Create a buffer from the JSON string
      const jsonBuffer = new Uint8Array(new TextEncoder().encode(jsonData))
      
      // Attempt the upload with minimal options
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(`${projectData.id}.json`, jsonBuffer, {
          contentType: "application/json",
          upsert: true // Overwrite if exists
        })

      if (error) {
        console.error(`Error saving project ${projectData.id}:`, error)
        
        // Check for specific error types
        if (error.message?.includes("authentication")) {
          console.error("Authentication error. Please sign in again.")
        } else if (error.message?.includes("permission")) {
          console.error("Permission denied. You don't have access to save projects.")
        }
        
        // Try fallback to localStorage if browser storage is available
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            console.log(`Fallback: Saving project ${projectData.id} to localStorage`)
            localStorage.setItem(`project_${projectData.id}`, JSON.stringify(projectData))
            console.log(`Successfully saved project ${projectData.id} to localStorage`)
            return true
          }
        } catch (localStorageError) {
          console.error(`Error saving to localStorage:`, localStorageError)
        }
        
        return false
      }

      console.log(`Successfully saved project: ${projectData.id}`)
      return true
    } catch (uploadError) {
      console.error(`Exception during upload for ${projectData.id}:`, uploadError)
      
      // Try localStorage fallback on upload error
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          console.log(`Error fallback: Saving project ${projectData.id} to localStorage`)
          localStorage.setItem(`project_${projectData.id}`, JSON.stringify(projectData))
          console.log(`Successfully saved project ${projectData.id} to localStorage`)
          return true
        }
      } catch (localStorageError) {
        console.error(`Error saving to localStorage:`, localStorageError)
      }
      
      return false
    }
  } catch (error) {
    console.error(`Error saving project ${projectData.id}:`, error)
    return false
  }
}

/**
 * Load a project from Supabase storage with improved error handling
 */
export async function loadProjectFromStorage(projectId: string): Promise<ProjectData | null> {
  const supabase = getSupabase()
  if (!supabase) {
    console.error("Supabase client not available")
    return null
  }

  try {
    // Check if user is authenticated (not strictly required for read access in some configurations)
    const { data: sessionData } = await supabase.auth.getSession()
    const isAuthenticated = !!sessionData.session
    
    console.log(`Loading project ${projectId}, user authenticated: ${isAuthenticated}`)
    
    // Initialize storage and check access
    const initResult = await initializeStorage()
    if (!initResult) {
      console.log(`Note: Limited storage access when loading ${projectId}`)
    }
    
    // Simple, direct approach to download file as recommended in Supabase docs
    console.log(`Downloading ${projectId}.json from "${BUCKET_NAME}" bucket`)
    
    // Add a timestamp to avoid caching issues
    const timestamp = new Date().getTime()
    
    // Attempt to download the file directly 
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(`${projectId}.json?t=${timestamp}`)
    
    if (error) {
      console.warn(`Storage download error for ${projectId}: ${error.message}`)
      
      // Try to load from localStorage as a fallback
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const localData = localStorage.getItem(`project_${projectId}`)
          if (localData) {
            console.log(`Found project ${projectId} in localStorage, attempting to parse`)
            const projectData = JSON.parse(localData) as ProjectData
            console.log(`Successfully loaded project ${projectId} from localStorage, title: ${projectData.title}`)
            return projectData
          } else {
            console.log(`No data found in localStorage for project ${projectId}`)
          }
        }
      } catch (localStorageError) {
        console.error(`Error loading from localStorage:`, localStorageError)
      }
      
      return null
    }
    
    if (!data) {
      console.error(`No data returned when downloading project ${projectId}`)
      return null
    }
    
    // Process the downloaded data
    try {
      const jsonData = await data.text()
      console.log(`Downloaded data for ${projectId} (${jsonData.length} chars)`)
      
      // For debugging, show a preview of the data
      if (jsonData.length > 0) {
        console.log(`Data preview: ${jsonData.substring(0, 100)}...`)
      }
      
      const projectData = JSON.parse(jsonData) as ProjectData
      console.log(`Successfully loaded project ${projectId} titled: ${projectData.title}`)
      console.log(`Project has ${projectData.dropAreas.length} drop areas:`, 
        projectData.dropAreas.map(area => 
          `${area.id}: ${area.blocks.length} blocks, isSplit: ${area.isSplit}`
        ).join(', ')
      )
      
      return projectData
    } catch (parseError) {
      console.error(`Error parsing project data for ${projectId}:`, parseError)
      return null
    }
  } catch (error) {
    console.error(`Error loading project ${projectId}:`, error)
    return null
  }
}

/**
 * List all projects from Supabase storage with improved error handling and caching control
 */
export async function listProjectsFromStorage(): Promise<Project[]> {
  const supabase = getSupabase()
  if (!supabase) {
    console.error("Supabase client not available")
    return []
  }

  try {
    // Check if user is authenticated - recommended but not strictly required for read access
    const { data: sessionData } = await supabase.auth.getSession()
    const isAuthenticated = !!sessionData.session
    
    if (!isAuthenticated) {
      console.warn("User not authenticated. Some storage operations may fail.")
      // Continue anyway - public reads might work depending on bucket policy
    }
    
    // Initialize storage and check access
    console.log(`Listing projects from "${BUCKET_NAME}" bucket...`)
    const initResult = await initializeStorage()
    if (!initResult) {
      console.log(`Note: Limited storage access when listing projects`)
    }
    
    // Simple approach according to Supabase docs
    // Simple approach with minimal parameters
    console.log(`Listing files in "${BUCKET_NAME}" bucket...`)
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(``, {
        limit: 100,
        offset: 0,
        sortBy: { column: "updated_at", order: "desc" }
      })

    if (error) {
      console.error("Error listing projects:", error)
      if (error.message?.includes("authentication")) {
        console.error("Authentication error. Please sign in to access your projects.")
      } else {
        console.error(`Storage error with status: ${error.status || 'unknown'}`)
      }
      
      // Try a direct fetch of a test file to diagnose the issue
      try {
        console.log("Attempting direct fetch of test file...")
        const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(`test.txt`)
        const response = await fetch(urlData.publicUrl)
        console.log(`Test fetch result: ${response.status} ${response.statusText}`)
      } catch (testError) {
        console.warn(`Test fetch failed: ${testError}`)
      }
      
      // Try to get projects from localStorage
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          console.log(`Attempting to list projects from localStorage`)
          const localProjects: Project[] = []
          
          // Loop through localStorage keys to find projects
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && key.startsWith('project_')) {
              try {
                // Extract project data from localStorage
                const localProjectData = JSON.parse(localStorage.getItem(key) || '{}') as ProjectData
                
                // Convert to Project type
                localProjects.push({
                  id: localProjectData.id,
                  title: localProjectData.title,
                  description: localProjectData.description,
                  createdAt: localProjectData.createdAt,
                  updatedAt: localProjectData.updatedAt,
                  blocks: localProjectData.dropAreas.reduce((count, area) => count + area.blocks.length, 0),
                  thumbnail: undefined,
                })
              } catch (parseError) {
                console.error(`Error parsing localStorage project:`, parseError)
              }
            }
          }
          
          if (localProjects.length > 0) {
            console.log(`Found ${localProjects.length} projects in localStorage`)
            return localProjects
          }
        }
      } catch (localStorageError) {
        console.error(`Error listing projects from localStorage:`, localStorageError)
      }
      
      return []
    }

    if (!data || data.length === 0) {
      console.warn("No project files found in storage")
      return []
    }

    // Log all files to help with debugging
    console.log(`Raw file list from storage:`, data.map(f => f.name).join(', '))

    // Filter for JSON files
    const projectFiles = data.filter((file) => file.name.endsWith(".json"))
    console.log(`Found ${projectFiles.length} project files in storage (after filtering for .json)`)
    
    // Log the project files for debugging
    projectFiles.forEach(file => {
      console.log(`Project file: ${file.name}, last modified: ${file.updated_at || 'unknown'}`)
    })

    // Load each project's metadata
    const projects: Project[] = []

    for (const file of projectFiles) {
      try {
        const projectId = file.name.replace(".json", "")
        console.log(`Loading project metadata for: ${projectId}`)

        const projectData = await loadProjectFromStorage(projectId)
        if (projectData) {
          let thumbnail: string | undefined = undefined

          try {
            thumbnail = await getProjectThumbnail(projectId)
          } catch (thumbnailError) {
            console.warn(`Error loading thumbnail for project ${projectId}:`, thumbnailError)
          }

          projects.push({
            id: projectData.id,
            title: projectData.title,
            description: projectData.description,
            createdAt: projectData.createdAt,
            updatedAt: projectData.updatedAt,
            blocks: countBlocks(projectData.dropAreas),
            thumbnail,
          })
        }
      } catch (projectError) {
        console.error(`Error loading project metadata:`, projectError)
        // Continue with other projects
      }
    }

    console.log(`Successfully loaded ${projects.length} projects from storage`)
    return projects
  } catch (error) {
    console.error("Error listing projects:", error)
    return []
  }
}

/**
 * Delete a project from Supabase storage
 */
export async function deleteProjectFromStorage(projectId: string): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false

  try {
    // Delete the project file
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([`${projectId}.json`])

    if (error) {
      console.error("Error deleting project:", error)
      return false
    }

    // Also delete the thumbnail if it exists
    try {
      await supabase.storage.from(BUCKET_NAME).remove([`thumbnails/${projectId}.png`])
    } catch (thumbnailError) {
      // Ignore errors when deleting thumbnails
      console.warn("Could not delete thumbnail:", thumbnailError)
    }

    return true
  } catch (error) {
    console.error("Error deleting project:", error)
    return false
  }
}

/**
 * Save a project thumbnail to Supabase storage
 */
export async function saveProjectThumbnail(projectId: string, thumbnailBlob: Blob): Promise<string | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  try {
    // Upload the thumbnail to Supabase storage
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(`thumbnails/${projectId}.png`, thumbnailBlob, {
        cacheControl: "3600",
        upsert: true, // Overwrite if exists
      })

    if (error) {
      console.error("Error saving thumbnail:", error)
      return null
    }

    // Get the public URL for the thumbnail
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(`thumbnails/${projectId}.png`)

    return publicUrl
  } catch (error) {
    console.error("Error saving thumbnail:", error)
    return null
  }
}

/**
 * Get a project thumbnail URL from Supabase storage
 */
export async function getProjectThumbnail(projectId: string): Promise<string | undefined> {
  const supabase = getSupabase()
  if (!supabase) return undefined

  try {
    // Check if the thumbnail exists
    const { data } = await supabase.storage.from(BUCKET_NAME).list("thumbnails")

    const thumbnailExists = data?.some((file) => file.name === `${projectId}.png`)

    if (!thumbnailExists) {
      return undefined
    }

    // Get the public URL for the thumbnail
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(`thumbnails/${projectId}.png`)

    return publicUrl
  } catch (error) {
    console.error("Error getting thumbnail:", error)
    return undefined
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

// Update the migrateMockProjects function to handle errors better
export async function migrateMockProjects(mockProjects: Project[]): Promise<boolean> {
  try {
    // Initialize storage first
    const initialized = await initializeStorage()
    if (!initialized) {
      console.warn("Storage initialization failed, but continuing anyway")
    }

    let successCount = 0
    let failCount = 0

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
        }

        // Save the project to storage
        const saved = await saveProjectToStorage(projectData)
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
    // Return true anyway to allow the application to continue
    return true
  }
}

