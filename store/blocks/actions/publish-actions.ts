import type { StateCreator } from 'zustand';
import type { BlocksState } from '../types';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  publishBoard as publishBoardDb,
  unpublishBoard as unpublishBoardDb,
  getPublishedBoard,
} from '@/lib/supabase/database';

// Get a fresh Supabase client instance each time to avoid stale auth state
const getSupabase = () => {
  if (typeof window === "undefined") {
    console.warn("getSupabase should only be called in browser environment");
    return null;
  }
  return getSupabaseBrowserClient();
};

type PublishActions = Pick<BlocksState, 'publishBoard' | 'unpublishBoard' | 'checkPublishStatus'>;

export const createPublishActions: StateCreator<BlocksState, [], [], PublishActions> = (set, get) => ({
  publishBoard: async () => {
    const { currentProjectId, currentProjectDatabaseId, currentProjectTitle, isPublishing } = get();

    console.log("[publishBoard] Starting publish process", {
      currentProjectId,
      currentProjectDatabaseId,
      currentProjectTitle,
      isPublishing
    });

    // WICHTIG: Veröffentlichen erfordert eine Datenbank-ID
    if (!currentProjectDatabaseId || isPublishing) {
      if (!currentProjectDatabaseId) console.error("[publishBoard] Aborting - Project must be saved in the database first (missing currentProjectDatabaseId).");
      if (isPublishing) console.log("[publishBoard] Aborting - Already publishing.");
      return false;
    }

    set({ isPublishing: true });

    try {
      // First save the current state TO THE DATABASE
      console.log("[publishBoard] Saving current project state to DB");
      const saveSuccess = await get().saveProject(currentProjectTitle);
      if (!saveSuccess || !get().currentProjectDatabaseId) {
        console.error("[publishBoard] Failed to save project to database before publishing");
        throw new Error("Failed to save project to database before publishing");
      }

      const supabase = getSupabase();
      if (!supabase) {
        console.error("Failed to initialize Supabase client");
        set({ isPublishing: false });
        return false;
      }

      // ALT: const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      // NEU: Sicherer Abruf des Users über getUser (authentifiziert gegen Supabase-Server)
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (!userData.user || userError) {
        console.error("[publishBoard] User not authenticated");
        throw new Error("User not authenticated");
      }
      const user = userData.user;

      const dbIdToPublish = get().currentProjectDatabaseId;
      if (!dbIdToPublish) {
        throw new Error("Database ID unexpectedly null after initial check");
      }

      console.log("[publishBoard] Publishing board", {
        projectId: dbIdToPublish,
        title: currentProjectTitle,
        authorName: user.user_metadata?.full_name || "Anonymous",
        userId: user.id
      });

      const success = await publishBoardDb(
        dbIdToPublish as string,
        currentProjectTitle,
        user.user_metadata?.full_name || "Anonymous",
        user.id
      );

      if (success) {
        console.log("[publishBoard] Successfully published board");
        set({
          isPublished: true,
          publishedUrl: `/boards/${dbIdToPublish}`,
        });
      } else {
        console.error("[publishBoard] Failed to publish board");
        throw new Error("Failed to publish board");
      }

      return success;
    } catch (error) {
      console.error("[publishBoard] Error publishing board:", error);
      return false;
    } finally {
      set({ isPublishing: false });
    }
  },

  unpublishBoard: async () => {
    const { currentProjectDatabaseId, isPublishing } = get();

    if (!currentProjectDatabaseId || isPublishing) {
      if (!currentProjectDatabaseId) console.error("[unpublishBoard] No database ID, cannot unpublish.");
      return false;
    }

    set({ isPublishing: true });

    try {
      const success = await unpublishBoardDb(currentProjectDatabaseId);

      if (success) {
        set({
          isPublished: false,
          publishedUrl: null,
        });
      }

      return success;
    } catch (error) {
      console.error("Error unpublishing board:", error);
      return false;
    } finally {
      set({ isPublishing: false });
    }
  },

  checkPublishStatus: async () => {
    const { currentProjectDatabaseId } = get();

    if (!currentProjectDatabaseId) {
      // Wenn keine DB ID, kann es nicht veröffentlicht sein
      set({ isPublished: false, publishedUrl: null });
      return;
    }

    try {
      const publishedBoard = await getPublishedBoard(currentProjectDatabaseId);

      set({
        isPublished: !!publishedBoard?.is_published,
        publishedUrl: publishedBoard?.is_published ? `/boards/${currentProjectDatabaseId}` : null,
      });
    } catch (error) {
      console.error("Error checking publish status:", error);
    }
  },
});
