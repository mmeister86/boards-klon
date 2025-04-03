import * as React from "react";
import { cn } from "@/lib/utils";

// TypeScript interface für die Component Props
export interface TypewriterHeroProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  words?: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  typingClassName?: string;
  cursorClassName?: string;
  align?: "left" | "center" | "right";
}

// TypewriterHero Component mit Schreibmaschinen-Effekt
export function TypewriterHero({
  title = "Welcome to",
  description = "A modern and beautiful UI library for React",
  words = ["Beautiful", "Modern", "Responsive", "Accessible"],
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseDuration = 2000,
  className,
  titleClassName,
  descriptionClassName,
  typingClassName,
  cursorClassName,
  align = "center",
  ...props
}: TypewriterHeroProps) {
  // State für den aktuellen Text und Animation
  const [currentText, setCurrentText] = React.useState("");
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isWaiting, setIsWaiting] = React.useState(false);

  // Animations-Logik mit useEffect
  React.useEffect(() => {
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
  }, [
    currentText,
    currentIndex,
    isDeleting,
    isWaiting,
    words,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
  ]);

  // Component Render
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden py-24",
        align === "center" && "text-center",
        align === "right" && "text-right",
        className
      )}
      {...props}
    >
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {title && (
          <h1
            className={cn(
              "text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl",
              titleClassName
            )}
          >
            {title}{" "}
            <span
              className={cn(
                "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent",
                typingClassName
              )}
            >
              {currentText}
              <span
                className={cn(
                  "ml-1 inline-block h-[1em] w-[2px] animate-text-blink bg-current",
                  cursorClassName
                )}
                aria-hidden="true"
              />
            </span>
          </h1>
        )}
        {description && (
          <p
            className={cn(
              "mt-6 max-w-3xl text-xl text-gray-600 dark:text-gray-400",
              align === "center" && "mx-auto",
              align === "right" && "ml-auto",
              descriptionClassName
            )}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
