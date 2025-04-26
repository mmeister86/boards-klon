import { createServerClient as createSupabaseServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * Creates a Supabase client for Server Components with proper cookie handling
 */
export async function createServerClient() {
  const cookieStore = await cookies()

  return createSupabaseServerClient(
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
            // This will throw in middleware, but we can ignore it since we're
            // handling setting cookies in the middleware separately
            console.debug('Cookie set error in server client:', error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options, maxAge: 0 })
          } catch (error) {
            // This will throw in middleware, but we can ignore it
            console.debug('Cookie remove error in server client:', error);
          }
        },
      },
    },
  )
}
