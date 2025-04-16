export const ItemTypes = {
  SQUARE: "square",
  BLOCK: "block",
  EXISTING_BLOCK: "existing_block",
  MEDIA: "media",
} as const; // Use 'as const' for literal types

// Global object to track drop operations across different handlers
// This helps prevent double-handling of the same drop event
type DropState = {
  isBeingHandled: boolean;
  handledBy: string | null;
  itemId: string | null;
  timestamp: number;
  reset: () => void;
};

// Create a singleton for tracking drops globally
export const DropTracker: DropState = {
  isBeingHandled: false,
  handledBy: null,
  itemId: null,
  timestamp: 0,

  // Method to reset the tracker after each drop operation
  reset: function () {
    this.isBeingHandled = false;
    this.handledBy = null;
    this.itemId = null;
    this.timestamp = 0;
    console.log(`[DropTracker] Reset - ready for next drop operation`);
  },
};

// Mark a drop as being handled
export function markDropHandled(handlerId: string, itemId: string): boolean {
  // If drop is already being handled and it's recent (last 500ms), reject
  const now = Date.now();
  if (DropTracker.isBeingHandled && now - DropTracker.timestamp < 500) {
    console.log(
      `[DropTracker] Drop for item ${itemId} REJECTED - already being handled by ${DropTracker.handledBy}`
    );
    return false;
  }

  // Otherwise, claim this drop
  DropTracker.isBeingHandled = true;
  DropTracker.handledBy = handlerId;
  DropTracker.itemId = itemId;
  DropTracker.timestamp = now;

  console.log(`[DropTracker] Drop for item ${itemId} claimed by ${handlerId}`);

  // Schedule an automatic reset after 500ms
  setTimeout(() => {
    if (DropTracker.itemId === itemId && DropTracker.handledBy === handlerId) {
      DropTracker.reset();
    }
  }, 500);

  return true;
}
