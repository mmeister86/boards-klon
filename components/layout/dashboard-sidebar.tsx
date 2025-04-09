"use client";

import React from "react"; // Removed useState import
import { useRouter } from "next/navigation";
import { Home, Library, BarChart3, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// Removed DropdownMenu*, ProfileSheet, SettingsSheet imports

// Define the type for the view state setter function including new views
type SetActiveView = React.Dispatch<
  React.SetStateAction<
    "projects" | "mediathek" | "analytics" | "profile" | "settings"
  >
>;

interface DashboardSidebarProps {
  activeView: "projects" | "mediathek" | "analytics" | "profile" | "settings"; // Updated activeView type
  setActiveView: SetActiveView;
}

export default function DashboardSidebar({
  activeView,
  setActiveView,
}: DashboardSidebarProps) {
  const router = useRouter();
  const { user, supabase } = useSupabase();
  // Removed isProfileOpen, isSettingsOpen state

  // Explicitly type the navItems array
  const navItems: {
    name: string;
    view: "projects" | "mediathek" | "analytics";
    icon: React.ElementType;
  }[] = [
    { name: "Projekte", view: "projects", icon: Home },
    { name: "Mediathek", view: "mediathek", icon: Library },
    { name: "Analytics", view: "analytics", icon: BarChart3 },
  ];

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <aside className="w-64 h-screen flex flex-col border-r bg-background fixed left-0 top-0 pt-[73px] z-40">
      <nav className="flex-1 px-4 py-8 space-y-2">
        {navItems.map((item) => (
          <Button
            key={item.name}
            variant={activeView === item.view ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start",
              activeView === item.view && "font-semibold"
            )}
            onClick={() => setActiveView(item.view)}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.name}
          </Button>
        ))}
      </nav>
      <div className="mt-auto p-4 border-t space-y-2">
        {user ? (
          <>
            <Button
              variant={activeView === "profile" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveView("profile")}
            >
              <User className="mr-2 h-4 w-4" />
              Profil
            </Button>
            <Button
              variant={activeView === "settings" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveView("settings")}
            >
              <Settings className="mr-2 h-4 w-4" />
              Einstellungen
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Abmelden
            </Button>
            <div className="flex items-center gap-2 px-2 py-1 mt-2 pt-2 pb-4">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-left">
                <span className="text-sm font-medium leading-none truncate max-w-[150px]">
                  {user.email?.split("@")[0]}
                </span>
                <span className="text-xs leading-none text-muted-foreground truncate max-w-[150px]">
                  {user.email}
                </span>
              </div>
            </div>
          </>
        ) : (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/sign-in")}
          >
            Anmelden
          </Button>
        )}
      </div>
    </aside>
  );
}
