import { createBrowserClient } from "@supabase/ssr"

// Behalte deine Fallback-Logik
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase URL or Anon Key not found. Using development mode with limited functionality. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
  )
}

// Create a singleton instance
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

export const createClient = () => {
  // If the instance already exists, return it
  if (supabaseInstance) {
    return supabaseInstance
  }

  // Otherwise, create a new instance and store it
  // Stelle sicher, dass hier die Variablen supabaseUrl und supabaseAnonKey verwendet werden
  supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey)
  return supabaseInstance
}

// Überprüfe, ob dieser Export noch benötigt wird.
// Wenn nicht, kann er entfernt werden.
export { getSupabaseBrowserClient, supabaseBrowser } from '../../lib/supabase/supabase-browser'
