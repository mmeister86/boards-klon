"use server"

import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

// Sign in with magic link
export async function signIn(formData: FormData) {
  const supabase = await createServerClient()
  const email = formData.get("email") as string

  // Request magic link via email
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false, // Don't create a user if they don't exist
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: "Magic link sent! Check your email to sign in" }
}

// Sign up with magic link
export async function signUp(formData: FormData) {
  const supabase = await createServerClient()
  const email = formData.get("email") as string

  // Send magic link for sign up
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true, // Create a user if they don't exist
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: "Magic link sent! Check your email to complete signup" }
}

export async function signOut() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  return redirect("/")
}
// Sign in/up with OAuth provider
export async function signInWithProvider(provider: "google" | "apple") {
  const supabase = await createServerClient()
  const redirectURL = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectURL,
    },
  })

  if (error) {
    console.error("OAuth sign-in error:", error)
    // Redirecting to sign-in page with error is tricky in server actions
    // Best handled client-side or by redirecting with a query param
    // For now, just redirecting back to sign-in might be okay,
    // but ideally, we'd show an error message.
    return redirect("/sign-in?error=OAuth sign-in failed")
  }

  if (data.url) {
    return redirect(data.url) // Redirect the user to the provider's authentication page
  }

  // Fallback redirect if no URL is returned (should not happen in normal flow)
  return redirect("/sign-in?error=Could not initiate OAuth sign-in")
}
