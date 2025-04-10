"use client";

import { useState, useEffect } from "react"; // Added hooks
import { useBlocksStore } from "@/store/blocks-store";
import { useViewport } from "@/lib/hooks/use-viewport";
import { PreviewDropArea } from "./preview-drop-area";
// Removed getViewportStyles import
import { filterNonEmptyDropAreas } from "@/lib/utils/drop-area-utils";
// Removed PhoneMockup and TabletMockup imports
import { Signal, Wifi, Battery } from "lucide-react"; // Added icons

export default function Preview() {
  const { dropAreas } = useBlocksStore();
  const { viewport } = useViewport();
  const [time, setTime] = useState(
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );

  // Filter out empty drop areas for preview
  const nonEmptyDropAreas = filterNonEmptyDropAreas(dropAreas);

  // Update time every minute (moved from mockups)
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Determine dynamic styles and classes
  const getFrameStyles = () => {
    switch (viewport) {
      case "mobile":
        return {
          width: "min(90vw, 375px)",
          height: "min(calc(90vw * 2.16), 812px)",
        };
      case "tablet":
        return {
          width: "min(95vw, 834px)",
          height: "auto", // Let content determine height
          minHeight: "600px", // Match desktop minHeight
          maxHeight: "85vh", // Update max height constraint to 85vh
        };
      case "desktop":
      default:
        return {
          width: "1400px", // Explicit width instead of 100%
          maxWidth: "1400px", // Keep max width for consistency
          height: "auto", // Let content determine height
          minHeight: "600px", // Ensure a minimum height
        };
    }
  };

  const getFrameClasses = () => {
    let classes =
      "relative bg-white overflow-hidden transition-all duration-300";
    switch (viewport) {
      case "mobile":
        classes += " rounded-[2.5rem] border-[14px] border-black";
        break;
      case "tablet":
        classes += " rounded-[2rem] border-[14px] border-black";
        break;
      case "desktop":
      default:
        classes += " rounded-[2rem] shadow-lg"; // Add shadow for desktop
        break;
    }
    return classes;
  };

  const getContentPadding = () => {
    switch (viewport) {
      case "mobile":
        return "px-4"; // Only horizontal padding needed below status bar
      case "tablet":
        return "p-6";
      case "desktop":
      default:
        return "p-8";
    }
  };

  return (
    <div className="flex-1 bg-gray-50 overflow-auto p-6 flex justify-center items-start">
      {/* Single container for frame/screen - now also the flex container */}
      <div
        className={`${getFrameClasses()} flex flex-col`} // Added flex flex-col here
        style={getFrameStyles()}
      >
        {/* Status Bar (Conditional) - Now direct child */}
        {(viewport === "mobile" || viewport === "tablet") && (
          <div
            className={`flex justify-between items-center text-xs font-medium pb-2 bg-gray-700 text-white mb-2 ${
              viewport === "mobile" ? "px-4 py-2" : "px-6 py-2"
            }`}
          >
            <div>{time}</div>
            <div
              className={`flex items-center ${
                viewport === "mobile" ? "gap-1" : "gap-2"
              }`}
            >
              {viewport === "mobile" && <Signal className="w-3.5 h-3.5" />}
              <Wifi
                className={viewport === "mobile" ? "w-3.5 h-3.5" : "w-4 h-4"}
              />
              <Battery
                className={viewport === "mobile" ? "w-4 h-4" : "w-5 h-5"}
                stroke="white" // Weißer Umriss für das Batterie-Icon
                fill="green" // Grüne Füllung für das Batterie-Icon
              />
            </div>
          </div>
        )}

        {/* Content Area - Now direct child */}
        <div
          className={`flex-1 overflow-y-auto min-h-0 relative ${getContentPadding()}`} // Keep scrolling here
        >
          <div
            className={`${viewport === "desktop" ? "space-y-6" : "space-y-4"}`}
          >
            {nonEmptyDropAreas.map((dropArea) => (
              <PreviewDropArea
                key={dropArea.id}
                dropArea={dropArea}
                viewport={viewport}
              />
            ))}
          </div>
        </div>
        {/* Removed intermediate div */}
      </div>
    </div>
  );
}
