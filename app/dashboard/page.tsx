"use client";

import { useState, useEffect } from "react";
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
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/layout/navbar";

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Force refresh of project list
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Force refresh when returning to dashboard page
  useEffect(() => {
    // This will trigger when the dashboard component mounts (including when returning from editor)
    setRefreshCounter((prev) => prev + 1);

    // Also add event listener for when the page becomes visible again (tab focus)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("Dashboard visible again, refreshing projects list");
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
      console.log(`Loading projects (refresh #${refreshCounter})`);

      try {
        // Initialize storage with better error handling
        let storageInitialized = false;
        try {
          storageInitialized = await initializeStorage();
          if (!storageInitialized) {
            console.warn(
              "Storage initialization failed, showing empty dashboard"
            );
          }
        } catch (initError) {
          console.error("Error initializing storage:", initError);
          // Continue anyway - we'll try to load projects or show empty dashboard
        }

        // Check if we need to migrate mock projects
        if (!isInitialized) {
          try {
            const storedProjects = await listProjectsFromStorage();

            // If no projects in storage, show empty dashboard
            if (!storedProjects || storedProjects.length === 0) {
              console.log(
                "No projects found in storage. Showing empty dashboard..."
              );
              // No mock projects to migrate, just show empty dashboard
              setProjects([]);
            }
            setIsInitialized(true);
          } catch (migrateError) {
            console.error(
              "Error checking projects:",
              migrateError
            );
            // If we can't check projects, show empty dashboard
            setProjects([]);
            setIsInitialized(true);
            setIsLoading(false);

            toast({
              title: "Speicherfehler",
              description:
                "Kein Zugriff auf Cloud-Speicher möglich. Bitte versuchen Sie es später erneut.",
              variant: "destructive",
            });

            return;
          }
        }

        // Load projects from storage (with forced cache bypass)
        try {
          // Add a timestamp to force fresh data
          const loadedProjects = await listProjectsFromStorage();
          if (loadedProjects && loadedProjects.length > 0) {
            setProjects(loadedProjects);
            console.log(
              `Successfully loaded ${loadedProjects.length} projects from storage`
            );
          } else {
            // Show empty dashboard if no projects found
            console.warn("No projects found in storage, showing empty dashboard");
            setProjects([]);

            toast({
              title: "Keine Projekte",
              description:
                "Keine gespeicherten Projekte gefunden. Erstellen Sie ein neues Projekt.",
            });
          }
        } catch (loadError) {
          console.error("Error loading projects from storage:", loadError);
          // Show empty dashboard with error message
          setProjects([]);

          toast({
            title: "Fehler beim Laden der Projekte",
            description:
              "Ihre Projekte konnten nicht geladen werden. Bitte versuchen Sie es später erneut.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error in loadProjects:", error);
        // Show empty dashboard with error message
        setProjects([]);
        toast({
          title: "Fehler beim Laden der Projekte",
          description:
            "Verwende lokale Daten. Änderungen werden nicht gespeichert.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadProjects();
  }, [isInitialized, toast, refreshCounter]);

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
      const loadedProjects = await listProjectsFromStorage();
      setProjects(loadedProjects);
      toast({
        title: "Projekt gelöscht",
        description: "Das Projekt wurde erfolgreich gelöscht.",
      });
    } catch (error) {
      console.error("Error refreshing projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Force manual refresh
  const forceRefresh = () => {
    console.log("Manual refresh triggered");
    setRefreshCounter((prev) => prev + 1);
  };

  // Debug log projects
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
