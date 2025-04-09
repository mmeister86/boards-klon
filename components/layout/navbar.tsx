"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  PencilRuler,
  LogIn,
  ChevronLeft,
  Save,
  User,
  Settings,
  LogOut,
  Check,
  ToggleLeft,
  ToggleRight,
  Share,
  Download,
  Trash,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { deleteProjectFromDatabase } from "@/lib/supabase/database";
import { deleteProjectFromStorage } from "@/lib/supabase/storage";

interface NavbarProps {
  currentView?: "dashboard" | "editor" | "mediathek";
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
    saveProject,
    isSaving,
    autoSaveEnabled,
    toggleAutoSave,
    lastSaved,
    currentProjectId,
  } = useBlocksStore();
  const { user, supabase } = useSupabase();
  const [title, setTitle] = useState(projectTitle);
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [showLastSaved, setShowLastSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update title when projectTitle prop changes
  useEffect(() => {
    setTitle(projectTitle);
  }, [projectTitle]);

  // Effect to handle the last saved indicator animation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lastSaved) {
      setShowLastSaved(true);
      timer = setTimeout(() => {
        setShowLastSaved(false);
      }, 2000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [lastSaved]);

  // Effect to handle error display
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      // Check authentication status before saving
      if (!user) {
        setSaveStatus("error");
        setError("Authentication required to save. Please sign in.");
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
        setError(
          "Failed to save project. Please check your connection and permissions."
        );
        // Reset to idle after 3 seconds
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch (error: unknown) {
      setSaveStatus("error");
      setError(error instanceof Error ? error.message : "Error saving project");
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

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const handleDeleteProject = async () => {
    if (!currentProjectId) {
      setError("No project selected to delete.");
      return;
    }
    try {
      // Lösche den Projektdatensatz aus der Datenbank
      const dbDeleted = await deleteProjectFromDatabase(currentProjectId);
      // Lösche die zugehörigen Dateien aus dem Storage
      const storageDeleted = await deleteProjectFromStorage(currentProjectId);

      if (dbDeleted || storageDeleted) {
        // Bei erfolgreichem Löschen, navigiere zum Dashboard
        router.replace("/dashboard");
      } else {
        throw new Error("Failed to delete project");
      }
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "Error deleting project"
      );
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-[73px] border-b bg-background z-50">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Logo and title section */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <PencilRuler className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold">Block Builder</h1>
          </div>

          {/* Navigation links - different based on view */}
          {currentView === "dashboard" ? null : currentView === "editor" ? ( // Removed Mediathek link for dashboard view
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
              {/* Mediathek link removed for editor view */}
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
              {/* Last saved indicator and Auto-save group */}
              <div className="flex items-center gap-2">
                {/* Auto-save toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleAutoSave(!autoSaveEnabled)}
                  className="flex items-center gap-1 text-xs relative"
                  title={
                    autoSaveEnabled
                      ? "Automatisches Speichern ist aktiviert"
                      : "Automatisches Speichern ist deaktiviert"
                  }
                >
                  {/* Last saved indicator */}
                  <div className="absolute right-full h-8 flex items-center">
                    <div
                      className={`
                        transform transition-all duration-300 ease-in-out mr-4
                        ${
                          showLastSaved
                            ? "translate-x-0 opacity-100"
                            : "translate-x-4 opacity-0 pointer-events-none"
                        }
                      `}
                    >
                      {lastSaved && (
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          Zuletzt gespeichert:{" "}
                          {new Date(lastSaved).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  </div>

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
              </div>

              {/* Manual save button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className={`flex items-center gap-1 ${
                  saveStatus === "saving"
                    ? "text-orange-500"
                    : saveStatus === "saved"
                    ? "text-green-500"
                    : saveStatus === "error"
                    ? "text-red-500"
                    : ""
                }`}
              >
                {saveStatus === "saving" ? (
                  <Save className="h-4 w-4 animate-spin" />
                ) : saveStatus === "saved" ? (
                  <Check className="h-4 w-4" />
                ) : saveStatus === "error" ? (
                  <Save className="h-4 w-4" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {saveStatus === "saving"
                    ? "Speichern..."
                    : saveStatus === "saved"
                    ? "Gespeichert"
                    : saveStatus === "error"
                    ? "Fehler"
                    : "Speichern"}
                </span>
              </Button>

              {/* Share button */}
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
              >
                <Share className="h-4 w-4" />
                <span className="hidden sm:inline">Teilen</span>
              </Button>

              {/* Export button */}
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Exportieren</span>
              </Button>

              {/* Delete button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteProject}
                className="flex items-center gap-1 text-red-600 border-red-600 hover:bg-red-100 hover:text-red-700"
              >
                <Trash className="h-4 w-4" />
                <span className="hidden sm:inline">Löschen</span>
              </Button>
            </>
          )}

          {/* User menu / Login Button - Conditionally render based on currentView and user status */}
          {user
            ? // Show User Menu only if NOT on dashboard AND NOT on editor
              currentView !== "dashboard" &&
              currentView !== "editor" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-9 w-9 rounded-full"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>
                          {user.email?.[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.email?.split("@")[0]}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => router.push("/dashboard?view=profile")}
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Profil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push("/dashboard?view=settings")}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Einstellungen</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Abmelden</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            : // Show Login Button only if NOT on dashboard AND NOT on editor
              currentView !== "dashboard" &&
              currentView !== "editor" && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="flex items-center gap-1"
                >
                  <Link href="/login">
                    <LogIn className="h-4 w-4" />
                    <span>Anmelden</span>
                  </Link>
                </Button>
              )}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md shadow-lg z-50">
          {error}
        </div>
      )}
    </nav>
  );
}
