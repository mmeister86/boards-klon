"use client";

import { useBlocksStore } from "@/store/blocks-store";
import { useViewport } from "@/lib/hooks/use-viewport";
import { PreviewDropArea } from "./preview-drop-area";
import { getViewportStyles } from "@/lib/utils/viewport-utils";
import { filterNonEmptyDropAreas } from "@/lib/utils/drop-area-utils";
import { PhoneMockup } from "./phone-mockup";
import { TabletMockup } from "./tablet-mockup";

export default function Preview() {
  const { dropAreas } = useBlocksStore();
  const { viewport } = useViewport();

  // Filter out empty drop areas for preview
  const nonEmptyDropAreas = filterNonEmptyDropAreas(dropAreas);

  return (
    <div className="flex-1 bg-gray-50 overflow-auto p-6">
      <div className="mx-auto flex justify-center">
        <div className="relative">
          <div
            className={`transition-[width,transform] duration-700 ease-in-out ${
              viewport === "mobile"
                ? "w-[375px]"
                : viewport === "tablet"
                ? "w-[834px]"
                : "w-[1400px]"
            }`}
          >
            <div
              className={`transition-transform duration-700 ease-in-out ${
                viewport === "mobile"
                  ? "scale-[0.8] hover:scale-[0.85]"
                  : viewport === "tablet"
                  ? "scale-[0.85]"
                  : ""
              }`}
            >
              {viewport === "mobile" ? (
                <div className="relative z-10 h-[812px]">
                  <PhoneMockup>
                    <div className="space-y-4 px-4">
                      {nonEmptyDropAreas.map((dropArea) => (
                        <PreviewDropArea
                          key={dropArea.id}
                          dropArea={dropArea}
                          viewport={viewport}
                        />
                      ))}
                    </div>
                  </PhoneMockup>
                </div>
              ) : viewport === "tablet" ? (
                <div className="relative z-10 h-[1112px]">
                  <TabletMockup>
                    <div className="space-y-6 p-6">
                      {nonEmptyDropAreas.map((dropArea) => (
                        <PreviewDropArea
                          key={dropArea.id}
                          dropArea={dropArea}
                          viewport={viewport}
                        />
                      ))}
                    </div>
                  </TabletMockup>
                </div>
              ) : (
                <div
                  className="bg-white rounded-[2rem] transition-all duration-700"
                  style={getViewportStyles(viewport)}
                >
                  <div className="space-y-6 p-8">
                    {nonEmptyDropAreas.map((dropArea) => (
                      <PreviewDropArea
                        key={dropArea.id}
                        dropArea={dropArea}
                        viewport={viewport}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
