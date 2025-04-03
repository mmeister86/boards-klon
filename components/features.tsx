"use client";

import { Badge } from "@/components/ui/badge";
import { Zap, Shield, BarChart, Globe } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";

// Reduced to 4 key features
const features = [
  {
    icon: Zap,
    title: "Blitzschnell",
    description:
      "Unsere optimierte Plattform sorgt dafür, dass deine Anwendung mit minimaler Latenz auf Höchstleistung läuft.",
  },
  {
    icon: Shield,
    title: "Standardmäßig sicher",
    description:
      "Sicherheit auf Unternehmensniveau mit Ende-zu-Ende-Verschlüsselung und fortschrittlichem Bedrohungsschutz.",
  },
  {
    icon: BarChart,
    title: "Detaillierte Analysen",
    description:
      "Gewinne wertvolle Einblicke mit umfassenden Analysen und anpassbaren Dashboards.",
  },
  {
    icon: Globe,
    title: "Globales CDN",
    description:
      "Content-Delivery-Netzwerk sorgt für schnelle Ladezeiten für Nutzer überall auf der Welt.",
  },
];

export default function Features() {
  // Extract icon components
  const ZapIcon = features[0].icon;
  const ShieldIcon = features[1].icon;
  const BarChartIcon = features[2].icon;
  const GlobeIcon = features[3].icon;

  return (
    <section id="features" className="py-20">
      <div className="container">
        <div className="flex flex-col gap-10">
          <div className="flex gap-4 flex-col items-start">
            <div>
              <Badge>Funktionen</Badge>
            </div>
            <div className="flex gap-2 flex-col">
              <h2 className="text-3xl md:text-5xl tracking-tighter font-bold">
                Leistungsstarke Funktionen
              </h2>
              <p className="text-lg max-w-2xl leading-relaxed tracking-tight text-muted-foreground">
                Unsere Plattform ist vollgepackt mit leistungsstarken
                Funktionen, die dir beim Aufbau und Wachstum deiner Anwendung
                helfen.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-muted rounded-xl h-full lg:col-span-2 p-6 aspect-square lg:aspect-auto flex justify-between flex-col relative overflow-hidden group border border-primary/30">
              <GlowingEffect
                disabled={false}
                blur={8}
                spread={20}
                borderWidth={2}
                proximity={100}
                movementDuration={1.5}
                glow={true}
              />
              <ZapIcon className="w-8 h-8 stroke-1 text-primary" />
              <div className="flex flex-col">
                <h3 className="text-xl tracking-tight font-medium">
                  {features[0].title}
                </h3>
                <p className="text-muted-foreground max-w-lg text-base">
                  {features[0].description}
                </p>
              </div>
            </div>
            <div className="bg-muted rounded-xl aspect-square p-6 flex justify-between flex-col relative overflow-hidden group border border-primary/30">
              <GlowingEffect
                disabled={false}
                blur={8}
                spread={20}
                borderWidth={2}
                proximity={100}
                movementDuration={1.5}
                glow={true}
              />
              <ShieldIcon className="w-8 h-8 stroke-1 text-primary" />
              <div className="flex flex-col">
                <h3 className="text-xl tracking-tight font-medium">
                  {features[1].title}
                </h3>
                <p className="text-muted-foreground max-w-xs text-base">
                  {features[1].description}
                </p>
              </div>
            </div>

            <div className="bg-muted rounded-xl aspect-square p-6 flex justify-between flex-col relative overflow-hidden group border border-primary/30">
              <GlowingEffect
                disabled={false}
                blur={8}
                spread={20}
                borderWidth={2}
                proximity={100}
                movementDuration={1.5}
                glow={true}
              />
              <BarChartIcon className="w-8 h-8 stroke-1 text-primary" />
              <div className="flex flex-col">
                <h3 className="text-xl tracking-tight font-medium">
                  {features[2].title}
                </h3>
                <p className="text-muted-foreground max-w-xs text-base">
                  {features[2].description}
                </p>
              </div>
            </div>
            <div className="bg-muted rounded-xl h-full lg:col-span-2 p-6 aspect-square lg:aspect-auto flex justify-between flex-col relative overflow-hidden group border border-primary/30">
              <GlowingEffect
                disabled={false}
                blur={8}
                spread={20}
                borderWidth={2}
                proximity={100}
                movementDuration={1.5}
                glow={true}
              />
              <GlobeIcon className="w-8 h-8 stroke-1 text-primary" />
              <div className="flex flex-col">
                <h3 className="text-xl tracking-tight font-medium">
                  {features[3].title}
                </h3>
                <p className="text-muted-foreground max-w-lg text-base">
                  {features[3].description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
