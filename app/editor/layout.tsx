import type { ReactNode } from "react";
import { DragAndDropProvider } from "@/components/dnd-provider"; // Import the provider
import { FeatureErrorBoundary } from "@/lib/errors/boundaries/FeatureErrorBoundary";

export default async function EditorLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Allow access to the editor without authentication
  // Wrap children with the provider
  return (
    <FeatureErrorBoundary feature="Editor">
      <DragAndDropProvider>{children}</DragAndDropProvider>
    </FeatureErrorBoundary>
  );
}
