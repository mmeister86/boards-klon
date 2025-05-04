import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Exportiere die zentrale Browser-Client-Initialisierung aus lib/supabase/supabase-browser.ts
export { getSupabaseBrowserClient, supabaseBrowser } from './supabase/supabase-browser'
