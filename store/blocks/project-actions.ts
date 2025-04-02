import type { BlocksState } from "./types";
import type { ProjectData } from "@/lib/types";
import {
  saveProjectToStorage,
  loadProjectFromStorage,
} from "@/lib/supabase/storage";
import { isEmptyProject } from "./utils";

export const createProjectActions = (
  set: (fn: (state: BlocksState) => Partial<BlocksState>) => void,
  get: () => BlocksState
) => ({
  loadProject: async (projectId: string) => {
    set((state) => ({ ...state, isLoading: true }));
    console.log(`Loading project: ${projectId}`);

    try {
      const projectData = await loadProjectFromStorage(projectId);
      if (!projectData) {
        console.error(`Project ${projectId} not found`);
        set((state) => ({ ...state, isLoading: false }));
        return false;
      }

      const dropAreasCopy = JSON.parse(JSON.stringify(projectData.dropAreas));
      set((state) => ({
        ...state,
        dropAreas: dropAreasCopy,
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
    const { dropAreas, currentProjectId } = get();
    if (!currentProjectId) {
      const newId = await get().createNewProject(projectTitle, description);
      return !!newId;
    }

    set((state) => ({ ...state, isSaving: true }));
    try {
      const existingProjectData = await loadProjectFromStorage(
        currentProjectId
      );
      const projectData: ProjectData = {
        id: currentProjectId,
        title: projectTitle,
        description,
        dropAreas,
        createdAt: existingProjectData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const success = await saveProjectToStorage(projectData);
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
    const { currentProjectId, dropAreas } = get();

    if (currentProjectId && isEmptyProject(dropAreas)) {
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
        dropAreas: [
          {
            id: "drop-area-1",
            blocks: [],
            isSplit: false,
            splitAreas: [],
            splitLevel: 0,
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const success = await saveProjectToStorage(projectData);
      if (!success) {
        set((state) => ({ ...state, isSaving: false }));
        return null;
      }

      set((state) => ({
        ...state,
        dropAreas: projectData.dropAreas,
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
