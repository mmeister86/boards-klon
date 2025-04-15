"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProjectCard from "@/components/dashboard/project-card";
import {
  listProjectsFromStorage,
  initializeStorage,
  deleteProjectFromStorage, // Need this for delete handler
} from "@/lib/supabase/storage";
import type { Project } from "@/lib/types";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBlocksStore } from "@/store/blocks-store";
import { useSupabase } from "@/components/providers/supabase-provider";
import { deleteProjectFromDatabase } from "@/lib/supabase/database"; // Import the database delete function

export default function ProjectsView() {
  console.log("[ProjectsView] Rendering...");
  const router = useRouter();
  const projectJustDeleted = useBlocksStore(
    (state) => state.projectJustDeleted
  );
  const deletedProjectTitle = useBlocksStore(
    (state) => state.deletedProjectTitle
  );
  const setProjectJustDeleted = useBlocksStore(
    (state) => state.setProjectJustDeleted
  );
  const setDeletedProjectTitle = useBlocksStore(
    (state) => state.setDeletedProjectTitle
  );
  const toastShownForDeletion = useRef(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [activeTab, setActiveTab] = useState("all");
  const { user } = useSupabase();

  // Memoize the toast notifications
  const showErrorToast = useCallback((title: string, description: string) => {
    toast.error(title, {
      description: description,
    });
  }, []);

  // Force refresh when component mounts or visibility changes
  useEffect(() => {
    setRefreshCounter((prev) => prev + 1); // Initial load trigger

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setRefreshCounter((prev) => prev + 1);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Load projects from Supabase storage
  useEffect(() => {
    async function loadProjects() {
      if (!user?.id) {
        console.log(
          "[ProjectsView] No user ID, cannot load projects from storage."
        );
        setIsLoading(false);
        setProjects([]);
        return;
      }
      const userId = user.id;

      setIsLoading(true);
      try {
        const storageInitialized = await initializeStorage();
        if (!storageInitialized) {
          setProjects([]);
          showErrorToast(
            "Speicherfehler",
            "Verbindung zum Cloud-Speicher nicht möglich."
          );
          setIsLoading(false);
          return;
        }
        const loadedProjects = await listProjectsFromStorage(userId);
        setProjects(loadedProjects || []);
      } catch (error) {
        console.error("Error loading projects:", error);
        setProjects([]);
        toast.error("Fehler beim Laden", {
          description: "Die Projekte konnten nicht geladen werden.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadProjects();
  }, [refreshCounter, showErrorToast, user?.id]);

  // Load projects from Supabase storage
  useEffect(() => {
    console.log(
      "[ProjectsView] useEffect running. projectJustDeleted:",
      projectJustDeleted,
      "toastShownRef:",
      toastShownForDeletion.current
    );
    if (projectJustDeleted && !toastShownForDeletion.current) {
      console.log(
        "[ProjectsView] projectJustDeleted is true AND toast not shown yet. Showing toast..."
      );
      toast.error(`"${deletedProjectTitle || "Projekt"}" wurde gelöscht`, {
        description: `Ihr Projekt wurde erfolgreich gelöscht.`,
        style: {
          backgroundColor: "hsl(var(--destructive))",
          color: "white",
        },
      });
      toastShownForDeletion.current = true;
      console.log("[ProjectsView] Set toastShownRef.current = true");

      console.log("[ProjectsView] Resetting projectJustDeleted to false.");
      setProjectJustDeleted(false);
      console.log("[ProjectsView] Resetting deletedProjectTitle to null.");
      setDeletedProjectTitle(null);
    } else if (!projectJustDeleted) {
      if (toastShownForDeletion.current) {
        console.log(
          "[ProjectsView] projectJustDeleted is false. Resetting toastShownRef.current = false."
        );
        toastShownForDeletion.current = false;
      }
    }
  }, [
    projectJustDeleted,
    setProjectJustDeleted,
    deletedProjectTitle,
    setDeletedProjectTitle,
  ]);

  // Filter projects based on search query
  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateProject = () => {
    router.push("/editor");
  };

  const handleProjectClick = (projectId: string) => {
    router.push(`/editor?projectId=${projectId}`);
  };

  // Delete project from storage and database
  const handleProjectDelete = async (
    projectId: string,
    projectTitle: string
  ) => {
    if (!user?.id) {
      showErrorToast("Fehler", "Benutzer nicht angemeldet.");
      return;
    }
    const userId = user.id;

    setIsLoading(true); // Indicate loading state during deletion

    let storageDeleted = false;
    let databaseDeleted = false;

    try {
      // 1. Delete from storage
      console.log(
        `[ProjectDelete] Attempting to delete project ${projectId} from storage...`
      );
      console.log(
        `[ProjectDelete] Calling deleteProjectFromStorage with projectId: ${projectId}, userId: ${userId}`
      );
      storageDeleted = await deleteProjectFromStorage(projectId, userId);

      if (!storageDeleted) {
        throw new Error("Failed to delete project from storage");
      }
      console.log(
        `[ProjectDelete] Successfully deleted project ${projectId} from storage`
      );

      // 2. Delete from database
      // Note: We use projectId here. Ensure your RLS policies allow deleting based on user_id
      // or that deleteProjectFromDatabase handles permissions correctly.
      console.log(
        `[ProjectDelete] Attempting to delete project ${projectId} from database...`
      );
      databaseDeleted = await deleteProjectFromDatabase(projectId);

      if (!databaseDeleted) {
        // Log a warning but don't necessarily throw an error,
        // as the primary goal (removing from storage/list) succeeded.
        console.warn(
          `[ProjectDelete] Project ${projectId} deleted from storage, but failed to delete from database.`
        );
        // Depending on requirements, you might want to throw an error here
        // or try to re-sync storage later.
      } else {
        console.log(
          `[ProjectDelete] Successfully deleted project ${projectId} from database`
        );
      }

      // Show success toast regardless of DB deletion success (as storage was deleted)
      toast.error(`"${projectTitle}" wurde gelöscht`, {
        description: `Ihr Projekt wurde erfolgreich gelöscht.`,
        style: {
          backgroundColor: "hsl(var(--destructive))",
          color: "white",
        },
      });

      // Trigger refresh after successful deletion
      setRefreshCounter((prev) => prev + 1);
    } catch (error) {
      console.error("[ProjectDelete] Error during project deletion:", error);
      // Provide more specific error based on which step failed
      let errorMsg = `Das Projekt "${projectTitle}" konnte nicht gelöscht werden.`;
      if (!storageDeleted) {
        errorMsg = `Das Projekt "${projectTitle}" konnte nicht aus dem Speicher gelöscht werden.`
      } else if (!databaseDeleted) {
        errorMsg = `Das Projekt "${projectTitle}" wurde aus dem Speicher gelöscht, aber ein Fehler trat beim Bereinigen der Datenbank auf.`
      }
      showErrorToast(
        "Fehler beim Löschen",
        errorMsg
      );
    } finally {
      // Let the loadProjects effect handle setting isLoading to false after refresh
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-4 md:gap-6">
        <h1 className="text-3xl font-bold mr-auto">Projekte</h1>

        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="hidden md:block"
        >
          <TabsList>
            <TabsTrigger value="all">Alle Projekte</TabsTrigger>
            <TabsTrigger value="recent">Kürzlich</TabsTrigger>
            <TabsTrigger value="templates">Vorlagen</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full md:w-auto md:min-w-[240px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Projekte durchsuchen..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Button
          onClick={handleCreateProject}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Neues Projekt</span>
          <span className="sm:hidden">Neu</span>
        </Button>
      </div>

      {/* Tabs for mobile */}
      <div className="md:hidden">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">
              Alle
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex-1">
              Kürzlich
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex-1">
              Vorlagen
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Project Grid / Loading / Empty State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-lg">Projekte werden geladen...</span>
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => handleProjectClick(project.id)}
              onDelete={() => handleProjectDelete(project.id, project.title)}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-[calc(100vh-300px)] xl:pr-[250px]">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">
              Keine Projekte gefunden
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? "Versuchen Sie einen anderen Suchbegriff"
                : "Erstellen Sie Ihr erstes Projekt, um zu beginnen"}
            </p>
            {!searchQuery && (
              <Button onClick={handleCreateProject}>Projekt erstellen</Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
