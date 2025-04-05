"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProjectCard from "@/components/dashboard/project-card";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import {
  listProjectsFromStorage,
  initializeStorage,
} from "@/lib/supabase/storage";
import type { Project } from "@/lib/types";
import { toast } from "sonner";
import Navbar from "@/components/layout/navbar";

export default function DashboardPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Force refresh of project list
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Memoize the toast notifications to maintain stable references
  const showErrorToast = useCallback((title: string, description: string) => {
    toast.error(title, {
      description: description,
    });
  }, []);

  const showInfoToast = useCallback((title: string, description: string) => {
    toast(title, {
      description: description,
    });
  }, []);

  // Force refresh when returning to dashboard page
  useEffect(() => {
    // This will trigger when the dashboard component mounts (including when returning from editor)
    setRefreshCounter((prev) => prev + 1);

    // Also add event listener for when the page becomes visible again (tab focus)
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
        // Initialize storage with better error handling
        const storageInitialized = await initializeStorage();
        if (!storageInitialized) {
          setProjects([]);
          showErrorToast(
            "Speicherfehler",
            "Verbindung zum Cloud-Speicher nicht möglich. Bitte versuchen Sie es später erneut."
          );
          setIsLoading(false);
          return;
        }

        // Load projects from storage
        const loadedProjects = await listProjectsFromStorage();
        if (loadedProjects && loadedProjects.length > 0) {
          setProjects(loadedProjects);
        } else {
          // Show empty dashboard if no projects found
          setProjects([]);
        }
      } catch {
        // Show empty dashboard with error message
        setProjects([]);
        toast.error("Fehler beim Laden", {
          description:
            "Die Projekte konnten nicht geladen werden. Bitte versuchen Sie es später erneut.",
          style: {
            backgroundColor: "hsl(var(--destructive))",
            color: "white",
          },
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadProjects();
  }, [showErrorToast, showInfoToast, refreshCounter]);

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

  const handleProjectDelete = async () => {
    // Refresh the projects list
    setIsLoading(true);
    try {
      // Show deletion success toast immediately
      toast.error("Projekt gelöscht", {
        description: "Das Projekt wurde erfolgreich gelöscht",
        style: {
          backgroundColor: "hsl(var(--destructive))",
          color: "white",
        },
      });

      // Then refresh the project list
      const loadedProjects = await listProjectsFromStorage();
      if (loadedProjects) {
        setProjects(loadedProjects);
      } else {
        throw new Error("Fehler beim Laden der Projekte");
      }
    } catch {
      showErrorToast(
        "Fehler beim Aktualisieren",
        "Die Projektliste konnte nicht aktualisiert werden."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Force manual refresh
  const forceRefresh = () => {
    setRefreshCounter((prev) => prev + 1);
  };

  // Remove debug logging
  useEffect(() => {
    if (projects.length > 0) {
      console.log("Loaded projects:", projects);
    }
  }, [projects]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar currentView="dashboard" />
      <div className="container mx-auto px-4 py-8">
        <DashboardHeader />

        <div className="flex justify-between items-center mb-8">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Projekte durchsuchen..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
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
            <Button
              onClick={handleCreateProject}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Neues Projekt
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-lg">Projekte werden geladen...</span>
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => handleProjectClick(project.id)}
                onDelete={handleProjectDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
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
        )}
      </div>
    </div>
  );
}
