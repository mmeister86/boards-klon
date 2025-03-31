"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

// Define viewport types
export type ViewportType = "desktop" | "tablet" | "mobile"

interface ViewportContextType {
  viewport: ViewportType
  setViewport: (viewport: ViewportType) => void
}

const ViewportContext = createContext<ViewportContextType | undefined>(undefined)

export function useViewport() {
  const context = useContext(ViewportContext)
  if (context === undefined) {
    throw new Error("useViewport must be used within a ViewportProvider")
  }
  return context
}

export function ViewportProvider({ children }: { children: ReactNode }) {
  const [viewport, setViewport] = useState<ViewportType>("desktop")

  return (
    <ViewportContext.Provider
      value={{
        viewport,
        setViewport,
      }}
    >
      {children}
    </ViewportContext.Provider>
  )
}

