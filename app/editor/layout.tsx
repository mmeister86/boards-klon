import type { ReactNode } from "react"

export default async function EditorLayout({ children }: { children: ReactNode }) {
  // Allow access to the editor without authentication
  return children
}

