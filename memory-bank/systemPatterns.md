# System Patterns

## System architecture

1. Frontend Architecture

   - Next.js App Router for routing and server components
   - React components for UI elements
   - Zustand for state management
   - TailwindCSS for styling

2. Backend Architecture

   - Supabase for authentication and data storage
   - Next.js API routes for server-side logic
   - Server-side rendering for improved performance

3. Data Flow
   - Client-side state management with Zustand
   - Server-side data persistence with Supabase
   - Real-time updates for collaborative features

## Key technical decisions

1. Framework Selection

   - Next.js for full-stack capabilities
   - React for component-based UI
   - TypeScript for type safety
   - Tailwind CSS for utility-first styling

2. State Management

   - Zustand for global state
   - React Context for theme/auth state
   - Local component state where appropriate

3. Data Storage
   - Supabase for user data and projects
   - Local storage for temporary states
   - Server-side caching for performance

## Design patterns in use

1. Component Patterns

   - Compound components for complex UI
   - Render props for flexible rendering
   - Higher-order components for shared functionality
   - Custom hooks for reusable logic

2. State Management Patterns

   - Observer pattern for state updates
   - Pub/sub for event handling
   - Command pattern for undo/redo
   - Factory pattern for component creation

3. UI Patterns
   - Controlled components for form inputs
   - Portal pattern for modals
   - Provider pattern for context
   - Composition pattern for layouts

## Component relationships

1. Editor Components

   ```
   Editor
   ├── Sidebar
   │   ├── ComponentLibrary
   │   └── PropertyPanel
   ├── Canvas
   │   ├── DropZone
   │   └── BlockRenderer
   └── Toolbar
       ├── Actions
       └── ViewControls
   ```

2. Block Components

   ```
   Block
   ├── BlockWrapper
   │   ├── DragHandle
   │   └── SelectionIndicator
   ├── BlockContent
   │   ├── TextBlock
   │   ├── ImageBlock
   │   └── ContainerBlock
   └── BlockControls
       ├── DeleteButton
       └── DuplicateButton
   ```

3. Authentication Flow
   ```
   AuthProvider
   ├── LoginForm
   ├── SignupForm
   └── AuthenticatedRoute
   ```
