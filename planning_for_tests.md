Okay, here's a plan for implementing testing in your "Block Builder" project, covering different levels of testing:

**1. Tooling Setup**

- **Test Runner & Framework:** Use **Vitest**. It's fast, compatible with Vite (which Next.js can use under the hood), and has a Jest-compatible API.
- **Component Testing:** Use **React Testing Library (RTL)** (`@testing-library/react`) for rendering components and interacting with them in a user-centric way.
- **User Interactions:** Use `@testing-library/user-event` for more realistic simulation of user interactions (typing, clicking, etc.).
- **Mocking API Calls (Supabase):** Use **Mock Service Worker (MSW)** to intercept HTTP requests made by the Supabase client and return mock responses. This is crucial for integration tests involving data fetching/saving.
- **End-to-End (E2E) Testing:** Use **Playwright** for testing complete user flows in real browsers.

**Installation:**

```bash
npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom msw playwright @playwright/test
```

**Configuration:**

- **Vitest:** Create a `vitest.config.ts` file. Configure it to use `jsdom` for the environment and set up global imports/setup files (e.g., for RTL cleanup and Jest-DOM matchers).
- **MSW:** Set up handlers for your Supabase interactions (auth, storage list/upload/download). Create setup files to start the mock server for your tests.
- **Playwright:** Initialize Playwright (`npx playwright install`) and configure `playwright.config.ts`.
- **`package.json`:** Add scripts for running tests (`"test": "vitest"`, `"test:ui": "vitest --ui"`, `"test:e2e": "playwright test"`).
- **`tsconfig.json`:** Ensure `vitest/globals` and `@testing-library/jest-dom` types are included.

**2. Unit Testing (`*.test.ts` / `*.test.tsx`)**

- **Focus:** Testing small, isolated units (functions, simple components) in isolation.
- **Targets:**
  - **Utility Functions (`lib/utils/`):** Test functions like `formatDate`, `getBlockStyle`, `findDropAreaById`, `isDropAreaEmpty`, `canMergeAreas` with various inputs and assert the expected outputs.
  - **Simple UI Components (`components/ui/`, simple blocks):** Render components like `Button`, `Badge`, `Input` with different props and verify they render correctly. Test simple event handlers (e.g., `onClick`). Use RTL's `render`, `screen`, `getByRole`, etc.
  - **Custom Hooks (Logic):** Test the pure logic parts of hooks like `useViewport` (if applicable) or potentially parts of `useBlockDrag`/`useDropArea` if they can be isolated from `react-dnd`.
- **Example (`lib/utils.test.ts`):**

  ```typescript
  import { formatDate } from "./utils";
  import { describe, it, expect } from "vitest";

  describe("formatDate", () => {
    it("should format recent dates relatively", () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(
        now.getTime() - 5 * 60 * 1000
      ).toISOString();
      expect(formatDate(fiveMinutesAgo)).toBe("vor 5 Minuten");
    });
    // ... more test cases
  });
  ```

**3. Integration Testing (`*.test.tsx`)**

- **Focus:** Testing how multiple units (components, hooks, store, mocks) work together.
- **Targets:**
  - **Forms & Authentication:** Render `SignInPage`/`SignUpPage`. Use `user-event` to simulate typing email. Mock Supabase auth calls (`signInWithOtp`) using MSW. Verify loading states, button clicks, and success/error messages/toasts (`sonner` might need specific testing setup or assertions on DOM changes).
  - **Dashboard (`DashboardPage`):** Render the page. Mock `listProjectsFromStorage` (using MSW if it involves direct Supabase calls, or by mocking the store action if it abstracts Supabase). Verify project cards are rendered based on mock data. Simulate search input (`user-event.type`) and verify filtering. Simulate delete click and verify the delete confirmation dialog appears and the mock delete function is called.
  - **Editor Components & Store:**
    - Render `Navbar` (in editor view). Mock `useBlocksStore` state (e.g., `isSaving`, `lastSaved`). Simulate clicking "Save", verify the correct store action (`saveProject`) is called (using Vitest spies/mocks `vi.spyOn`). Simulate title editing and verify `setProjectTitle` is called.
    - Render components using `useEditorStore` (like Tiptap toolbars). Mock the store state (`activeFormats`), verify button appearances. Simulate clicks and verify store actions (`updateActiveFormats`) are called.
  - **Supabase Storage Interaction:** Test `blocks-store` actions (`loadProject`, `saveProject`, `createNewProject`) by mocking the underlying `loadProjectFromStorage`, `saveProjectToStorage` functions using `vi.mock` or by using MSW to mock the Supabase client's storage methods directly. Assert that the store state updates correctly after successful/failed operations.
  - **Tiptap Blocks:** Render `ParagraphBlock` / `HeadingBlock`. Assert initial rendering based on props. Testing deep Tiptap interactions can be complex; focus on verifying that `onUpdate` correctly calls the `updateBlockContent` store action.
- **Tools:** RTL, `user-event`, MSW, Vitest `vi.mock`/`vi.spyOn`.

**4. Drag and Drop Testing (Special Focus)**

- **Challenge:** Simulating realistic drag-and-drop browser events with RTL is difficult and often unreliable.
- **Recommended Approach:**
  - **Unit Test Store Actions:** Create specific unit tests for the Zustand actions related to D&D: `addBlockAtIndex`, `moveBlock`, `reorderBlocks`, `splitDropArea`, `mergeDropAreas`, `insertBlockInNewArea`. Set up an initial `dropAreas` state, call the action with specific arguments, and assert that the final `dropAreas` state in the store is exactly as expected. This verifies the core state manipulation logic.
  - **Integration Test Component _Results_:** Render components like `DropAreaContent` or `Canvas`. _Instead of simulating the drag_, manually trigger the store actions that _should_ occur _after_ a drop (e.g., call `store.getState().addBlockAtIndex(...)`). Then, use RTL to assert that the UI correctly reflects the state change (e.g., the new block is rendered in the correct position, the insertion indicator is gone). This tests the component's reaction to the state changes caused by D&D.
  - **E2E Tests (Crucial):** Rely heavily on Playwright for testing the _actual user interaction_ of dragging elements, seeing indicators, dropping, and verifying the visual and state outcomes.

**5. End-to-End Testing (`*.spec.ts` in a `tests-e2e` directory)**

- **Focus:** Testing complete user flows through the application in a real browser environment.
- **Targets (Critical User Journeys):**
  - **Authentication:** Navigate to `/`, click sign-in, enter credentials (use environment variables for test accounts), verify successful login and redirection to `/dashboard`. Test sign-out.
  - **Project Lifecycle:** Create a new project, verify editor loads. Add a block (e.g., Heading). Change its content. Save the project (manually or verify auto-save). Return to dashboard, verify project exists. Reload the project, verify content persistence. Delete the project.
  - **Core D&D:**
    - Drag a block from the sidebar (`LeftSidebar`) onto an empty `DropArea` on the `Canvas`. Verify it appears.
    - Drag an existing `CanvasBlock` and drop it between two other blocks within the same `DropAreaContent`. Verify the insertion indicator appears correctly during hover and the block is placed correctly after drop.
    - Drag a block from one `DropArea` to another (empty or populated). Verify it moves correctly.
  - **Splitting/Merging (Visual):** Drag onto an empty area's split indicator, verify it splits. Drag onto a merge indicator, verify areas merge.
  - **Preview Mode:** Toggle preview mode and switch viewports, verify the basic layout rendering changes as expected (Playwright can take screenshots for visual regression).
- **Tools:** Playwright. Use page object models for better organization. Interact with elements using locators.

**6. Mocking Supabase with MSW**

- Create handler files (e.g., `src/mocks/handlers.ts`).
- Define request handlers for Supabase endpoints (e.g., `/auth/v1/otp`, `/storage/v1/object/...`).

  ```typescript
  // src/mocks/handlers.ts
  import { http, HttpResponse } from "msw";

  const handlers = [
    // Mock Supabase Auth OTP
    http.post("*/auth/v1/otp", () => {
      return HttpResponse.json({}); // Simulate success
    }),
    // Mock Supabase Storage List
    http.get("*/storage/v1/object/projects", ({ request }) => {
      // Return mock file list based on tests
      return HttpResponse.json([
        {
          name: "project-1.json",
          id: "uuid1",
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          last_accessed_at: new Date().toISOString(),
          metadata: { size: 1000, mimetype: "application/json" },
        },
      ]);
    }),
    // Mock Storage Download
    http.get("*/storage/v1/object/projects/:projectId", ({ params }) => {
      const { projectId } = params;
      if (projectId === "project-1.json") {
        // Return mock project data
        return HttpResponse.json({
          id: "project-1",
          title: "Mock Project",
          dropAreas: [] /*...*/,
        });
      }
      return new HttpResponse(null, { status: 404 });
    }),
    // Add handlers for upload, delete, etc.
  ];
  export { handlers };
  ```

- Set up the mock server in your test setup file.

**Implementation Strategy:**

1.  Start with unit tests for utilities – they are the easiest wins.
2.  Add integration tests for authentication forms and dashboard data display, setting up MSW early.
3.  Write unit tests for Zustand store actions, especially the D&D related ones.
4.  Implement E2E tests for the most critical user flows (auth, project creation, basic block addition, save/load).
5.  Add integration tests for editor components and their interaction with the store.
6.  Incrementally add more E2E tests covering specific D&D scenarios (reordering, splitting, merging).
7.  Integrate tests into your CI/CD pipeline.
