import { createServerClient as createSupabaseServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/lib/supabase/database.types"

/**
 * Creates a Supabase client for Server Components with proper cookie handling and PKCE flow
 * @returns Supabase client instance with proper typing and auth configuration
 */
export async function createServerClient() {
  const cookieStore = await cookies()

  return createSupabaseServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Aktiviert PKCE Flow für erhöhte Sicherheit
        flowType: 'pkce',
        // Automatische Token-Aktualisierung
        autoRefreshToken: true,
        // Erkennt Auth-Parameter in der URL (wichtig für OAuth)
        detectSessionInUrl: true,
        // Session wird über Cookies persistiert
        persistSession: true,
      },
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Verbesserte Fehlerbehandlung mit spezifischen Fehlermeldungen
            console.error('Cookie set error in server client:', {
              error,
              cookieName: name,
              options
            })
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options, maxAge: 0 })
          } catch (error) {
            // Verbesserte Fehlerbehandlung mit spezifischen Fehlermeldungen
            console.error('Cookie remove error in server client:', {
              error,
              cookieName: name,
              options
            })
          }
        },
      },
    },
  )
}
