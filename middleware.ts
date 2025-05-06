import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

const PROTECTED_ROUTES = ['/dashboard', '/editor'];
const UNAUTHENTICATED_REDIRECT_TARGET = '/sign-in';
const AUTH_PAGES_FOR_LOGGED_IN_USERS = ['/auth']; // Pfade wie /login, /signup, die für eingeloggte User nicht zugänglich sein sollen
const DEFAULT_REDIRECT_FOR_LOGGED_IN_USERS = '/dashboard';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
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
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname;

  const isProtectedRoute = PROTECTED_ROUTES.some(route => path.startsWith(route));
  const isOnAuthPageForLoggedInUser = AUTH_PAGES_FOR_LOGGED_IN_USERS.some(route => path.startsWith(route));

  if (!user && isProtectedRoute) {
    const redirectUrl = new URL(UNAUTHENTICATED_REDIRECT_TARGET, request.url)
    return NextResponse.redirect(redirectUrl)
  }

  if (user && isOnAuthPageForLoggedInUser) {
    const redirectUrl = new URL(DEFAULT_REDIRECT_FOR_LOGGED_IN_USERS, request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    '/auth/:path*', // Behalte diesen Matcher bei, um /auth und seine Unterpfade abzudecken
  ],
}
