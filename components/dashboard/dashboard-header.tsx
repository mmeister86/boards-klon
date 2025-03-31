"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardHeader() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-6">Meine Projekte</h1>
      <div className="flex justify-between items-center">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">Alle Projekte</TabsTrigger>
            <TabsTrigger value="recent">Kürzlich</TabsTrigger>
            <TabsTrigger value="templates">Vorlagen</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Sortieren
          </Button>
          <Button variant="outline" size="sm">
            Filtern
          </Button>
        </div>
      </div>
    </div>
  );
}
