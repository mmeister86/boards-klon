import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/lib/supabase/types"

/**
 * Creates a Supabase client for browser environments with refresh support
 * This approach creates a fresh client when needed rather than using a static singleton
 */
export function createClient() {
  if (typeof window === "undefined") {
    console.warn("createClient should only be called in browser environments")
    return undefined
  }

  try {
    // Check if environment variables are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn("Supabase URL or Anon Key not found. Using fallback values.")
      // Continue with fallback values
    }

    // Create a fresh client instance each time to ensure latest auth state
    const client = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key",
    )

    // Ensure the client is properly initialized
    if (!client) {
      throw new Error("Failed to create Supabase client")
    }

    return client
  } catch (error) {
    console.error("Error creating Supabase client:", error)
    return undefined
  }
}

// Note: We're removing the singleton pattern to avoid stale auth state
