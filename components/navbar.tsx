"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import AuthModal from "./auth-modal";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function Navbar() {
  const { supabase, user, isLoading } = useSupabase();
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  const handleAuthClick = (mode: "signin" | "signup") => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleSignOut = async () => {
    if (!supabase) return;

    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const handleDashboardClick = () => {
    router.push("/dashboard");
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">B</span>
            </div>
            <span className="font-bold inline-block">Block Builder</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="#features"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Funktionen
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Preise
            </Link>
            <Link
              href="#about"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Über uns
            </Link>
          </nav>
        </div>

        <div className="hidden md:flex gap-4">
          {isLoading ? (
            <div className="h-9 w-24 bg-muted rounded-md animate-pulse"></div>
          ) : user ? (
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleDashboardClick}>
                Dashboard
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground font-medium">
                        {user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleSignOut}>
                    Abmelden
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <>
              <Button variant="ghost" onClick={() => handleAuthClick("signin")}>
                Anmelden
              </Button>
              <Button onClick={() => handleAuthClick("signup")}>
                Registrieren
              </Button>
            </>
          )}
        </div>

        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menü umschalten</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="flex flex-col gap-4 mt-8">
              <Link
                href="#features"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Funktionen
              </Link>
              <Link
                href="#pricing"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Preise
              </Link>
              <Link
                href="#about"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Über uns
              </Link>
              <div className="flex flex-col gap-2 mt-4">
                {isLoading ? (
                  <div className="h-9 w-full bg-muted rounded-md animate-pulse"></div>
                ) : user ? (
                  <>
                    <Button onClick={handleDashboardClick}>Dashboard</Button>
                    <Button variant="outline" onClick={handleSignOut}>
                      Abmelden
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => handleAuthClick("signin")}
                    >
                      Anmelden
                    </Button>
                    <Button onClick={() => handleAuthClick("signup")}>
                      Registrieren
                    </Button>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {!user && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode={authMode}
        />
      )}
    </header>
  );
}
