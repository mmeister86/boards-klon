"use client"

import { useState, useEffect } from "react"
import { Clock, Wifi, Battery, LockIcon, Signal } from "lucide-react"
import { cn } from "@/lib/utils"

export default function SmartphoneMockup() {
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
  const [isLocked, setIsLocked] = useState(true)

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4 md:p-8">
      <div className="relative mx-auto">
        {/* Phone Frame */}
        <div
          className="relative bg-[#1a1a1a] rounded-[40px] shadow-xl overflow-hidden"
          style={{
            width: "min(90vw, 375px)",
            height: "min(calc(90vw * 2.16), 812px)",
            boxShadow: "0 50px 100px -20px rgba(0,0,0,0.25), 0 30px 60px -30px rgba(0,0,0,0.3)",
          }}
        >
          {/* Notch */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[40%] h-[30px] bg-[#1a1a1a] rounded-b-[14px] z-20">
            <div className="absolute top-[8px] left-1/2 transform -translate-x-1/2 w-[6px] h-[6px] bg-[#333] rounded-full"></div>
            <div className="absolute top-[8px] left-[calc(50%-15px)] w-[4px] h-[4px] bg-[#333] rounded-full"></div>
          </div>

          {/* Power Button */}
          <div className="absolute top-[100px] right-[-4px] w-[4px] h-[40px] bg-[#222] rounded-r-md"></div>

          {/* Volume Buttons */}
          <div className="absolute top-[90px] left-[-4px] w-[4px] h-[30px] bg-[#222] rounded-l-md"></div>
          <div className="absolute top-[130px] left-[-4px] w-[4px] h-[30px] bg-[#222] rounded-l-md"></div>

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
                  <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-4 py-2 text-white text-xs font-medium">
                    <div>{time}</div>
                    <div className="flex items-center gap-1">
                      <Signal className="w-3.5 h-3.5" />
                      <Wifi className="w-3.5 h-3.5" />
                      <Battery className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="text-white text-5xl font-extralight mb-3">{time}</div>
                  <div className="text-white/80 text-sm font-light mb-12">
                    {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
                  </div>

                  <div className="flex items-center gap-1.5 text-white/90 mt-6">
                    <LockIcon className="w-4 h-4" />
                    <span className="text-xs">Swipe up to unlock</span>
                  </div>
                </div>
              ) : (
                /* App Interface */
                <MobileAppInterface />
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

function MobileAppInterface() {
  const [activeTab, setActiveTab] = useState("home")

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Status Bar */}
      <div className="flex justify-between items-center px-4 py-2 text-xs font-medium bg-white">
        <div className="text-black">{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
        <div className="flex items-center gap-1">
          <Signal className="w-3.5 h-3.5" />
          <Wifi className="w-3.5 h-3.5" />
          <Battery className="w-4 h-4" />
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="flex justify-between items-center px-4 py-3 border-b">
        <span className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text">
          DesignHub
        </span>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Clock className="w-5 h-5 text-gray-700" />
            <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
          </div>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-600"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-800">Discover</h1>
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-1 px-1">
          {["All", "UI Design", "Web", "Mobile", "Branding"].map((category) => (
            <div
              key={category}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                category === "All" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              {category}
            </div>
          ))}
        </div>

        {/* Featured Post */}
        <div className="mb-5 rounded-xl overflow-hidden bg-gray-100 shadow-sm">
          <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                  <div className="w-0 h-0 border-t-6 border-t-transparent border-l-8 border-l-purple-600 border-b-6 border-b-transparent ml-1"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-3">
            <h3 className="text-sm font-semibold text-gray-800">Creating Stunning UI Animations</h3>
            <p className="text-xs text-gray-600 mt-0.5">Learn how to bring your interfaces to life</p>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600"></div>
                <span className="text-xs text-gray-700">Alex Morgan</span>
              </div>
              <div className="text-xs text-gray-500">5 min read</div>
            </div>
          </div>
        </div>

        {/* Grid of Posts */}
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg overflow-hidden bg-gray-100 shadow-sm">
              <div
                className="aspect-[4/3] bg-gradient-to-br"
                style={{
                  background: [
                    "linear-gradient(to bottom right, #f97316, #db2777)",
                    "linear-gradient(to bottom right, #06b6d4, #3b82f6)",
                    "linear-gradient(to bottom right, #8b5cf6, #ec4899)",
                    "linear-gradient(to bottom right, #10b981, #3b82f6)",
                  ][i],
                }}
              ></div>
              <div className="p-2">
                <h3 className="text-xs font-medium text-gray-800 truncate">
                  {["Mobile App Dashboard", "Website Redesign", "3D Icon Collection", "Brand Identity Guidelines"][i]}
                </h3>
                <div className="flex justify-between items-center mt-1">
                  <div className="flex items-center gap-1">
                    <div className="w-3.5 h-3.5 rounded-full bg-gray-300"></div>
                    <span className="text-[10px] text-gray-600">
                      {["Alex M.", "Sarah C.", "Mike P.", "Lisa W."][i]}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Tab Bar */}
      <div className="flex justify-around items-center px-2 py-3 border-t bg-white">
        {[
          { name: "home", icon: HomeIcon },
          { name: "search", icon: SearchIcon },
          { name: "messages", icon: MessageIcon },
          { name: "profile", icon: ProfileIcon },
        ].map((tab) => (
          <button
            key={tab.name}
            className={cn("p-1.5 rounded-full", activeTab === tab.name ? "text-purple-600" : "text-gray-500")}
            onClick={() => setActiveTab(tab.name)}
          >
            <tab.icon active={activeTab === tab.name} />
          </button>
        ))}
      </div>
    </div>
  )
}

// Custom icons for the tab bar
function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 9.5L12 4L21 9.5V20H3V9.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? "0.1" : "0"}
      />
      <path d="M9 20V14H15V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SearchIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? "0.1" : "0"}
      />
      <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MessageIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? "0.1" : "0"}
      />
    </svg>
  )
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? "0.1" : "0"}
      />
    </svg>
  )
}

