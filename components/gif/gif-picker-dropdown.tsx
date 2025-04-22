import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { GifItem } from "@/lib/types";
import {
  fetchTrendingGifs,
  searchGifs,
  fetchGifsByCategory,
} from "@/lib/giphy-api";
import { getFavoriteGifs } from "@/lib/gif-favorites";

// Kategorien-Konstanten (können erweitert werden)
const CATEGORIES = [
  { id: "favorites", name: "Favorites", emoji: "⭐" },
  { id: "trending", name: "Trending", emoji: "🔥" },
  { id: "reactions", name: "Reactions", emoji: "😮" },
  { id: "animals", name: "Animals", emoji: "🐶" },
  { id: "memes", name: "Memes", emoji: "😂" },
  // Weitere Kategorien nach Bedarf
];

interface GifPickerDropdownProps {
  onSelect: (gif: GifItem) => void;
}

/**
 * GIF Picker Dropdown mit Suche, Kategorien, Grid, Favoriten und Infinite Scroll
 */
export const GifPickerDropdown: React.FC<GifPickerDropdownProps> = ({
  onSelect,
}) => {
  // State für GIFs, Suche, Kategorie, Paging, Favoriten, Lade- und Fehlerstatus
  const [gifs, setGifs] = useState<GifItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("trending");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [favorites, setFavorites] = useState<GifItem[]>([]);

  // Ref für Infinite Scroll
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Debounced Search (300ms)
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  // Favoriten aus localStorage laden
  useEffect(() => {
    if (category === "favorites") {
      setFavorites(getFavoriteGifs());
    }
  }, [category]);

  // GIFs laden, wenn Kategorie oder Suche sich ändert
  useEffect(() => {
    let cancelled = false;
    async function loadGifs() {
      setIsLoading(true);
      setError(null);
      setPage(1);
      setHasMore(true);
      try {
        let result: GifItem[] = [];
        if (category === "favorites") {
          result = getFavoriteGifs();
        } else if (debouncedSearch.trim()) {
          result = await searchGifs(debouncedSearch, 21, 1);
        } else if (category === "trending") {
          result = await fetchTrendingGifs(21, 1);
        } else {
          result = await fetchGifsByCategory(category, 21, 1);
        }
        if (!cancelled) {
          setGifs(result);
          setHasMore(result.length === 21);
        }
      } catch {
        if (!cancelled) setError("Fehler beim Laden der GIFs.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    loadGifs();
    return () => {
      cancelled = true;
    };
  }, [category, debouncedSearch]);

  // Infinite Scroll: weitere GIFs laden, wenn am Ende
  useEffect(() => {
    if (category === "favorites" || !hasMore || isLoading) return;
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Nächste Seite laden
          setPage((p) => p + 1);
        }
      },
      { threshold: 1 }
    );
    const currentLoader = loaderRef.current;
    if (currentLoader) observer.observe(currentLoader);
    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [hasMore, isLoading, category]);

  // Weitere GIFs laden, wenn page sich erhöht (außer bei Favoriten)
  useEffect(() => {
    if (page === 1 || category === "favorites" || isLoading) return;
    let cancelled = false;
    async function loadMore() {
      setIsLoading(true);
      try {
        let more: GifItem[] = [];
        if (debouncedSearch.trim()) {
          more = await searchGifs(debouncedSearch, 21, page);
        } else if (category === "trending") {
          more = await fetchTrendingGifs(21, page);
        } else {
          more = await fetchGifsByCategory(category, 21, page);
        }
        if (!cancelled) {
          setGifs((prev) => [...prev, ...more]);
          setHasMore(more.length === 21);
        }
      } catch {
        if (!cancelled) setError("Fehler beim Nachladen der GIFs.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    loadMore();
    return () => {
      cancelled = true;
    };
  }, [page, category, debouncedSearch, isLoading]);

  // Handler für Kategorie-Wechsel
  const handleCategory = (cat: string) => {
    setCategory(cat);
    setSearch("");
    setDebouncedSearch("");
    setPage(1);
    setError(null);
  };

  // Handler für GIF-Auswahl
  const handleGifClick = (gif: GifItem) => {
    onSelect(gif);
  };

  // Render
  return (
    <div className="w-[360px] bg-white border rounded-lg shadow-lg p-4">
      {/* Suchfeld */}
      <input
        type="text"
        placeholder="GIFs suchen..."
        className="w-full border rounded px-3 py-2 mb-2 text-sm"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        disabled={category === "favorites"}
      />
      {/* Kategorieauswahl */}
      <div className="flex gap-2 mb-2 overflow-x-auto">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`px-2 py-1 rounded flex items-center gap-1 ${
              category === cat.id
                ? "bg-blue-100 text-blue-700 font-semibold"
                : "bg-gray-100"
            }`}
            onClick={() => handleCategory(cat.id)}
          >
            <span>{cat.emoji}</span> {cat.name}
            {cat.id === "favorites" && (
              <span className="ml-1 text-xs text-gray-500">
                ({favorites.length})
              </span>
            )}
          </button>
        ))}
      </div>
      {/* Fehleranzeige */}
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      {/* GIF Grid */}
      <div className="grid grid-cols-3 gap-2 min-h-[180px] max-h-[400px] overflow-y-auto">
        {(category === "favorites" ? favorites : gifs).map((gif) => (
          <button
            key={gif.id}
            className="aspect-square bg-gray-100 rounded overflow-hidden group relative"
            onClick={() => handleGifClick(gif)}
            title={gif.title}
          >
            <Image
              src={gif.previewUrl}
              alt={gif.title}
              width={gif.width || 100}
              height={gif.height || 100}
              className="object-cover group-hover:opacity-80 transition"
              style={{
                width: "100%",
                height: "100%",
              }}
            />
          </button>
        ))}
        {/* Ladeindikator für Infinite Scroll */}
        {isLoading && (
          <div className="col-span-3 flex justify-center py-4">
            <span className="text-gray-400 text-sm">Lade GIFs...</span>
          </div>
        )}
        {/* Platzhalter für Intersection Observer */}
        <div ref={loaderRef} />
      </div>
      {/* Keine Ergebnisse */}
      {!isLoading &&
        (category === "favorites"
          ? favorites.length === 0
          : gifs.length === 0) && (
          <div className="text-gray-400 text-center py-6">
            Keine GIFs gefunden.
          </div>
        )}
    </div>
  );
};
