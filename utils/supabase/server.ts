import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Provide fallback values for development in v0
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase URL or Anon Key not found. Using development mode with limited functionality. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
  )
  // Optional: Hier könntest du Standardwerte setzen oder einen Fehler werfen,
  // anstatt mit potenziell nicht funktionierenden Clients weiterzumachen.
  // Für dieses Beispiel verwenden wir die Ausrufezeichen oben, was impliziert,
  // dass die Werte zur Laufzeit vorhanden sein MÜSSEN.
}

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    supabaseUrl, // Verwende die oben definierten Variablen
    supabaseAnonKey, // Verwende die oben definierten Variablen
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
