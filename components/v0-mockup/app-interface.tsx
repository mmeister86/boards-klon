"use client"

import { useState } from "react"
import { Home, Search, Bell, User, Menu, ChevronLeft, ChevronRight, Heart, MessageSquare, Bookmark } from "lucide-react"

export default function AppInterface() {
  const [activeTab, setActiveTab] = useState("home")

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Navigation Bar */}
      <div className="flex justify-between items-center px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <Menu className="w-6 h-6 text-gray-700" />
          <span className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text">
            DesignHub
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Bell className="w-6 h-6 text-gray-700" />
            <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></div>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Discover</h1>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full bg-gray-100">
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button className="p-2 rounded-full bg-gray-100">
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {["All", "UI Design", "Web", "Mobile", "Branding", "3D"].map((category) => (
            <div
              key={category}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                category === "All" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              {category}
            </div>
          ))}
        </div>

        {/* Featured Post */}
        <div className="mb-8 rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
          <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                  <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-purple-600 border-b-8 border-b-transparent ml-1"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Creating Stunning UI Animations</h3>
                <p className="text-sm text-gray-600">Learn how to bring your interfaces to life</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-full bg-gray-200">
                  <Heart className="w-4 h-4 text-gray-700" />
                </button>
                <button className="p-2 rounded-full bg-gray-200">
                  <Bookmark className="w-4 h-4 text-gray-700" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Grid of Posts */}
        <div className="grid grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden bg-gray-100 shadow-sm">
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
              <div className="p-3">
                <h3 className="text-sm font-medium text-gray-800 truncate">
                  {["Mobile App Dashboard", "Website Redesign", "3D Icon Collection", "Brand Identity Guidelines"][i]}
                </h3>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-1">
                    <div className="w-5 h-5 rounded-full bg-gray-300"></div>
                    <span className="text-xs text-gray-600">
                      {["Alex Morgan", "Sarah Chen", "Mike Peters", "Lisa Wong"][i]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-gray-500" />
                    <span className="text-xs text-gray-600">{[124, 89, 213, 56][i]}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Tab Bar */}
      <div className="flex justify-around items-center px-6 py-3 border-t bg-white">
        <button
          className={`p-2 rounded-full ${activeTab === "home" ? "text-purple-600 bg-purple-50" : "text-gray-500"}`}
          onClick={() => setActiveTab("home")}
        >
          <Home className="w-6 h-6" />
        </button>
        <button
          className={`p-2 rounded-full ${activeTab === "search" ? "text-purple-600 bg-purple-50" : "text-gray-500"}`}
          onClick={() => setActiveTab("search")}
        >
          <Search className="w-6 h-6" />
        </button>
        <button
          className={`p-2 rounded-full ${activeTab === "messages" ? "text-purple-600 bg-purple-50" : "text-gray-500"}`}
          onClick={() => setActiveTab("messages")}
        >
          <MessageSquare className="w-6 h-6" />
        </button>
        <button
          className={`p-2 rounded-full ${activeTab === "profile" ? "text-purple-600 bg-purple-50" : "text-gray-500"}`}
          onClick={() => setActiveTab("profile")}
        >
          <User className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}

