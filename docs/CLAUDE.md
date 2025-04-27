# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run all tests with Vitest
- `npm test -- [filename]` - Run a single test file
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:e2e` - Run end-to-end tests with Playwright

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

## Architecture Notes
- **DnD (Drag and Drop)**: Uses React DnD library for drag and drop functionality
- **Authentication**: Magic link authentication via Supabase
- **Image Optimization**: Uses Sharp for image processing
- **Data Storage**: Supabase for database and storage