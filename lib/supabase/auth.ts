import { createServerClient } from './server'
import { getSupabaseBrowserClient } from './client'
import { cookies } from 'next/headers'
import { Session, User, AuthError } from '@supabase/supabase-js'

/**
 * Auth-Utilities für häufige Authentifizierungsoperationen
 */

// Typen für Auth-Responses
export interface AuthResponse<T = void> {
  success: boolean
  error?: string
  data?: T
}

// Typen für Benutzer-Updates
export interface UserUpdateData {
  email?: string
  password?: string
  data?: {
    first_name?: string
    last_name?: string
    avatar_url?: string
    [key: string]: string | undefined
  }
}

/**
 * Server-seitige Authentifizierungsfunktionen
 */
export const serverAuth = {
  /**
   * Überprüft die aktuelle Session auf dem Server
   */
  async getSession(): Promise<AuthResponse<Session | null>> {
    try {
      const supabase = await createServerClient()
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) throw error

      return {
        success: true,
        data: session
      }
    } catch (error) {
      console.error('Error getting session:', error)
      return {
        success: false,
        error: error instanceof AuthError ? error.message : 'Failed to get session'
      }
    }
  },

  /**
   * Überprüft, ob ein Benutzer authentifiziert ist
   */
  async isAuthenticated(): Promise<boolean> {
    const { success, data: session } = await serverAuth.getSession()
    return success && !!session
  },

  /**
   * Löscht alle Auth-Cookies
   */
  async clearAuthCookies(): Promise<void> {
    const cookieStore = cookies()
    const authCookies = ['sb-access-token', 'sb-refresh-token']

    authCookies.forEach(cookie => {
      cookieStore.delete(cookie)
    })
  }
}

/**
 * Client-seitige Authentifizierungsfunktionen
 */
export const clientAuth = {
  /**
   * Meldet einen Benutzer mit Email und Passwort an
   */
  async signInWithEmail(email: string, password: string): Promise<AuthResponse<{ user: User | null; session: Session | null }>> {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      return {
        success: true,
        data
      }
    } catch (error) {
      console.error('Sign in error:', error)
      return {
        success: false,
        error: error instanceof AuthError ? error.message : 'Failed to sign in'
      }
    }
  },

  /**
   * Registriert einen neuen Benutzer
   */
  async signUp(email: string, password: string): Promise<AuthResponse<{ user: User | null; session: Session | null }>> {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error

      return {
        success: true,
        data
      }
    } catch (error) {
      console.error('Sign up error:', error)
      return {
        success: false,
        error: error instanceof AuthError ? error.message : 'Failed to sign up'
      }
    }
  },

  /**
   * Meldet den Benutzer ab
   */
  async signOut(): Promise<AuthResponse> {
    try {
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase.auth.signOut()

      if (error) throw error

      return {
        success: true
      }
    } catch (error) {
      console.error('Sign out error:', error)
      return {
        success: false,
        error: error instanceof AuthError ? error.message : 'Failed to sign out'
      }
    }
  },

  /**
   * Sendet einen Magic Link zur passwortlosen Anmeldung
   */
  async sendMagicLink(email: string): Promise<AuthResponse> {
    try {
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error

      return {
        success: true
      }
    } catch (error) {
      console.error('Magic link error:', error)
      return {
        success: false,
        error: error instanceof AuthError ? error.message : 'Failed to send magic link'
      }
    }
  },

  /**
   * Aktualisiert das Benutzerprofil
   */
  async updateUser(userUpdate: UserUpdateData): Promise<AuthResponse<{ user: User | null }>> {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase.auth.updateUser(userUpdate)

      if (error) throw error

      return {
        success: true,
        data
      }
    } catch (error) {
      console.error('User update error:', error)
      return {
        success: false,
        error: error instanceof AuthError ? error.message : 'Failed to update user'
      }
    }
  }
}
