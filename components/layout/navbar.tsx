"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  PencilRuler,
  Eye,
  Home,
  LogIn,
  ChevronLeft,
  Save,
  MoreVertical,
  User,
  Settings,
  LogOut,
  Check,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useBlocksStore } from "@/store/blocks-store";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSupabase } from "@/components/providers/supabase-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface NavbarProps {
  currentView?: "dashboard" | "editor";
  projectTitle?: string;
  onTitleChange?: (title: string) => void;
}

export default function Navbar({
  currentView = "dashboard",
  projectTitle = "Untitled Project",
  onTitleChange,
}: NavbarProps) {
  const router = useRouter();
  const {
    previewMode,
    togglePreviewMode,
    saveProject,
    isSaving,
    autoSaveEnabled,
    toggleAutoSave,
    lastSaved,
  } = useBlocksStore();
  const { user } = useSupabase();
  const [title, setTitle] = useState(projectTitle);
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  // Update title when projectTitle prop changes
  useEffect(() => {
    setTitle(projectTitle);
  }, [projectTitle]);

  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      // Check authentication status before saving
      if (!user) {
        setSaveStatus("error");
        console.error("Authentication required to save. Please sign in.");
        setTimeout(() => setSaveStatus("idle"), 3000);
        return;
      }

      const success = await saveProject(title);
      if (success) {
        setSaveStatus("saved");
        // Reset to idle after 2 seconds
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setSaveStatus("error");
        console.error(
          "Failed to save project. Please check your connection and permissions."
        );
        // Reset to idle after 3 seconds
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch (error) {
      console.error("Error saving project:", error);
      setSaveStatus("error");
      // Reset to idle after 3 seconds
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    setIsEditing(false);
    if (onTitleChange) {
      onTitleChange(title);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      if (onTitleChange) {
        onTitleChange(title);
      }
    }
  };

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <nav className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Logo and title section */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <PencilRuler className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold">Block Builder</h1>
          </div>

          {/* Navigation links - different based on view */}
          {currentView === "dashboard" ? (
            <div className="hidden md:flex space-x-6 ml-8">
              <Link
                href="/dashboard"
                className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
              <a
                href="#"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Vorlagen
              </a>
              <a
                href="#"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Einstellungen
              </a>
            </div>
          ) : (
            <div className="flex items-center ml-8 space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToDashboard}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Zurück
              </Button>
              <div className="h-4 border-r border-border"></div>
              {isEditing ? (
                <Input
                  value={title}
                  onChange={handleTitleChange}
                  onBlur={handleTitleBlur}
                  onKeyDown={handleTitleKeyDown}
                  className="h-9 w-48 text-sm font-medium"
                  autoFocus
                />
              ) : (
                <div
                  className="h-9 px-3 flex items-center text-sm font-medium cursor-pointer hover:bg-muted rounded-md"
                  onClick={() => setIsEditing(true)}
                >
                  {title}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right side actions - different based on view */}
        <div className="flex items-center space-x-4">
          {currentView === "editor" && (
            <>
              <Button
                variant={previewMode ? "default" : "outline"}
                size="sm"
                onClick={togglePreviewMode}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                <span>{previewMode ? "Vorschau beenden" : "Vorschau"}</span>
              </Button>
              <div className="flex items-center gap-2">
                {/* Auto-save toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleAutoSave(!autoSaveEnabled)}
                  className="flex items-center gap-1 text-xs"
                  title={
                    autoSaveEnabled
                      ? "Automatisches Speichern ist aktiviert"
                      : "Automatisches Speichern ist deaktiviert"
                  }
                >
                  {autoSaveEnabled ? (
                    <>
                      <ToggleRight className="h-4 w-4 text-green-500" />
                      <span className="hidden sm:inline">Auto</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Auto</span>
                    </>
                  )}
                </Button>

                {/* Last saved indicator */}
                {lastSaved && autoSaveEnabled && (
                  <div className="text-xs text-muted-foreground hidden md:block">
                    Zuletzt gespeichert:{" "}
                    {new Date(lastSaved).toLocaleTimeString()}
                  </div>
                )}

                {/* Manual save button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving || saveStatus === "saving"}
                  className="flex items-center gap-2 min-w-[90px]"
                >
                  {saveStatus === "saving" ? (
                    <>
                      <PencilRuler className="h-4 w-4 animate-spin" />
                      <span>Wird gespeichert...</span>
                    </>
                  ) : saveStatus === "saved" ? (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Gespeichert</span>
                    </>
                  ) : saveStatus === "error" ? (
                    <span className="text-destructive">
                      Speichern fehlgeschlagen
                    </span>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Speichern</span>
                    </>
                  )}
                </Button>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Veröffentlichen</DropdownMenuItem>
                  <DropdownMenuItem>Exportieren</DropdownMenuItem>
                  <DropdownMenuItem>Teilen</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Projekteinstellungen</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {/* User avatar with dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {user ? user.email?.charAt(0).toUpperCase() : "G"}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {user ? (
                <>
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>Mein Konto</span>
                      <span className="text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Einstellungen</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Abmelden</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/auth" className="flex items-center">
                      <LogIn className="mr-2 h-4 w-4" />
                      <span>Anmelden</span>
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
