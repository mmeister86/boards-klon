import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { createMiddlewareClient } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  // Create a Supabase client configured to use cookies
  const { supabase, response } = createMiddlewareClient(request)

  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession()

  // Check if the request is for a protected route
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/editor')

  // If no session and trying to access protected route, redirect to sign-in
  if (!session && isProtectedRoute) {
    const redirectUrl = new URL('/sign-in', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If we have a session and trying to access auth page, redirect to dashboard
  if (session && request.nextUrl.pathname === '/auth') {
    const redirectUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     *
     * Also match specific protected routes:
     * - /dashboard routes
     * - /editor routes
     * - /auth route (for redirecting logged-in users)
     */
    // Re-enable the general matcher
    "/((?!_next/static|_next/image|favicon.ico|public).*)",

    // Behalte die spezifischen Matcher für Auth-Logik bei:
    "/dashboard/:path*",
    "/editor/:path*",
    "/auth",
  ],
}
