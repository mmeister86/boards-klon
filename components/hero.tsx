"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useEffect, useState, useMemo } from "react";

export default function Hero() {
  // State für den Typewriter-Effekt
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const words = useMemo(
    () => ["Großartiges", "Innovatives", "Kreatives", "Einzigartiges"],
    []
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  // Typewriter Animation
  useEffect(() => {
    const typingSpeed = 100;
    const deletingSpeed = 50;
    const pauseDuration = 2000;

    const timeout = setTimeout(
      () => {
        if (isWaiting) {
          setIsWaiting(false);
          setIsDeleting(true);
          return;
        }

        if (isDeleting) {
          if (currentText === "") {
            setIsDeleting(false);
            setCurrentIndex((prev) => (prev + 1) % words.length);
          } else {
            setCurrentText((prev) => prev.slice(0, -1));
          }
        } else {
          const targetWord = words[currentIndex];
          if (currentText === targetWord) {
            setIsWaiting(true);
          } else {
            setCurrentText((prev) => targetWord.slice(0, prev.length + 1));
          }
        }
      },
      isWaiting ? pauseDuration : isDeleting ? deletingSpeed : typingSpeed
    );

    return () => clearTimeout(timeout);
  }, [currentText, currentIndex, isDeleting, isWaiting, words]);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white to-[#c7ed85]/20 pointer-events-none" />

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-br from-primary/20 via-secondary/20 to-background blur-3xl opacity-50 -z-10" />

      <div className="container relative">
        <div className="flex flex-col items-center text-center max-w-8xl mx-auto space-y-8">
          <h1 className="text-9xl md:text-9xl font-black tracking-tight leading-tight">
            Baue heute etwas <br />
            <span className="text-[#D4A373] inline-flex">
              {currentText}
              <span
                className="ml-1 inline-block h-[1em] w-[2px] animate-text-blink bg-[#D4A373]"
                aria-hidden="true"
              />
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Unsere Plattform bietet alles, was du brauchst, um deine nächste
            große Idee zu erstellen, zu starten und zu skalieren. Beginne mit
            Zuversicht zu bauen.
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
              <span className="text-3xl font-bold">99,9%</span>
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
