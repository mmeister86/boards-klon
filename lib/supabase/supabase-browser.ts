import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/lib/supabase/database.types"

// Create a module-level variable to store the client instance
let supabaseClientInstance: ReturnType<typeof createBrowserClient<Database>> | null = null

// Function to get or create the Supabase browser client
export function getSupabaseBrowserClient() {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    throw new Error("getSupabaseBrowserClient should only be called in the browser")
  }

  // For production, or if we already have an instance, return it
  if (supabaseClientInstance) {
    return supabaseClientInstance
  }

  // Create a new instance
  supabaseClientInstance = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  return supabaseClientInstance
}

// Export a function to get the client
// This ensures we only create the client when it's actually used
export const supabaseBrowser = typeof window !== "undefined" ? getSupabaseBrowserClient() : null

