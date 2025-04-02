"use client";

import { ReactNode, useState, useEffect } from "react";
import { Battery, Wifi } from "lucide-react";

interface TabletMockupProps {
  children: ReactNode;
}

export function TabletMockup({ children }: TabletMockupProps) {
  const [time, setTime] = useState(
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );

  // Update time every minute
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
    <div className="relative mx-auto">
      {/* Tablet Frame */}
      <div
        className="relative bg-white rounded-[2rem] border-[14px] border-black overflow-hidden"
        style={{
          width: "min(95vw, 834px)",
          height: "min(calc(95vw * 1.334), 1112px)",
        }}
      >
        {/* Screen Content */}
        <div className="relative w-full h-full overflow-hidden flex flex-col bg-white">
          {/* Status Bar */}
          <div className="flex justify-between items-center px-6 py-2 text-xs font-medium">
            <div>{time}</div>
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4" />
              <Battery className="w-5 h-5" />
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto min-h-0 relative">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
