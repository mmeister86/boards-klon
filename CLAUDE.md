# CLAUDE.md - Guidelines for Boards Klon

## Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Code Style
- **TypeScript**: Strict type checking, explicit return types for functions
- **Imports**: Group imports by type (React, libraries, internal), sort alphabetically
- **Components**: Use functional components with explicit type definitions
- **Naming**: PascalCase for components, camelCase for variables/functions
- **State Management**: Zustand for global state, React hooks for local state
- **Error Handling**: Use try/catch for async operations, provide meaningful error messages
- **Formatting**: Use 2-space indentation, max 80 characters per line
- **Path Aliases**: Use `@/` for imports from project root
- **UI Components**: Use shadcn/ui component patterns with Tailwind CSS

## Project Structure
- `/app` - Next.js app router pages and layouts
- `/components` - Reusable React components
- `/lib` - Utility functions and types
- `/store` - Zustand state management
- `/utils` - Helper functions and utilities

## Authentication Flow
- **Protected Routes**: `/dashboard` and `/editor` require authentication
- **Sign Up**: Magic link authentication (passwordless)
  - User enters email → Magic link sent → User clicks link → Account created
- **Sign In**: Magic link authentication (passwordless)
  - User enters email → Magic link sent → User clicks link → Authentication complete
- **Server-side Protection**: Middleware checks auth status and redirects as needed