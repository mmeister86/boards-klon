"use server"

import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

// Sign in with magic link
export async function signIn(formData: FormData) {
  const supabase = await createServerClient()
  const email = formData.get("email") as string
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!siteUrl) {
    console.error("NEXT_PUBLIC_SITE_URL environment variable not set on the server!");
    return { error: "Konfigurationsfehler: Website-URL fehlt auf dem Server." };
  }

  // Request magic link via email
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false, // Don't create a user if they don't exist
      emailRedirectTo: `${siteUrl}/auth/callback`,
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!siteUrl) {
    console.error("NEXT_PUBLIC_SITE_URL environment variable not set on the server!");
    return { error: "Konfigurationsfehler: Website-URL fehlt auf dem Server." };
  }

  // Send magic link for sign up
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true, // Create a user if they don't exist
      emailRedirectTo: `${siteUrl}/auth/callback`,
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!siteUrl) {
    console.error("NEXT_PUBLIC_SITE_URL environment variable not set on the server!");
    return redirect("/sign-in?error=Konfigurationsfehler: Website-URL fehlt auf dem Server.");
  }

  const redirectURL = `${siteUrl}/auth/callback`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectURL,
    },
  })

  if (error) {
    console.error("OAuth sign-in error:", error)
    return redirect(`/sign-in?error=OAuth sign-in fehlgeschlagen: ${encodeURIComponent(error.message)}`);
  }

  if (data.url) {
    return redirect(data.url) // Redirect the user to the provider's authentication page
  }

  // Fallback redirect if no URL is returned (should not happen in normal flow)
  return redirect("/sign-in?error=Konnte OAuth-Anmeldung nicht initiieren")
}
