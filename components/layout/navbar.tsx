"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  PencilRuler,
  Eye,
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
  const [showLastSaved, setShowLastSaved] = useState(false);

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
            <div className="hidden md:flex space-x-6 ml-8" />
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

              {/* Preview button */}
              <Button
                variant={previewMode ? "default" : "outline"}
                size="sm"
                onClick={togglePreviewMode}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                <span>{previewMode ? "Vorschau beenden" : "Vorschau"}</span>
              </Button>

              {/* Action buttons */}
              <Button variant="outline" size="sm">
                Veröffentlichen
              </Button>
            </>
          )}

          {/* User avatar dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-0">
                <Avatar>
                  <AvatarFallback>
                    {user ? user.email?.charAt(0).toUpperCase() : "G"}
                  </AvatarFallback>
                </Avatar>
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
                  {currentView === "editor" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Share className="mr-2 h-4 w-4" />
                        <span>Teilen</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        <span>Exportieren</span>
                      </DropdownMenuItem>
                    </>
                  )}
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
