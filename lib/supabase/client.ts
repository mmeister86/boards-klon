import { createBrowserClient } from "@supabase/ssr"
import { createClient as createServerClient } from "@supabase/supabase-js"
import { Database } from "./database.types"

/**
 * Creates a Supabase client that works in both browser and server environments
 */
export function createClient() {
  // Check if environment variables are available
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Supabase URL or Anon Key not found")
  }

  // Create client based on environment
  if (typeof window === "undefined") {
    // Server-side: Use regular client
    return createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  }

  // Browser-side: Use browser client
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

// Note: We're removing the singleton pattern to avoid stale auth state
