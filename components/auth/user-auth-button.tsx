"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import { useSupabase } from "@/components/providers/supabase-provider";

export function UserAuthButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { supabase, user } = useSupabase();
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    if (!supabase) return;

    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (error: any) {
      setError(error.message || "Error signing out");
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if user is not logged in
  if (!user) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSignOut}
      disabled={isLoading || !supabase}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </>
      )}
    </Button>
  );
}
