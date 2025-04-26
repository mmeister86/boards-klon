import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import type { Database } from "@/lib/supabase/database.types"

// Definition der geschützten und öffentlichen Routen
const PROTECTED_ROUTES = ['/dashboard', '/boards', '/settings']
const AUTH_ROUTES = ['/login', '/signup', '/forgot-password']

/**
 * Creates a Supabase client for middleware with proper cookie handling and route protection
 */
export function createMiddlewareClient(request: NextRequest) {
  // Create a response object that we'll modify
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
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
    },
  )

  return { supabase, response }
}

/**
 * Middleware function to handle authentication and route protection
 */
export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request)

  try {
    // Überprüfe die aktuelle Session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('Session error in middleware:', sessionError)
    }

    const path = request.nextUrl.pathname
    const isProtectedRoute = PROTECTED_ROUTES.some(route => path.startsWith(route))
    const isAuthRoute = AUTH_ROUTES.some(route => path.startsWith(route))

    // Wenn keine Session existiert und die Route geschützt ist
    if (!session && isProtectedRoute) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirect', path)
      return NextResponse.redirect(redirectUrl)
    }

    // Wenn eine Session existiert und wir auf einer Auth-Route sind
    if (session && isAuthRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Aktualisiere die Response mit den neuesten Cookie-Änderungen
    return response

  } catch (error) {
    console.error('Middleware error:', error)
    return response
  }
}

// Konfiguriere die Middleware-Ausführung
export const config = {
  matcher: [
    // Führe Middleware für alle Routen aus, außer für statische Dateien und API-Routen
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(png|jpg|gif|ico)).*)',
  ],
}
