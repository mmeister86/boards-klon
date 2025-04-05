# Refactoring Plan for Drag and Drop Integration

This document outlines a comprehensive plan to simplify and streamline the integration of Zustand, insert indicators, and the drag & drop components in the codebase.

## 1. Audit and Map Current Interactions

- **Objective**: Understand the current implementation.
- **Actions**:
  - **Drag Initiation**: `components/blocks/canvas-block.tsx` uses the `lib/hooks/use-block-drag.ts` hook.
  - **Drop Handling & Hover States**:
    - **Gaps Between Areas**: `components/canvas/canvas.tsx` uses its own `useDrop` hook to detect hovering between `DropArea` components and calculate an insertion index. It renders `InsertionIndicator` between areas.
    - **Onto Area (Empty/Inter-Area Move)**: `components/canvas/drop-area/drop-area.tsx` uses the `lib/hooks/use-drop-area.ts` hook. This hook manages hover states for the area itself, split/merge indicators (via `components/canvas/drop-area/drop-indicators.tsx`), and handles drops onto empty areas or moves from other areas into populated ones.
    - **Within Populated Area (Reorder/New Block)**: `components/canvas/drop-area/drop-area-content.tsx` uses its own `useDrop` hook to calculate hover index within the block list and renders `InsertionIndicator` between blocks. It handles reordering within the same area and adding new blocks.
  - **Zustand Store Actions**: The primary actions triggered by drop events are:
    - `insertBlockInNewArea`: Called by `Canvas` for drops in gaps between areas. Creates a new area and inserts the block.
    - `addBlock`: Called by `useDropArea` (in `DropArea`) for drops onto an empty area.
    - `moveBlock`: Called by `useDropArea` (in `DropArea`) for moving blocks between areas (when dropped onto a populated area).
    - `reorderBlocks`: Called by `DropAreaContent` for reordering blocks within the same area.
    - `addBlockAtIndex`: Called by `DropAreaContent` for adding a new block at a specific index within a populated area.
  - **Coordination**: A global `markDropHandled` function (in `lib/item-types.ts`) and a global `window.resetDropAreaContentHover` function (in `DropAreaContent`) are used to prevent duplicate drop processing and reset hover states.
- **Kommentar**: This step creates a map of how drag events and state updates interact across the application. The current implementation involves multiple `useDrop` hooks at different levels (`Canvas`, `DropArea` via `useDropArea`, `DropAreaContent`) coordinating through store actions and global functions.

## 2. Separation of Visual Feedback from Persistent State

- **Objective**: Isolate transient UI changes from global state updates.
- **Actions**:
  - **Implement `DragHoverContext`**: Create a dedicated React context (`context/drag-hover-context.tsx`) to manage the transient state of the insertion indicator during drag hover events.
    - **Context State**: The context will store `{ targetType: 'gap' | 'area' | null, index: number | null, areaId?: string | null }`.
    - **Context Value**: Provide `setHoverTarget(target)` and `clearHoverTarget(immediate?)` functions.
    - **Provider Logic**: The `DragHoverProvider` will manage the state using `useState` and include hysteresis logic (delay before hiding indicator) using `setTimeout` and `useRef`.
    - **Provider Integration**: Wrap the main draggable area (e.g., inside `Canvas`) with `<DragHoverProvider>`.
    - **Custom Hook**: Create `useDragHover()` for easy consumption.
  - **Refactor Hover Handlers**:
    - Modify `hover` handlers in `Canvas` (for gaps) and `DropAreaContent` (for within areas) to call `setHoverTarget` and `clearHoverTarget` from the context instead of using local state (`hoveredInsertionIndex`, `hoverIndex`).
  - **Update `InsertionIndicator`**:
    - Modify the component to consume `useDragHover()`.
    - Remove the `isVisible` prop.
    - Add props to define its own location (`targetType`, `index`, `areaId?`).
    - Determine visibility by comparing its props to the context state.
  - **Refactor Drop Handlers**:
    - Modify `drop` handlers in `Canvas` and `DropAreaContent` to read the final hover target from `useDragHover()` context to determine the correct action and index.
    - Call `clearHoverTarget(true)` immediately after handling a drop.
  - **Replace Global Reset**:
    - Modify the `end` handler in `useBlockDrag` to call `clearHoverTarget(true)` from the context if the drop was not successful (`!monitor.didDrop()`).
    - Remove the `window.resetDropAreaContentHover` mechanism from `DropAreaContent`.
  - **Limit Global State Updates**: Ensure Zustand store actions (`insertBlockInNewArea`, `addBlock`, `moveBlock`, etc.) are _only_ called from the appropriate `drop` handler after validation, using the state derived from the context at drop time.
- **Kommentar**: Using a dedicated context centralizes the transient visual state, clearly separating it from the persistent Zustand state. This makes the indicator logic more robust and easier to manage across different drop target types (gaps vs. within areas).

## 3. Debounce and Guard Event Handlers

- **Objective**: Prevent multiple rapid events from causing duplicate updates.
- **Actions**:
  - **Debounce Hover Updates**: Apply debouncing (e.g., ~100ms delay) to the calls that update the transient hover state (`context.setHoverTarget` from the planned `DragHoverContext`).
    - **Location**: Apply within the `hover` handlers of `useDrop` in `Canvas` and `DropAreaContent`.
    - **Method**: Use a debounce utility (adapt existing one from `store/blocks-store.ts` or use `lodash.debounce`). Create debounced function instances using `useMemo` or `useCallback`.
    - **Interaction**: This complements the context's hysteresis for clearing the indicator. Ensure `clearHoverTarget` is called appropriately when hover ends to manage the flow.
  - **Ensure Idempotent Drop Handling**:
    - **Coordination**: Review and potentially refine the `markDropHandled` mechanism (`lib/item-types.ts`) for coordinating between drop handlers. Consider replacing the timeout-based reset with a more deterministic one (e.g., triggered by drag end).
    - **Store Actions**: Enhance store actions (Step 5) to perform checks that prevent duplicate logical updates (e.g., check if block already exists before adding).
  - **Event Flow Control**: Use `preventDefault()` and `stopPropagation()` if necessary, although less common in `react-dnd` handlers.
- **Kommentar**: Debouncing hover updates improves performance and visual stability. Ensuring drop handlers are idempotent (through coordination like `markDropHandled` and robust store actions) prevents duplicate state changes.

## 4. Refactor and Compose Custom Hooks

- **Objective**: Clarify and streamline the logic for drag and drop.
- **Actions**:
  - **Refactor `useDropArea` using Composition**: Break down the monolithic `useDropArea` hook into smaller, focused hooks.
    - **Create `useAreaSplitMerge(dropArea, viewport, isHovering)`**:
      - Encapsulates logic for checking `canSplit`/`canMerge`, calculating `mergeTarget`/`mergePosition`, determining `shouldShowSplitIndicator`/`shouldShowMergeIndicator`, and providing `handleSplit`/`handleMerge` callbacks.
    - **Refine `useDropArea(dropArea, viewport)`**:
      - Focuses on core `useDrop` setup for the area.
      - Manages direct hover state (`isHovering`) and updates `DragHoverContext`.
      - Handles drop logic specific to the area (empty drop, inter-area move), calling store actions (`addBlock`, `moveBlock`) and using `markDropHandled`. Review `setTimeout` usage.
      - Composes `useAreaSplitMerge` internally to get split/merge state and handlers.
      - Calculates `getDropAreaStyles` based on its own state and results from `useAreaSplitMerge`.
  - **Refactor Hover Calculation Logic (Optional but Recommended)**:
    - Consider extracting the logic for calculating insertion indices (both in `Canvas` for gaps and `DropAreaContent` for within areas) into a reusable utility function or a dedicated hook (`useInsertionIndexCalculation`).
  - **Review `useBlockDrag`**: Ensure it remains focused solely on drag source responsibilities.
  - **Define Clear APIs**: Ensure all refactored hooks have clear inputs and outputs.
- **Kommentar**: This modular approach, particularly breaking down `useDropArea`, improves separation of concerns, readability, testability, and maintainability.

## 5. Strengthen Zustand Store Updates

- **Objective**: Enhance the robustness of state updates.
- **Actions**:
  - **Add Idempotency Checks to Store Actions**: Implement checks within relevant store actions in `store/blocks-store.ts` to prevent duplicate state changes if actions are called multiple times inadvertently.
    - **`moveBlock(blockId, sourceAreaId, targetAreaId)`**:
      - Before execution, verify `blockId` exists in `sourceAreaId`. If not, log error and return state.
      - Before execution, verify `blockId` does _not_ already exist in `targetAreaId`. If yes, log error and return state.
    - **`addBlockAtIndex(blockData, dropAreaId, index)` / `addBlock(blockData, dropAreaId)`**:
      - _Option 1 (Recommended but requires external change)_: Modify drag sources for _new_ blocks to generate a temporary unique ID (`tempId`). Pass this `tempId` to the action. Before inserting, check if a block with the same `tempId` was just added at/near the target index. If yes, log warning and return state.
      - _Option 2 (Fallback)_: Rely primarily on event handling guards (debouncing, `markDropHandled`) to prevent duplicate calls for new block additions.
    - **`insertBlockInNewArea(item, insertIndex)`**:
      - If moving an existing block (`item.id` exists), perform the same source verification as in `moveBlock` before removing from source.
      - Rely on event handling guards to prevent duplicate calls for the area/block creation itself.
    - **`reorderBlocks(...)`**: No specific check needed as it replaces state.
    - **Error Handling**: When checks fail, log informative errors/warnings and return the unmodified state.
  - **Ensure Atomic Updates**: Review actions to ensure synchronous state updates within the `set` callback. Avoid introducing asynchronous operations within the core state update logic of a single action. (The `setTimeout` in `useDropArea` is external to the store actions themselves but relates to the overall drop->update flow).
- **Kommentar**: These safeguards, especially for `moveBlock`, add a crucial layer of robustness at the state management level, complementing the event handling guards. Handling new block idempotency is trickier due to generated IDs.

## 6. Documentation and Code Comments

- **Objective**: Improve clarity for current and future developers.
- **Actions**:
  - Add descriptive comments in key areas of the hooks and store functions that describe their responsibilities.
  - Document the refactored architecture in this file, summarizing the separation between transient UI feedback and persistent state updates.
- **Kommentar**: Detailed documentation reduces onboarding time and aids debugging.

## 7. Testing and Debugging Strategies

- **Objective**: Validate the refactored implementation and prevent regressions.
- **Actions**:
  - Write unit and integration tests to simulate drag and drop events, ensuring that only a single insertion occurs per drop.
  - Add temporary logging within the drag and drop events to trace the event flow during development.
- **Kommentar**: Thorough testing ensures that the refactoring achieves the desired robustness.

## 8. Incremental Refactoring and Code Reviews

- **Objective**: Refactor safely in manageable steps.
- **Actions**:
  - Decouple the insert indicator's visual state from the store update, then add debouncing on hover events.
  - Refactor custom hooks into cohesive units with clear responsibilities.
  - Review each incremental change with automated tests to verify that behavior remains correct.
- **Kommentar**: An incremental approach minimizes risk and facilitates continuous integration of improvements.

## Conclusion

This plan streamlines the interaction between React DnD and Zustand by clearly segregating transient UI states (insert indicators) from persistent state updates. By implementing debounced event handlers, robust idempotency checks, modular hooks, and comprehensive testing, the code becomes more maintainable and resistant to issues like duplicate insertions.
