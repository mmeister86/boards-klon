"use client";

import { ReactNode, useState, useEffect } from "react";
import { Signal, Wifi, Battery } from "lucide-react";

interface PhoneMockupProps {
  children: ReactNode;
}

export function PhoneMockup({ children }: PhoneMockupProps) {
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
      {/* Phone Frame */}
      <div
        className="relative bg-white rounded-[2.5rem] border-[14px] border-black overflow-hidden"
        style={{
          width: "min(90vw, 375px)",
          height: "min(calc(90vw * 2.16), 812px)",
        }}
      >
        {/* Screen Content */}
        <div className="relative w-full h-full overflow-hidden flex flex-col bg-white">
          {/* Status Bar */}
          <div className="flex justify-between items-center px-4 py-2 text-xs font-medium">
            <div>{time}</div>
            <div className="flex items-center gap-1">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4" />
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
