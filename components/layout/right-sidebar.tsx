"use client"

import { useBlocksStore } from "@/store/blocks-store"

export default function RightSidebar() {
  const { selectedBlockId, dropAreas } = useBlocksStore()

  // Find the selected block in any drop area
  const selectedBlock = dropAreas.flatMap((area) => area.blocks).find((block) => block.id === selectedBlockId)

  return (
    <div className="w-64 bg-card border-l border-border overflow-y-auto p-5">
      <h2 className="text-lg font-semibold mb-5">Properties</h2>

      {selectedBlock ? (
        <div className="space-y-5">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Block Type</p>
            <p className="font-medium capitalize">{selectedBlock.type}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Drop Area</p>
            <p className="font-medium">{selectedBlock.dropAreaId}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground mb-1">Content</p>
            <textarea
              className="w-full h-24 p-2 text-sm bg-background border border-border rounded-lg"
              defaultValue={selectedBlock.content}
              readOnly
            />
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Additional properties will be editable here in future updates.</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Select a block on the canvas to view and edit its properties.</p>
      )}
    </div>
  )
}

