import type { StateCreator } from 'zustand';
import type { BlocksState, LayoutBlockType } from '../types';
import type { ProjectData } from '@/lib/types';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  loadProjectFromDatabase,
  saveProjectToDatabase,
} from '@/lib/supabase/database';
import {
  saveProjectToStorage,
  loadProjectFromStorage,
} from '@/lib/supabase/storage';
import { debounce } from '../utils';

// Singleton-Instanz des Supabase-Clients
const getSupabase = () => {
  if (typeof window === "undefined") return null;
  return getSupabaseBrowserClient();
};

export type StorageActions = Pick<BlocksState,
  | 'loadProject'
  | 'saveProject'
  | 'createNewProject'
  | 'setProjectTitle'
> & {
  triggerAutoSave: () => void;
};

export const createStorageActions: StateCreator<BlocksState, [], [], StorageActions> = (set, get) => {
  // Create a debounced version of the save function
  const debouncedSave = debounce(async () => {
    const state = get();
    console.log("Debounced Save Check:", {
      isSaving: state.isSaving,
      currentProjectId: state.currentProjectId,
      autoSaveEnabled: state.autoSaveEnabled
    });

    if (!state.currentProjectId || !state.autoSaveEnabled) {
      console.log("Debounced Save Aborted:", {
        reason: !state.currentProjectId ? "no projectId" : "autoSave disabled"
      });
      return;
    }

    if (state.isSaving) {
      console.log("Already saving, will retry in 3 seconds");
      // Schedule another attempt after current save completes
      setTimeout(() => {
        const newState = get();
        if (!newState.isSaving && newState.autoSaveEnabled) {
          console.log("Retrying auto-save after previous save completed");
          debouncedSave();
        }
      }, 3000);
      return;
    }

    console.log("Starting auto-save process...");

    try {
      set({ isSaving: true });

      const {
        currentProjectId,
        currentProjectDatabaseId,
        layoutBlocks,
        currentProjectTitle
      } = get();

      console.log("Internal auto-save running for project:", {
        id: currentProjectId,
        dbId: currentProjectDatabaseId,
        title: currentProjectTitle,
        layoutBlockCount: layoutBlocks.length
      });

      const now = new Date().toISOString();
      const supabase = getSupabase();

      // Clone to avoid mutating state directly
      const blocksToSave = JSON.parse(JSON.stringify(layoutBlocks));

      const projectData: ProjectData = {
        id: currentProjectDatabaseId || currentProjectId || undefined,
        title: currentProjectTitle,
        description: "",
        layoutBlocks: blocksToSave,
        createdAt: now,
        updatedAt: now,
      };

      let success = false;
      let finalDbId: string | null = null;
      const supabaseUser = supabase ? (await supabase.auth.getUser()).data.user : null;

      // Try database save first
      if (supabase && supabaseUser) {
        const dbResult = await saveProjectToDatabase(
          projectData,
          supabaseUser.id
        );
        success = dbResult.success;
        finalDbId = dbResult.projectId;
        console.log("Auto-save to database:", success, "DB ID:", finalDbId);
      } else {
        console.log("Supabase client or user not available, attempting storage save only.");
      }

      // If DB save not successful OR no DB connection, try local storage
      if (!success) {
        console.log("Attempting to save to local storage with ID:", currentProjectId);
        if (!supabaseUser || typeof supabaseUser.id !== 'string') {
          console.error("No user for local storage save");
          set({ isSaving: false });
          return false;
        }
        success = await saveProjectToStorage(projectData, supabaseUser.id);
        console.log("Auto-save to storage:", success);
        if (finalDbId && !success) finalDbId = null;
      } else {
        // If DB successful, optionally sync storage
        if (finalDbId) {
          if (supabaseUser && typeof supabaseUser.id === 'string') {
            await saveProjectToStorage({ ...projectData, id: finalDbId }, supabaseUser.id);
            console.log("Synchronized local storage with DB ID:", finalDbId);
          } else {
            console.error("No user for local storage sync (DB ID)");
          }
        }
      }

      console.log(`Auto-save completed with result: ${success ? 'success' : 'failed'}`);

      set({
        currentProjectTitle: currentProjectTitle,
        currentProjectDatabaseId: finalDbId,
        currentProjectId: finalDbId || currentProjectId,
        lastSaved: success ? new Date() : get().lastSaved,
        isSaving: false,
      });
    } catch (error: unknown) {
      console.error(`Auto-save error: ${error instanceof Error ? error.message : error}`);
      set({ isSaving: false });
    }
  }, 2000);

  // Implement triggerAutoSave here
  const triggerAutoSave = () => {
    if (!get().autoSaveEnabled) return;
    debouncedSave();
  };

  return {
    loadProject: async (projectId: string) => {
      set({ isLoading: true });
      const supabase = getSupabase();
      let projectData: ProjectData | null = null;
      let storageProjectId: string | null = null;
      let dbProjectId: string | null = null;

      const supabaseUser = supabase ? (await supabase.auth.getUser()).data.user : null;
      const userId = supabaseUser?.id;

      try {
        // Try loading from Database first
        if (supabase) {
          projectData = await loadProjectFromDatabase(projectId);
          dbProjectId = projectData ? projectId : null;
        }

        // If not found in DB or Supabase not available, try Local Storage
        if (!projectData && userId) {
          projectData = await loadProjectFromStorage(projectId, userId);
          storageProjectId = projectData ? projectId : null;
        } else if (!projectData && !userId) {
          console.warn("Cannot load from storage without userId.");
        }

        if (projectData) {
          console.log("Project loaded:", projectData);
          if (!projectData.layoutBlocks) {
            console.warn(`Project ${projectId} loaded but hat keine layoutBlocks. Leere Canvas.`);
            projectData.layoutBlocks = [];
          }

          set({
            layoutBlocks: projectData.layoutBlocks,
            currentProjectId: storageProjectId || dbProjectId || projectId,
            currentProjectDatabaseId: dbProjectId || null,
            currentProjectTitle: projectData.title || "Untitled Project",
            lastSaved: projectData.updatedAt ? new Date(projectData.updatedAt) : null,
            isLoading: false,
          });
          // Nach dem Laden den Publish-Status prüfen
          if (dbProjectId) {
            get().checkPublishStatus();
          }
          return true;
        } else {
          set({ isLoading: false });
          console.error(`Project ${projectId} not found.`);
          return false;
        }
      } catch (error: unknown) {
        set({ isLoading: false });
        console.error(`Error loading project: ${error instanceof Error ? error.message : error}`);
        return false;
      }
    },

    saveProject: async (projectTitle: string, description = "") => {
      const {
        currentProjectId,
        currentProjectDatabaseId,
        layoutBlocks,
        currentProjectTitle,
      } = get();

      if (!currentProjectId) {
        console.warn("Cannot save project: No currentProjectId available.");
        return false;
      }

      set({ isSaving: true });

      const now = new Date().toISOString();
      const supabase = getSupabase();

      // Clone to avoid mutating state directly
      const blocksToSave = JSON.parse(JSON.stringify(layoutBlocks));

      const projectData: ProjectData = {
        id: currentProjectDatabaseId || currentProjectId || undefined,
        title: currentProjectTitle,
        description: description,
        layoutBlocks: blocksToSave,
        createdAt: now,
        updatedAt: now,
      };

      let success = false;
      let finalDbId: string | null = null;
      const supabaseUser = supabase ? (await supabase.auth.getUser()).data.user : null;

      // Try database save first
      if (supabase && supabaseUser) {
        const dbResult = await saveProjectToDatabase(
          projectData,
          supabaseUser.id
        );
        success = dbResult.success;
        finalDbId = dbResult.projectId;
        console.log("Save to database:", success, "DB ID:", finalDbId);
      } else {
        console.log("Supabase client or user not available, attempting storage save only.");
      }

      // If DB save not successful OR no DB connection, try local storage
      if (!success) {
        console.log("Attempting to save to local storage with ID:", currentProjectId);
        if (!supabaseUser || typeof supabaseUser.id !== 'string') {
          console.error("No user for local storage save");
          set({ isSaving: false });
          return false;
        }
        success = await saveProjectToStorage(projectData, supabaseUser.id);
        console.log("Save to storage:", success);
        if (finalDbId && !success) finalDbId = null;
      } else {
        // If DB successful, optionally sync storage
        if (finalDbId) {
          if (supabaseUser && typeof supabaseUser.id === 'string') {
            await saveProjectToStorage({ ...projectData, id: finalDbId }, supabaseUser.id);
            console.log("Synchronized local storage with DB ID:", finalDbId);
          } else {
            console.error("No user for local storage sync (DB ID)");
          }
        }
      }

      set({
        currentProjectTitle: projectTitle, // Update title on save
        currentProjectDatabaseId: finalDbId,
        currentProjectId: finalDbId || currentProjectId, // Use DB ID if available
        lastSaved: success ? new Date() : get().lastSaved,
        isSaving: false,
      });

      console.log(`Save completed with result: ${success ? 'success' : 'failed'}`);

      return success;
    },

    createNewProject: async (title: string, description = "") => {
      set({ isLoading: true });
      const supabase = getSupabase();
      const supabaseUser = supabase ? (await supabase.auth.getUser()).data.user : null;
      const userId = supabaseUser?.id;

      const newProjectId = crypto.randomUUID();
      let finalDbId: string | null = null;
      let success = false;

      const initialLayout: LayoutBlockType[] = []; // Keine LayoutBlocks beim Start

      const projectData: ProjectData = {
        id: newProjectId,
        title,
        description,
        layoutBlocks: initialLayout,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Try database save first if user is logged in
      if (supabase && userId) {
        const dbResult = await saveProjectToDatabase(
          projectData,
          userId
        );
        success = dbResult.success;
        finalDbId = dbResult.projectId;
        console.log("Create project in database:", success, "DB ID:", finalDbId);
      } else {
        console.log("Supabase client or user not available, creating project in storage only.");
      }

      // If DB save not successful OR no DB connection, save to local storage
      if (!success) {
        console.log("Attempting to save new project to local storage with ID:", newProjectId);
        if (!userId || typeof userId !== 'string') {
          console.error("No user for local storage save");
          set({ isLoading: false });
          return null;
        }
        success = await saveProjectToStorage(projectData, userId);
        console.log("Create project in storage:", success);
        if (finalDbId && !success) finalDbId = null; // If DB save failed, clear DB ID
      } else {
        // If DB successful, optionally sync storage
         if (finalDbId) {
          if (userId && typeof userId === 'string') {
            await saveProjectToStorage({ ...projectData, id: finalDbId }, userId);
            console.log("Synchronized new project to local storage with DB ID:", finalDbId);
          } else {
            console.error("No user for local storage sync (new project, DB ID)");
          }
        }
      }

      if (success) {
        set({
          layoutBlocks: initialLayout,
          currentProjectId: finalDbId || newProjectId, // Use DB ID if available
          currentProjectDatabaseId: finalDbId,
          currentProjectTitle: title,
          lastSaved: new Date(),
          isLoading: false,
        });
         // Nach dem Erstellen den Publish-Status prüfen (für DB-Projekte)
         if (finalDbId) {
            get().checkPublishStatus();
          }
        return finalDbId || newProjectId; // Return the actual project ID (DB or local)
      } else {
        set({ isLoading: false });
        console.error("Failed to create new project.");
        return null;
      }
    },

    setProjectTitle: (title: string) => {
      set({ currentProjectTitle: title });
      get().triggerAutoSave();
    },

    triggerAutoSave,
  };
};
