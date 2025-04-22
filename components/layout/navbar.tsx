"use client";

import type React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  PencilRuler,
  ChevronLeft,
  Save,
  Check,
  ToggleLeft,
  ToggleRight,
  Globe2,
  Loader2,
  Trash2,
} from "lucide-react";
import { useBlocksStore } from "@/store/blocks-store";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { deleteProjectFromStorage } from "@/lib/supabase/storage";
import { deleteProjectFromDatabase } from "@/lib/supabase/database";

interface NavbarProps {
  context: "dashboard" | "editor";
  projectTitle?: string;
  onTitleChange?: (title: string) => void;
}

export default function Navbar({
  context,
  projectTitle = "Untitled Project",
  onTitleChange,
}: NavbarProps) {
  const router = useRouter();

  // Select store values individually and only when context is 'editor'
  // This prevents unnecessary re-renders in 'dashboard' context and avoids unstable object references
  const saveProject = useBlocksStore((state) =>
    context === "editor" ? state.saveProject : undefined
  );
  const autoSaveEnabled = useBlocksStore((state) =>
    context === "editor" ? state.autoSaveEnabled : false
  );
  const toggleAutoSave = useBlocksStore((state) =>
    context === "editor" ? state.toggleAutoSave : undefined
  );
  const lastSaved = useBlocksStore((state) =>
    context === "editor" ? state.lastSaved : null
  );
  const currentProjectId = useBlocksStore((state) =>
    context === "editor" ? state.currentProjectId : null
  );
  const publishBoard = useBlocksStore((state) =>
    context === "editor" ? state.publishBoard : undefined
  );
  const isPublished = useBlocksStore((state) =>
    context === "editor" ? state.isPublished : false
  );
  const isPublishing = useBlocksStore((state) =>
    context === "editor" ? state.isPublishing : false
  );
  const publishedUrl = useBlocksStore((state) =>
    context === "editor" ? state.publishedUrl : null
  );
  const checkPublishStatus = useBlocksStore((state) =>
    context === "editor" ? state.checkPublishStatus : undefined
  );
  const { user } = useSupabase();

  const initialTitleRef = useRef(projectTitle);
  const [title, setTitle] = useState(initialTitleRef.current);
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [showLastSaved, setShowLastSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const setProjectJustDeleted = useBlocksStore((state) =>
    context === "editor" ? state.setProjectJustDeleted : undefined
  );
  const setDeletedProjectTitle = useBlocksStore((state) =>
    context === "editor" ? state.setDeletedProjectTitle : undefined
  );

  useEffect(() => {
    if (context === "editor" && projectTitle !== initialTitleRef.current) {
      initialTitleRef.current = projectTitle;
      setTitle(projectTitle);
    }
  }, [projectTitle, context]);

  useEffect(() => {
    if (!lastSaved || context !== "editor") return;

    setShowLastSaved(true);
    const timer = setTimeout(() => setShowLastSaved(false), 2000);
    return () => clearTimeout(timer);
  }, [lastSaved, context]);

  useEffect(() => {
    if (!error) return;
    toast.error(error, { duration: 3000 });
    const timer = setTimeout(() => setError(null), 3000);
    return () => clearTimeout(timer);
  }, [error]);

  useEffect(() => {
    if (context === "editor" && currentProjectId && checkPublishStatus) {
      // Check the actual publication status when the component mounts
      checkPublishStatus();
    }
  }, [context, currentProjectId, checkPublishStatus]);

  const handleSave = useCallback(async () => {
    // Ensure context is editor and saveProject function exists
    if (context !== "editor" || !currentProjectId || !saveProject) return;
    setSaveStatus("saving");
    try {
      if (!user) {
        setSaveStatus("error");
        setError("Authentication required to save. Please sign in.");
        setTimeout(() => setSaveStatus("idle"), 3000);
        return;
      }
      const success = await saveProject(title);
      if (success) {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setSaveStatus("error");
        setError(
          "Failed to save project. Please check your connection and permissions."
        );
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch (error: unknown) {
      setSaveStatus("error");
      setError(error instanceof Error ? error.message : "Error saving project");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  }, [context, currentProjectId, user, saveProject, title]); // Keep saveProject in deps

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (context !== "editor") return;
      const newTitle = e.target.value;
      setTitle(newTitle);
      onTitleChange?.(newTitle);
    },
    [context, onTitleChange]
  );

  const handleTitleBlur = useCallback(() => {
    if (context !== "editor") return;
    setIsEditing(false);
  }, [context]);

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (context !== "editor") return;
      if (e.key === "Enter") {
        setIsEditing(false);
      }
    },
    [context]
  );

  const handleBackToDashboard = useCallback(() => {
    router.push("/dashboard/projekte");
  }, [router]);

  const handleToggleAutoSave = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      // Ensure toggleAutoSave function exists before calling
      if (!toggleAutoSave) return;
      toggleAutoSave();
    },
    [toggleAutoSave] // Keep toggleAutoSave in deps
  );

  const handlePublish = useCallback(async () => {
    if (!publishBoard || !user) {
      toast.error(
        "Sie müssen angemeldet sein, um ein Board zu veröffentlichen."
      );
      return;
    }

    try {
      const success = await publishBoard();
      if (success) {
        toast.success("Board erfolgreich veröffentlicht!");
      } else {
        toast.error("Fehler beim Veröffentlichen des Boards.");
      }
    } catch (error: unknown) {
      console.error("Error publishing board:", error);
      toast.error("Fehler beim Veröffentlichen des Boards.");
    }
  }, [publishBoard, user]);

  const handleDelete = useCallback(async () => {
    // Get user ID first
    if (!user?.id) {
      toast.error("Fehler: Benutzer nicht angemeldet.");
      return;
    }
    const userId = user.id;

    // Ensure project ID and store callbacks are available
    if (
      !currentProjectId ||
      !setProjectJustDeleted ||
      !setDeletedProjectTitle
    ) {
      console.warn("Deletion prerequisites not met:", {
        currentProjectId,
        storeCallbacks: !!(setProjectJustDeleted && setDeletedProjectTitle),
      });
      toast.error("Fehler: Projektinformationen nicht verfügbar.");
      return;
    }

    setIsDeleting(true);
    let storageDeleted = false;
    let databaseDeleted = false;

    try {
      // 1. Delete from storage FIRST
      console.log(
        `[Navbar Delete] Attempting to delete project from storage: ${currentProjectId} for user ${userId}`
      );
      storageDeleted = await deleteProjectFromStorage(currentProjectId, userId); // Pass userId

      if (!storageDeleted) {
        // If storage delete failed, stop the process
        throw new Error(
          "Fehler beim Löschen der Projektdateien aus dem Speicher."
        );
      }
      console.log(
        `[Navbar Delete] Successfully deleted project from storage: ${currentProjectId}`
      );

      // 2. Conditionally delete from database ONLY if a database ID exists
      // Use currentProjectId as it should match the DB ID after creation/loading
      console.log(
        `[Navbar Delete] Attempting to delete project from database: ${currentProjectId}`
      );
      databaseDeleted = await deleteProjectFromDatabase(currentProjectId); // Use the primary project ID

      if (!databaseDeleted) {
        // Log warning but proceed, as storage was the primary target
        console.warn(
          `[Navbar Delete] Project ${currentProjectId} deleted from storage, but failed/skipped database deletion.`
        );
      } else {
        console.log(
          `[Navbar Delete] Successfully deleted project from database: ${currentProjectId}`
        );
      }

      // If we reached here, at least storage was deleted successfully

      // Set deletion state in store
      setProjectJustDeleted(true);
      setDeletedProjectTitle(title);

      // Redirect to dashboard
      router.push("/dashboard/projekte");

      // No need to setIsDeleting(false) here as we are navigating away
    } catch (error: unknown) {
      console.error("[Navbar Delete] Error deleting project:", error);
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Unbekannter Fehler beim Löschen";
      toast.error(`Fehler beim Löschen: ${errorMsg}`);
      setIsDeleting(false); // Stop loading indicator on error
    }
    // Add userId to dependency array
  }, [
    currentProjectId,
    setProjectJustDeleted,
    setDeletedProjectTitle,
    title,
    router,
    user?.id, // Add userId
  ]);

  return (
    <nav className="fixed top-0 left-0 right-0 h-[73px] border-b bg-background z-50">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/projekte" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <PencilRuler className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold hidden sm:block">
              Block Builder
            </h1>
          </Link>

          {context === "editor" && (
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
              <div className="h-6 border-r border-border mx-2"></div>
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

        <div className="flex items-center space-x-2">
          {context === "editor" && (
            <>
              {showLastSaved && (
                <span className="text-xs text-muted-foreground ease-in-out duration-300">
                  Gespeichert um {new Date(lastSaved!).toLocaleTimeString()}
                </span>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleAutoSave}
                title={
                  autoSaveEnabled
                    ? "Automatisches Speichern aktiviert"
                    : "Automatisches Speichern deaktiviert"
                }
              >
                {autoSaveEnabled ? (
                  <ToggleRight className="h-5 w-5 text-green-600" />
                ) : (
                  <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                disabled={saveStatus === "saving" || saveStatus === "saved"}
                className="relative w-24 justify-center pr-6"
              >
                {saveStatus === "saving" && (
                  <>
                    <Save className="h-4 w-4 animate-spin" />
                    Speichern...
                  </>
                )}
                {saveStatus === "saved" && (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    Gespeichert
                  </>
                )}
                {saveStatus === "error" && (
                  <>
                    <Save className="h-4 w-4 text-red-600" />
                    Fehler
                  </>
                )}
                {saveStatus === "idle" && (
                  <>
                    <Save className=" h-4 w-4" />
                    Speichern
                  </>
                )}
              </Button>

              {isPublished ? (
                <Button
                  variant="default"
                  size="sm"
                  className="bg-green-500 text-white hover:bg-green-600/90"
                  asChild
                >
                  <Link href={publishedUrl || "#"} target="_blank">
                    <Globe2 className="mr-2 h-4 w-4" />
                    Veröffentlicht
                  </Link>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePublish}
                  disabled={isPublishing}
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Wird veröffentlicht...
                    </>
                  ) : (
                    <>
                      <Globe2 className="mr-2 h-4 w-4" />
                      Veröffentlichen
                    </>
                  )}
                </Button>
              )}

              <Button
                variant="default"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-500 text-white hover:bg-red-600/90"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Wird gelöscht...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Löschen
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
