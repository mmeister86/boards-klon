import { createBrowserClient } from "@supabase/ssr"

// Provide fallback values for development in v0
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key"

// Create a singleton instance
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

export const createClient = () => {
  // Check if environment variables are available
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn("Supabase URL or Anon Key not found. Using development mode with limited functionality.")
  }

  // If the instance already exists, return it
  if (supabaseInstance) {
    return supabaseInstance
  }

  // Otherwise, create a new instance and store it
  supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey)
  return supabaseInstance
}

