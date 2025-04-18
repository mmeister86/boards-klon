"use client";

import React, { useState, useEffect } from "react"; // Added React
import { useBlocksStore } from "@/store/blocks-store";
import { useViewport } from "@/lib/hooks/use-viewport";
import { RenderLayoutBlock } from "../public/RenderLayoutBlock";
import { Signal, Wifi, Battery } from "lucide-react"; // Removed Eye, EyeOff

// ===== Preview Component (Formerly PreviewContent) =====
export default function Preview() {
  // Renamed and made default export
  const { layoutBlocks } = useBlocksStore();
  const { viewport } = useViewport();

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
          height: "auto",
          minHeight: "600px",
          maxHeight: "85vh",
        };
      default:
        return {
          width: "1400px",
          maxWidth: "1400px",
          height: "auto",
          minHeight: "600px",
          marginTop: "20px",
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
      default:
        classes += " rounded-[2rem] shadow-lg";
        break;
    }
    return classes;
  };

  const getContentPadding = () => {
    switch (viewport) {
      case "mobile":
        return "px-4";
      case "tablet":
        return "p-6";
      default:
        return "p-8";
    }
  };

  const [time, setTime] = useState(
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
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

  return (
    <div className="flex-1 bg-gray-50 overflow-visible p-6 flex justify-center items-start h-full relative">
      <div
        className={`${getFrameClasses()} flex flex-col`}
        style={getFrameStyles()}
      >
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
                stroke="white"
                fill="green"
              />
            </div>
          </div>
        )}
        <div
          className={`flex-1 overflow-y-auto min-h-0 relative ${getContentPadding()}`}
          style={{
            maxHeight:
              viewport === "mobile"
                ? "calc(100% - 40px)"
                : viewport === "desktop"
                ? "70vh"
                : "100%",
          }}
        >
          <div
            className={`${viewport === "desktop" ? "space-y-6" : "space-y-4"}`}
          >
            {layoutBlocks.map((layoutBlock) => (
              <RenderLayoutBlock
                key={layoutBlock.id}
                layoutBlock={layoutBlock}
                viewport={viewport}
              />
            ))}
            {layoutBlocks.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                Kein Inhalt vorhanden.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
