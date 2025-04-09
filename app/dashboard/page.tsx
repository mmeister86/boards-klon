"use client";

import { useState } from "react";
// Removed unused imports: useEffect, useCallback, useRouter, PlusCircle, Search, Loader2, Button, Input, ProjectCard, listProjectsFromStorage, initializeStorage, Project, toast
import DashboardSidebar from "@/components/layout/dashboard-sidebar";
import MediathekView from "@/components/mediathek/mediathek-view";
import AnalyticsView from "@/components/analytics/analytics-view";
import ProjectsView from "@/components/dashboard/projects-view";
import ProfileView from "@/components/profile/profile-view"; // Added
import SettingsView from "@/components/settings/settings-view"; // Added
import Navbar from "@/components/layout/navbar";

export default function DashboardPage() {
  // Removed router, project state, loading state, refresh counter, toast functions, effects, and handlers

  const [activeView, setActiveView] = useState<
    "projects" | "mediathek" | "analytics" | "profile" | "settings" // Added profile and settings
  >("projects");

  // Helper function to render the content based on activeView
  const renderActiveView = () => {
    switch (activeView) {
      case "projects":
        return <ProjectsView />; // Use the new component
      case "mediathek":
        return <MediathekView />;
      case "analytics":
        return <AnalyticsView />;
      case "profile": // Added case
        return <ProfileView />;
      case "settings": // Added case
        return <SettingsView />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar currentView="dashboard" />
      <div className="flex flex-1">
        <DashboardSidebar
          activeView={activeView}
          setActiveView={setActiveView}
        />
        <main className="flex-1 ml-64 pt-[73px]">
          <div className="h-full px-12 py-8">{renderActiveView()}</div>
        </main>
      </div>
    </div>
  );
}
