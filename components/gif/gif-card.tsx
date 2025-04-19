"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChevronDown, Search, X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import GifPlayer from "./gif-player";
import GifGrid from "./gif-grid";
import CategoryFilter from "./category-filter";
import {
  CATEGORIES,
  addFavoriteGif,
  removeFavoriteGif,
  isGifFavorite,
  getFavoriteGifs,
  type GifItem,
} from "./giphy-api";

// HILFSFUNKTION zum Aufrufen unserer Backend-API-Route
async function fetchGifsFromApi(params: URLSearchParams): Promise<GifItem[]> {
  const response = await fetch(`/api/giphy?${params.toString()}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch GIFs from API");
  }
  const data = await response.json();
  // Giphy API gibt Daten direkt zurück, nicht in einem .data Feld wie Tenor
  // Passen Sie dies ggf. an die tatsächliche Struktur Ihrer GifItem und der Giphy-Antwort an
  return data.data || data; // Anpassung je nach API-Antwortstruktur
}

// NEU: Props-Interface für GifCard exportieren
export interface GifCardProps {
  onSelectGif: (gif: GifItem) => void; // Callback für die GIF-Auswahl
  initialSelectedGif?: GifItem | null; // Optional: Vorausgewähltes GIF
  compact?: boolean; // NEU: Kompakte Darstellung für Editor
}

// NEU: Exportiere die GifCard Komponente
export const GifCard: React.FC<GifCardProps> = ({
  onSelectGif,
  initialSelectedGif = null,
  compact = false, // Default: nicht kompakt
}) => {
  const [gifs, setGifs] = useState<GifItem[]>([]);
  const [selectedGif, setSelectedGif] = useState<GifItem | null>(
    initialSelectedGif
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("trending");
  const [playerHeight, setPlayerHeight] = useState<number>(300); // Default height
  const [favoritesCount, setFavoritesCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Load initial GIFs and favorites count
  useEffect(() => {
    const loadInitialGifs = async () => {
      try {
        setIsLoading(true);
        // Rufe unsere API für trendige GIFs auf
        const params = new URLSearchParams({ limit: "20" });
        const trendingGifs = await fetchGifsFromApi(params);
        setGifs(trendingGifs);
        if (trendingGifs.length > 0) {
          setSelectedGif(trendingGifs[0]);
        }

        // Update favorites count
        updateFavoritesCount();
      } catch (error) {
        console.error("Error loading GIFs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialGifs();
  }, []);

  // Update favorites count
  const updateFavoritesCount = () => {
    if (typeof window !== "undefined") {
      try {
        const favoritesStr = localStorage.getItem("gif-picker-favorites");
        const favorites = favoritesStr ? JSON.parse(favoritesStr) : [];
        setFavoritesCount(favorites.length);
      } catch (error) {
        console.error("Error counting favorites:", error);
      }
    }
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle category change
  const handleCategoryChange = useCallback(
    async (categoryId: string) => {
      if (debouncedQuery.trim() !== "") {
        // Wenn eine Suchanfrage aktiv ist, wird sie zuerst zurückgesetzt
        setSearchQuery("");
        setDebouncedQuery("");
      }

      setSelectedCategory(categoryId);
      setIsLoading(true);

      try {
        // Unterscheide zwischen Trending/Kategorie und Favoriten
        let categoryGifs: GifItem[] = [];
        if (categoryId === "favorites") {
          // Favoriten lokal laden
          categoryGifs = getFavoriteGifs();
          setHasMore(false); // Lokale Favoriten haben keine Paginierung über API
        } else {
          // Rufe unsere API für Kategorien auf (verwende categoryId als query)
          const params = new URLSearchParams({
            query: categoryId,
            limit: "20",
          });
          categoryGifs = await fetchGifsFromApi(params);
          setHasMore(categoryGifs.length === 20);
        }

        setGifs(categoryGifs);
        setPage(1);
        setHasMore(categoryGifs.length === 20);
      } catch (error) {
        console.error(`Error loading GIFs for category ${categoryId}:`, error);
      } finally {
        setIsLoading(false);
      }
    },
    [debouncedQuery] // Abhängigkeit: debouncedQuery wird im Callback verwendet
  );

  // Suche nach GIFs, wenn sich die Suchanfrage ändert
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.trim() === "") {
        // Wenn die Suche geleert wurde und wir nicht bereits Kategorie-GIFs laden, lade nach Kategorie
        if (!isLoading) {
          handleCategoryChange(selectedCategory);
        }
        return;
      }

      setIsLoading(true);
      try {
        // Rufe unsere API für die Suche auf
        const params = new URLSearchParams({
          query: debouncedQuery,
          limit: "20",
        });
        const results = await fetchGifsFromApi(params);
        setGifs(results);
        setPage(1);
        setHasMore(results.length === 20);
      } catch (error) {
        console.error("Error searching GIFs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
    // Abhängigkeiten: handleCategoryChange, isLoading, selectedCategory, debouncedQuery
  }, [debouncedQuery, handleCategoryChange, isLoading, selectedCategory]);

  // Toggle favorite status
  const handleToggleFavorite = (gif: GifItem) => {
    if (isGifFavorite(gif.id)) {
      removeFavoriteGif(gif.id);
    } else {
      addFavoriteGif(gif);
    }

    // Update favorites count
    updateFavoritesCount();

    // If we're in the favorites category, refresh the list
    if (selectedCategory === "favorites") {
      handleCategoryChange("favorites");
    }
  };

  // Load more GIFs when scrolling
  const loadMoreGifs = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const limit = 20;
      let moreGifs: GifItem[] = [];

      if (debouncedQuery.trim()) {
        // Rufe unsere API für die Suche auf (nächste Seite)
        const params = new URLSearchParams({
          query: debouncedQuery,
          limit: limit.toString(),
          offset: ((nextPage - 1) * limit).toString(),
        });
        moreGifs = await fetchGifsFromApi(params);
      } else if (selectedCategory !== "favorites") {
        // Nur API aufrufen, wenn nicht Favoriten
        // Rufe unsere API für Kategorien auf (nächste Seite)
        const params = new URLSearchParams({
          query: selectedCategory,
          limit: limit.toString(),
          offset: ((nextPage - 1) * limit).toString(),
        });
        moreGifs = await fetchGifsFromApi(params);
      }
      // Kein API-Aufruf für Favoriten, da diese lokal geladen werden

      if (moreGifs.length === 0 && selectedCategory !== "favorites") {
        setHasMore(false);
      } else {
        setGifs((prevGifs) => [...prevGifs, ...moreGifs]);
        setPage(nextPage);
      }
    } catch (error) {
      console.error("Error loading more GIFs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isDropdownOpen]);

  const handleGifSelect = (gif: GifItem) => {
    setSelectedGif(gif);
    setIsDropdownOpen(false);
    // Rufe den übergebenen Callback auf
    onSelectGif(gif);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const clearSearch = () => {
    setSearchQuery("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Handle GIF height change
  const handlePlayerHeightChange = (height: number) => {
    // Set a minimum height to prevent too small player area
    const minHeight = 200;
    setPlayerHeight(Math.max(height, minHeight));
  };

  return (
    <Card
      ref={cardRef}
      className={`flex flex-col bg-card text-card-foreground ${
        compact
          ? "w-full h-full max-w-none shadow-none border-none p-0"
          : "w-full max-w-md shadow-sm"
      } `}
      style={
        compact ? { boxShadow: "none", border: "none", borderRadius: 0 } : {}
      }
    >
      <CardHeader
        className={`px-4 py-3 border-b border-border ${
          compact ? "p-2 border-none" : ""
        }`}
      >
        <div className="relative" ref={dropdownRef}>
          <Button
            variant="outline"
            onClick={toggleDropdown}
            className="w-full flex items-center justify-between text-left font-normal"
          >
            <span className="truncate pr-2">
              {selectedGif
                ? selectedGif.title || "Unbenanntes GIF"
                : "GIF auswählen..."}
            </span>
            <ChevronDown className="h-4 w-4 flex-shrink-0" />
          </Button>

          {isDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-popover text-popover-foreground rounded-md shadow-lg border border-border">
              <div className="p-2">
                <div className="relative mb-2">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    ref={searchInputRef}
                    placeholder="GIFs suchen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-8"
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  )}
                </div>

                <CategoryFilter
                  categories={CATEGORIES.map((cat) =>
                    cat.id === "favorites"
                      ? { ...cat, name: `Favorites (${favoritesCount})` }
                      : cat
                  )}
                  selectedCategory={selectedCategory}
                  onSelectCategory={handleCategoryChange}
                />
              </div>

              <div
                className="overflow-y-auto flex-1"
                style={{
                  maxHeight: playerHeight
                    ? `calc(100% - ${playerHeight}px)`
                    : "300px",
                }}
              >
                <CategoryFilter
                  categories={CATEGORIES}
                  selectedCategory={selectedCategory}
                  onSelectCategory={handleCategoryChange}
                />
                <GifGrid
                  gifs={gifs}
                  onSelect={handleGifSelect}
                  onLoadMore={loadMoreGifs}
                  hasMore={hasMore}
                  isLoading={isLoading}
                  onToggleFavorite={handleToggleFavorite}
                />
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className={`p-0 flex-1 relative ${compact ? "p-0" : ""}`}>
        {selectedGif ? (
          <>
            <div
              style={{
                height: `${playerHeight}px`,
                transition: "height 0.3s ease",
              }}
            >
              <GifPlayer
                gif={selectedGif}
                onHeightChange={handlePlayerHeightChange}
              />
            </div>

            {/* Favorite button for selected GIF */}
            <Button
              size="sm"
              variant="outline"
              className={`absolute top-2 right-2 ${
                isGifFavorite(selectedGif.id) ? "bg-yellow-50" : ""
              }`}
              onClick={() => handleToggleFavorite(selectedGif)}
            >
              <Star
                className={`h-4 w-4 mr-1 ${
                  isGifFavorite(selectedGif.id) ? "fill-yellow-500" : ""
                }`}
              />
              {isGifFavorite(selectedGif.id) ? "Favorited" : "Favorite"}
            </Button>
          </>
        ) : (
          <div className="flex items-center justify-center h-[300px] bg-gray-100">
            {isLoading ? (
              <div className="animate-pulse text-gray-400">Loading GIFs...</div>
            ) : (
              <div className="text-gray-400">Kein GIF ausgewählt</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
