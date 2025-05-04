import type { BlocksState } from "./types";
import type { ProjectData } from "@/lib/types";
import {
  saveProjectToStorage,
  loadProjectFromStorage,
} from "@/lib/supabase/storage";
import { isEmptyProject, createEmptyLayoutBlock } from "./utils";
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export const createProjectActions = (
  set: (fn: (state: BlocksState) => Partial<BlocksState>) => void,
  get: () => BlocksState
) => ({
  loadProject: async (projectId: string) => {
    set((state) => ({ ...state, isLoading: true }));
    console.log(`Loading project: ${projectId}`);

    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        console.error("Supabase client not available");
        set((state) => ({ ...state, isLoading: false }));
        return false;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("User not authenticated");
        set((state) => ({ ...state, isLoading: false }));
        return false;
      }

      const projectData = await loadProjectFromStorage(projectId, user.id);
      if (!projectData) {
        console.error(`Project ${projectId} not found`);
        set((state) => ({ ...state, isLoading: false }));
        return false;
      }

      const layoutBlocksCopy = JSON.parse(JSON.stringify(projectData.layoutBlocks));
      set((state) => ({
        ...state,
        layoutBlocks: layoutBlocksCopy,
        currentProjectId: projectData.id,
        currentProjectTitle: projectData.title,
        isLoading: false,
        lastSaved: new Date(projectData.updatedAt),
      }));

      return true;
    } catch (error) {
      console.error(`Error loading project ${projectId}:`, error);
      set((state) => ({ ...state, isLoading: false }));
      return false;
    }
  },

  saveProject: async (projectTitle: string, description?: string): Promise<boolean> => {
    const { layoutBlocks, currentProjectId } = get();
    if (!currentProjectId) {
      const newId = await get().createNewProject(projectTitle, description);
      return !!newId;
    }

    set((state) => ({ ...state, isSaving: true }));
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        console.error("Supabase client not available");
        set((state) => ({ ...state, isSaving: false }));
        return false;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("User not authenticated");
        set((state) => ({ ...state, isSaving: false }));
        return false;
      }

      const existingProjectData = await loadProjectFromStorage(currentProjectId, user.id);
      const projectData: ProjectData = {
        id: currentProjectId,
        title: projectTitle,
        description,
        layoutBlocks,
        createdAt: existingProjectData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const success = await saveProjectToStorage(projectData, user.id);
      set((state) => ({
        ...state,
        currentProjectTitle: projectTitle,
        isSaving: false,
        lastSaved: success ? new Date() : null,
      }));

      return success;
    } catch (error) {
      console.error(`Error saving project ${currentProjectId}:`, error);
      set((state) => ({ ...state, isSaving: false }));
      return false;
    }
  },

  createNewProject: async (title: string, description?: string) => {
    const { currentProjectId, layoutBlocks } = get();

    if (currentProjectId && isEmptyProject(layoutBlocks)) {
      set((state) => ({
        ...state,
        currentProjectTitle: title || "Untitled Project",
        lastSaved: new Date(),
      }));
      return currentProjectId;
    }

    set((state) => ({ ...state, isSaving: true }));
    try {
      const newProjectId = `project-${Date.now()}`;
      const projectData: ProjectData = {
        id: newProjectId,
        title: title || "Untitled Project",
        description,
        layoutBlocks: [createEmptyLayoutBlock(`layout-${Date.now()}`, "single-column")],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        console.error("Supabase client not available");
        set((state) => ({ ...state, isSaving: false }));
        return null;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("User not authenticated");
        set((state) => ({ ...state, isSaving: false }));
        return null;
      }

      const success = await saveProjectToStorage(projectData, user.id);
      if (!success) {
        set((state) => ({ ...state, isSaving: false }));
        return null;
      }

      set((state) => ({
        ...state,
        layoutBlocks: projectData.layoutBlocks,
        currentProjectId: newProjectId,
        currentProjectTitle: projectData.title,
        isSaving: false,
        lastSaved: new Date(),
      }));

      return newProjectId;
    } catch (error) {
      console.error("Error creating new project:", error);
      set((state) => ({ ...state, isSaving: false }));
      return null;
    }
  },

  setProjectTitle: (title: string) => {
    set((state) => ({ ...state, currentProjectTitle: title }));
    get().triggerAutoSave();
  },
});
