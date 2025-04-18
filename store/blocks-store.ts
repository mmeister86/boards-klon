/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import type { BlockType } from "@/lib/types";
import {
  saveProjectToStorage,
  loadProjectFromStorage,
} from "@/lib/supabase/storage";
import {
  loadProjectFromDatabase,
  saveProjectToDatabase,
  publishBoard as publishBoardDb,
  unpublishBoard as unpublishBoardDb,
  getPublishedBoard,
} from "@/lib/supabase/database";
import type { ProjectData } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

// Neue Typen für Layout-Blöcke definieren
export type LayoutType =
  | "single-column"
  | "two-columns"
  | "three-columns"
  | "grid-2x2"
  | "layout-1-2" // Beispiel: Eine Spalte links (1/3), eine rechts (2/3)
  | "layout-2-1"; // Beispiel: Eine Spalte links (2/3), eine rechts (1/3)

// Typ für eine Inhaltszone innerhalb eines Layoutblocks
export interface ContentDropZoneType {
  id: string; // Eindeutige ID für die Zone innerhalb des Layoutblocks
  blocks: BlockType[]; // Verwenden das bestehende BlockType Array
}

// Typ für einen Layoutblock auf dem Canvas
export interface LayoutBlockType {
  id: string; // Eindeutige ID für den Layoutblock
  type: LayoutType; // Der Typ des Layouts (z.B. 'two-columns')
  zones: ContentDropZoneType[]; // Die Inhaltszonen, die dieses Layout definiert
}

// Types for the store
interface BlocksState {
  // State
  layoutBlocks: LayoutBlockType[]; // Neue Hauptstruktur für den Canvas
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

  // Block Actions (angepasst für LayoutBlocks und ContentZones)
  addBlock: (
    block: Omit<BlockType, "id">,
    targetLayoutId: string,
    targetZoneId: string,
    targetIndex?: number // Optional: Index zum Einfügen
  ) => void;
  moveBlock: (
    blockId: string,
    source: { layoutId: string; zoneId: string },
    target: { layoutId: string; zoneId: string; index: number }
  ) => void;
  deleteBlock: (
    blockId: string,
    sourceLayoutId: string,
    sourceZoneId: string
  ) => void;
  updateBlockContent: (
    blockId: string,
    sourceLayoutId: string, // Benötigt zum Finden des Blocks
    sourceZoneId: string, // Benötigt zum Finden des Blocks
    content: string,
    additionalProps?: Partial<BlockType>
  ) => void;
  selectBlock: (id: string | null) => void;
  reorderBlocks: (
    layoutId: string,
    zoneId: string,
    orderedBlockIds: string[] // Nur die IDs reichen für die Neuordnung
  ) => void;

  // NEU: Layout Block Actions
  addLayoutBlock: (type: LayoutType, targetIndex?: number) => string;
  deleteLayoutBlock: (id: string) => void;
  moveLayoutBlock: (sourceIndex: number, targetIndex: number) => void;

  // Project Actions (bleiben)
  loadProject: (projectId: string) => Promise<boolean>;
  saveProject: (projectTitle: string, description?: string) => Promise<boolean>;
  createNewProject: (
    title: string,
    description?: string
  ) => Promise<string | null>;
  setProjectTitle: (title: string) => void;

  // UI State Actions (bleiben)
  setPreviewMode: (enabled: boolean) => void;
  togglePreviewMode: () => void;
  toggleAutoSave: (enabled: boolean) => void;
  triggerAutoSave: () => void;
  setProjectJustDeleted: (deleted: boolean) => void;
  setDeletedProjectTitle: (title: string | null) => void;

  // Publishing Actions (bleiben)
  publishBoard: () => Promise<boolean>;
  unpublishBoard: () => Promise<boolean>;
  checkPublishStatus: () => Promise<void>;

  // Canvas Hover Actions (bleiben)
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

// Helper zum Erstellen von Zonen für Layouts
const createZonesForLayout = (layoutType: LayoutType): ContentDropZoneType[] => {
  let zones: ContentDropZoneType[] = [];
  switch (layoutType) {
    case "single-column":
      zones = [{ id: crypto.randomUUID(), blocks: [] }];
      break;
    case "two-columns":
    case "layout-1-2":
    case "layout-2-1":
      zones = [
        { id: crypto.randomUUID(), blocks: [] },
        { id: crypto.randomUUID(), blocks: [] },
      ];
      break;
    case "three-columns":
      zones = [
        { id: crypto.randomUUID(), blocks: [] },
        { id: crypto.randomUUID(), blocks: [] },
        { id: crypto.randomUUID(), blocks: [] },
      ];
      break;
    case "grid-2x2":
      zones = [
        { id: crypto.randomUUID(), blocks: [] },
        { id: crypto.randomUUID(), blocks: [] },
        { id: crypto.randomUUID(), blocks: [] },
        { id: crypto.randomUUID(), blocks: [] },
      ];
      break;
    default:
      console.warn(`Unknown layout type: ${layoutType}. Defaulting to single column.`);
      zones = [{ id: crypto.randomUUID(), blocks: [] }];
  }
  return zones;
}

// Create the store
export const useBlocksStore = create<BlocksState>((set, get) => {
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
    
    // Use direct internal save implementation rather than calling saveProject
    // to avoid the double isSaving check
    try {
      // Mark as saving
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

      const projectData = {
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
  }, 2000); // 2 seconds debounce time

  return {
    // Initial state
    layoutBlocks: [], // Start with an empty array instead of a default block
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

    // Block Actions (angepasst für LayoutBlocks und ContentZones)
    addBlock: (blockData, targetLayoutId, targetZoneId, targetIndex) => {
      set((state) => {
        const newBlockId = crypto.randomUUID();
        const newBlock = { id: newBlockId, ...blockData } as BlockType;

        const newLayoutBlocks = state.layoutBlocks.map((layoutBlock) => {
          if (layoutBlock.id === targetLayoutId) {
            const newZones = layoutBlock.zones.map((zone) => {
              if (zone.id === targetZoneId) {
                const insertAt =
                  targetIndex !== undefined &&
                  targetIndex >= 0 &&
                  targetIndex <= zone.blocks.length
                    ? targetIndex
                    : zone.blocks.length;
                const updatedBlocks = [...zone.blocks];
                updatedBlocks.splice(insertAt, 0, newBlock);
                return { ...zone, blocks: updatedBlocks };
              }
              return zone;
            });
            return { ...layoutBlock, zones: newZones };
          }
          return layoutBlock;
        });

        return { layoutBlocks: newLayoutBlocks };
      });
      get().triggerAutoSave();
    },

    moveBlock: (blockId, source, target) => {
      set((state) => {
        let blockToMove: BlockType | null = null;
        const sourceLayoutId = source.layoutId;
        const sourceZoneId = source.zoneId;

        // 1. Finde und entferne den Block aus der Quellzone
        const blocksWithoutMoved = state.layoutBlocks.map((layoutBlock) => {
          if (layoutBlock.id === sourceLayoutId) {
            const newZones = layoutBlock.zones.map((zone) => {
              if (zone.id === sourceZoneId) {
                const blockIndex = zone.blocks.findIndex((b) => b.id === blockId);
                if (blockIndex > -1) {
                  blockToMove = zone.blocks[blockIndex];
                  const updatedBlocks = zone.blocks.filter(
                    (b) => b.id !== blockId
                  );
                  return { ...zone, blocks: updatedBlocks };
                }
              }
              return zone;
            });
            return { ...layoutBlock, zones: newZones };
          }
          return layoutBlock;
        });

        if (!blockToMove) {
          console.error("Block to move not found!");
          return {}; // Keine Änderung
        }

        // 2. Füge den Block in die Zielzone am Zielindex ein
        const finalLayoutBlocks = blocksWithoutMoved.map((layoutBlock) => {
          if (layoutBlock.id === target.layoutId) {
            const newZones = layoutBlock.zones.map((zone) => {
              if (zone.id === target.zoneId) {
                const updatedBlocks = [...zone.blocks];
                const insertIndex = Math.max(
                  0,
                  Math.min(target.index, updatedBlocks.length)
                );
                updatedBlocks.splice(insertIndex, 0, blockToMove!); // non-null assertion OK
                return { ...zone, blocks: updatedBlocks };
              }
              return zone;
            });
            return { ...layoutBlock, zones: newZones };
          }
          return layoutBlock;
        });

        return { layoutBlocks: finalLayoutBlocks };
      });
      get().triggerAutoSave();
    },

    deleteBlock: (blockId, sourceLayoutId, sourceZoneId) => {
      console.log("Store: deleteBlock called with:", {
        blockId,
        sourceLayoutId,
        sourceZoneId
      });
      
      // Check for null or undefined values
      if (!blockId) {
        console.error("Cannot delete block with null/undefined blockId");
        return;
      }
      if (!sourceLayoutId) {
        console.error("Cannot delete block with null/undefined sourceLayoutId");
        return;
      }
      if (!sourceZoneId) {
        console.error("Cannot delete block with null/undefined sourceZoneId");
        return;
      }
      
      set((state) => {
        console.log("Block store state:", {
          layoutBlocksCount: state.layoutBlocks.length,
          layoutBlockIds: state.layoutBlocks.map(lb => lb.id),
          selectedBlockId: state.selectedBlockId
        });
        
        // Find our layout block and zone to do checks before deleting
        const layoutBlock = state.layoutBlocks.find(lb => lb.id === sourceLayoutId);
        if (!layoutBlock) {
          console.error(`Cannot find layout block with ID ${sourceLayoutId}`);
          return {}; // No change to state
        }
        
        const zone = layoutBlock.zones.find(z => z.id === sourceZoneId);
        if (!zone) {
          console.error(`Cannot find zone with ID ${sourceZoneId} in layout ${sourceLayoutId}`);
          return {}; // No change to state
        }
        
        const blockToDelete = zone.blocks.find(b => b.id === blockId);
        if (!blockToDelete) {
          console.error(`Cannot find block with ID ${blockId} in zone ${sourceZoneId}`);
          return {}; // No change to state
        }
        
        console.log("Found block to delete:", {
          blockId: blockToDelete.id,
          blockType: blockToDelete.type
        });
        
        const newLayoutBlocks = state.layoutBlocks.map((layoutBlock) => {
          if (layoutBlock.id === sourceLayoutId) {
            const newZones = layoutBlock.zones.map((zone) => {
              if (zone.id === sourceZoneId) {
                const updatedBlocks = zone.blocks.filter((b) => b.id !== blockId);
                console.log(`Filtered blocks in zone ${zone.id}: ${zone.blocks.length} -> ${updatedBlocks.length}`);
                return { ...zone, blocks: updatedBlocks };
              }
              return zone;
            });
            return { ...layoutBlock, zones: newZones };
          }
          return layoutBlock;
        });
        
        const newSelectedBlockId =
          state.selectedBlockId === blockId ? null : state.selectedBlockId;
        
        console.log("Delete operation completed");
        
        return {
          layoutBlocks: newLayoutBlocks,
          selectedBlockId: newSelectedBlockId,
          canvasHoveredInsertionIndex: null,
        };
      });
      get().triggerAutoSave();
    },

    updateBlockContent: (
      blockId,
      sourceLayoutId,
      sourceZoneId,
      content,
      additionalProps
    ) => {
      set((state) => {
        const newLayoutBlocks = state.layoutBlocks.map((layoutBlock) => {
          if (layoutBlock.id === sourceLayoutId) {
            const newZones = layoutBlock.zones.map((zone) => {
              if (zone.id === sourceZoneId) {
                const updatedBlocks = zone.blocks.map((block) => {
                  if (block.id === blockId) {
                    return { ...block, content: content, ...additionalProps } as BlockType;
                  }
                  return block;
                });
                return { ...zone, blocks: updatedBlocks };
              }
              return zone;
            });
            return { ...layoutBlock, zones: newZones };
          }
          return layoutBlock;
        });
        return { layoutBlocks: newLayoutBlocks };
      });
      get().triggerAutoSave();
    },

    selectBlock: (id) => set({ selectedBlockId: id }),

    reorderBlocks: (layoutId, zoneId, orderedBlockIds) => {
      set((state) => {
        const newLayoutBlocks = state.layoutBlocks.map((layoutBlock) => {
          if (layoutBlock.id === layoutId) {
            const newZones = layoutBlock.zones.map((zone) => {
              if (zone.id === zoneId) {
                const blockMap = new Map(
                  zone.blocks.map((block) => [block.id, block])
                );
                const reorderedBlocks = orderedBlockIds
                  .map((id) => blockMap.get(id))
                  .filter((block): block is BlockType => block !== undefined);

                if (reorderedBlocks.length !== zone.blocks.length) {
                  console.warn(
                    "Block mismatch during reorder. Some blocks might be missing."
                  );
                }
                return { ...zone, blocks: reorderedBlocks };
              }
              return zone;
            });
            return { ...layoutBlock, zones: newZones };
          }
          return layoutBlock;
        });
        return { layoutBlocks: newLayoutBlocks };
      });
      get().triggerAutoSave();
    },

    // NEU: Layout Block Actions Implementation
    addLayoutBlock: (type, targetIndex) => {
      const state = get();
      const newLayoutBlockId = crypto.randomUUID();
      const newBlock: LayoutBlockType = {
        id: newLayoutBlockId,
        type: type,
        zones: createZonesForLayout(type),
      };

      // Check if we have a project ID - if not, create a new project first
      if (!state.currentProjectId) {
        console.log("[addLayoutBlock] No project ID found, auto-creating a project");
        (async () => {
          try {
            const newProjectId = await state.createNewProject("Unbenanntes Projekt");
            if (newProjectId) {
              console.log(`[addLayoutBlock] Created new project: ${newProjectId}`);
              
              // Now add the layout block
              set((state) => {
                const updatedLayoutBlocks = [...state.layoutBlocks];
                const insertAt =
                  targetIndex !== undefined &&
                  targetIndex >= 0 &&
                  targetIndex <= updatedLayoutBlocks.length
                    ? targetIndex
                    : updatedLayoutBlocks.length;
                updatedLayoutBlocks.splice(insertAt, 0, newBlock);
                return { layoutBlocks: updatedLayoutBlocks };
              });
              
              // Trigger save after setting both project ID and layout block
              get().triggerAutoSave();
            } else {
              console.error("[addLayoutBlock] Failed to auto-create a project");
            }
          } catch (error) {
            console.error("[addLayoutBlock] Error creating project:", error);
          }
        })();
      } else {
        // Normal flow when we have a project ID
        set((state) => {
          const updatedLayoutBlocks = [...state.layoutBlocks];
          const insertAt =
            targetIndex !== undefined &&
            targetIndex >= 0 &&
            targetIndex <= updatedLayoutBlocks.length
              ? targetIndex
              : updatedLayoutBlocks.length;
          updatedLayoutBlocks.splice(insertAt, 0, newBlock);
          return { layoutBlocks: updatedLayoutBlocks };
        });
        get().triggerAutoSave();
      }
      
      return newLayoutBlockId; // Gibt die ID zurück
    },

    deleteLayoutBlock: (id) => {
      set((state) => {
        // Finde den zu löschenden LayoutBlock, um ggf. die Auswahl zurückzusetzen
        const layoutToDelete = state.layoutBlocks.find((lb) => lb.id === id);
        if (!layoutToDelete) return {}; // Nicht gefunden

        const updatedLayoutBlocks = state.layoutBlocks.filter(
          (block) => block.id !== id
        );

        let newSelectedBlockId = state.selectedBlockId;
        if (state.selectedBlockId) {
          // Wenn das ausgewählte Block im gelöschten Layoutblock war, Auswahl zurücksetzen
          const blockWasInDeletedLayout = layoutToDelete.zones.some((z) =>
            z.blocks.some((b) => b.id === state.selectedBlockId)
          );
          if (blockWasInDeletedLayout) {
            newSelectedBlockId = null;
          }
        }

        return {
          layoutBlocks: updatedLayoutBlocks,
          selectedBlockId: newSelectedBlockId,
          canvasHoveredInsertionIndex: null,
        };
      });
      get().triggerAutoSave();
    },

    moveLayoutBlock: (sourceIndex, targetIndex) => {
      set((state) => {
        if (
          sourceIndex < 0 ||
          sourceIndex >= state.layoutBlocks.length ||
          targetIndex < 0 ||
          targetIndex > state.layoutBlocks.length // Allow inserting at the end
        ) {
          console.error("Invalid indices for moveLayoutBlock");
          return {};
        }

        const updatedLayoutBlocks = [...state.layoutBlocks];
        const [movedBlock] = updatedLayoutBlocks.splice(sourceIndex, 1);

        if (!movedBlock) {
          console.error(
            "Layout block to move not found at source index:",
            sourceIndex
          );
          return {};
        }

        // Correct target index if moving downwards
        const actualTargetIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
        // Ensure target index is within bounds after potential correction
        const finalTargetIndex = Math.max(0, Math.min(actualTargetIndex, updatedLayoutBlocks.length));

        updatedLayoutBlocks.splice(finalTargetIndex, 0, movedBlock);

        return { layoutBlocks: updatedLayoutBlocks };
      });
      get().triggerAutoSave();
    },

    // Project Actions Implementation
    loadProject: async (projectId) => {
      set({ isLoading: true });
      const supabase = getSupabase();
      let projectData: ProjectData | null = null;
      let storageProjectId: string | null = null;
      let dbProjectId: string | null = null;
      // Hole userId für Storage Load
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
            layoutBlocks: projectData.layoutBlocks, // Leerer oder geladener Array wird verwendet
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

    saveProject: async (projectTitle, description = "") => {
      const {
        currentProjectId,
        currentProjectDatabaseId,
        layoutBlocks, // Verwende layoutBlocks
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
        return false; // Verhindere konkurrierende Speicherungen
      }
      if (!currentProjectId) {
        console.error("Cannot save project without a currentProjectId");
        return false;
      }

      set({ isSaving: true });
      const now = new Date().toISOString();
      const supabase = getSupabase();

      // Klonen, um den State nicht direkt zu mutieren
      const blocksToSave = JSON.parse(JSON.stringify(layoutBlocks));

      const projectData: ProjectData = {
        // ID wird jetzt in saveProjectToDatabase basierend auf Existenz hinzugefügt
        id: currentProjectDatabaseId || currentProjectId, // Übergib die vorhandene ID
        title: projectTitle,
        description: description,
        layoutBlocks: blocksToSave, // Neuer Schlüssel
        createdAt: now, // Wird in DB überschrieben, falls vorhanden und Update
        updatedAt: now,
      };

      try {
        let success = false;
        let finalDbId: string | null = null; // Wird durch DB-Funktion gesetzt
        const supabaseUser = supabase ? (await supabase.auth.getUser()).data.user : null;

        // Versuche zuerst in der Datenbank zu speichern
        if (supabase && supabaseUser) {
          // Korrigierter Aufruf: projectData und userId übergeben
          const dbResult = await saveProjectToDatabase(
            projectData,
            supabaseUser.id
          );
          success = dbResult.success;
          finalDbId = dbResult.projectId; // Aktualisiere die DB ID basierend auf dem Ergebnis
          console.log("Saved to database:", success, "DB ID:", finalDbId);
        } else {
          console.log("Supabase client or user not available, attempting storage save only.");
        }

        // Wenn DB-Speichern nicht erfolgreich ODER keine DB-Verbindung, versuche Local Storage
        // Speichere im Storage immer unter der currentProjectId (kann local- sein)
        if (!success) {
          console.log("Attempting to save to local storage with ID:", currentProjectId);
          // saveProjectToStorage erwartet nur projectData
          success = await saveProjectToStorage(projectData);
          console.log("Saved to storage:", success);
          // Wenn im Storage gespeichert, aber DB-Speichern fehlgeschlagen ODER nicht versucht,
          // und wir vorher eine DB-ID hatten, müssen wir sie löschen?
          // Nein, wir behalten die ID, falls das Projekt später wieder mit DB verbunden wird.
          // Aber wir setzen finalDbId auf null, wenn DB fehlgeschlagen ist.
          if (finalDbId && !success) finalDbId = null;
        } else {
          // Wenn DB erfolgreich, synchronisiere optional Storage
          // (könnte man weglassen, wenn DB die Hauptquelle ist)
          if (finalDbId) {
             // saveProjectToStorage erwartet nur projectData
             await saveProjectToStorage({ ...projectData, id: finalDbId }); // Stelle sicher, dass die ID korrekt ist
             console.log("Synchronized local storage with DB ID:", finalDbId);
          }
        }

        // Log detailed save results for debugging
        console.log("Save completed with result:", { 
          success, 
          finalDbId,
          timestamp: new Date().toISOString()
        });
        
        set({
          currentProjectTitle: projectTitle,
          // Aktualisiere die currentProjectDatabaseId nur, wenn DB-Speichern erfolgreich war
          currentProjectDatabaseId: finalDbId,
          // Aktualisiere currentProjectId, falls es durch DB-Speichern eine neue ID gab (neues Projekt)
          currentProjectId: finalDbId || currentProjectId, // Behalte alte ID, wenn DB fehlschlägt
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

    createNewProject: async (title, description = "") => {
      console.log("[Store] Creating new project:", { title, description });
      set({ isLoading: true });
      const supabase = getSupabase();
      const now = new Date().toISOString();
      const initialLayout: LayoutBlockType[] = []; // Start with an empty layout

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

    setProjectTitle: (title) => {
      set({ currentProjectTitle: title });
      get().triggerAutoSave(); // Titeländerung löst Speichern aus
    },

    // UI State Actions Implementation
    setPreviewMode: (enabled) => set({ previewMode: enabled }),
    togglePreviewMode: () =>
      set((state) => ({ previewMode: !state.previewMode })),
    toggleAutoSave: (enabled) => set({ autoSaveEnabled: enabled }),
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
        // Still trigger the debounced save, which will wait for the current save to complete
      }
      
      console.log("Initiating debounced save sequence");
      debouncedSave();
    },
    setProjectJustDeleted: (deleted) => set({ projectJustDeleted: deleted }),
    setDeletedProjectTitle: (title) => set({ deletedProjectTitle: title }),

    // Publishing Actions Implementation
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
        const saveSuccess = await get().saveProject(currentProjectTitle); // saveProject versucht DB zuerst
        if (!saveSuccess || !get().currentProjectDatabaseId) { // Erneute Prüfung der DB ID nach save
          console.error("[publishBoard] Failed to save project to database before publishing");
          throw new Error("Failed to save project to database before publishing");
        }

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

        const dbIdToPublish = get().currentProjectDatabaseId; // Nimm die ID aus dem State
        console.log("[publishBoard] Publishing board", {
          projectId: dbIdToPublish,
          title: currentProjectTitle,
          authorName: user.user_metadata?.full_name || "Anonymous",
          userId: user.id
        });

        // Verwende die umbenannte DB-Funktion
        const success = await publishBoardDb(
          dbIdToPublish!,
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
        // Verwende die umbenannte DB-Funktion
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

    // Canvas Hover Actions Implementation
    setCanvasHoveredInsertionIndex: (index) => {
      set({ canvasHoveredInsertionIndex: index });
    },

    resetAllHoverStates: () => {
      set({ canvasHoveredInsertionIndex: null });
      // Hier könnten in Zukunft weitere Hover-States zurückgesetzt werden
    },
  };
});
