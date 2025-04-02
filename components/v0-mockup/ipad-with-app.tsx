"use client"

import { useState } from "react"
import { Wifi, Battery, LockIcon } from "lucide-react"
import AppInterface from "./app-interface"

export default function IPadWithApp() {
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
  const [isLocked, setIsLocked] = useState(true)

  // Update time every minute
  useState(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
    }, 60000)

    return () => clearInterval(interval)
  })

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4 md:p-8">
      <div className="relative mx-auto">
        {/* iPad Frame */}
        <div
          className="relative bg-[#1a1a1a] rounded-[40px] shadow-xl overflow-hidden"
          style={{
            width: "min(90vw, 834px)",
            height: "min(calc(90vw * 1.334), 1112px)",
            boxShadow: "0 50px 100px -20px rgba(0,0,0,0.25), 0 30px 60px -30px rgba(0,0,0,0.3)",
          }}
        >
          {/* Camera */}
          <div className="absolute top-[20px] left-1/2 transform -translate-x-1/2 w-[8px] h-[8px] bg-black rounded-full z-20">
            <div className="absolute inset-[1px] rounded-full bg-[#333]"></div>
          </div>

          {/* Power Button */}
          <div className="absolute top-[80px] right-[-4px] w-[4px] h-[60px] bg-[#222] rounded-r-md"></div>

          {/* Volume Buttons */}
          <div className="absolute top-[180px] right-[-4px] w-[4px] h-[40px] bg-[#222] rounded-r-md"></div>
          <div className="absolute top-[230px] right-[-4px] w-[4px] h-[40px] bg-[#222] rounded-r-md"></div>

          {/* Home Button / Touch ID */}
          <div className="absolute bottom-[20px] left-1/2 transform -translate-x-1/2 w-[6px] h-[6px] border-2 border-[#333] rounded-full z-20"></div>

          {/* Screen Bezel */}
          <div className="absolute inset-[12px] rounded-[30px] bg-black overflow-hidden">
            {/* Screen Content */}
            <div className="relative w-full h-full overflow-hidden">
              {isLocked ? (
                /* Lock Screen */
                <div
                  className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-600 flex flex-col items-center justify-center"
                  onClick={() => setIsLocked(false)}
                >
                  {/* Status Bar */}
                  <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-6 py-2 text-white text-xs font-medium bg-black/10 backdrop-blur-md">
                    <div>{time}</div>
                    <div className="flex items-center gap-2">
                      <Wifi className="w-4 h-4" />
                      <Battery className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="text-white text-7xl font-extralight mb-4">{time}</div>
                  <div className="text-white/80 text-xl font-light mb-16">
                    {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
                  </div>

                  <div className="flex items-center gap-2 text-white/90 mt-8">
                    <LockIcon className="w-5 h-5" />
                    <span className="text-sm">Swipe up to unlock</span>
                  </div>
                </div>
              ) : (
                /* App Interface */
                <AppInterface />
              )}
            </div>
          </div>
        </div>

        {/* Reflection */}
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-t-[40px] pointer-events-none"></div>
      </div>
    </div>
  )
}

