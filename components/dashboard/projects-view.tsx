"use client";

import { useState, useEffect, useCallback } from "react";
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
import { deleteProjectFromDatabase } from "@/lib/supabase/database"; // Need this for delete handler
import type { Project } from "@/lib/types";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProjectsView() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [activeTab, setActiveTab] = useState("all");

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
        const loadedProjects = await listProjectsFromStorage();
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
  }, [refreshCounter, showErrorToast]); // Depend on refreshCounter

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

  // Combined delete logic (Database + Storage)
  const handleProjectDelete = async (
    projectId: string,
    projectTitle: string
  ) => {
    setIsLoading(true); // Indicate loading state during deletion
    try {
      // Attempt to delete from storage first (might be less critical if DB fails)
      await deleteProjectFromStorage(projectId);
      // Attempt to delete from database
      await deleteProjectFromDatabase(projectId);

      // Show success toast
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
      console.error("Error deleting project:", error);
      showErrorToast(
        "Fehler beim Löschen",
        `Das Projekt "${projectTitle}" konnte nicht vollständig gelöscht werden.`
      );
      // Still refresh the list even if deletion failed partially
      setRefreshCounter((prev) => prev + 1);
    } finally {
      // Set loading to false *after* state update from refresh
      // We might need a small delay or better state management here
      // For now, let the loadProjects effect handle setting isLoading to false
    }
  };

  const forceRefresh = () => {
    setIsLoading(true);
    setRefreshCounter((prev) => prev + 1);
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

        <Button
          variant="outline"
          size="icon"
          onClick={forceRefresh}
          disabled={isLoading}
          title="Projektliste aktualisieren"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
        <div className="flex items-center justify-center min-h-[calc(100vh-300px)]">
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
