import { StateCreator } from 'zustand';
import { BlocksState } from '../types';
import type { BlockType } from '@/lib/types';

export type BlockActions = Pick<BlocksState,
  | 'addBlock'
  | 'moveBlock'
  | 'deleteBlock'
  | 'updateBlockContent'
  | 'selectBlock'
  | 'reorderBlocks'
>;

export const createBlockActions: StateCreator<
  BlocksState,
  [],
  [],
  BlockActions
> = (set, get) => ({
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
              updatedBlocks.splice(insertIndex, 0, blockToMove!);
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
    if (!blockId || !sourceLayoutId || !sourceZoneId) {
      console.error("Cannot delete block with missing parameters");
      return;
    }

    set((state) => {
      const layoutBlock = state.layoutBlocks.find(lb => lb.id === sourceLayoutId);
      if (!layoutBlock) {
        console.error(`Cannot find layout block with ID ${sourceLayoutId}`);
        return {};
      }

      const zone = layoutBlock.zones.find(z => z.id === sourceZoneId);
      if (!zone) {
        console.error(`Cannot find zone with ID ${sourceZoneId}`);
        return {};
      }

      const blockToDelete = zone.blocks.find(b => b.id === blockId);
      if (!blockToDelete) {
        console.error(`Cannot find block with ID ${blockId}`);
        return {};
      }

      const newLayoutBlocks = state.layoutBlocks.map((layoutBlock) => {
        if (layoutBlock.id === sourceLayoutId) {
          const newZones = layoutBlock.zones.map((zone) => {
            if (zone.id === sourceZoneId) {
              const updatedBlocks = zone.blocks.filter((b) => b.id !== blockId);
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

      return {
        layoutBlocks: newLayoutBlocks,
        selectedBlockId: newSelectedBlockId,
        canvasHoveredInsertionIndex: null,
      };
    });
    get().triggerAutoSave();
  },

  updateBlockContent: (blockId, sourceLayoutId, sourceZoneId, content, additionalProps) => {
    set((state) => {
      const newLayoutBlocks = state.layoutBlocks.map((layoutBlock) => {
        if (layoutBlock.id === sourceLayoutId) {
          const newZones = layoutBlock.zones.map((zone) => {
            if (zone.id === sourceZoneId) {
              const updatedBlocks = zone.blocks.map((block) => {
                if (block.id === blockId) {
                  return { ...block, content, ...additionalProps } as BlockType;
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
});
