"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

// Define the context type
type SupabaseContextType = {
  supabase: ReturnType<typeof createClient> | undefined;
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
      return createClient();
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

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (error: any) {
        setError(error.message || "Error getting initial session");
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
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
