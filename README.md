# Boards Klon - Visual Web Builder

Boards Klon is a web application that allows users to visually build web pages or layouts using a drag-and-drop interface. It's built with modern web technologies, enabling users to create, manage, and preview their projects.

## Key Features

- **Visual Editor:** Drag-and-drop blocks onto a canvas to build layouts.
- **Component Blocks:** Use predefined blocks (like headings, paragraphs, etc.) to structure content.
- **Configuration:** Select blocks on the canvas to configure their properties via a right sidebar.
- **Preview Mode:** View the created layout in different viewport sizes (desktop, tablet, mobile).
- **Project Management:** Create, save, and load projects associated with user accounts.
- **Authentication:** User accounts managed via Supabase.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **UI:** [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) components
- **Backend & Database:** [Supabase](https://supabase.io/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Drag & Drop:** [React DnD](https://react-dnd.github.io/react-dnd/about)
- **(Potential) Rich Text Editing:** [Tiptap](https://tiptap.dev/)

## Project Structure

- `app/`: Contains the core application routes and pages (Next.js App Router).
  - `app/auth/`: Authentication pages and logic.
  - `app/dashboard/`: User dashboard for managing projects.
  - `app/editor/`: The main visual editor interface.
- `components/`: Reusable React components.
  - `components/blocks/`: Components representing draggable content blocks.
  - `components/canvas/`: Components related to the editor canvas and drop areas.
  - `components/layout/`: Layout components (Navbar, Sidebars).
  - `components/preview/`: Components for the preview mode.
  - `components/ui/`: UI primitives (likely from shadcn/ui).
- `lib/`: Utility functions, hooks, constants, and Supabase client setup.
- `store/`: Zustand stores for managing application state (blocks, editor UI).
- `styles/`: Global styles.

## Learn More about Dependencies

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React DnD Documentation](https://react-dnd.github.io/react-dnd/about)
