import type { StateCreator } from 'zustand';
import type { BlocksState, LayoutBlockType } from '../types';
import type { ProjectData } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
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
  return createClient();
};

export type StorageActions = Pick<BlocksState,
  | 'loadProject'
  | 'saveProject'
  | 'createNewProject'
  | 'triggerAutoSave'
  | 'setProjectTitle'
>;

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
        id: currentProjectDatabaseId || currentProjectId,
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
        success = await saveProjectToStorage(projectData);
        console.log("Auto-save to storage:", success);
        if (finalDbId && !success) finalDbId = null;
      } else {
        // If DB successful, optionally sync storage
        if (finalDbId) {
          await saveProjectToStorage({ ...projectData, id: finalDbId });
          console.log("Synchronized local storage with DB ID:", finalDbId);
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
    } catch (error: any) {
      console.error(`Auto-save error: ${error.message}`);
      set({ isSaving: false });
    }
  }, 2000);

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
      } catch (error: any) {
        set({ isLoading: false });
        console.error(`Error loading project: ${error.message}`);
        return false;
      }
    },

    saveProject: async (projectTitle: string, description = "") => {
      const {
        currentProjectId,
        currentProjectDatabaseId,
        layoutBlocks,
        isSaving,
      } = get();

      console.log("Save Project called:", {
        currentProjectId,
        currentProjectDatabaseId,
        isSaving,
        blocksCount: layoutBlocks.length
      });

      if (isSaving) {
        console.log("Save aborted: Already saving");
        return false;
      }
      if (!currentProjectId) {
        console.error("Cannot save project without a currentProjectId");
        return false;
      }

      set({ isSaving: true });
      const now = new Date().toISOString();
      const supabase = getSupabase();

      const blocksToSave = JSON.parse(JSON.stringify(layoutBlocks));

      const projectData: ProjectData = {
        id: currentProjectDatabaseId || currentProjectId,
        title: projectTitle,
        description: description,
        layoutBlocks: blocksToSave,
        createdAt: now,
        updatedAt: now,
      };

      try {
        let success = false;
        let finalDbId: string | null = null;
        const supabaseUser = supabase ? (await supabase.auth.getUser()).data.user : null;

        // Versuche zuerst in der Datenbank zu speichern
        if (supabase && supabaseUser) {
          const dbResult = await saveProjectToDatabase(
            projectData,
            supabaseUser.id
          );
          success = dbResult.success;
          finalDbId = dbResult.projectId;
          console.log("Saved to database:", success, "DB ID:", finalDbId);
        } else {
          console.log("Supabase client or user not available, attempting storage save only.");
        }

        // Wenn DB-Speichern nicht erfolgreich ODER keine DB-Verbindung, versuche Local Storage
        if (!success) {
          console.log("Attempting to save to local storage with ID:", currentProjectId);
          success = await saveProjectToStorage(projectData);
          console.log("Saved to storage:", success);
          if (finalDbId && !success) finalDbId = null;
        } else {
          // Wenn DB erfolgreich, synchronisiere optional Storage
          if (finalDbId) {
            await saveProjectToStorage({ ...projectData, id: finalDbId });
            console.log("Synchronized local storage with DB ID:", finalDbId);
          }
        }

        console.log("Save completed with result:", {
          success,
          finalDbId,
          timestamp: new Date().toISOString()
        });

        set({
          currentProjectTitle: projectTitle,
          currentProjectDatabaseId: finalDbId,
          currentProjectId: finalDbId || currentProjectId,
          lastSaved: success ? new Date() : get().lastSaved,
          isSaving: false,
        });
        return success;
      } catch (error: any) {
        set({ isSaving: false });
        console.error(`Error saving project: ${error.message}`);
        return false;
      }
    },

    createNewProject: async (title: string, description = "") => {
      console.log("[Store] Creating new project:", { title, description });
      set({ isLoading: true });
      const supabase = getSupabase();
      const now = new Date().toISOString();
      const initialLayout = [];

      const projectData: Omit<ProjectData, "id"> = {
        title: title,
        description: description,
        layoutBlocks: initialLayout,
        createdAt: now,
        updatedAt: now,
      };

      try {
        let newProjectId: string | null = null;
        let newDbId: string | null = null;
        const supabaseUser = supabase ? (await supabase.auth.getUser()).data.user : null;

        // Versuche zuerst in der Datenbank zu erstellen
        if (supabase && supabaseUser) {
          console.log("[Store] Attempting to create project in database");
          const dbResult = await saveProjectToDatabase(
            projectData,
            supabaseUser.id
          );
          if (dbResult.success && dbResult.projectId) {
            newDbId = dbResult.projectId;
            newProjectId = newDbId;
            console.log("[Store] Created project in database:", { newDbId, newProjectId });
            await saveProjectToStorage({ ...projectData, id: newProjectId });
          } else {
            console.error("[Store] Failed to create project in database:", dbResult);
          }
        }

        // Wenn DB fehlgeschlagen oder nicht verfügbar, erstelle im Local Storage
        if (!newProjectId) {
          newProjectId = `local-${crypto.randomUUID()}`;
          console.log("[Store] Creating project in local storage:", newProjectId);
          const success = await saveProjectToStorage({ ...projectData, id: newProjectId });
          if (!success) throw new Error("Failed to save new project to storage");
          console.log("[Store] Created project in local storage:", newProjectId);
        }

        // Setze den State
        const newState = {
          layoutBlocks: initialLayout,
          currentProjectId: newProjectId,
          currentProjectDatabaseId: newDbId,
          currentProjectTitle: title,
          isLoading: false,
          lastSaved: new Date(),
          isPublished: false,
          publishedUrl: null,
        };
        console.log("[Store] Setting new project state:", newState);
        set(newState);

        return newProjectId;
      } catch (error: any) {
        console.error("[Store] Error creating new project:", error);
        set({ isLoading: false });
        return null;
      }
    },

    triggerAutoSave: () => {
      const state = get();
      const { autoSaveEnabled, isSaving, currentProjectId } = state;

      console.log("AutoSave Trigger:", {
        autoSaveEnabled,
        isSaving,
        currentProjectId
      });

      if (!autoSaveEnabled) {
        console.log("AutoSave not triggered: autoSaveEnabled is false");
        return;
      }

      if (!currentProjectId) {
        console.log("AutoSave not triggered: no currentProjectId");
        return;
      }

      if (isSaving) {
        console.log("AutoSave deferred: already saving");
      }

      console.log("Initiating debounced save sequence");
      debouncedSave();
    },

    setProjectTitle: (title: string) => {
      set({ currentProjectTitle: title });
      get().triggerAutoSave();
    },
  };
};
