"use client";

import { useViewport } from "@/lib/hooks/use-viewport";
import { Button } from "@/components/ui/button";
import { Laptop, Tablet, Smartphone } from "lucide-react";

export function ViewportSelector() {
  const { viewport, setViewport } = useViewport();

  return (
    <div className="inline-flex items-center justify-center space-x-1 bg-card p-1 rounded-full shadow-sm border border-border">
      <Button
        variant={viewport === "desktop" ? "default" : "ghost"}
        size="sm"
        onClick={() => setViewport("desktop")}
        className={`flex items-center gap-2 rounded-full ${
          viewport === "desktop" ? "bg-primary text-primary-foreground" : ""
        }`}
      >
        <Laptop className="h-4 w-4" />
        <span className="hidden sm:inline">Desktop</span>
      </Button>
      <Button
        variant={viewport === "tablet" ? "default" : "ghost"}
        size="sm"
        onClick={() => setViewport("tablet")}
        className={`flex items-center gap-2 rounded-full ${
          viewport === "tablet" ? "bg-primary text-primary-foreground" : ""
        }`}
      >
        <Tablet className="h-4 w-4" />
        <span className="hidden sm:inline">Tablet</span>
      </Button>
      <Button
        variant={viewport === "mobile" ? "default" : "ghost"}
        size="sm"
        onClick={() => setViewport("mobile")}
        className={`flex items-center gap-2 rounded-full ${
          viewport === "mobile" ? "bg-primary text-primary-foreground" : ""
        }`}
      >
        <Smartphone className="h-4 w-4" />
        <span className="hidden sm:inline">Smartphone</span>
      </Button>
    </div>
  );
}
