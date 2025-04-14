"use client"; // Layouts often need client components like Sidebar

import DashboardSidebar from "@/components/layout/dashboard-sidebar";
import Navbar from "@/components/layout/navbar";

// Dieses Layout definiert die gemeinsame Struktur für alle Dashboard-Routen
export default function DashboardLayout({
  children, // Die spezifische Seite (z.B. ProjectsPage) wird hier als children übergeben
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Die Navbar ist Teil des Layouts */}
      <Navbar context="dashboard" />
      <div className="flex flex-1">
        {/* Die Sidebar ist ebenfalls Teil des Layouts */}
        {/* Die Sidebar muss später angepasst werden, um Links statt State zu verwenden */}
        <DashboardSidebar />
        {/* Der Hauptbereich rendert den spezifischen Seiteninhalt */}
        <main className="flex-1 ml-64 pt-[73px]">
          <div className="h-full px-12 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
