"use server"

import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

// Sign in with magic link
export async function signIn(formData: FormData) {
  const supabase = createServerClient()
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
  const supabase = createServerClient()
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
  const supabase = createServerClient()
  await supabase.auth.signOut()
  return redirect("/")
}

