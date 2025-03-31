import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import type { Database } from "@/lib/supabase/types"

/**
 * Creates a Supabase client for middleware with proper cookie handling
 */
export function createMiddlewareClient(request: NextRequest) {
  // Create a response object that we'll modify
  let response = NextResponse.next({
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
          // Update both the request and response cookies
          request.cookies.set({
            name,
            value,
            ...options,
          })

          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })

          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: { path?: string; domain?: string }) {
          // Update both the request and response cookies
          request.cookies.set({
            name,
            value: "",
            ...options,
            maxAge: 0,
          })

          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })

          response.cookies.set({
            name,
            value: "",
            ...options,
            maxAge: 0,
          })
        },
      },
    },
  )

  return { supabase, response }
}

