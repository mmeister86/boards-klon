"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardHeader() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="flex justify-between items-center">
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Alle Projekte</TabsTrigger>
          <TabsTrigger value="recent">Kürzlich</TabsTrigger>
          <TabsTrigger value="templates">Vorlagen</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
