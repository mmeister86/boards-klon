"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import {
  Home,
  Library,
  BarChart3,
  User,
  Settings,
  LogOut,
  Globe2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function DashboardSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, supabase } = useSupabase();

  const navItems: {
    name: string;
    href: string;
    icon: React.ElementType;
  }[] = [
    { name: "Projekte", href: "/dashboard/projekte", icon: Home },
    { name: "Boards", href: "/dashboard/boards", icon: Globe2 },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Mediathek", href: "/dashboard/mediathek", icon: Library },
  ];

  const profileHref = "/dashboard/profil";
  const settingsHref = "/dashboard/einstellungen";

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <aside className="w-64 h-screen flex flex-col border-r bg-background fixed left-0 top-0 pt-[73px] z-40">
      <nav className="flex-1 px-4 py-8 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Button
              asChild
              key={item.name}
              variant={isActive ? "secondary" : "ghost"}
            >
              <Link
                href={item.href}
                className={cn(
                  "w-full !justify-start",
                  isActive && "font-semibold"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Link>
            </Button>
          );
        })}
      </nav>
      <div className="mt-auto p-4 border-t space-y-2">
        {user ? (
          <>
            <Button
              asChild
              variant={pathname.startsWith(profileHref) ? "secondary" : "ghost"}
            >
              <Link
                href={profileHref}
                className={cn(
                  "w-full !justify-start",
                  pathname.startsWith(profileHref) && "font-semibold"
                )}
              >
                <User className="mr-2 h-4 w-4" />
                Profil
              </Link>
            </Button>
            <Button
              asChild
              variant={
                pathname.startsWith(settingsHref) ? "secondary" : "ghost"
              }
            >
              <Link
                href={settingsHref}
                className={cn(
                  "w-full !justify-start",
                  pathname.startsWith(settingsHref) && "font-semibold"
                )}
              >
                <Settings className="mr-2 h-4 w-4" />
                Einstellungen
              </Link>
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
