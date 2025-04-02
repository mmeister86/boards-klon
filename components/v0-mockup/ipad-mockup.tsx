"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Battery, Wifi } from "lucide-react"

interface IPadMockupProps {
  children?: React.ReactNode
}

export default function IPadMockup({ children }: IPadMockupProps) {
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
        {/* iPad Frame */}
        <div
          className="relative bg-[#1a1a1a] rounded-[38px] shadow-xl overflow-hidden"
          style={{
            width: "min(95vw, 834px)",
            height: "min(calc(95vw * 1.334), 1112px)",
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
          <div className="absolute inset-[12px] rounded-[28px] bg-black overflow-hidden">
            {/* Status Bar */}
            <div
              className={`absolute top-0 left-0 right-0 z-10 flex justify-between items-center px-6 py-2 text-white text-xs font-medium transition-opacity duration-300 ${
                scrollPosition > 20 ? "bg-white text-black shadow-sm" : "bg-transparent"
              }`}
            >
              <div>{time}</div>
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                <Battery className="w-5 h-5" />
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div
              ref={contentRef}
              onScroll={handleScroll}
              className="w-full h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent"
            >
              {children || <DefaultIPadContent />}
            </div>
          </div>
        </div>

        {/* Reflection */}
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-t-[38px] pointer-events-none"></div>
      </div>
    </div>
  )
}

function DefaultIPadContent() {
  return (
    <div className="min-h-full bg-white">
      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -inset-4 bg-[url('/placeholder.svg')] bg-cover bg-center opacity-20 blur-sm"></div>
        </div>
        <div className="relative text-center px-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Creative Portfolio</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Showcasing innovative designs and digital experiences
          </p>
        </div>
      </div>

      {/* Portfolio Grid */}
      <div className="px-8 py-12 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Projects</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-xl"
            >
              <div
                className="aspect-[4/3] bg-gradient-to-br"
                style={{
                  background: [
                    "linear-gradient(to bottom right, #f97316, #db2777)",
                    "linear-gradient(to bottom right, #06b6d4, #3b82f6)",
                    "linear-gradient(to bottom right, #8b5cf6, #ec4899)",
                    "linear-gradient(to bottom right, #10b981, #3b82f6)",
                    "linear-gradient(to bottom right, #f59e0b, #ef4444)",
                    "linear-gradient(to bottom right, #6366f1, #a855f7)",
                  ][i % 6],
                }}
              ></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {
                    [
                      "Mobile App Design",
                      "E-commerce Website",
                      "Brand Identity",
                      "UI Component Library",
                      "Dashboard Interface",
                      "Marketing Campaign",
                    ][i % 6]
                  }
                </h3>
                <p className="text-gray-600 mb-4">
                  {
                    [
                      "A sleek mobile application with intuitive navigation and engaging user experience.",
                      "Responsive online store with seamless checkout process and product showcases.",
                      "Comprehensive brand identity including logo, color palette, and typography guidelines.",
                      "Reusable UI components built with accessibility and performance in mind.",
                      "Data visualization dashboard with real-time analytics and reporting features.",
                      "Integrated marketing campaign across digital and traditional channels.",
                    ][i % 6]
                  }
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium text-purple-600">View Project</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* About Section */}
      <div className="px-8 py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">About the Designer</h2>
          <p className="text-lg text-gray-700 mb-8">
            With over a decade of experience in digital design, I specialize in creating intuitive and visually stunning
            interfaces that prioritize user experience. My approach combines aesthetic sensibility with functional
            design principles to deliver memorable digital products.
          </p>
          <p className="text-lg text-gray-700 mb-8">
            I've collaborated with startups, agencies, and enterprise clients across various industries including
            technology, healthcare, finance, and education. Each project is an opportunity to solve unique challenges
            and create meaningful experiences.
          </p>
          <div className="flex flex-wrap gap-3">
            {["UI/UX Design", "Brand Identity", "Web Development", "Mobile Apps", "Design Systems"].map((skill) => (
              <span key={skill} className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="px-8 py-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Let's Work Together</h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            I'm currently available for freelance projects, consultations, and collaborations. If you have a project in
            mind, let's discuss how we can bring your vision to life.
          </p>
          <button className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors">
            Get in Touch
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-8 bg-black text-gray-400 text-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div>© 2023 Creative Portfolio. All rights reserved.</div>
          <div className="flex gap-6 mt-4 md:mt-0">
            <span>Twitter</span>
            <span>Instagram</span>
            <span>LinkedIn</span>
            <span>Dribbble</span>
          </div>
        </div>
      </div>
    </div>
  )
}

