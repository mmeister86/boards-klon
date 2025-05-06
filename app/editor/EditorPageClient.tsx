"use client";
import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/navbar";
import LeftSidebar from "@/components/layout/left-sidebar";
import Canvas from "@/components/canvas/canvas";
import { ViewportProvider } from "@/lib/hooks/use-viewport";
import { useBlocksStore } from "@/store/blocks-store";
import { initializeStorage } from "@/lib/supabase/storage";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Context7: Client-Komponente für den Editor
// Rendert die Sidebar als children
export default function EditorPageClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const {
    loadProject,
    currentProjectTitle,
    setProjectTitle,
    isLoading,
    createNewProject,
    checkPublishStatus,
    previewMode,
  } = useBlocksStore();

  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [manuallyCreatedProject, setManuallyCreatedProject] = useState<
    string | null
  >(null);
  const hasTriedCreatingProject = useRef(false);

  useEffect(() => {
    if (manuallyCreatedProject && !projectId) {
      const newUrl = `${window.location.pathname}?projectId=${manuallyCreatedProject}`;
      window.history.replaceState({ as: newUrl, url: newUrl }, "", newUrl);
      setTimeout(() => {
        router.refresh();
      }, 100);
    }
  }, [manuallyCreatedProject, projectId, router]);

  useEffect(() => {
    if (!initializing || hasTriedCreatingProject.current) return;
    hasTriedCreatingProject.current = true;
    async function init() {
      try {
        await initializeStorage();
        if (projectId) {
          const success = await loadProject(projectId);
          if (!success) {
            setError(`Failed to load project with ID: ${projectId}`);
          } else {
            await checkPublishStatus();
          }
        } else {
          const newProjectId = await createNewProject("Unbenanntes Projekt");
          if (newProjectId) {
            setManuallyCreatedProject(newProjectId);
          } else {
            setError("Fehler beim Erstellen eines neuen Projekts");
          }
        }
      } catch {
        setError("Beim Initialisieren des Editors ist ein Fehler aufgetreten");
      } finally {
        setInitializing(false);
      }
    }
    init();
  }, [
    projectId,
    loadProject,
    createNewProject,
    initializing,
    checkPublishStatus,
  ]);

  if (initializing || isLoading) {
    return (
      <div className="flex flex-col h-screen">
        <Navbar context="editor" projectTitle="Loading..." />
        <div className="flex-1 flex items-center justify-center bg-muted">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg">Projekt wird geladen...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen">
        <Navbar context="editor" projectTitle="Error" />
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
    <ViewportProvider>
      <div className="flex flex-col h-screen">
        <Navbar
          context="editor"
          projectTitle={currentProjectTitle}
          onTitleChange={setProjectTitle}
        />
        <div className="flex flex-1 overflow-hidden">
          {/* Only show sidebars when not in preview mode */}
          {!previewMode && <LeftSidebar />}
          <div
            className={`flex-1 bg-muted flex flex-col ${
              previewMode ? "overflow-visible" : "overflow-auto"
            }`}
          >
            <Canvas />
          </div>
          {/* Only show right sidebar when not in preview mode */}
          {!previewMode && children}
        </div>
      </div>
    </ViewportProvider>
  );
}
