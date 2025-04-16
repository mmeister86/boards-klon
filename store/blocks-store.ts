/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import type { BlockType, DropAreaType } from "@/lib/types";
import type { ViewportType } from "@/lib/hooks/use-viewport";
import {
  findDropAreaById,
  updateDropAreaById,
  isDropAreaEmpty,
  findBlockById,
  canMergeAreas,
  findParentOfSplitAreas,
} from "@/lib/utils/drop-area-utils";
import {
  saveProjectToStorage,
  loadProjectFromStorage,
} from "@/lib/supabase/storage";
import {
  loadProjectFromDatabase,
  saveProjectToDatabase,
  publishBoard,
  unpublishBoard,
  getPublishedBoard,
} from "@/lib/supabase/database";
import type { ProjectData } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

// Add type guard function at the top level, after the imports
const isValidBlockType = (type: string): type is BlockType['type'] => {
  return ['heading', 'paragraph', 'image', 'video', 'audio', 'document'].includes(type);
};

// Types for the store
interface DragItem {
  id?: string;
  type: string;
  content: string;
  sourceDropAreaId?: string;
}

interface BlocksState {
  // State
  dropAreas: DropAreaType[];
  selectedBlockId: string | null;
  previewMode: boolean;
  currentProjectId: string | null;
  currentProjectDatabaseId: string | null;
  currentProjectTitle: string;
  isLoading: boolean;
  isSaving: boolean;
  autoSaveEnabled: boolean;
  lastSaved: Date | null;
  projectJustDeleted: boolean;
  deletedProjectTitle: string | null;
  isPublishing: boolean;
  isPublished: boolean;
  publishedUrl: string | null;
  canvasHoveredInsertionIndex: number | null;

  // Block Actions
  addBlock: (block: Omit<BlockType, "id">, dropAreaId: string) => void;
  addBlockAtIndex: (
    block: Omit<BlockType, "id">,
    dropAreaId: string,
    index: number
  ) => void; // New action
  moveBlock: (
    blockId: string,
    sourceAreaId: string,
    targetAreaId: string
  ) => void;
  deleteBlock: (blockId: string, dropAreaId: string) => void;
  updateBlockContent: (
    blockId: string,
    dropAreaId: string,
    content: string,
    additionalProps?: Partial<BlockType>
  ) => void;
  selectBlock: (id: string | null) => void;
  reorderBlocks: (dropAreaId: string, blocks: BlockType[]) => void;

  // Drop Area Actions
  splitDropArea: (dropAreaId: string) => void;
  splitPopulatedDropArea: (dropAreaId: string) => void;
  mergeDropAreas: (firstAreaId: string, secondAreaId: string) => void;
  deleteDropArea: (dropAreaId: string) => void;
  insertDropAreaBetween: (beforeAreaId: string, afterAreaId: string) => string;
  insertDropArea: (insertIndex: number) => string;
  insertBlockInNewArea: (item: DragItem, insertIndex: number) => void;

  // Area State Checks
  canMerge: (firstAreaId: string, secondAreaId: string) => boolean;
  canSplit: (dropAreaId: string, viewport: ViewportType) => boolean;
  cleanupEmptyDropAreas: () => void;

  // Project Actions
  loadProject: (projectId: string) => Promise<boolean>;
  saveProject: (projectTitle: string, description?: string) => Promise<boolean>;
  createNewProject: (
    title: string,
    description?: string
  ) => Promise<string | null>;
  setProjectTitle: (title: string) => void;

  // UI State Actions
  setPreviewMode: (enabled: boolean) => void;
  togglePreviewMode: () => void;
  toggleAutoSave: (enabled: boolean) => void;
  triggerAutoSave: () => void;
  setProjectJustDeleted: (deleted: boolean) => void;
  setDeletedProjectTitle: (title: string | null) => void;

  // Publishing Actions
  publishBoard: () => Promise<boolean>;
  unpublishBoard: () => Promise<boolean>;
  checkPublishStatus: () => Promise<void>;

  // NEU: Canvas Hover Actions
  setCanvasHoveredInsertionIndex: (index: number | null) => void;
  resetAllHoverStates: () => void;
}

// Debounce helper function
function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Create a singleton instance of the Supabase client
const getSupabase = () => {
  if (typeof window === "undefined") return null;
  return createClient();
};

// Create the store
export const useBlocksStore = create<BlocksState>((set, get) => {
  // Create a debounced version of the save function
  const debouncedSave = debounce(async () => {
    const { currentProjectTitle, currentProjectId, isSaving, autoSaveEnabled } =
      get();

    if (isSaving || !currentProjectId || !autoSaveEnabled) {
      return;
    }

    set({ isSaving: true });

    try {
      const success = await get().saveProject(currentProjectTitle);
      set({
        lastSaved: success ? new Date() : null,
        isSaving: false,
      });
    } catch (error: any) {
      set({ isSaving: false });
      throw new Error(`Auto-save error: ${error.message}`);
    }
  }, 2000);

  return {
    // Initial state
    dropAreas: [
      {
        id: "drop-area-1",
        blocks: [],
        isSplit: false,
        splitAreas: [],
        splitLevel: 0,
      },
    ],
    selectedBlockId: null,
    previewMode: false,
    currentProjectId: null,
    currentProjectDatabaseId: null,
    currentProjectTitle: "Untitled Project",
    isLoading: false,
    isSaving: false,
    autoSaveEnabled: true,
    lastSaved: null,
    projectJustDeleted: false,
    deletedProjectTitle: null,
    isPublishing: false,
    isPublished: false,
    publishedUrl: null,
    canvasHoveredInsertionIndex: null,

    // Block Actions
    addBlock: (block, dropAreaId) => {
      const id = `block-${Date.now()}`;
      const newBlock: BlockType = {
        ...block,
        id,
        dropAreaId,
        ...(block.type === "heading" && {
          headingLevel: block.headingLevel || 1,
        }),
      };

      set((state) => {
        const targetArea = findDropAreaById(state.dropAreas, dropAreaId);
        if (!targetArea) {
          throw new Error(`Drop area ${dropAreaId} not found`);
        }

        const updated = updateDropAreaById(
          state.dropAreas,
          dropAreaId,
          (area) => {
            // Create a deep copy of the area before modifying to ensure isolation
            const areaCopy = JSON.parse(JSON.stringify(area));
            // Modify the copy
            areaCopy.blocks.push(newBlock);
            return areaCopy; // Return the modified deep copy
          }
        );

        // Add new empty area if needed
        const lastRootArea = updated[updated.length - 1];
        const lastAreaHasBlocks =
          lastRootArea.blocks.length > 0 ||
          (lastRootArea.isSplit &&
            lastRootArea.splitAreas.some((a) => a.blocks.length > 0));

        if (lastAreaHasBlocks) {
          return {
            ...state,
            dropAreas: [
              ...updated,
              {
                id: `drop-area-${updated.length + 1}`,
                blocks: [],
                isSplit: false,
                splitAreas: [],
                splitLevel: 0,
              },
            ],
          };
        }

        return { ...state, dropAreas: updated };
      });

      // Cleanup und Auto-Save nach dem State-Update
      setTimeout(() => {
        get().cleanupEmptyDropAreas(); // <-- RE-ENABLED
        get().triggerAutoSave();
      }, 0);
    },

    moveBlock: (blockId, sourceAreaId, targetAreaId) => {
      set((state) => {
        console.log(`[Store.moveBlock] Initiated`, {
          blockId,
          sourceAreaId,
          targetAreaId,
        });
        try {
          const { block: foundBlock, dropAreaId: actualSourceAreaId } = findBlockById(state.dropAreas, blockId);
          console.log(`[Store.moveBlock] Found block info`, {
            foundBlock: foundBlock ? { ...foundBlock } : null,
            actualSourceAreaId,
          });
          if (!foundBlock) {
            throw new Error(`Block ${blockId} not found`);
          }

          const sourceAreaToUse = actualSourceAreaId || sourceAreaId;
          if (sourceAreaToUse === targetAreaId) {
            return state;
          }

          let rootAreas = JSON.parse(JSON.stringify(state.dropAreas));
          const targetIndex = rootAreas.findIndex(
            (area: DropAreaType) => area.id === targetAreaId
          );

          // Handle dropping between populated areas
          const prevArea = targetIndex > 0 ? rootAreas[targetIndex - 1] : null;
          const nextArea =
            targetIndex < rootAreas.length - 1
              ? rootAreas[targetIndex + 1]
              : null;

          const isPrevPopulated =
            prevArea &&
            (!isDropAreaEmpty(prevArea) ||
              (prevArea.isSplit &&
                prevArea.splitAreas.some(
                  (a: DropAreaType) => !isDropAreaEmpty(a)
                )));
          const isNextPopulated =
            nextArea &&
            (!isDropAreaEmpty(nextArea) ||
              (nextArea.isSplit &&
                nextArea.splitAreas.some(
                  (a: DropAreaType) => !isDropAreaEmpty(a)
                )));

          let finalTargetAreaId = targetAreaId;

          // Create new area between populated areas if needed
          if (isPrevPopulated && isNextPopulated) {
            const newArea: DropAreaType = {
              id: `drop-area-${Date.now()}`,
              blocks: [],
              isSplit: false,
              splitAreas: [],
              splitLevel: 0,
            };
            rootAreas.splice(targetIndex, 0, newArea);
            finalTargetAreaId = newArea.id;
          }

          // Remove block from source
          rootAreas = updateDropAreaById(
            rootAreas,
            sourceAreaToUse,
            (area) => ({
              ...area,
              blocks: area.blocks.filter((block) => block.id !== blockId),
            })
          );

          // Add block to target (either new area or original target)
          const blockToMove = { ...foundBlock, dropAreaId: finalTargetAreaId };
          rootAreas = updateDropAreaById(
            rootAreas,
            finalTargetAreaId,
            (area) => ({
              ...area,
              blocks: [...area.blocks, blockToMove],
            })
          );

          console.log(`[Store.moveBlock] State *before* setting`, {
            newState: JSON.parse(JSON.stringify(rootAreas)),
          });
          return { ...state, dropAreas: rootAreas };
        } catch (error: any) {
          console.error(`[Store.moveBlock] Error occurred:`, error);
          throw new Error(`Error moving block: ${error.message}`);
        }
      });

      setTimeout(() => {
        get().cleanupEmptyDropAreas(); // <-- RE-ENABLED
        get().triggerAutoSave();
      }, 0);
    },

    deleteBlock: (blockId, dropAreaId) => {
      set((state) => {
        const { block: foundBlock, dropAreaId: actualDropAreaId } =
          findBlockById(state.dropAreas, blockId);
        if (!foundBlock) {
          throw new Error(`Block ${blockId} not found`);
        }

        const dropAreaToUse = actualDropAreaId || dropAreaId;
        let updated = updateDropAreaById(
          state.dropAreas,
          dropAreaToUse,
          (area) => ({
            ...area,
            blocks: area.blocks.filter((block) => block.id !== blockId),
          })
        );

        // Check if we need to add an empty area at the end
        const lastArea = updated[updated.length - 1];
        const lastAreaHasContent =
          lastArea.blocks.length > 0 ||
          (lastArea.isSplit &&
            lastArea.splitAreas.some((a) => a.blocks.length > 0));

        if (lastAreaHasContent) {
          updated = [
            ...updated,
            {
              id: `drop-area-${Date.now()}`,
              blocks: [],
              isSplit: false,
              splitAreas: [],
              splitLevel: 0,
            },
          ];
        }

        return { ...state, dropAreas: updated };
      });

      setTimeout(() => {
        get().cleanupEmptyDropAreas(); // <-- RE-ENABLED
        get().triggerAutoSave();
      }, 0);
    },

    updateBlockContent: (
      blockId,
      dropAreaId,
      content,
      additionalProps = {}
    ) => {
      set((state) => {
        const { block: foundBlock, dropAreaId: actualDropAreaId } =
          findBlockById(state.dropAreas, blockId);
        if (!foundBlock) {
          throw new Error(`Block ${blockId} not found`);
        }

        const dropAreaToUse = actualDropAreaId || dropAreaId;
        const updated = updateDropAreaById(
          state.dropAreas,
          dropAreaToUse,
          (area) => ({
            ...area,
            blocks: area.blocks.map((block) =>
              block.id === blockId
                ? { ...block, content, ...additionalProps }
                : block
            ),
          })
        );

        return { ...state, dropAreas: updated };
      });

      get().triggerAutoSave();
    },

    selectBlock: (id) => set({ selectedBlockId: id }),

    reorderBlocks: (dropAreaId, blocks) => {
      set((state) => {
        const blocksCopy = blocks.map((block) => ({ ...block }));
        const updated = updateDropAreaById(
          state.dropAreas,
          dropAreaId,
          (area) => ({
            ...area,
            blocks: blocksCopy,
          })
        );

        return { ...state, dropAreas: updated };
      });

      get().triggerAutoSave();
    },

    addBlockAtIndex: (block, dropAreaId, index) => {
      const id = `block-${Date.now()}`;
      const newBlock: BlockType = {
        ...block,
        id,
        dropAreaId, // Ensure dropAreaId is set on the block itself
        ...(block.type === "heading" && {
          headingLevel: block.headingLevel || 1,
        }),
      };

      set((state) => {
        // --- Simplified State Update ---
        const dropAreasCopy = JSON.parse(JSON.stringify(state.dropAreas));
        const targetArea = findDropAreaById(dropAreasCopy, dropAreaId);

        if (!targetArea) {
          throw new Error(
            `[addBlockAtIndex] Target drop area ${dropAreaId} not found.`
          );
        }

        // Insert block at the specified index directly into the found area's blocks
        targetArea.blocks.splice(index, 0, newBlock);

        // Note: Unlike addBlock, we don't automatically add a new empty area here.
        // Insertion should happen within the target area.
        return { ...state, dropAreas: dropAreasCopy };
        // --- End Simplified State Update ---
      });

      // Cleanup und Auto-Save nach dem State-Update
      setTimeout(() => {
        get().cleanupEmptyDropAreas(); // <-- RE-ENABLED
        get().triggerAutoSave();
      }, 0);
    },

    // Drop Area Actions
    splitDropArea: (dropAreaId) => {
      set((state) => {
        const updated = updateDropAreaById(
          state.dropAreas,
          dropAreaId,
          (area) => {
            const leftAreaId = `${area.id}-left-${Date.now()}`;
            const rightAreaId = `${area.id}-right-${Date.now()}`;

            return {
              ...area,
              isSplit: true,
              splitAreas: [
                {
                  id: leftAreaId,
                  blocks: [],
                  isSplit: false,
                  splitAreas: [],
                  splitLevel: area.splitLevel + 1,
                  parentId: area.id,
                },
                {
                  id: rightAreaId,
                  blocks: [],
                  isSplit: false,
                  splitAreas: [],
                  splitLevel: area.splitLevel + 1,
                  parentId: area.id,
                },
              ],
            };
          }
        );

        return { ...state, dropAreas: updated };
      });

      get().triggerAutoSave();
    },

    splitPopulatedDropArea: (dropAreaId) => {
      set((state) => {
        const updated = updateDropAreaById(
          state.dropAreas,
          dropAreaId,
          (area) => {
            const leftAreaId = `${area.id}-left-${Date.now()}`;
            const rightAreaId = `${area.id}-right-${Date.now()}`;

            return {
              ...area,
              isSplit: true,
              blocks: [],
              splitAreas: [
                {
                  id: leftAreaId,
                  blocks: area.blocks.map((block) => ({
                    ...block,
                    dropAreaId: leftAreaId,
                  })),
                  isSplit: false,
                  splitAreas: [],
                  splitLevel: area.splitLevel + 1,
                  parentId: area.id,
                },
                {
                  id: rightAreaId,
                  blocks: [],
                  isSplit: false,
                  splitAreas: [],
                  splitLevel: area.splitLevel + 1,
                  parentId: area.id,
                },
              ],
            };
          }
        );

        return { ...state, dropAreas: updated };
      });

      get().triggerAutoSave();
    },

    mergeDropAreas: (firstAreaId, secondAreaId) => {
      set((state) => {
        const parent = findParentOfSplitAreas(
          state.dropAreas,
          firstAreaId,
          secondAreaId
        );
        if (!parent) return state;

        const firstArea = findDropAreaById(state.dropAreas, firstAreaId);
        const secondArea = findDropAreaById(state.dropAreas, secondAreaId);
        if (!firstArea || !secondArea) return state;

        const firstAreaEmpty = firstArea.blocks.length === 0;
        const blocksForMergedArea = firstAreaEmpty
          ? secondArea.blocks
          : firstArea.blocks;

        const updated = updateDropAreaById(
          state.dropAreas,
          parent.id,
          (area) => ({
            ...area,
            isSplit: false,
            splitAreas: [],
            splitLevel: Math.max(0, area.splitLevel - 1),
            blocks: blocksForMergedArea.map((block) => ({
              ...block,
              dropAreaId: area.id,
            })),
          })
        );

        return { ...state, dropAreas: updated };
      });

      get().triggerAutoSave();
    },

    deleteDropArea: (dropAreaId) => {
      set((state) => {
        if (state.dropAreas.length <= 1) {
          throw new Error("Cannot delete the only drop area");
        }

        const updated = state.dropAreas.filter(
          (area) => area.id !== dropAreaId
        );
        return { ...state, dropAreas: updated };
      });

      setTimeout(() => {
        set((state) => {
          if (state.dropAreas.length === 0) {
            return {
              ...state,
              dropAreas: [
                {
                  id: `drop-area-${Date.now()}`,
                  blocks: [],
                  isSplit: false,
                  splitAreas: [],
                  splitLevel: 0,
                },
              ],
            };
          }
          return state;
        });
        get().cleanupEmptyDropAreas(); // <-- RE-ENABLED (Direct call? Check if this was intended)
        get().triggerAutoSave();
      }, 0);
    },

    // Area State Checks
    canMerge: (firstAreaId, secondAreaId) => {
      const { dropAreas } = get();
      return canMergeAreas(dropAreas, firstAreaId, secondAreaId);
    },

    canSplit: (dropAreaId, viewport) => {
      const { dropAreas } = get();
      const area = findDropAreaById(dropAreas, dropAreaId);
      if (!area) return false;

      if (viewport === "mobile") return false;
      if (viewport === "tablet" && area.splitLevel >= 1) return false;
      if (viewport === "desktop" && area.splitLevel >= 2) return false;

      return true;
    },

    cleanupEmptyDropAreas: () => {
      set((state) => {
        const initialAreas = state.dropAreas;
        if (initialAreas.length <= 1) return state;

        let changed = false;
        const cleanedAreas: DropAreaType[] = [];

        // 1. Iterate backwards to safely remove consecutive empty areas
        let previousAreaWasEmpty = false;
        for (let i = initialAreas.length - 1; i >= 0; i--) {
          const currentArea = initialAreas[i];
          const isCurrentAreaEmpty = isDropAreaEmpty(currentArea);

          if (isCurrentAreaEmpty && previousAreaWasEmpty) {
            // Skip this area (it's a consecutive empty one)
            changed = true;
            continue; // Don't add it to cleanedAreas
          } else {
            // Keep this area (either populated or the first empty one from the end)
            cleanedAreas.unshift(currentArea); // Add to the beginning to maintain relative order
            previousAreaWasEmpty = isCurrentAreaEmpty;
          }
        }

        // If after cleaning we have 0 areas (shouldn't happen if initial length > 1, but safe check)
        if (cleanedAreas.length === 0) {
           cleanedAreas.push({
              id: `drop-area-${Date.now()}`,
              blocks: [], isSplit: false, splitAreas: [], splitLevel: 0
           });
           changed = true;
        }

        // 2. Ensure exactly one empty area exists at the very end
        const lastCleanedArea = cleanedAreas[cleanedAreas.length - 1];
        if (!isDropAreaEmpty(lastCleanedArea)) {
          // If the last area is populated, add a new empty one
          cleanedAreas.push({
            id: `drop-area-${Date.now()}`,
            blocks: [],
            isSplit: false,
            splitAreas: [],
            splitLevel: 0,
          });
          changed = true;
        }

        // 3. Return original state if nothing changed
        if (!changed) {
          return state;
        }

        // 4. Return the new state
        return { ...state, dropAreas: cleanedAreas };
      });
    },

    // Project Actions
    loadProject: async (projectId: string) => {
      const supabase = getSupabase(); // Hole Client für User-Info
      if (!supabase) return false;
      const { data: { user } } = await supabase.auth.getUser();
      // userId kann null sein, wenn nicht eingeloggt
      const userId = user?.id;

      // Check if the projectId is a valid UUID format
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const isUuid = uuidRegex.test(projectId);

      console.log(`[LoadProject] Starting load for ID: ${projectId}, Is UUID: ${isUuid}, User ID: ${userId}`);

      set({ isLoading: true, currentProjectId: null, currentProjectDatabaseId: null });

      try {
        let projectData: ProjectData | null = null;
        let projectTitle = "Untitled Project";
        let dbProjectId: string | undefined = undefined;
        let storageProjectId: string | undefined = undefined;

        // Prioritize loading from Database if the ID is a UUID
        if (isUuid) {
           console.log(`[LoadProject] Attempting to load from database with UUID: ${projectId}`);
          const dbProject = await loadProjectFromDatabase(projectId);
          if (dbProject) {
            console.log("[LoadProject] Successfully loaded from database.");
            projectData = dbProject;
            projectTitle = dbProject.title;
            dbProjectId = dbProject.id;
            storageProjectId = dbProject.id;
          } else {
            console.warn(
              `[LoadProject] Project with UUID ${projectId} not found in database.`
            );
          }
        }

        // If not loaded from DB OR if the provided ID wasn't a UUID, try loading from storage
        // Nur aus Storage laden, wenn wir eine userId haben!
        if (!projectData && userId) {
           console.log(`[LoadProject] Attempting to load from storage with ID: ${projectId} for user ${userId}`);
           // Übergebe userId an loadProjectFromStorage
           const storageProject = await loadProjectFromStorage(projectId, userId);
          if (storageProject) {
            console.log("[LoadProject] Successfully loaded from storage.");
            projectData = storageProject;
            projectTitle = storageProject.title;
            storageProjectId = storageProject.id;
            dbProjectId = (storageProject.id && uuidRegex.test(storageProject.id)) ? storageProject.id : undefined;
             console.log(`[LoadProject] Storage Project ID: ${storageProjectId}, Identified DB ID: ${dbProjectId}`);
          } else {
             console.log(`[LoadProject] Project not found in storage for user ${userId}.`);
          }
        } else if (!projectData) {
            console.log("[LoadProject] Cannot load from storage without userId.");
        }

        // If project was loaded (either from DB or Storage)
        if (projectData) {
           console.log("[LoadProject] Setting store state:", {
              dbId: dbProjectId,
              storageId: storageProjectId,
              title: projectTitle
           });
          set({
            dropAreas: projectData.dropAreas,
            currentProjectId: storageProjectId || dbProjectId || projectId,
            currentProjectDatabaseId: dbProjectId || null,
            currentProjectTitle: projectTitle,
            lastSaved: projectData.updatedAt ? new Date(projectData.updatedAt) : null,
            isLoading: false,
          });
          console.log("[LoadProject] Load successful.");
          return true;
        } else {
          // Project not found
          console.error(`[LoadProject] Project ${projectId} not found in database or storage.`);
          set({ isLoading: false, currentProjectId: null, currentProjectDatabaseId: null });
          return false;
        }
      } catch (error: any) {
        console.error(`[LoadProject] Error loading project ${projectId}:`, error);
        set({ isLoading: false, currentProjectId: null, currentProjectDatabaseId: null });
        return false;
      }
    },

    saveProject: async (projectTitle, description) => {
      const {
        currentProjectId,
        currentProjectDatabaseId,
        dropAreas,
      } = get();

      const supabase = getSupabase();
      if (!supabase) return false;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      const userId = user.id;

      console.log(`[SaveProject] Starting save. Title: "${projectTitle}", Storage ID: ${currentProjectId}, DB ID: ${currentProjectDatabaseId}`);

      set({ isSaving: true });
      const now = new Date().toISOString();

      let dbIdToUse: string | undefined = currentProjectDatabaseId || undefined;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      if (!dbIdToUse && currentProjectId && uuidRegex.test(currentProjectId)) {
         dbIdToUse = currentProjectId;
         console.log(`[SaveProject] Using currentProjectId (${dbIdToUse}) as DB ID.`);
      } else if (!dbIdToUse) {
         console.log("[SaveProject] No valid DB ID found. DB will generate ID.");
      }

      const projectData: ProjectData = {
        id: dbIdToUse,
        title: projectTitle,
        description: description || "",
        dropAreas: JSON.parse(JSON.stringify(dropAreas)),
        createdAt: now,
        updatedAt: now,
      };

      // --- Attempt to load existing data to preserve createdAt ---
      if (dbIdToUse) {
         let existingCreatedAt: string | undefined;
         try {
            const existingDbData = await loadProjectFromDatabase(dbIdToUse);
            existingCreatedAt = existingDbData?.createdAt;
         } catch (loadDbError) {
             console.warn(`Could not load DB data for ${dbIdToUse}:`, loadDbError);
         }
         if (!existingCreatedAt) {
            try {
               const storageIdForLoad = dbIdToUse;
               if (userId) {
                 const existingStorageData = await loadProjectFromStorage(storageIdForLoad, userId);
                 existingCreatedAt = existingStorageData?.createdAt;
               } else {
                   console.warn("[SaveProject] Cannot load from storage to preserve createdAt without userId.");
               }
            } catch (loadStorageError) {
                console.warn(`Could not load Storage data for ${dbIdToUse}:`, loadStorageError);
            }
         }
         if (existingCreatedAt) {
             projectData.createdAt = existingCreatedAt;
         }
      }

      console.log('[SaveProject] Data prepared for saving:', projectData);

      try {
        // --- Save to Database ---
        console.log('[SaveProject] Attempting to save to database...');
        const dbResult = await saveProjectToDatabase(projectData, userId);
        console.log(`[SaveProject] Database save result:`, dbResult);

        if (!dbResult.success || !dbResult.projectId) {
           console.error('[SaveProject] Database save failed. Aborting.');
           set({ isSaving: false });
           return false;
        }

        const finalDbId = dbResult.projectId;
        set({ currentProjectDatabaseId: finalDbId });
        projectData.id = finalDbId;

        // --- Save to Storage ---
        console.log(`[SaveProject] Attempting to save to storage with ID ${finalDbId}...`);
        const storageSuccess = await saveProjectToStorage(projectData);
        console.log(`[SaveProject] Storage save success: ${storageSuccess}`);

        if (!storageSuccess) {
           console.warn('[SaveProject] Storage save failed, but database save was successful.');
        }

        // Update store state
        set({
          currentProjectId: finalDbId,
          currentProjectTitle: projectTitle,
          lastSaved: new Date(),
          isSaving: false,
        });
        console.log(`[SaveProject] Save completed successfully. DB ID: ${finalDbId}`);
        return true;

      } catch (error: any) {
        console.error("[SaveProject] Error during save operation:", error);
        set({ isSaving: false });
        return false;
      }
    },

    createNewProject: async (title, description) => {
      const { isSaving } = get();
      const supabase = getSupabase();
      if (!supabase || isSaving) return null;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
           console.error("[CreateProject] User not authenticated.");
           return null;
      }
      const userId = user.id;

      console.log("[CreateProject] Creating NEW project entry.");
      set({ isSaving: true });
      const now = new Date().toISOString();

      try {
        const initialProjectData: ProjectData = {
          title: title || "Untitled Project",
          description: description || "",
          dropAreas: [
            {
              id: "drop-area-1",
              blocks: [],
              isSplit: false,
              splitAreas: [],
              splitLevel: 0,
            },
          ],
          createdAt: now,
          updatedAt: now,
        };

        console.log("[CreateProject] Saving initial data to database...");
        const dbResult = await saveProjectToDatabase(initialProjectData, userId);

        if (!dbResult.success || !dbResult.projectId) {
           console.error("[CreateProject] Failed to save initial project to database.");
           set({ isSaving: false });
           return null;
        }

        const newDbId = dbResult.projectId;
        console.log(`[CreateProject] Database save successful. New DB ID: ${newDbId}`);

        const finalProjectData: ProjectData = {
           ...initialProjectData,
           id: newDbId,
        };

        console.log(`[CreateProject] Saving initial data to storage with ID ${newDbId}...`);
        const storageSuccess = await saveProjectToStorage(finalProjectData);
        if (!storageSuccess) {
          console.warn("[CreateProject] Failed to save initial project to storage, but DB entry created.");
        }

        set({
          dropAreas: finalProjectData.dropAreas,
          currentProjectId: newDbId,
          currentProjectDatabaseId: newDbId,
          currentProjectTitle: finalProjectData.title,
          isSaving: false,
          lastSaved: new Date(),
        });
        console.log(`[CreateProject] New project created and store updated. ID: ${newDbId}`);
        return newDbId;

      } catch (error: any) {
        console.error("[CreateProject] Error creating new project:", error);
        set({ isSaving: false });
        return null;
      }
    },

    setProjectTitle: (title) => {
      set({ currentProjectTitle: title });
      get().triggerAutoSave();
    },

    // UI State Actions
    setPreviewMode: (enabled) => set({ previewMode: enabled }),

    togglePreviewMode: () =>
      set((state) => ({ previewMode: !state.previewMode })),

    toggleAutoSave: (enabled) => set({ autoSaveEnabled: enabled }),

    triggerAutoSave: () => {
      if (get().autoSaveEnabled) {
        debouncedSave();
      }
    },

    // Area Insertion Actions
    insertDropAreaBetween: (beforeAreaId, afterAreaId) => {
      const newAreaId = `drop-area-${Date.now()}`;
      set((state) => {
        const rootAreas = [...state.dropAreas];
        const beforeIndex = rootAreas.findIndex(
          (area) => area.id === beforeAreaId
        );
        const afterIndex = rootAreas.findIndex(
          (area) => area.id === afterAreaId
        );

        if (beforeIndex === -1 || afterIndex === -1) {
          throw new Error("Could not find areas to insert between");
        }

        rootAreas.splice(afterIndex, 0, {
          id: newAreaId,
          blocks: [],
          isSplit: false,
          splitAreas: [],
          splitLevel: 0,
        });

        return { ...state, dropAreas: rootAreas };
      });

      return newAreaId;
    },

    insertDropArea: (insertIndex) => {
      const newAreaId = `drop-area-${Date.now()}`;
      set((state) => {
        const updatedAreas = [...state.dropAreas];
        updatedAreas.splice(insertIndex, 0, {
          id: newAreaId,
          blocks: [],
          isSplit: false,
          splitAreas: [],
          splitLevel: 0,
        });

        return { ...state, dropAreas: updatedAreas };
      });

      return newAreaId;
    },

    insertBlockInNewArea: (item, insertIndex) => {
      set((state) => {
        let updatedAreas = [...state.dropAreas];
        const newAreaId = `drop-area-${Date.now()}`;
        let blockToInsert: BlockType;

        if (item.id && item.sourceDropAreaId) {
          const { block: foundBlock, dropAreaId: actualSourceAreaId } =
            findBlockById(updatedAreas, item.id);
          if (!foundBlock) {
            throw new Error(`Block ${item.id} not found for insertion`);
          }

          updatedAreas = updateDropAreaById(
            updatedAreas,
            actualSourceAreaId || item.sourceDropAreaId,
            (area) => ({
              ...area,
              blocks: area.blocks.filter((b) => b.id !== item.id),
            })
          );

          blockToInsert = { ...foundBlock, dropAreaId: newAreaId };
        } else {
          blockToInsert = {
            id: `block-${Date.now()}`,
            type: isValidBlockType(item.type) ? item.type : 'paragraph', // Default to paragraph if invalid type
            content: item.content,
            dropAreaId: newAreaId,
            ...(item.type === "heading" && { headingLevel: 1 }),
          };
        }

        const newArea: DropAreaType = {
          id: newAreaId,
          blocks: [blockToInsert],
          isSplit: false,
          splitAreas: [],
          splitLevel: 0,
        };

        updatedAreas.splice(insertIndex, 0, newArea);
        return { ...state, dropAreas: updatedAreas };
      });

      setTimeout(() => {
        get().cleanupEmptyDropAreas(); // <-- RE-ENABLED
        get().triggerAutoSave();
      }, 0);
    },

    // UI State Action Implementation
    setProjectJustDeleted: (deleted) => set({ projectJustDeleted: deleted }),
    setDeletedProjectTitle: (title) => set({ deletedProjectTitle: title }),

    // Publishing Actions
    publishBoard: async () => {
      const { currentProjectId, currentProjectTitle, isPublishing } = get();

      console.log("[publishBoard] Starting publish process", {
        currentProjectId,
        currentProjectTitle,
        isPublishing
      });

      if (!currentProjectId || isPublishing) {
        console.log("[publishBoard] Aborting - invalid state", {
          currentProjectId,
          isPublishing
        });
        return false;
      }

      set({ isPublishing: true });

      try {
        // First save the current state
        console.log("[publishBoard] Saving current project state");
        const saveSuccess = await get().saveProject(currentProjectTitle);
        if (!saveSuccess) {
          console.error("[publishBoard] Failed to save project before publishing");
          throw new Error("Failed to save project before publishing");
        }

        // Get the user info from Supabase
        const supabase = getSupabase();
        if (!supabase) {
          console.error("[publishBoard] Supabase client not available");
          throw new Error("Supabase client not available");
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error("[publishBoard] User not authenticated");
          throw new Error("User not authenticated");
        }

        console.log("[publishBoard] Publishing board", {
          projectId: currentProjectId,
          title: currentProjectTitle,
          authorName: user.user_metadata?.full_name || "Anonymous",
          userId: user.id
        });

        // Publish the board
        const success = await publishBoard(
          currentProjectId,
          currentProjectTitle,
          user.user_metadata?.full_name || "Anonymous",
          user.id
        );

        if (success) {
          console.log("[publishBoard] Successfully published board");
          set({
            isPublished: true,
            publishedUrl: `/boards/${currentProjectId}`,
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
      const { currentProjectId, isPublishing } = get();

      if (!currentProjectId || isPublishing) {
        return false;
      }

      set({ isPublishing: true });

      try {
        const success = await unpublishBoard(currentProjectId);

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
      const { currentProjectId } = get();

      if (!currentProjectId) {
        return;
      }

      try {
        const publishedBoard = await getPublishedBoard(currentProjectId);

        set({
          isPublished: !!publishedBoard?.is_published,
          publishedUrl: publishedBoard?.is_published ? `/boards/${currentProjectId}` : null,
        });
      } catch (error) {
        console.error("Error checking publish status:", error);
      }
    },

    // NEU: Canvas Hover Actions
    setCanvasHoveredInsertionIndex: (index) => {
      set({ canvasHoveredInsertionIndex: index });
    },
    resetAllHoverStates: () => {
      get().setCanvasHoveredInsertionIndex(null);
      // Zukünftig könnten hier weitere Resets (z.B. für DropAreas) hinzugefügt werden,
      // aber vorerst reicht der Canvas-Reset über den Store.
    },
  };
});
