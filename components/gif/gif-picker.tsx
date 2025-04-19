"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Bookmark, Clock, Sparkles } from "lucide-react";
import GifGrid from "@/components/gif-grid";
import GifPlayer from "@/components/gif-player";
import { searchGifs, getTrendingGifs } from "@/lib/tenor-api";
import type { GifItem } from "@/types/gif";

export default function GifPicker() {
  const [searchQuery, setSearchQuery] = useState("");
  const [gifs, setGifs] = useState<GifItem[]>([]);
  const [trendingGifs, setTrendingGifs] = useState<GifItem[]>([]);
  const [favoriteGifs, setFavoriteGifs] = useState<GifItem[]>([]);
  const [recentGifs, setRecentGifs] = useState<GifItem[]>([]);
  const [selectedGif, setSelectedGif] = useState<GifItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Lade Trending GIFs beim ersten Rendern
  useEffect(() => {
    const loadTrendingGifs = async () => {
      setIsLoading(true);
      try {
        const trending = await getTrendingGifs();
        setTrendingGifs(trending);
      } catch (error) {
        console.error("Fehler beim Laden der Trending GIFs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTrendingGifs();

    // Lade gespeicherte Favoriten und kürzlich verwendete GIFs aus dem localStorage
    const savedFavorites = localStorage.getItem("favoriteGifs");
    const savedRecent = localStorage.getItem("recentGifs");

    if (savedFavorites) {
      setFavoriteGifs(JSON.parse(savedFavorites));
    }

    if (savedRecent) {
      setRecentGifs(JSON.parse(savedRecent));
    }
  }, []);

  // Speichere Favoriten und kürzlich verwendete GIFs im localStorage
  useEffect(() => {
    if (favoriteGifs.length > 0) {
      localStorage.setItem("favoriteGifs", JSON.stringify(favoriteGifs));
    }
  }, [favoriteGifs]);

  useEffect(() => {
    if (recentGifs.length > 0) {
      localStorage.setItem("recentGifs", JSON.stringify(recentGifs));
    }
  }, [recentGifs]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const results = await searchGifs(searchQuery);
      setGifs(results);
    } catch (error) {
      console.error("Fehler bei der GIF-Suche:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGifSelect = (gif: GifItem) => {
    setSelectedGif(gif);

    // Füge das GIF zu den kürzlich verwendeten hinzu
    const isAlreadyInRecent = recentGifs.some((item) => item.id === gif.id);

    if (!isAlreadyInRecent) {
      const updatedRecent = [gif, ...recentGifs].slice(0, 20); // Begrenze auf 20 Einträge
      setRecentGifs(updatedRecent);
    }
  };

  const toggleFavorite = (gif: GifItem) => {
    const isFavorite = favoriteGifs.some((item) => item.id === gif.id);

    if (isFavorite) {
      setFavoriteGifs(favoriteGifs.filter((item) => item.id !== gif.id));
    } else {
      setFavoriteGifs([gif, ...favoriteGifs]);
    }
  };

  const isGifFavorite = (gifId: string) => {
    return favoriteGifs.some((item) => item.id === gifId);
  };

  return (
    <div className="flex flex-col gap-6">
      {selectedGif && (
        <div className="bg-card rounded-lg p-4 border">
          <h2 className="text-xl font-semibold mb-2">Ausgewähltes GIF</h2>
          <GifPlayer gif={selectedGif} />
          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              onClick={() => toggleFavorite(selectedGif)}
            >
              {isGifFavorite(selectedGif.id)
                ? "Aus Favoriten entfernen"
                : "Zu Favoriten hinzufügen"}
              <Bookmark
                className={`ml-2 h-4 w-4 ${
                  isGifFavorite(selectedGif.id) ? "fill-current" : ""
                }`}
              />
            </Button>
            <Button variant="secondary" onClick={() => setSelectedGif(null)}>
              Schließen
            </Button>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Input
          placeholder="GIFs suchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1"
        />
        <Button onClick={handleSearch}>
          <Search className="h-4 w-4 mr-2" />
          Suchen
        </Button>
      </div>

      <Tabs defaultValue="trending">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="trending">
            <Sparkles className="h-4 w-4 mr-2" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="search">
            <Search className="h-4 w-4 mr-2" />
            Suche
          </TabsTrigger>
          <TabsTrigger value="favorites">
            <Bookmark className="h-4 w-4 mr-2" />
            Favoriten
          </TabsTrigger>
          <TabsTrigger value="recent">
            <Clock className="h-4 w-4 mr-2" />
            Kürzlich
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trending">
          <GifGrid
            gifs={trendingGifs}
            onSelect={handleGifSelect}
            isLoading={isLoading}
            favoriteGifs={favoriteGifs}
            onToggleFavorite={toggleFavorite}
          />
        </TabsContent>

        <TabsContent value="search">
          <GifGrid
            gifs={gifs}
            onSelect={handleGifSelect}
            isLoading={isLoading}
            favoriteGifs={favoriteGifs}
            onToggleFavorite={toggleFavorite}
          />
        </TabsContent>

        <TabsContent value="favorites">
          <GifGrid
            gifs={favoriteGifs}
            onSelect={handleGifSelect}
            isLoading={false}
            favoriteGifs={favoriteGifs}
            onToggleFavorite={toggleFavorite}
          />
        </TabsContent>

        <TabsContent value="recent">
          <GifGrid
            gifs={recentGifs}
            onSelect={handleGifSelect}
            isLoading={false}
            favoriteGifs={favoriteGifs}
            onToggleFavorite={toggleFavorite}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
