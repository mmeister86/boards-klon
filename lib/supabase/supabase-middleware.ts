import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import type { Database } from "@/lib/supabase/database.types"

export function getSupabaseMiddlewareClient(request: NextRequest) {
  // Create a response object that we'll modify later
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Update the response cookies
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          // Update the response cookies
          response.cookies.set({
            name,
            value: "",
            ...options,
            maxAge: 0,
          })
        },
      },
    }
  )

  return { supabase, response }
}
