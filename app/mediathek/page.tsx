"use client";

import { useState } from "react";
import {
  Image as LucideImage,
  Video,
  Music,
  Link2,
  FileText,
  Search,
  Loader2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/layout/navbar";
import Image from "next/image";

// Typen für die Mediendateien
type MediaType = "image" | "video" | "audio" | "link" | "document";

interface MediaItem {
  id: string;
  type: MediaType;
  title: string;
  url: string;
  thumbnail?: string;
  createdAt: Date;
}

// Dummy-Daten für die Demonstration
const dummyMedia: MediaItem[] = [
  // Bilder
  {
    id: "img1",
    type: "image",
    title: "Beispielbild 1",
    url: "/images/example1.jpg",
    thumbnail: "/images/example1-thumb.jpg",
    createdAt: new Date(),
  },
  {
    id: "img2",
    type: "image",
    title: "Beispielbild 2",
    url: "/images/example2.jpg",
    thumbnail: "/images/example2-thumb.jpg",
    createdAt: new Date(),
  },
  {
    id: "img3",
    type: "image",
    title: "Beispielbild 3",
    url: "/images/example3.jpg",
    thumbnail: "/images/example3-thumb.jpg",
    createdAt: new Date(),
  },
  {
    id: "img4",
    type: "image",
    title: "Beispielbild 4",
    url: "/images/example4.jpg",
    thumbnail: "/images/example4-thumb.jpg",
    createdAt: new Date(),
  },
  {
    id: "img5",
    type: "image",
    title: "Beispielbild 5",
    url: "/images/example5.jpg",
    thumbnail: "/images/example5-thumb.jpg",
    createdAt: new Date(),
  },
  // Videos
  {
    id: "vid1",
    type: "video",
    title: "Beispielvideo 1",
    url: "/videos/example1.mp4",
    thumbnail: "/videos/example1-thumb.jpg",
    createdAt: new Date(),
  },
  {
    id: "vid2",
    type: "video",
    title: "Beispielvideo 2",
    url: "/videos/example2.mp4",
    thumbnail: "/videos/example2-thumb.jpg",
    createdAt: new Date(),
  },
  {
    id: "vid3",
    type: "video",
    title: "Beispielvideo 3",
    url: "/videos/example3.mp4",
    thumbnail: "/videos/example3-thumb.jpg",
    createdAt: new Date(),
  },
  {
    id: "vid4",
    type: "video",
    title: "Beispielvideo 4",
    url: "/videos/example4.mp4",
    thumbnail: "/videos/example4-thumb.jpg",
    createdAt: new Date(),
  },
  {
    id: "vid5",
    type: "video",
    title: "Beispielvideo 5",
    url: "/videos/example5.mp4",
    thumbnail: "/videos/example5-thumb.jpg",
    createdAt: new Date(),
  },
  // Audio
  {
    id: "aud1",
    type: "audio",
    title: "Beispielaudio 1",
    url: "/audio/example1.mp3",
    createdAt: new Date(),
  },
  {
    id: "aud2",
    type: "audio",
    title: "Beispielaudio 2",
    url: "/audio/example2.mp3",
    createdAt: new Date(),
  },
  {
    id: "aud3",
    type: "audio",
    title: "Beispielaudio 3",
    url: "/audio/example3.mp3",
    createdAt: new Date(),
  },
  {
    id: "aud4",
    type: "audio",
    title: "Beispielaudio 4",
    url: "/audio/example4.mp3",
    createdAt: new Date(),
  },
  {
    id: "aud5",
    type: "audio",
    title: "Beispielaudio 5",
    url: "/audio/example5.mp3",
    createdAt: new Date(),
  },
  // Links
  {
    id: "link1",
    type: "link",
    title: "Beispiellink 1",
    url: "https://example1.com",
    createdAt: new Date(),
  },
  {
    id: "link2",
    type: "link",
    title: "Beispiellink 2",
    url: "https://example2.com",
    createdAt: new Date(),
  },
  {
    id: "link3",
    type: "link",
    title: "Beispiellink 3",
    url: "https://example3.com",
    createdAt: new Date(),
  },
  {
    id: "link4",
    type: "link",
    title: "Beispiellink 4",
    url: "https://example4.com",
    createdAt: new Date(),
  },
  {
    id: "link5",
    type: "link",
    title: "Beispiellink 5",
    url: "https://example5.com",
    createdAt: new Date(),
  },
  // Dokumente
  {
    id: "doc1",
    type: "document",
    title: "Beispieldokument 1",
    url: "/documents/example1.pdf",
    createdAt: new Date(),
  },
  {
    id: "doc2",
    type: "document",
    title: "Beispieldokument 2",
    url: "/documents/example2.pdf",
    createdAt: new Date(),
  },
  {
    id: "doc3",
    type: "document",
    title: "Beispieldokument 3",
    url: "/documents/example3.pdf",
    createdAt: new Date(),
  },
  {
    id: "doc4",
    type: "document",
    title: "Beispieldokument 4",
    url: "/documents/example4.pdf",
    createdAt: new Date(),
  },
  {
    id: "doc5",
    type: "document",
    title: "Beispieldokument 5",
    url: "/documents/example5.pdf",
    createdAt: new Date(),
  },
];

export default function MediathekPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Filter Medien basierend auf der Suchanfrage
  const filteredMedia = dummyMedia.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Gruppiere Medien nach Typ
  const groupedMedia = filteredMedia.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {} as Record<MediaType, MediaItem[]>);

  // Render-Funktion für die Medienvorschau
  const renderMediaPreview = (item: MediaItem) => {
    switch (item.type) {
      case "image":
        return (
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
            {item.thumbnail ? (
              <Image
                src={item.thumbnail}
                alt={`Vorschaubild für ${item.title}`}
                className="object-cover"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <LucideImage className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>
        );
      case "video":
        return (
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            {item.thumbnail ? (
              <Image
                src={item.thumbnail}
                alt={`Vorschaubild für ${item.title}`}
                className="object-cover"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Video className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>
        );
      case "audio":
        return (
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <Music className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        );
      case "link":
        return (
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <Link2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        );
      case "document":
        return (
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Render-Funktion für eine Medienkategorie
  const renderMediaCategory = (
    type: MediaType,
    title: string,
    icon: React.ReactNode
  ) => {
    const items = groupedMedia[type] || [];
    const displayItems = items.slice(0, 4);
    const hasMore = items.length > 4;

    return (
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          {icon}
          <h2 className="text-xl font-semibold">{title}</h2>
          <span className="text-sm text-muted-foreground">
            ({items.length})
          </span>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {displayItems.map((item) => (
            <div key={item.id} className="relative">
              {renderMediaPreview(item)}
            </div>
          ))}
          {hasMore && (
            <Button
              variant="outline"
              className="aspect-square flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
            >
              mehr
            </Button>
          )}
        </div>
      </section>
    );
  };

  // Handle drag and drop events
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
    // Handle file upload here
    const files = Array.from(e.dataTransfer.files);
    console.log("Dropped files:", files);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar currentView="mediathek" />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Mediathek</h1>
          <div className="relative w-full max-w-md ml-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Medien durchsuchen..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-8">
          {/* Linke Spalte: Medienkategorien */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="space-y-8">
                {renderMediaCategory(
                  "image",
                  "Bilder",
                  <LucideImage className="h-5 w-5" />
                )}
                {renderMediaCategory(
                  "video",
                  "Videos",
                  <Video className="h-5 w-5" />
                )}
                {renderMediaCategory(
                  "audio",
                  "Audio",
                  <Music className="h-5 w-5" />
                )}
                {renderMediaCategory(
                  "link",
                  "Links",
                  <Link2 className="h-5 w-5" />
                )}
                {renderMediaCategory(
                  "document",
                  "Dokumente",
                  <FileText className="h-5 w-5" />
                )}
              </div>
            )}
          </div>

          {/* Rechte Spalte: Upload-Bereich */}
          <div className="w-80">
            <div className="sticky top-8">
              <h2 className="text-xl font-semibold mb-4">Medien hochladen</h2>
              <div
                className={`
                  border-2 border-dashed rounded-lg p-8
                  flex flex-col items-center justify-center gap-4
                  transition-colors duration-200
                  ${
                    isDragging ? "border-primary bg-primary/5" : "border-border"
                  }
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Dateien hierher ziehen oder
                  </p>
                  <Button variant="link" className="mt-1">
                    Dateien auswählen
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Maximale Dateigröße: 50MB
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
