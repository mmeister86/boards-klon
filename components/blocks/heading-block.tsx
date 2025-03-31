"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, Info } from "lucide-react";

interface HeadingBlockProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  content: string;
  onChange: (data: { level: number; content: string }) => void;
  readOnly?: boolean;
}

export function HeadingBlock({
  level = 1,
  content = "Überschrift",
  onChange,
  readOnly = false,
}: HeadingBlockProps) {
  const [headingLevel, setHeadingLevel] = useState<number>(level);
  const [headingText, setHeadingText] = useState<string>(content);

  const handleLevelChange = (newLevel: number) => {
    setHeadingLevel(newLevel);
    onChange({ level: newLevel, content: headingText });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHeadingText(e.target.value);
    onChange({ level: headingLevel, content: e.target.value });
  };

  // Keyboard shortcuts for heading level changes
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Alt/Option + 1-6 to change heading level
    if (e.altKey && e.key >= "1" && e.key <= "6") {
      const newLevel = parseInt(e.key);
      setHeadingLevel(newLevel);
      onChange({ level: newLevel, content: headingText });
      e.preventDefault();
    }
  };

  // Helper function to get the appropriate tag (h1-h6) with correct styling
  const HeadingTag = ({
    children,
    className = "",
    level,
  }: {
    children: React.ReactNode;
    className?: string;
    level: number;
  }) => {
    const combinedClassName = `${getHeadingStyleByLevel(level)} ${className}`;

    switch (level) {
      case 1:
        return <h1 className={combinedClassName}>{children}</h1>;
      case 2:
        return <h2 className={combinedClassName}>{children}</h2>;
      case 3:
        return <h3 className={combinedClassName}>{children}</h3>;
      case 4:
        return <h4 className={combinedClassName}>{children}</h4>;
      case 5:
        return <h5 className={combinedClassName}>{children}</h5>;
      case 6:
        return <h6 className={combinedClassName}>{children}</h6>;
      default:
        return <h1 className={combinedClassName}>{children}</h1>;
    }
  };

  const renderHeading = () => {
    // Display read-only version when in preview mode
    if (readOnly) {
      return <HeadingTag level={headingLevel}>{headingText}</HeadingTag>;
    }

    // In edit mode, show the input field with proper heading styles
    return (
      <div className="w-full relative">
        <HeadingTag
          level={headingLevel}
          className="pointer-events-none opacity-0 h-0 overflow-hidden"
        >
          {headingText || "Heading text..."}
        </HeadingTag>
        <Input
          type="text"
          value={headingText}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          className={`w-full px-0 bg-transparent border-0 outline-none focus:border-primary border-b border-transparent ${getHeadingStyleByLevel(
            headingLevel
          )}`}
          placeholder="Heading text..."
          style={{
            caretColor: "currentColor",
            lineHeight: "inherit",
            fontWeight: "inherit",
            fontSize: "inherit",
          }}
        />
      </div>
    );
  };

  const getHeadingStyleByLevel = (level: number): string => {
    switch (level) {
      case 1:
        return "text-4xl font-bold";
      case 2:
        return "text-3xl font-bold";
      case 3:
        return "text-2xl font-bold";
      case 4:
        return "text-xl font-bold";
      case 5:
        return "text-lg font-bold";
      case 6:
        return "text-base font-bold";
      default:
        return "text-4xl font-bold";
    }
  };

  return (
    <div className="flex flex-col w-full">
      {!readOnly && (
        <div className="flex items-center mb-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <span
                  className={getHeadingStyleByLevel(headingLevel)}
                  style={{ fontSize: "0.875rem" }}
                >
                  H{headingLevel}
                </span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[220px]">
              <DropdownMenuItem
                onClick={() => handleLevelChange(1)}
                className="py-2 px-3"
              >
                <span className="text-4xl font-bold">Heading 1</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleLevelChange(2)}
                className="py-2 px-3"
              >
                <span className="text-3xl font-bold">Heading 2</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleLevelChange(3)}
                className="py-2 px-3"
              >
                <span className="text-2xl font-bold">Heading 3</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleLevelChange(4)}
                className="py-2 px-3"
              >
                <span className="text-xl font-bold">Heading 4</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleLevelChange(5)}
                className="py-2 px-3"
              >
                <span className="text-lg font-bold">Heading 5</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleLevelChange(6)}
                className="py-2 px-3"
              >
                <span className="text-base font-bold">Heading 6</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="ml-2 text-xs text-muted-foreground flex items-center">
            {headingLevel === 1 && "Largest heading"}
            {headingLevel === 2 && "Large heading"}
            {headingLevel === 3 && "Medium heading"}
            {headingLevel === 4 && "Small heading"}
            {headingLevel === 5 && "Smaller heading"}
            {headingLevel === 6 && "Smallest heading"}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="ml-1.5 text-muted-foreground hover:text-foreground transition-colors">
                    <Info size={14} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Press Alt + 1-6 to quickly change heading level</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}
      {renderHeading()}
    </div>
  );
}
