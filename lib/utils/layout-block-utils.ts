import type { BlockType, LayoutBlockType } from "@/lib/types";

/**
 * Findet einen spezifischen ContentBlock innerhalb der verschachtelten LayoutBlock-Struktur.
 *
 * @param layoutBlocks Das Array aller LayoutBlockType-Objekte.
 * @param layoutId Die ID des gesuchten LayoutBlocks.
 * @param zoneId Die ID der gesuchten ContentDropZoneType innerhalb des LayoutBlocks.
 * @param blockId Die ID des gesuchten BlockType innerhalb der Zone.
 * @returns Den gefundenen BlockType oder undefined, wenn nicht gefunden.
 */
export const findContentBlockInLayout = (
  layoutBlocks: LayoutBlockType[],
  layoutId: string,
  zoneId: string,
  blockId: string
): BlockType | undefined => {
  // Finde den richtigen LayoutBlock
  const targetLayout = layoutBlocks.find((lb) => lb.id === layoutId);
  if (!targetLayout) {
    // console.warn(`LayoutBlock with ID ${layoutId} not found.`);
    return undefined;
  }

  // Finde die richtige Zone innerhalb des LayoutBlocks
  const targetZone = targetLayout.zones.find((z) => z.id === zoneId);
  if (!targetZone) {
    // console.warn(`ContentZone with ID ${zoneId} not found in LayoutBlock ${layoutId}.`);
    return undefined;
  }

  // Finde den richtigen Block innerhalb der Zone
  const targetBlock = targetZone.blocks.find((b) => b.id === blockId);
  if (!targetBlock) {
    // console.warn(`Block with ID ${blockId} not found in Zone ${zoneId} of LayoutBlock ${layoutId}.`);
    return undefined;
  }

  return targetBlock;
};

// Weitere Hilfsfunktionen für Layouts können hier hinzugefügt werden...
