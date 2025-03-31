import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-background/80 pointer-events-none" />

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-br from-primary/20 via-secondary/20 to-background blur-3xl opacity-50 -z-10" />

      <div className="container relative">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Baue heute etwas{" "}
            <span className="text-primary">Außergewöhnliches</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Unsere Plattform bietet alles, was Sie brauchen, um Ihre nächste
            große Idee zu entwickeln, zu starten und zu skalieren. Beginnen Sie
            mit Zuversicht.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button size="lg" className="gap-2">
              Jetzt starten <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              Mehr erfahren
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-8 w-full">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold">10k+</span>
              <span className="text-muted-foreground">Aktive Nutzer</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold">99.9%</span>
              <span className="text-muted-foreground">Verfügbarkeit</span>
            </div>
            <div className="flex flex-col items-center col-span-2 md:col-span-1">
              <span className="text-3xl font-bold">24/7</span>
              <span className="text-muted-foreground">Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
