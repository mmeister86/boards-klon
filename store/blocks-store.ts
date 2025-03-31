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
  type ProjectData,
} from "@/lib/supabase/storage";

// Debounce helper function to limit how often we save
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

// Define the store state interface
interface BlocksState {
  dropAreas: DropAreaType[];
  selectedBlockId: string | null;
  previewMode: boolean;
  currentProjectId: string | null;
  currentProjectTitle: string;
  isLoading: boolean;
  isSaving: boolean;
  autoSaveEnabled: boolean;
  lastSaved: Date | null;
  addBlock: (block: Omit<BlockType, "id">, dropAreaId: string) => void;
  splitDropArea: (dropAreaId: string) => void;
  splitPopulatedDropArea: (dropAreaId: string) => void;
  mergeDropAreas: (firstAreaId: string, secondAreaId: string) => void;
  canMerge: (firstAreaId: string, secondAreaId: string) => boolean;
  selectBlock: (id: string | null) => void;
  canSplit: (dropAreaId: string, viewport: ViewportType) => boolean;
  moveBlock: (
    blockId: string,
    sourceAreaId: string,
    targetAreaId: string
  ) => void;
  deleteBlock: (blockId: string, dropAreaId: string) => void;
  deleteDropArea: (dropAreaId: string) => void;
  updateBlockContent: (
    blockId: string,
    dropAreaId: string,
    content: string,
    additionalProps?: Partial<BlockType>
  ) => void;
  cleanupEmptyDropAreas: () => void;
  togglePreviewMode: () => void;
  reorderBlocks: (dropAreaId: string, blocks: BlockType[]) => void;
  loadProject: (projectId: string) => Promise<boolean>;
  saveProject: (
    projectTitle: string,
    description?: string
  ) => Promise<string | boolean | null>;
  createNewProject: (
    title: string,
    description?: string
  ) => Promise<string | null>;
  setProjectTitle: (title: string) => void;
  triggerAutoSave: () => void;
  toggleAutoSave: (enabled: boolean) => void;
  insertDropAreaBetween: (beforeAreaId: string, afterAreaId: string) => string;
  insertDropArea: (insertIndex: number) => string;
  // Action to insert a block into a newly created area at a specific index
  insertBlockInNewArea: (item: DragItem, insertIndex: number) => void;
}

// Define the type for the dragged item (consistent with Canvas)
// Moved this interface definition here to be accessible by the action type above
interface DragItem {
  id?: string; // ID of the block being dragged (if existing)
  type: string; // Type of the block (e.g., 'heading', 'paragraph')
  content: string; // Default content for new blocks
  sourceDropAreaId?: string; // Original drop area ID (if moving existing block)
}

// Create the store
export const useBlocksStore = create<BlocksState>((set, get) => {
  // Create a debounced version of the save function to prevent too many saves
  const debouncedSave = debounce(async () => {
    const { currentProjectTitle, currentProjectId, isSaving } = get();

    // Don't auto-save if we're already saving or if there's no project ID
    if (isSaving || !currentProjectId) {
      console.log("Auto-save skipped: Already saving or no project ID");
      return;
    }

    console.log("Auto-save triggered for project:", currentProjectId);

    // Set saving state
    set({ isSaving: true });

    try {
      // Call the save function
      const success = await get().saveProject(currentProjectTitle);

      if (success) {
        set({
          lastSaved: new Date(),
          isSaving: false,
        });
        console.log("Auto-save successful");
      } else {
        set({ isSaving: false });
        console.error("Auto-save failed");
      }
    } catch (error) {
      set({ isSaving: false });
      console.error("Auto-save error:", error);
    }
  }, 2000); // 2 second debounce

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
    autoSaveEnabled: true, // Auto-save is enabled by default
    lastSaved: null,

    // Add the reorderBlocks function here
    reorderBlocks: (dropAreaId, blocks) => {
      set((state) => {
        console.log(`Reordering blocks in drop area ${dropAreaId}`, blocks);

        // Create a deep copy of the blocks to ensure we're not mutating state
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

      // Trigger auto-save after reordering blocks
      get().triggerAutoSave();
    },

    // Actions
    addBlock: (block, dropAreaId) => {
      const id = `block-${Date.now()}`;

      // Add default properties based on block type
      let newBlock = { ...block, id };

      // Set default properties for specific block types
      if (block.type === "heading") {
        newBlock = {
          ...newBlock,
          headingLevel: block.headingLevel || 1, // Default to H1 if not specified
        };
      }

      set((state) => {
        // First, try to find the target drop area
        const targetArea = findDropAreaById(state.dropAreas, dropAreaId);

        if (!targetArea) {
          console.error(`Drop area with ID ${dropAreaId} not found`);
          return state;
        }

        // Update the drop areas, adding the block to the target area
        const updated = updateDropAreaById(
          state.dropAreas,
          dropAreaId,
          (area) => ({
            ...area,
            blocks: [...area.blocks, newBlock],
          })
        );

        // Check if we need to add a new drop area at the root level
        const lastRootArea = updated[updated.length - 1];
        const lastAreaHasBlocks =
          lastRootArea.blocks.length > 0 ||
          (lastRootArea.isSplit &&
            lastRootArea.splitAreas.some((a) => a.blocks.length > 0));

        if (lastAreaHasBlocks) {
          // Add a new empty drop area at the root level
          const newAreaId = `drop-area-${updated.length + 1}`;
          return {
            ...state,
            dropAreas: [
              ...updated,
              {
                id: newAreaId,
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

      // Clean up empty areas after adding a block
      setTimeout(() => {
        get().cleanupEmptyDropAreas();
        // Trigger auto-save after adding blocks
        get().triggerAutoSave();
      }, 0);
    },

    splitDropArea: (dropAreaId) => {
      set((state) => {
        const area = findDropAreaById(state.dropAreas, dropAreaId);
        if (!area) return state;

        const updated = updateDropAreaById(
          state.dropAreas,
          dropAreaId,
          (area) => {
            // Create two new split areas
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

      // Trigger auto-save after splitting
      get().triggerAutoSave();
    },

    splitPopulatedDropArea: (dropAreaId) => {
      set((state) => {
        const area = findDropAreaById(state.dropAreas, dropAreaId);
        if (!area) return state;

        const updated = updateDropAreaById(
          state.dropAreas,
          dropAreaId,
          (area) => {
            // Create two new split areas
            const leftAreaId = `${area.id}-left-${Date.now()}`;
            const rightAreaId = `${area.id}-right-${Date.now()}`;

            // Update the dropAreaId for each block
            const updatedBlocks = area.blocks.map((block) => ({
              ...block,
              dropAreaId: leftAreaId,
            }));

            return {
              ...area,
              isSplit: true,
              // Keep the original blocks in the left area
              splitAreas: [
                {
                  id: leftAreaId,
                  blocks: updatedBlocks, // Copy the existing blocks to the left area with updated dropAreaId
                  isSplit: false,
                  splitAreas: [],
                  splitLevel: area.splitLevel + 1,
                  parentId: area.id,
                },
                {
                  id: rightAreaId,
                  blocks: [], // Right area starts empty
                  isSplit: false,
                  splitAreas: [],
                  splitLevel: area.splitLevel + 1,
                  parentId: area.id,
                },
              ],
              // Clear the blocks from the parent area since they're now in the left split area
              blocks: [],
            };
          }
        );

        return { ...state, dropAreas: updated };
      });

      // Trigger auto-save after splitting populated area
      get().triggerAutoSave();
    },

    // Check if two drop areas can be merged
    canMerge: (firstAreaId, secondAreaId) => {
      const { dropAreas } = get();
      const result = canMergeAreas(dropAreas, firstAreaId, secondAreaId);
      // Only log when merge is possible to reduce console noise
      if (result) {
        console.log(
          `canMerge check: ${firstAreaId} + ${secondAreaId} = ${result}`
        );
      }
      return result;
    },

    // Merge two drop areas
    mergeDropAreas: (firstAreaId, secondAreaId) => {
      set((state) => {
        // Find the parent area that contains these split areas
        const parent = findParentOfSplitAreas(
          state.dropAreas,
          firstAreaId,
          secondAreaId
        );
        if (!parent) return state;

        // Find the areas to merge
        const firstArea = findDropAreaById(state.dropAreas, firstAreaId);
        const secondArea = findDropAreaById(state.dropAreas, secondAreaId);

        if (!firstArea || !secondArea) return state;

        // Determine which area has content (if any)
        const firstAreaEmpty = firstArea.blocks.length === 0;

        // If both are empty, the merged area will be empty
        // If one has content, we'll use that content in the merged area
        const blocksForMergedArea = firstAreaEmpty
          ? secondArea.blocks
          : firstArea.blocks;

        // Update the parent area to no longer be split
        const updated = updateDropAreaById(
          state.dropAreas,
          parent.id,
          (area) => ({
            ...area,
            isSplit: false,
            splitAreas: [],
            splitLevel: Math.max(0, area.splitLevel - 1), // Decrement splitLevel but never below 0
            blocks: blocksForMergedArea.map((block) => ({
              ...block,
              dropAreaId: area.id,
            })),
          })
        );

        return { ...state, dropAreas: updated };
      });

      // Trigger auto-save after merging
      get().triggerAutoSave();
    },

    selectBlock: (id) => {
      set({ selectedBlockId: id });
    },

    canSplit: (dropAreaId, viewport) => {
      const { dropAreas } = get();
      const area = findDropAreaById(dropAreas, dropAreaId);
      if (!area) return false;

      // Check if we've reached the maximum split level
      if (viewport === "desktop" && area.splitLevel >= 2) return false; // Max 4 in a row (2 split levels)
      if (viewport === "tablet" && area.splitLevel >= 1) return false; // Max 2 in a row (1 split level)
      if (viewport === "mobile") return false; // No splitting in mobile

      return true;
    },

    moveBlock: (blockId, sourceAreaId, targetAreaId) => {
      // Generate a trace ID to track this operation through logs
      const traceId = `move_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      console.log(`[${traceId}] MOVE BLOCK STARTED: ${blockId} from ${sourceAreaId} to ${targetAreaId}`);
      
      set((state) => {
        try {
          // Find the block in any drop area (gets the actual location)
          const { block: foundBlock, dropAreaId: actualSourceAreaId } =
            findBlockById(state.dropAreas, blockId);

          // If block not found, log error and return state
          if (!foundBlock) {
            console.error(`[${traceId}] Block with ID ${blockId} NOT FOUND in any drop area`);
            return state;
          }

          // Use the actual source area where the block was found
          const sourceAreaToUse = actualSourceAreaId || sourceAreaId;
          
          // Debug: Check if the source area matches what was expected
          if (sourceAreaToUse !== sourceAreaId) {
            console.warn(`[${traceId}] Source area mismatch - Expected: ${sourceAreaId}, Actual: ${sourceAreaToUse}`);
          }
          
          console.log(`[${traceId}] Moving block ${blockId} from ${sourceAreaToUse} to ${targetAreaId}`);
          
          // Skip if trying to move to the same area
          if (sourceAreaToUse === targetAreaId) {
            console.log(`[${traceId}] Source and target are the same (${sourceAreaToUse}), skipping move`);
            return state;
          }

          // Debug: Verify that the block exists in the source area
          console.log(`[${traceId}] Block found:`, foundBlock);
          
          // Make a DEEP clone of all areas to avoid reference issues
          console.log(`[${traceId}] Creating deep copy of state with ${state.dropAreas.length} areas`);
          const rootAreas = JSON.parse(JSON.stringify(state.dropAreas));

          // Find source and target areas
          const sourceArea = findDropAreaById(rootAreas, sourceAreaToUse);
          const targetArea = findDropAreaById(rootAreas, targetAreaId);

          // Ensure both areas exist
          if (!sourceArea || !targetArea) {
            console.error(`[${traceId}] Source or target area not found - Source: ${!!sourceArea}, Target: ${!!targetArea}`);
            return state;
          }

          // Check if we're dropping between two populated areas
          const targetIndex = rootAreas.findIndex(
            (area) => area.id === targetAreaId
          );
          const prevArea = targetIndex > 0 ? rootAreas[targetIndex - 1] : null;
          const nextArea =
            targetIndex < rootAreas.length - 1
              ? rootAreas[targetIndex + 1]
              : null;

          const isPrevPopulated =
            prevArea &&
            (!isDropAreaEmpty(prevArea) ||
              (prevArea.isSplit &&
                prevArea.splitAreas.some((a) => !isDropAreaEmpty(a))));
          const isNextPopulated =
            nextArea &&
            (!isDropAreaEmpty(nextArea) ||
              (nextArea.isSplit &&
                nextArea.splitAreas.some((a) => !isDropAreaEmpty(a))));

          let finalTargetAreaId = targetAreaId;

          if (isPrevPopulated && isNextPopulated) {
            // Create a new drop area between the populated areas
            const newArea: DropAreaType = {
              id: `drop-area-${Date.now()}`,
              blocks: [],
              isSplit: false,
              splitAreas: [],
              splitLevel: 0,
            };

            // Insert the new area at the target position
            rootAreas.splice(targetIndex, 0, newArea);
            finalTargetAreaId = newArea.id;
            console.log(`[${traceId}] Created new area ${finalTargetAreaId} between populated areas`);
          } else if (
            isDropAreaEmpty(targetArea) &&
            !targetArea.isSplit &&
            !targetArea.parentId
          ) {
            // If not between populated areas, use the topmost empty area
            const topmostEmptyIndex = rootAreas.findIndex(
              (area) => isDropAreaEmpty(area) && !area.isSplit && !area.parentId
            );
            if (topmostEmptyIndex !== -1) {
              const topmostEmptyArea = rootAreas[topmostEmptyIndex];
              if (topmostEmptyArea.id !== targetAreaId) {
                finalTargetAreaId = topmostEmptyArea.id;
                console.log(`[${traceId}] Using topmost empty area ${finalTargetAreaId} instead of ${targetAreaId}`);
              }
            }
          }

          // Create a copy of the block with updated dropAreaId
          const blockToMove = { ...foundBlock, dropAreaId: finalTargetAreaId };
          
          console.log(`[${traceId}] STEP 1: Removing block ${blockId} from source area ${sourceAreaToUse}`);
          
          // 1. Remove the block from its source area
          let processedAreas = updateDropAreaById(
            rootAreas,
            sourceAreaToUse,
            (area) => {
              const filteredBlocks = area.blocks.filter((block) => block.id !== blockId);
              console.log(`[${traceId}] Filtered blocks in ${area.id}: ${area.blocks.length} -> ${filteredBlocks.length}`);
              return {
                ...area,
                blocks: filteredBlocks,
              };
            }
          );
          
          console.log(`[${traceId}] STEP 2: Adding block ${blockId} to target area ${finalTargetAreaId}`);
          
          // 2. Add the block to the target area
          processedAreas = updateDropAreaById(
            processedAreas,
            finalTargetAreaId,
            (area) => {
              const updatedBlocks = [...area.blocks, blockToMove];
              console.log(`[${traceId}] Updated blocks in ${area.id}: ${area.blocks.length} -> ${updatedBlocks.length}`);
              return {
                ...area,
                blocks: updatedBlocks,
              };
            }
          );

          console.log(`[${traceId}] MOVE COMPLETE: Block ${blockId} moved successfully`);
          
          // Return updated state
          return { ...state, dropAreas: processedAreas };
        } catch (error) {
          console.error(`[${traceId}] ERROR moving block:`, error);
          return state;
        }
      });

      // Clean up empty areas after moving a block
      setTimeout(() => {
        console.log(`[${traceId}] Running cleanup after block move`);
        get().cleanupEmptyDropAreas();
        // Trigger auto-save after moving blocks
        get().triggerAutoSave();
        console.log(`[${traceId}] Block move operation fully completed (with cleanup)`);
      }, 0);
    },

    deleteBlock: (blockId, dropAreaId) => {
      set((state) => {
        try {
          // Find the block using the improved findBlockById function
          const { block: foundBlock, dropAreaId: actualDropAreaId } =
            findBlockById(state.dropAreas, blockId);

          // If block not found, log error and return state
          if (!foundBlock) {
            console.error(
              `Block with ID ${blockId} not found in any drop area`
            );
            return state;
          }

          // Use the actual drop area ID where the block was found
          const dropAreaToUse = actualDropAreaId || dropAreaId;

          const updated = updateDropAreaById(
            state.dropAreas,
            dropAreaToUse,
            (area) => ({
              ...area,
              blocks: area.blocks.filter((block) => block.id !== blockId),
            })
          );

          return { ...state, dropAreas: updated };
        } catch (error) {
          console.error("Error deleting block:", error);
          return state;
        }
      });

      // Clean up empty areas after deleting a block
      setTimeout(() => {
        get().cleanupEmptyDropAreas();
        // Trigger auto-save after deleting blocks
        get().triggerAutoSave();
      }, 0);
    },
    
    deleteDropArea: (dropAreaId) => {
      set((state) => {
        try {
          // Find the drop area first
          const dropArea = findDropAreaById(state.dropAreas, dropAreaId);
          
          // If the drop area doesn't exist, return current state
          if (!dropArea) {
            console.error(`Drop area with ID ${dropAreaId} not found`);
            return state;
          }
          
          // Don't allow deleting if it will result in no drop areas
          if (state.dropAreas.length <= 1) {
            console.error("Cannot delete the only drop area");
            return state;
          }
          
          // If the drop area is split, we need to handle its children
          if (dropArea.isSplit && dropArea.splitAreas.length > 0) {
            // Just remove the area directly since we want to delete all contents
            const updated = state.dropAreas.filter(area => area.id !== dropAreaId);
            return { ...state, dropAreas: updated };
          } else {
            // It's a regular area, just filter it out from the top-level areas
            const updated = state.dropAreas.filter(area => area.id !== dropAreaId);
            return { ...state, dropAreas: updated };
          }
        } catch (error) {
          console.error("Error deleting drop area:", error);
          return state;
        }
      });
      
      // Make sure we still have at least one drop area
      setTimeout(() => {
        set((state) => {
          if (state.dropAreas.length === 0) {
            // Add a new empty drop area
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
        
        // Trigger auto-save after deleting the drop area
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
        try {
          // Find the block using the improved findBlockById function
          const { block: foundBlock, dropAreaId: actualDropAreaId } =
            findBlockById(state.dropAreas, blockId);

          // If block not found, log error and return state
          if (!foundBlock) {
            console.error(
              `Block with ID ${blockId} not found in any drop area`
            );
            return state;
          }

          // Use the actual drop area ID where the block was found
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
        } catch (error) {
          console.error("Error updating block content:", error);
          return state;
        }
      });

      // Trigger auto-save after updating content
      get().triggerAutoSave();
    },

    cleanupEmptyDropAreas: () => {
      set((state) => {
        // We only need to check root-level drop areas
        const rootAreas = [...state.dropAreas];

        // Always keep at least one drop area
        if (rootAreas.length <= 1) return state;

        // First, check if we have any populated areas
        const hasPopulatedAreas = rootAreas.some(
          (area) =>
            !isDropAreaEmpty(area) ||
            (area.isSplit &&
              area.splitAreas.some((splitArea) => !isDropAreaEmpty(splitArea)))
        );

        if (hasPopulatedAreas) {
          // Reorder areas to ensure populated ones are at the top
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

        // Find consecutive empty areas
        for (let i = 0; i < rootAreas.length - 1; i++) {
          if (
            isDropAreaEmpty(rootAreas[i]) &&
            isDropAreaEmpty(rootAreas[i + 1])
          ) {
            // Remove the second empty area
            rootAreas.splice(i + 1, 1);
            // Recheck the current index
            i--;
          }
        }

        // Ensure there's always at least one empty area at the end if the last area is populated
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

    togglePreviewMode: () => {
      set((state) => ({ previewMode: !state.previewMode }));
    },

    loadProject: async (projectId) => {
      set({ isLoading: true });
      console.log(`Starting to load project: ${projectId}`);

      try {
        // Load project data from Supabase storage
        console.log(`Calling loadProjectFromStorage for ${projectId}`);
        const projectData = await loadProjectFromStorage(projectId);

        if (!projectData) {
          console.error(
            `Project with ID ${projectId} not found or could not be loaded`
          );
          set({ isLoading: false });
          return false;
        }

        console.log(
          `Project data received for ${projectId}, preparing to update store`
        );

        // Make a deep copy of the drop areas to ensure we don't have reference issues
        const dropAreasCopy = JSON.parse(JSON.stringify(projectData.dropAreas));

        console.log(`Updating store with project data:
          - Title: ${projectData.title}
          - ID: ${projectData.id}
          - Drop areas: ${dropAreasCopy.length}
          - Created: ${projectData.createdAt}
          - Updated: ${projectData.updatedAt}
        `);

        // Update the store with the loaded project data
        set({
          dropAreas: dropAreasCopy,
          currentProjectId: projectData.id,
          currentProjectTitle: projectData.title,
          isLoading: false,
          lastSaved: new Date(projectData.updatedAt),
        });

        console.log(`Successfully loaded project ${projectId} into store`);
        return true;
      } catch (error) {
        console.error(`Error loading project ${projectId}:`, error);
        set({ isLoading: false });
        return false;
      }
    },

    saveProject: async (projectTitle, description) => {
      const { dropAreas, currentProjectId } = get();

      // If no project ID, create a new one
      if (!currentProjectId) {
        console.log("No current project ID, creating new project instead");
        return await get().createNewProject(projectTitle, description);
      }

      set({ isSaving: true });
      console.log(
        `Saving project ${currentProjectId} with title "${projectTitle}"`
      );

      // Log drop area information for debugging
      console.log(
        `Project ${currentProjectId} has ${dropAreas.length} drop areas:`
      );
      dropAreas.forEach((area, index) => {
        console.log(
          `  - Area ${index}: ${area.id}, ${area.blocks.length} blocks, isSplit: ${area.isSplit}`
        );
        if (area.blocks.length > 0) {
          console.log(
            `    - Blocks: ${area.blocks.map((b) => b.type).join(", ")}`
          );
        }
      });

      try {
        // Try to load the existing project to preserve creation date
        let existingProjectData = null;
        try {
          existingProjectData = await loadProjectFromStorage(currentProjectId);
          if (existingProjectData) {
            console.log(
              `Found existing project data for ${currentProjectId}, preserving creation date: ${existingProjectData.createdAt}`
            );
          }
        } catch (loadError) {
          console.warn(`Could not load existing project data: ${loadError}`);
        }

        // Create project data object with proper timestamps
        const projectData: ProjectData = {
          id: currentProjectId,
          title: projectTitle,
          description,
          dropAreas,
          // For existing projects, we need to preserve creation date
          createdAt: existingProjectData
            ? existingProjectData.createdAt
            : new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Save to Supabase storage
        console.log(
          `Calling saveProjectToStorage for project ${currentProjectId}`
        );
        console.log(
          `Project data being saved: ID=${projectData.id}, title=${projectData.title}, areas=${projectData.dropAreas.length}`
        );

        const success = await saveProjectToStorage(projectData);

        if (!success) {
          console.error(`Failed to save project ${currentProjectId}`);
          set({ isSaving: false });
          return false;
        }

        console.log(`Successfully saved project ${currentProjectId}`);

        // Verify the save by loading the project back
        try {
          const verifyData = await loadProjectFromStorage(currentProjectId);
          if (verifyData) {
            console.log(
              `Verified: project ${currentProjectId} was saved with ${verifyData.dropAreas.length} drop areas`
            );
          } else {
            console.warn(
              `Verification warning: Could not load saved project ${currentProjectId}`
            );
          }
        } catch (verifyError) {
          console.warn(`Verification error: ${verifyError}`);
        }

        // Update the current project title and save timestamp
        set({
          currentProjectTitle: projectTitle,
          isSaving: false,
          lastSaved: new Date(),
        });

        return true;
      } catch (error) {
        console.error(`Error saving project ${currentProjectId}:`, error);
        set({ isSaving: false });
        return false;
      }
    },

    createNewProject: async (title, description) => {
      // Helper function to check if a project is empty (no blocks)
      const isEmptyProject = (areas: DropAreaType[]) => {
        if (!areas || areas.length === 0) return true;

        // Check if any drop area has blocks
        for (const area of areas) {
          if (area.blocks && area.blocks.length > 0) return false;

          // Check split areas recursively
          if (area.isSplit && area.splitAreas && area.splitAreas.length > 0) {
            for (const splitArea of area.splitAreas) {
              if (splitArea.blocks && splitArea.blocks.length > 0) return false;
            }
          }
        }

        return true;
      };

      // Check if we already have a project in progress - no need to create a new one
      const { currentProjectId, dropAreas } = get();

      // If we already have a project in progress with no blocks,
      // just update the title and return the existing ID
      if (currentProjectId && isEmptyProject(dropAreas)) {
        console.log(
          `Reusing current empty project: ${currentProjectId} and updating title to "${title}"`
        );
        set({
          currentProjectTitle: title || "Untitled Project",
          lastSaved: new Date(),
        });
        // Don't save to storage yet - we'll do that when the user makes changes
        return currentProjectId;
      }

      // Otherwise, create a new project
      set({ isSaving: true });

      try {
        // Generate a new project ID with a unique timestamp
        const timestamp = Date.now();
        const newProjectId = `project-${timestamp}`;
        console.log(`Creating new project with ID: ${newProjectId}`);

        // Create initial project data
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
          createdAt: new Date(timestamp).toISOString(),
          updatedAt: new Date(timestamp).toISOString(),
        };

        // Save to Supabase storage
        console.log(
          `Calling saveProjectToStorage for new project ${newProjectId}`
        );
        const success = await saveProjectToStorage(projectData);

        if (!success) {
          console.error(`Failed to create new project ${newProjectId}`);
          set({ isSaving: false });
          return null;
        }

        console.log(`Successfully created new project ${newProjectId}`);

        // Update the store with the new project data
        set({
          dropAreas: projectData.dropAreas,
          currentProjectId: newProjectId,
          currentProjectTitle: projectData.title,
          isSaving: false,
          lastSaved: new Date(),
        });

        return newProjectId;
      } catch (error) {
        console.error("Error creating new project:", error);
        set({ isSaving: false });
        return null;
      }
    },

    // No duplicate function needed

    // Set project title
    setProjectTitle: (title) => {
      set({ currentProjectTitle: title });

      // Auto-save the project when title changes
      get().triggerAutoSave();
    },

    // Add new auto-save toggle function
    toggleAutoSave: (enabled) => {
      set({ autoSaveEnabled: enabled });
    },

    // Add auto-save trigger function with better logging
    triggerAutoSave: () => {
      const { autoSaveEnabled, currentProjectId, isSaving } = get();

      // Skip if already saving or saving disabled
      if (isSaving) {
        console.log("Auto-save triggered but already saving, skipping");
        return;
      }

      if (!autoSaveEnabled) {
        console.log("Auto-save triggered but disabled in settings, skipping");
        return;
      }

      if (!currentProjectId) {
        console.log(
          "Auto-save triggered but no project ID available, skipping"
        );
        return;
      }

      console.log("Triggering debounced auto-save");
      debouncedSave();
    },

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
          console.error("Could not find one of the areas to insert between");
          return state;
        }

        // Create the new drop area
        const newArea: DropAreaType = {
          id: newAreaId,
          blocks: [],
          isSplit: false,
          splitAreas: [],
          splitLevel: 0,
        };

        // Insert the new area between the two existing areas
        rootAreas.splice(afterIndex, 0, newArea);

        return { ...state, dropAreas: rootAreas };
      });

      return newAreaId;
    },

    insertDropArea: (insertIndex) => {
      const newAreaId = `drop-area-${Date.now()}`;

      set((state) => {
        const updatedAreas = [...state.dropAreas];
        const newArea: DropAreaType = {
          id: newAreaId,
          blocks: [],
          isSplit: false,
          splitAreas: [],
          splitLevel: 0,
        };

        // Insert the new area at the specified index
        updatedAreas.splice(insertIndex, 0, newArea);

        return { ...state, dropAreas: updatedAreas };
      });

      return newAreaId;
    },

    // --- NEW ACTION ---
    insertBlockInNewArea: (item, insertIndex) => {
      set((state) => {
        let updatedAreas = [...state.dropAreas];
        let blockToInsert: BlockType;
        const newAreaId = `drop-area-${Date.now()}`;

        // If it's an existing block being moved
        if (item.id && item.sourceDropAreaId) {
          // Find the block first
          const { block: foundBlock, dropAreaId: actualSourceAreaId } =
            findBlockById(updatedAreas, item.id);

          if (!foundBlock) {
            console.error(`Block ${item.id} not found for insertion.`);
            return state;
          }

          // Remove block from its original area
          const sourceAreaToUse = actualSourceAreaId || item.sourceDropAreaId;
          updatedAreas = updateDropAreaById(
            updatedAreas,
            sourceAreaToUse,
            (area) => ({
              ...area,
              blocks: area.blocks.filter((b) => b.id !== item.id),
            })
          );

          // Prepare the block for the new area
          blockToInsert = { ...foundBlock, dropAreaId: newAreaId };
        }
        // If it's a new block from the sidebar
        else {
          const newBlockId = `block-${Date.now()}`;
          blockToInsert = {
            id: newBlockId,
            type: item.type,
            content: item.content,
            dropAreaId: newAreaId,
            // Add default props if needed (e.g., headingLevel)
            ...(item.type === "heading" && { headingLevel: 1 }),
          };
        }

        // Create the new drop area with the block
        const newArea: DropAreaType = {
          id: newAreaId,
          blocks: [blockToInsert], // Add the block here
          isSplit: false,
          splitAreas: [],
          splitLevel: 0, // New areas are always root level initially
        };

        // Insert the new area at the specified index
        updatedAreas.splice(insertIndex, 0, newArea);

        return { ...state, dropAreas: updatedAreas };
      });

      // Clean up and save
      setTimeout(() => {
        get().cleanupEmptyDropAreas();
        get().triggerAutoSave();
      }, 0);
    },
    // --- END NEW ACTION ---
  };
});
