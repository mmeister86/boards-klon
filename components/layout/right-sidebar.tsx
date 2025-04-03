/* eslint-disable jsx-a11y/alt-text */
"use client";

import {
  Image,
  Film,
  Music,
  FileText,
  Upload,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";

// Mock data for media items
interface MediaItem {
  id: string;
  name: string;
  type: "photo" | "video" | "audio" | "document";
  thumbnail?: string;
  fileSize: string;
  dateAdded: string;
}

const mockMediaItems: MediaItem[] = [
  {
    id: "1",
    name: "Beach Sunset",
    type: "photo",
    fileSize: "2.4 MB",
    dateAdded: "2024-03-20",
  },
  {
    id: "2",
    name: "Mountain View",
    type: "photo",
    fileSize: "1.8 MB",
    dateAdded: "2024-03-19",
  },
  {
    id: "3",
    name: "Forest Path",
    type: "photo",
    fileSize: "2.1 MB",
    dateAdded: "2024-03-18",
  },
  {
    id: "4",
    name: "City Lights",
    type: "photo",
    fileSize: "3.2 MB",
    dateAdded: "2024-03-17",
  },
  {
    id: "5",
    name: "Desert Landscape",
    type: "photo",
    fileSize: "2.7 MB",
    dateAdded: "2024-03-16",
  },
  {
    id: "6",
    name: "Product Demo",
    type: "video",
    fileSize: "15.6 MB",
    dateAdded: "2024-03-18",
  },
  {
    id: "7",
    name: "Tutorial Video",
    type: "video",
    fileSize: "24.2 MB",
    dateAdded: "2024-03-17",
  },
  {
    id: "8",
    name: "Presentation",
    type: "video",
    fileSize: "18.4 MB",
    dateAdded: "2024-03-16",
  },
  {
    id: "9",
    name: "Event Recording",
    type: "video",
    fileSize: "45.7 MB",
    dateAdded: "2024-03-15",
  },
  {
    id: "10",
    name: "Background Music",
    type: "audio",
    fileSize: "4.2 MB",
    dateAdded: "2024-03-16",
  },
  {
    id: "11",
    name: "Interview Recording",
    type: "audio",
    fileSize: "8.7 MB",
    dateAdded: "2024-03-15",
  },
  {
    id: "12",
    name: "Podcast Episode",
    type: "audio",
    fileSize: "12.4 MB",
    dateAdded: "2024-03-14",
  },
  {
    id: "13",
    name: "Sound Effect",
    type: "audio",
    fileSize: "1.2 MB",
    dateAdded: "2024-03-13",
  },
  {
    id: "14",
    name: "Project Brief.pdf",
    type: "document",
    fileSize: "567 KB",
    dateAdded: "2024-03-14",
  },
  {
    id: "15",
    name: "Report.docx",
    type: "document",
    fileSize: "892 KB",
    dateAdded: "2024-03-13",
  },
  {
    id: "16",
    name: "Contract.pdf",
    type: "document",
    fileSize: "1.2 MB",
    dateAdded: "2024-03-12",
  },
  {
    id: "17",
    name: "Proposal.docx",
    type: "document",
    fileSize: "756 KB",
    dateAdded: "2024-03-11",
  },
];

interface MediaCategoryProps {
  title: string;
  icon: React.ReactNode;
  iconColor: string;
  items: MediaItem[];
  type: MediaItem["type"];
  isActive: boolean;
  onSelect: () => void;
}

function MediaCategory({
  title,
  icon,
  iconColor,
  items,
  type,
  isActive,
  onSelect,
}: MediaCategoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayItems = isExpanded ? items : items.slice(0, 4);

  const renderItem = (item: MediaItem) => {
    if (type === "photo") {
      return (
        <div
          key={item.id}
          className="aspect-square bg-muted rounded-lg p-2 hover:bg-muted/80 cursor-pointer group relative"
        >
          <div className="w-full h-full bg-background rounded flex items-center justify-center">
            <Image size={24} className="text-muted-foreground" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/50 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-xs text-white truncate">{item.name}</p>
          </div>
        </div>
      );
    }

    return (
      <div
        key={item.id}
        className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg cursor-pointer"
      >
        {icon}
        <div className="flex-1 min-w-0">
          <p className="text-sm truncate">{item.name}</p>
          <p className="text-xs text-muted-foreground">{item.fileSize}</p>
        </div>
      </div>
    );
  };

  const handleHeaderClick = () => {
    if (!isActive) {
      onSelect();
      setIsExpanded(false); // Reset expansion state when switching categories
    } else {
      setIsExpanded(!isExpanded); // Toggle expansion when already active
    }
  };

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={handleHeaderClick}
        className={`w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors ${
          isActive ? "bg-muted/50" : ""
        }`}
      >
        <div className="flex items-center gap-2">
          <div className={iconColor}>{icon}</div>
          <h3 className="font-medium">{title}</h3>
          <span className="text-sm text-muted-foreground ml-2">
            ({items.length})
          </span>
        </div>
        {isActive && items.length > 4 && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            {!isExpanded && <span>{items.length - 4} weitere</span>}
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        )}
      </button>

      {isActive && (
        <div className="px-3 pb-3">
          {type === "photo" ? (
            <div className="grid grid-cols-2 gap-2">
              {displayItems.map(renderItem)}
            </div>
          ) : (
            <div className="space-y-2">{displayItems.map(renderItem)}</div>
          )}

          {items.length > 4 && !isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="w-full mt-2 p-2 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors"
            >
              Mehr anzeigen
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function RightSidebar() {
  const [isDragging, setIsDragging] = useState(false);
  const [activeCategory, setActiveCategory] =
    useState<MediaItem["type"]>("photo");

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    // Handle file drop
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      console.log("Dropped files:", files);
      // Here you would typically handle the file upload
    }
  };

  const categories = [
    {
      title: "Fotos",
      icon: <Image size={18} />,
      iconColor: "text-blue-500",
      type: "photo" as const,
      items: mockMediaItems.filter((item) => item.type === "photo"),
    },
    {
      title: "Videos",
      icon: <Film size={18} />,
      iconColor: "text-red-500",
      type: "video" as const,
      items: mockMediaItems.filter((item) => item.type === "video"),
    },
    {
      title: "Audio",
      icon: <Music size={18} />,
      iconColor: "text-green-500",
      type: "audio" as const,
      items: mockMediaItems.filter((item) => item.type === "audio"),
    },
    {
      title: "Dokumente",
      icon: <FileText size={18} />,
      iconColor: "text-purple-500",
      type: "document" as const,
      items: mockMediaItems.filter((item) => item.type === "document"),
    },
  ];

  return (
    <div className="w-64 bg-card border-l border-border flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="p-5">
          <h2 className="text-lg font-semibold mb-5">Media Library</h2>

          {/* Categories */}
          <div className="divide-y divide-border">
            {categories.map((category) => (
              <MediaCategory
                key={category.type}
                title={category.title}
                icon={category.icon}
                iconColor={category.iconColor}
                items={category.items}
                type={category.type}
                isActive={activeCategory === category.type}
                onSelect={() => setActiveCategory(category.type)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="border-t border-border p-4">
        <div
          className={`
            border-2 border-dashed rounded-lg p-4 text-center transition-colors
            ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            className="hidden"
            id="fileUpload"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              if (files.length > 0) {
                console.log("Selected files:", files);
                // Here you would typically handle the file upload
              }
            }}
          />
          <label
            htmlFor="fileUpload"
            className="flex flex-col items-center gap-2 cursor-pointer"
          >
            <Upload size={20} className="text-muted-foreground" />
            <div className="text-sm">
              <span className="text-primary font-medium">
                Klicken zum Hochladen
              </span>{" "}
              oder Dateien hier reinziehen
            </div>
            <p className="text-xs text-muted-foreground">
              Unterstützt Bilder, Videos, Audio und Dokumente
            </p>
          </label>
        </div>
      </div>
    </div>
  );
}
