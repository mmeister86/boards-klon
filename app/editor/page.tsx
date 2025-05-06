/**
 * The `EditorPage` function in this TypeScript React component handles the initialization, loading,
 * and rendering of a project editor interface, including error handling and navigation.
 * @returns The `EditorPage` component returns different content based on the state of the application:
 */

import EditorPageClient from "./EditorPageClient";
import EditorRightSidebarSSR from "./editor-right-sidebar-ssr";

export default async function EditorPage() {
  // supabase wird nicht mehr benötigt, da alle SSR-Logik für Medien in die Sidebar-SSR-Komponente ausgelagert ist
  // session wird nicht mehr benötigt, da initialMediaItems und userId entfernt wurden
  // initialMediaItems werden nicht mehr benötigt, da die Sidebar-SSR-Komponente ihre Daten selbst lädt
  // Übergib nur children an die Client-Komponente (initialMediaItems wird nicht mehr benötigt)
  return (
    <EditorPageClient>
      <EditorRightSidebarSSR />
    </EditorPageClient>
  );
}
