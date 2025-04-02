import { createServerClient as createSupaServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/lib/supabase/types"

/**
 * Creates a Supabase client for server components with cookie handling
 */
export function createServerClient() {
  const cookieStore = cookies()

  return createSupaServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(
          name: string,
          value: string,
          options: {
            path?: string
            maxAge?: number
            domain?: string
            secure?: boolean
            sameSite?: "strict" | "lax" | "none"
          },
        ) {
          try {
            cookieStore.set(name, value, options)
          } catch (err) {
            // This will throw in middleware or when cookies are read-only
            // We can safely ignore this error since it's handled by the middleware
            console.debug('Cookie set error:', err);
          }
        },
        remove(name: string, options: { path?: string; domain?: string }) {
          try {
            cookieStore.set(name, "", { ...options, maxAge: 0 })
          } catch (err) {
            // This will throw in middleware or when cookies are read-only
            // We can safely ignore this error since it's handled by the middleware
            console.debug('Cookie remove error:', err);
          }
        },
      },
    },
  )
}

