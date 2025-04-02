import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/lib/supabase/database.types"

export function getSupabaseServerClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: { path?: string; maxAge?: number; domain?: string; secure?: boolean; sameSite?: "strict" | "lax" | "none" }) {
          try {
            cookieStore.set(name, value, options)
          } catch (err) {
            // This will throw in middleware, but we can ignore it since we're
            // handling setting cookies in the middleware separately
            console.debug('Cookie set error in server client:', err);
          }
        },
        remove(name: string, options: { path?: string; domain?: string }) {
          try {
            cookieStore.set(name, "", { ...options, maxAge: 0 })
          } catch (err) {
            // This will throw in middleware, but we can ignore it
            console.debug('Cookie remove error in server client:', err);
          }
        },
      },
    },
  )
}

