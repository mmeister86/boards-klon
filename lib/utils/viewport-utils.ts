import type { ViewportType } from "@/lib/hooks/use-viewport"

// Define viewport container styles
export const getViewportStyles = (viewport: ViewportType) => {
  const styles = {
    desktop: {
      width: "100%", // Will be controlled by parent container
      maxWidth: "100%",
      padding: "2rem",
    },
    tablet: {
      width: "768px",
      maxWidth: "100%",
      padding: "1.5rem",
      border: "12px solid #333",
      borderRadius: "24px",
    },
    mobile: {
      width: "375px",
      maxWidth: "100%",
      padding: "1rem",
      border: "8px solid #333",
      borderRadius: "32px",
    },
  }

  return styles[viewport]
}

// Get container class based on viewport
export const getViewportContainerClass = (viewport: ViewportType) => {
  return viewport === "desktop" ? "w-full max-w-5xl" : ""
}

