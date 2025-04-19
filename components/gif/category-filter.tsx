"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface Category {
  id: string;
  name: string;
  emoji: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Check if scroll buttons should be shown
  const checkScroll = () => {
    if (!scrollAreaRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollAreaRef.current;
    setShowLeftScroll(scrollLeft > 0);
    setShowRightScroll(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      scrollArea.addEventListener("scroll", checkScroll);
      // Initial check
      checkScroll();

      return () => {
        scrollArea.removeEventListener("scroll", checkScroll);
      };
    }
  }, []);

  // Scroll left/right
  const scrollLeft = () => {
    if (!scrollAreaRef.current) return;
    scrollAreaRef.current.scrollBy({ left: -200, behavior: "smooth" });
  };

  const scrollRight = () => {
    if (!scrollAreaRef.current) return;
    scrollAreaRef.current.scrollBy({ left: 200, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {showLeftScroll && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white/90 shadow-md rounded-full h-8 w-8"
          onClick={scrollLeft}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      <div
        ref={scrollAreaRef}
        className="flex overflow-x-auto scrollbar-hide py-2 px-1 -mx-1 snap-x"
      >
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            className={`mr-2 whitespace-nowrap snap-start ${
              selectedCategory === category.id
                ? "bg-primary text-primary-foreground"
                : ""
            }`}
            onClick={() => onSelectCategory(category.id)}
          >
            <span className="mr-2">{category.emoji}</span>
            {category.name}
          </Button>
        ))}
      </div>

      {showRightScroll && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white/90 shadow-md rounded-full h-8 w-8"
          onClick={scrollRight}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
