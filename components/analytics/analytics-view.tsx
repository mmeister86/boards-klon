"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, LineChart, PieChart } from "lucide-react"; // Example icons

export default function AnalyticsView() {
  // Mock data for demonstration
  const mockStats = [
    { title: "Besucher", value: "1,234", change: "+5.2%", icon: BarChart },
    {
      title: "Projektaufrufe",
      value: "8,765",
      change: "+12.1%",
      icon: LineChart,
    },
    {
      title: "Medien-Downloads",
      value: "456",
      change: "-1.5%",
      icon: PieChart,
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Analytics</h1>
      <div className="grid gap-6 md:grid-cols-3">
        {mockStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change} zum Vormonat
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-8 text-center text-muted-foreground">
        <p>(Weitere Analytics-Daten und Diagramme werden hier angezeigt)</p>
      </div>
    </div>
  );
}
