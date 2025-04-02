"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Battery, Wifi, Signal } from "lucide-react"

interface PhoneMockupProps {
  children?: React.ReactNode
}

export default function PhoneMockup({ children }: PhoneMockupProps) {
  const [time, setTime] = useState<string>("")
  const contentRef = useRef<HTMLDivElement>(null)
  const [scrollPosition, setScrollPosition] = useState(0)

  // Update time every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
    }

    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  // Track scroll position for visual effects
  const handleScroll = () => {
    if (contentRef.current) {
      setScrollPosition(contentRef.current.scrollTop)
    }
  }

  return (
    <div className="flex items-center justify-center p-4 md:p-8">
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
            {/* Status Bar */}
            <div
              className={`absolute top-0 left-0 right-0 z-10 flex justify-between items-center px-4 py-2 text-white text-xs font-medium transition-all duration-300 ${
                scrollPosition > 20 ? "bg-white text-black shadow-sm" : "bg-transparent"
              }`}
            >
              <div>{time}</div>
              <div className="flex items-center gap-1">
                <Signal className="w-3.5 h-3.5" />
                <Wifi className="w-3.5 h-3.5" />
                <Battery className="w-4 h-4" />
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div
              ref={contentRef}
              onScroll={handleScroll}
              className="w-full h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent"
            >
              {children || <DefaultPhoneContent />}
            </div>
          </div>
        </div>

        {/* Reflection */}
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-t-[40px] pointer-events-none"></div>
      </div>
    </div>
  )
}

function DefaultPhoneContent() {
  return (
    <div className="min-h-full bg-white pt-8">
      {/* App Header */}
      <div className="px-4 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Discover</h1>
        <p className="text-gray-600">Explore trending designs</p>
      </div>

      {/* Stories */}
      <div className="px-4 pb-6">
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-br from-pink-500 to-purple-500">
                <div className="w-full h-full rounded-full bg-white p-[2px]">
                  <div
                    className="w-full h-full rounded-full bg-gradient-to-br"
                    style={{
                      background: [
                        "linear-gradient(to bottom right, #f97316, #db2777)",
                        "linear-gradient(to bottom right, #06b6d4, #3b82f6)",
                        "linear-gradient(to bottom right, #8b5cf6, #ec4899)",
                        "linear-gradient(to bottom right, #10b981, #3b82f6)",
                        "linear-gradient(to bottom right, #f59e0b, #ef4444)",
                        "linear-gradient(to bottom right, #6366f1, #a855f7)",
                        "linear-gradient(to bottom right, #ec4899, #8b5cf6)",
                        "linear-gradient(to bottom right, #14b8a6, #0ea5e9)",
                      ][i % 8],
                    }}
                  ></div>
                </div>
              </div>
              <span className="text-xs mt-1 text-gray-700 whitespace-nowrap">
                {["Design", "UI/UX", "Mobile", "Web", "Branding", "3D", "Animation", "Typography"][i % 8]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Post */}
      <div className="px-4 pb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Featured</h2>
        <div className="rounded-xl overflow-hidden bg-white shadow-md">
          <div className="aspect-[4/3] bg-gradient-to-br from-purple-500 to-indigo-600 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                  <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-purple-600 border-b-[6px] border-b-transparent ml-1"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-base font-semibold text-gray-900">Creating Stunning UI Animations</h3>
            <p className="text-sm text-gray-600 mt-1">
              Learn how to bring your interfaces to life with smooth animations and transitions.
            </p>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600"></div>
                <span className="text-xs text-gray-700">Alex Morgan</span>
              </div>
              <div className="text-xs text-gray-500">5 min read</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="px-4 pb-8">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Recent</h2>
          <span className="text-sm text-purple-600 font-medium">View all</span>
        </div>

        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 items-center">
              <div
                className="w-16 h-16 rounded-lg bg-gradient-to-br flex-shrink-0"
                style={{
                  background: [
                    "linear-gradient(to bottom right, #f97316, #db2777)",
                    "linear-gradient(to bottom right, #06b6d4, #3b82f6)",
                    "linear-gradient(to bottom right, #8b5cf6, #ec4899)",
                    "linear-gradient(to bottom right, #10b981, #3b82f6)",
                    "linear-gradient(to bottom right, #f59e0b, #ef4444)",
                  ][i % 5],
                }}
              ></div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">
                  {
                    [
                      "Responsive Design Principles",
                      "Color Theory for Designers",
                      "Typography Fundamentals",
                      "Designing for Accessibility",
                      "Prototyping Best Practices",
                    ][i % 5]
                  }
                </h3>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-600">
                    {["Sarah Chen", "Mike Peters", "Lisa Wong", "David Kim", "Emma Johnson"][i % 5]}
                  </span>
                  <span className="text-xs text-gray-500">{["2d", "4d", "1w", "2w", "3w"][i % 5]} ago</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 pb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Categories</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            "UI Design",
            "UX Research",
            "Web Design",
            "Mobile Apps",
            "Branding",
            "Typography",
            "3D Design",
            "Animation",
          ].map((category, i) => (
            <div key={category} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-sm font-medium text-gray-900">{category}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="px-4 py-8 bg-gray-50">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Join our newsletter</h2>
          <p className="text-sm text-gray-600 mb-4">Get weekly design tips and resources</p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-sm"
            />
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium">Subscribe</button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-6 bg-gray-900 text-white">
        <div className="text-center">
          <div className="text-lg font-bold mb-4">DesignHub</div>
          <div className="flex justify-center gap-4 mb-4">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-xs">𝕏</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-xs">in</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-xs">ig</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-xs">dr</span>
            </div>
          </div>
          <div className="text-xs text-gray-400">© 2023 DesignHub. All rights reserved.</div>
        </div>
      </div>
    </div>
  )
}

