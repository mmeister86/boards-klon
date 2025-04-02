"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Navbar from "@/components/layout/navbar";
import LeftSidebar from "@/components/layout/left-sidebar";
import Canvas from "@/components/canvas/canvas";
import RightSidebar from "@/components/layout/right-sidebar";
import Preview from "@/components/preview/preview";
import { ViewportProvider } from "@/lib/hooks/use-viewport";
import { useBlocksStore } from "@/store/blocks-store";
import { ViewportSelector } from "@/components/canvas/viewport-selector";
import { initializeStorage } from "@/lib/supabase/storage";
import { Loader2 } from "lucide-react";

export default function EditorPage() {
  const router = useRouter();
  const {
    previewMode,
    loadProject,
    currentProjectTitle,
    setProjectTitle,
    isLoading,
    createNewProject,
  } = useBlocksStore();

  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [manuallyCreatedProject, setManuallyCreatedProject] = useState<
    string | null
  >(null);

  // Use a ref to track if we already tried to create a project
  // This helps prevent multiple project creations during React's rendering cycles
  const hasTriedCreatingProject = useRef(false);

  // Handle the case where we successfully created a project manually
  // This effect runs after we have a manuallyCreatedProject ID
  useEffect(() => {
    if (manuallyCreatedProject && !projectId) {
      // Update URL with new project ID using window.history to avoid triggering re-renders
      // This is a workaround to avoid Next.js router behavior that might cause multiple renders
      const newUrl = `${window.location.pathname}?projectId=${manuallyCreatedProject}`;
      window.history.replaceState({ as: newUrl, url: newUrl }, "", newUrl);

      console.log(`URL updated with new project ID: ${manuallyCreatedProject}`);
    }
  }, [manuallyCreatedProject, projectId]);

  // Initialize storage and load project
  useEffect(() => {
    // Prevent this effect from running more than once
    if (!initializing || hasTriedCreatingProject.current) return;

    hasTriedCreatingProject.current = true;

    async function init() {
      try {
        // Initialize Supabase storage
        console.log("Initializing storage...");
        await initializeStorage();

        if (projectId) {
          // Load existing project
          console.log(`Loading existing project: ${projectId}`);
          const success = await loadProject(projectId);
          if (!success) {
            console.error(`Failed to load project with ID: ${projectId}`);
            setError(`Failed to load project with ID: ${projectId}`);
          } else {
            console.log(`Successfully loaded project: ${projectId}`);
          }
        } else {
          // Create a new project manually when no projectId is provided
          console.log("No project ID, creating new project...");

          const newProjectId = await createNewProject("Unbenanntes Projekt");
          if (newProjectId) {
            console.log(`Created new project: ${newProjectId}`);
            // Instead of using router.replace which may cause re-renders,
            // we'll store the ID and update the URL in a separate effect
            setManuallyCreatedProject(newProjectId);
          } else {
            console.error("Failed to create a new project");
            setError("Fehler beim Erstellen eines neuen Projekts");
          }
        }
      } catch (err) {
        console.error("Error initializing editor:", err);
        setError("Beim Initialisieren des Editors ist ein Fehler aufgetreten");
      } finally {
        setInitializing(false);
      }
    }

    init();
  }, [projectId, loadProject, createNewProject, initializing]);

  // Show loading state
  if (initializing || isLoading) {
    return (
      <div className="flex flex-col h-screen">
        <Navbar currentView="editor" projectTitle="Loading..." />
        <div className="flex-1 flex items-center justify-center bg-muted">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg">Projekt wird geladen...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col h-screen">
        <Navbar currentView="editor" projectTitle="Error" />
        <div className="flex-1 flex items-center justify-center bg-muted">
          <div className="bg-card p-8 rounded-lg shadow-lg max-w-md">
            <h2 className="text-xl font-bold text-destructive mb-4">
              Fehler beim Laden des Projekts
            </h2>
            <p className="mb-6">{error}</p>
            <div className="flex justify-end">
              <Button onClick={() => router.push("/dashboard")}>
                Zurück zum Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <ViewportProvider>
        <div className="flex flex-col h-screen">
          <Navbar
            currentView="editor"
            projectTitle={currentProjectTitle}
            onTitleChange={setProjectTitle}
          />

          {previewMode ? <PreviewMode /> : <EditorMode />}
        </div>
      </ViewportProvider>
    </DndProvider>
  );
}

// Extracted component for preview mode
function PreviewMode() {
  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Viewport selector centered at the top */}
      <div className="flex justify-center my-4">
        <ViewportSelector />
      </div>
      <Preview />
    </div>
  );
}

// Extracted component for editor mode
function EditorMode() {
  return (
    <div className="flex flex-1 overflow-hidden">
      <LeftSidebar />
      <div className="flex-1 bg-muted overflow-hidden flex flex-col">
        <Canvas />
      </div>
      <RightSidebar />
    </div>
  );
}

// Import Button for error state
import { Button } from "@/components/ui/button";
