import type { BlockType, DropAreaType } from "@/lib/types";
import type { BlocksState } from "./types";
import {
  findBlockById,
  updateDropAreaById,
  isDropAreaEmpty,
} from "@/lib/utils/drop-area-utils";
import { createEmptyDropArea, findDropAreaById } from "./utils";

export const createBlockActions = (
  set: (fn: (state: BlocksState) => Partial<BlocksState>) => void,
  get: () => BlocksState
) => ({
  addBlock: (block: Omit<BlockType, "id">, dropAreaId: string) => {
    const { dropAreas } = get();
    const dropArea = findDropAreaById(dropAreas, dropAreaId);
    if (!dropArea) return;

    const newBlock: BlockType = {
      ...block,
      id: `block-${Date.now()}`,
      dropAreaId,
    };

    const newDropAreas = [...dropAreas];
    const targetAreaIndex = newDropAreas.findIndex(
      (area) => area.id === dropAreaId
    );
    if (targetAreaIndex === -1) return;

    newDropAreas[targetAreaIndex] = {
      ...newDropAreas[targetAreaIndex],
      blocks: [...newDropAreas[targetAreaIndex].blocks, newBlock],
    };

    set((state) => ({ ...state, dropAreas: newDropAreas }));
    get().triggerAutoSave();
  },

  moveBlock: (blockId: string, sourceAreaId: string, targetAreaId: string) => {
    const { dropAreas } = get();
    const sourceArea = findDropAreaById(dropAreas, sourceAreaId);
    const targetArea = findDropAreaById(dropAreas, targetAreaId);
    if (!sourceArea || !targetArea) return;

    const blockToMove = sourceArea.blocks.find((block) => block.id === blockId);
    if (!blockToMove) return;

    const newDropAreas = [...dropAreas];
    const sourceAreaIndex = newDropAreas.findIndex(
      (area) => area.id === sourceAreaId
    );
    const targetAreaIndex = newDropAreas.findIndex(
      (area) => area.id === targetAreaId
    );
    if (sourceAreaIndex === -1 || targetAreaIndex === -1) return;

    // Remove block from source area
    newDropAreas[sourceAreaIndex] = {
      ...newDropAreas[sourceAreaIndex],
      blocks: newDropAreas[sourceAreaIndex].blocks.filter(
        (block) => block.id !== blockId
      ),
    };

    // Add block to target area
    const movedBlock: BlockType = {
      ...blockToMove,
      dropAreaId: targetAreaId,
    };

    newDropAreas[targetAreaIndex] = {
      ...newDropAreas[targetAreaIndex],
      blocks: [...newDropAreas[targetAreaIndex].blocks, movedBlock],
    };

    set((state) => ({ ...state, dropAreas: newDropAreas }));
    get().triggerAutoSave();
  },

  deleteBlock: (blockId: string, dropAreaId: string) => {
    const { dropAreas } = get();
    const dropArea = findDropAreaById(dropAreas, dropAreaId);
    if (!dropArea) return;

    const newDropAreas = [...dropAreas];
    const areaIndex = newDropAreas.findIndex((area) => area.id === dropAreaId);
    if (areaIndex === -1) return;

    newDropAreas[areaIndex] = {
      ...newDropAreas[areaIndex],
      blocks: newDropAreas[areaIndex].blocks.filter(
        (block) => block.id !== blockId
      ),
    };

    set((state) => ({ ...state, dropAreas: newDropAreas }));
    get().triggerAutoSave();
  },

  updateBlockContent: (
    blockId: string,
    dropAreaId: string,
    content: string,
    additionalProps?: Partial<BlockType>
  ) => {
    const { dropAreas } = get();
    const dropArea = findDropAreaById(dropAreas, dropAreaId);
    if (!dropArea) return;

    const newDropAreas = [...dropAreas];
    const areaIndex = newDropAreas.findIndex((area) => area.id === dropAreaId);
    if (areaIndex === -1) return;

    const blockIndex = newDropAreas[areaIndex].blocks.findIndex(
      (block) => block.id === blockId
    );
    if (blockIndex === -1) return;

    newDropAreas[areaIndex] = {
      ...newDropAreas[areaIndex],
      blocks: [
        ...newDropAreas[areaIndex].blocks.slice(0, blockIndex),
        {
          ...newDropAreas[areaIndex].blocks[blockIndex],
          content,
          ...additionalProps,
        },
        ...newDropAreas[areaIndex].blocks.slice(blockIndex + 1),
      ],
    };

    set((state) => ({ ...state, dropAreas: newDropAreas }));
    get().triggerAutoSave();
  },

  selectBlock: (id: string | null) => set((state) => ({ ...state, selectedBlockId: id })),

  reorderBlocks: (dropAreaId: string, blocks: BlockType[]) => {
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
});
