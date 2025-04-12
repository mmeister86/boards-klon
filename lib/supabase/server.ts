import { createServerClient as createSupaServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
// import type { Database } from "@/lib/supabase/types" // TODO: Generate/populate types.ts

/**
 * Creates a Supabase client for server components with cookie handling
 */
export function createServerClient() {
  const cookieStore = cookies()

  return createSupaServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            console.debug('Server Component cookie set error:', error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            console.debug('Server Component cookie remove error:', error);
          }
        },
      },
    },
  )
}
