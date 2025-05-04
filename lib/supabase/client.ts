import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "./database.types"

/**
 * Creates a Supabase client for browser environment
 */
export function createClient() {
  // Check if environment variables are available
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Supabase URL or Anon Key not found")
  }

  // Ensure we're only calling this on the client side
  if (typeof window === "undefined") {
    throw new Error("createClient should only be called in the browser. Für serverseitigen Code nutze createServerClient aus lib/supabase/server.")
  }

  // Browser-side: Use browser client
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

// Note: We're removing the singleton pattern to avoid stale auth state

// Exportiere die zentrale Browser-Client-Initialisierung
export { getSupabaseBrowserClient, supabaseBrowser } from './supabase-browser'
