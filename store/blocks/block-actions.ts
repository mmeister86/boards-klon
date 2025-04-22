/* eslint-disable @typescript-eslint/no-unused-vars */
import type { BlockType, LayoutType, ContentDropZoneType, HeadingBlock, ParagraphBlock } from "@/lib/types";
import type { BlocksState, BlockActions } from "./types";
import { findLayoutBlockAndZone, updateLayoutBlock } from "./utils";

export const createBlockActions = (
  set: (fn: (state: BlocksState) => Partial<BlocksState>) => void,
  get: () => BlocksState
): BlockActions => ({
  addBlock: (
    blockData: Omit<BlockType, "id">,
    layoutId: string,
    zoneId: string,
    index: number
  ) => {
    const { layoutBlocks } = get();
    const { layoutBlock, zone } = findLayoutBlockAndZone(
      layoutBlocks,
      layoutId,
      zoneId
    );

    if (!layoutBlock || !zone) {
      console.error(`Layout block or zone not found for addBlock: ${layoutId}/${zoneId}`);
      return;
    }

    let newBlock: BlockType;
    switch (blockData.type) {
      case "heading": {
        const headingData = blockData as Omit<HeadingBlock, "id">;
        newBlock = {
          id: `block-${Date.now()}`,
          type: "heading",
          content: String(headingData.content || ""),
          headingLevel: headingData.headingLevel as 1 | 2 | 3 | 4 | 5 | 6 | undefined
        };
        break;
      }
      case "paragraph": {
        const paragraphData = blockData as Omit<ParagraphBlock, "id">;
        newBlock = {
          id: `block-${Date.now()}`,
          type: "paragraph",
          content: String(paragraphData.content || "")
        };
        break;
      }
      default:
        newBlock = {
          ...blockData,
          id: `block-${Date.now()}`
        } as BlockType;
    }

    const updatedBlocks = [...zone.blocks];
    updatedBlocks.splice(index, 0, newBlock);

    const updatedZones = layoutBlock.zones.map((z: ContentDropZoneType) =>
      z.id === zoneId ? { ...z, blocks: updatedBlocks } : z
    );

    const updatedLayoutBlocks = updateLayoutBlock(layoutBlocks, layoutId, {
      zones: updatedZones
    });

    set((state) => ({ ...state, layoutBlocks: updatedLayoutBlocks }));
    get().triggerAutoSave();
  },

  moveBlock: (
    blockId: string,
    source: { layoutId: string; zoneId: string },
    target: { layoutId: string; zoneId: string; index: number }
  ) => {
    const { layoutBlocks } = get();
    const { layoutBlock: sourceLayout, zone: sourceZone } = findLayoutBlockAndZone(
      layoutBlocks,
      source.layoutId,
      source.zoneId
    );
    const { layoutBlock: targetLayout, zone: targetZone } = findLayoutBlockAndZone(
      layoutBlocks,
      target.layoutId,
      target.zoneId
    );

    if (!sourceLayout || !sourceZone || !targetLayout || !targetZone) {
      console.error("Source or target layout/zone not found for move");
      return;
    }

    const blockToMove = sourceZone.blocks.find((block: BlockType) => block.id === blockId);
    if (!blockToMove) {
        console.error(`Block ${blockId} not found in source ${source.layoutId}/${source.zoneId}`);
        return;
    }

    let updatedLayoutBlocks = [...layoutBlocks];

    const sourceBlocks = sourceZone.blocks.filter((block: BlockType) => block.id !== blockId);
    updatedLayoutBlocks = updateLayoutBlock(
      updatedLayoutBlocks,
      source.layoutId,
      {
        zones: sourceLayout.zones.map((z: ContentDropZoneType) =>
          z.id === source.zoneId ? { ...z, blocks: sourceBlocks } : z
        ),
      }
    );

    const { zone: currentTargetZone, layoutBlock: currentTargetLayout } = findLayoutBlockAndZone(
        updatedLayoutBlocks,
        target.layoutId,
        target.zoneId
      );

    if (!currentTargetZone || !currentTargetLayout) {
        console.error(`Target zone ${target.layoutId}/${target.zoneId} became invalid after source removal`);
        return;
    }

    const targetBlocks = [...currentTargetZone.blocks];
    const finalIndex = Math.max(0, Math.min(target.index, targetBlocks.length));
    targetBlocks.splice(finalIndex, 0, blockToMove);

    updatedLayoutBlocks = updateLayoutBlock(
      updatedLayoutBlocks,
      target.layoutId,
      {
        zones: currentTargetLayout.zones.map((z: ContentDropZoneType) =>
          z.id === target.zoneId ? { ...z, blocks: targetBlocks } : z
        ),
      }
    );

    set((state) => ({ ...state, layoutBlocks: updatedLayoutBlocks }));
    get().triggerAutoSave();
  },

  deleteBlock: (blockId: string, layoutId: string, zoneId: string) => {
    const { layoutBlocks } = get();
    const { layoutBlock, zone } = findLayoutBlockAndZone(
      layoutBlocks,
      layoutId,
      zoneId
    );

    if (!layoutBlock || !zone) {
        console.error(`Layout/zone ${layoutId}/${zoneId} not found for delete`);
        return;
    }

    const originalLength = zone.blocks.length;
    const updatedBlocks = zone.blocks.filter((block: BlockType) => block.id !== blockId);

    if (updatedBlocks.length < originalLength) {
        const updatedLayoutBlocks = updateLayoutBlock(layoutBlocks, layoutId, {
          zones: layoutBlock.zones.map((z: ContentDropZoneType) =>
            z.id === zoneId ? { ...z, blocks: updatedBlocks } : z
          ),
        });
        set((state) => ({ ...state, layoutBlocks: updatedLayoutBlocks }));
        get().triggerAutoSave();
    } else {
        console.warn(`Block ${blockId} not found in zone ${zoneId} for deletion.`);
    }
  },

  updateBlockContent: (
    blockId: string,
    layoutId: string,
    zoneId: string,
    content: BlockType["content"],
    additionalProps?: Partial<BlockType>
  ) => {
    const { layoutBlocks } = get();
    const { layoutBlock, zone } = findLayoutBlockAndZone(
      layoutBlocks,
      layoutId,
      zoneId
    );
    if (!layoutBlock || !zone) {
        console.error(`Layout/zone ${layoutId}/${zoneId} not found for update`);
        return;
    }

    let blockUpdated = false;
    const updatedBlocks = zone.blocks.map((block: BlockType) => {
      if (block.id === blockId) {
        blockUpdated = true;
        const updatedBlock = { ...block, content: content, ...additionalProps };
        return updatedBlock as BlockType;
      }
      return block;
    });

    if (blockUpdated) {
      const updatedLayoutBlocks = updateLayoutBlock(layoutBlocks, layoutId, {
        zones: layoutBlock.zones.map((z: ContentDropZoneType): ContentDropZoneType =>
          z.id === zoneId ? { ...z, blocks: updatedBlocks } : z
        ),
      });
      set((state) => ({ ...state, layoutBlocks: updatedLayoutBlocks }));
      get().triggerAutoSave();
    } else {
        console.warn(`Block ${blockId} not found in zone ${zoneId} for update.`);
    }
  },

  reorderBlocks: (layoutId: string, zoneId: string, orderedBlockIds: string[]) => {
    const { layoutBlocks } = get();
    const { layoutBlock, zone } = findLayoutBlockAndZone(layoutBlocks, layoutId, zoneId);

    if (!layoutBlock || !zone) {
        console.error(`Layout/zone ${layoutId}/${zoneId} not found for reorder`);
        return;
    }

    const blockMap = new Map(zone.blocks.map((block: BlockType) => [block.id, block]));
    const reorderedBlocks = orderedBlockIds.map(id => blockMap.get(id)).filter(Boolean) as BlockType[];

    if (reorderedBlocks.length !== zone.blocks.length || orderedBlockIds.length !== zone.blocks.length) {
        console.error("Block reorder mismatch - lengths differ or block not found");
        return;
    }

    const updatedLayoutBlocks = updateLayoutBlock(layoutBlocks, layoutId, {
      zones: layoutBlock.zones.map((z: ContentDropZoneType) =>
        z.id === zoneId ? { ...z, blocks: reorderedBlocks } : z
      )
    });

    set((state) => ({ ...state, layoutBlocks: updatedLayoutBlocks }));
    get().triggerAutoSave();
  },

  selectBlock: (id: string | null): void => set((state) => ({ ...state, selectedBlockId: id })),
});
