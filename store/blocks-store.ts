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
import type { ProjectData } from "@/lib/types";

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
  currentProjectTitle: string;
  isLoading: boolean;
  isSaving: boolean;
  autoSaveEnabled: boolean;
  lastSaved: Date | null;
  projectJustDeleted: boolean;
  deletedProjectTitle: string | null;

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
    currentProjectTitle: "Untitled Project",
    isLoading: false,
    isSaving: false,
    autoSaveEnabled: true,
    lastSaved: null,
    projectJustDeleted: false,
    deletedProjectTitle: null,

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

      // Cleanup and auto-save
      setTimeout(() => {
        get().cleanupEmptyDropAreas();
        get().triggerAutoSave();
      }, 0);
    },

    moveBlock: (blockId, sourceAreaId, targetAreaId) => {
      set((state) => {
        try {
          const { block: foundBlock, dropAreaId: actualSourceAreaId } =
            findBlockById(state.dropAreas, blockId);
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

          return { ...state, dropAreas: rootAreas };
        } catch (error: any) {
          throw new Error(`Error moving block: ${error.message}`);
        }
      });

      setTimeout(() => {
        get().cleanupEmptyDropAreas();
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
        get().cleanupEmptyDropAreas();
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

      // Cleanup and auto-save
      setTimeout(() => {
        get().cleanupEmptyDropAreas();
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
        const rootAreas = [...state.dropAreas];
        if (rootAreas.length <= 1) return state;

        const hasPopulatedAreas = rootAreas.some(
          (area) =>
            !isDropAreaEmpty(area) ||
            (area.isSplit && area.splitAreas.some((a) => !isDropAreaEmpty(a)))
        );

        if (hasPopulatedAreas) {
          rootAreas.sort((a, b) => {
            const aEmpty =
              isDropAreaEmpty(a) &&
              (!a.isSplit || a.splitAreas.every(isDropAreaEmpty));
            const bEmpty =
              isDropAreaEmpty(b) &&
              (!b.isSplit || b.splitAreas.every(isDropAreaEmpty));
            return aEmpty === bEmpty ? 0 : aEmpty ? 1 : -1;
          });
        }

        // Remove consecutive empty areas
        for (let i = 0; i < rootAreas.length - 1; i++) {
          if (
            isDropAreaEmpty(rootAreas[i]) &&
            isDropAreaEmpty(rootAreas[i + 1])
          ) {
            rootAreas.splice(i + 1, 1);
            i--;
          }
        }

        // Ensure one empty area at the end if needed
        const lastArea = rootAreas[rootAreas.length - 1];
        if (!isDropAreaEmpty(lastArea)) {
          rootAreas.push({
            id: `drop-area-${Date.now()}`,
            blocks: [],
            isSplit: false,
            splitAreas: [],
            splitLevel: 0,
          });
        }

        return { ...state, dropAreas: rootAreas };
      });
    },

    // Project Actions
    loadProject: async (projectId) => {
      try {
        const projectData = await loadProjectFromStorage(projectId);
        if (!projectData) {
          throw new Error(`Project ${projectId} not found`);
        }

        const dropAreasCopy = JSON.parse(JSON.stringify(projectData.dropAreas));
        set({
          dropAreas: dropAreasCopy,
          currentProjectId: projectData.id,
          currentProjectTitle: projectData.title,
          isLoading: false,
          lastSaved: new Date(projectData.updatedAt),
        });

        return true;
      } catch (error: any) {
        set({ isLoading: false });
        throw new Error(`Error loading project ${projectId}: ${error.message}`);
      }
    },

    saveProject: async (projectTitle, description) => {
      const { dropAreas, currentProjectId } = get();
      if (!currentProjectId) {
        const newId = await get().createNewProject(projectTitle, description);
        return !!newId;
      }

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
        set({
          currentProjectTitle: projectTitle,
          isSaving: false,
          lastSaved: success ? new Date() : null,
        });

        return success;
      } catch (error: any) {
        set({ isSaving: false });
        throw new Error(
          `Error saving project ${currentProjectId}: ${error.message}`
        );
      }
    },

    createNewProject: async (title, description) => {
      const { currentProjectId, dropAreas } = get();
      const isEmptyProject = (areas: DropAreaType[]) => {
        return !areas.some(
          (area) =>
            area.blocks.length > 0 ||
            (area.isSplit && area.splitAreas.some((a) => a.blocks.length > 0))
        );
      };

      if (currentProjectId && isEmptyProject(dropAreas)) {
        set({
          currentProjectTitle: title || "Untitled Project",
          lastSaved: new Date(),
        });
        return currentProjectId;
      }

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
          set({ isSaving: false });
          return null;
        }

        set({
          dropAreas: projectData.dropAreas,
          currentProjectId: newProjectId,
          currentProjectTitle: projectData.title,
          isSaving: false,
          lastSaved: new Date(),
        });

        return newProjectId;
      } catch (error: any) {
        set({ isSaving: false });
        throw new Error("Error creating new project: " + error.message);
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
      const { autoSaveEnabled, currentProjectId, isSaving } = get();
      if (isSaving || !autoSaveEnabled || !currentProjectId) {
        return;
      }
      debouncedSave();
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
            type: item.type,
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
        get().cleanupEmptyDropAreas();
        get().triggerAutoSave();
      }, 0);
    },

    // UI State Action Implementation
    setProjectJustDeleted: (deleted) => set({ projectJustDeleted: deleted }),
    setDeletedProjectTitle: (title) => set({ deletedProjectTitle: title }),
  };
});
