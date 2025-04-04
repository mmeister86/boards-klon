import type { ReactNode } from "react";
import { DragAndDropProvider } from "@/components/dnd-provider"; // Import the provider

export default async function EditorLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Allow access to the editor without authentication
  // Wrap children with the provider
  return <DragAndDropProvider>{children}</DragAndDropProvider>;
}
