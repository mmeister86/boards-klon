"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

// Define the context type
type SupabaseContextType = {
  supabase: ReturnType<typeof getSupabaseBrowserClient> | undefined;
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  error?: string;
};

// Create the context with default values
const SupabaseContext = createContext<SupabaseContextType>({
  supabase: undefined,
  session: null,
  user: null,
  isLoading: true,
});

/**
 * Provider component that makes Supabase client available to any child component that calls useSupabase().
 */
export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => {
    // Only create the client once on component mount
    if (typeof window !== "undefined") {
      return getSupabaseBrowserClient();
    }
    return undefined;
  });

  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  // Set up auth state listener on mount
  useEffect(() => {
    if (!supabase) return;

    // Get initial user data securely
    const getInitialUser = async () => {
      try {
        // Get authenticated user data
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;

        setUser(user);
        // If we have a user, we can assume we have a valid session
        setSession(user ? ({ user } as Session) : null);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Error getting initial user data";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialUser();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // When auth state changes, get fresh user data
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (!error) {
        setUser(user);
        setSession(session); // session from onAuthStateChange is already validated
      }
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const value = {
    supabase,
    session,
    user,
    isLoading,
    error,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}

/**
 * Hook that provides access to the Supabase client and auth state
 */
export function useSupabase() {
  const context = useContext(SupabaseContext);

  if (!context) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }

  return context;
}
