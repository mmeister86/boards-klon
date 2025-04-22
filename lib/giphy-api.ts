// Giphy API Integration für GIF Picker
// Alle Funktionen geben ein Array von GifItem zurück

import { GifItem } from "./types";

// GIPHY API Key (hier als Platzhalter, in Produktion per .env!)
const GIPHY_API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY || "";
const BASE_URL = "https://api.giphy.com/v1/gifs";

/**
 * Wandelt ein Giphy-API-Objekt in unser GifItem um
 * @param obj Ein einzelnes Giphy-Objekt (Typ: unknown, wird gecastet)
 */
function mapGiphyToGifItem(obj: unknown): GifItem {
  // Typisierung für die wichtigsten Felder des Giphy-Objekts
  const giphyObj = obj as {
    id: string;
    title?: string;
    images: {
      original: { url: string; width: string; height: string };
      fixed_width_small_still?: { url: string };
      preview_gif?: { url: string };
    };
  };
  return {
    id: giphyObj.id,
    title: giphyObj.title || "",
    url: giphyObj.images.original.url,
    previewUrl:
      giphyObj.images.fixed_width_small_still?.url ||
      giphyObj.images.preview_gif?.url ||
      giphyObj.images.original.url,
    width: parseInt(giphyObj.images.original.width, 10),
    height: parseInt(giphyObj.images.original.height, 10),
  };
}

/**
 * Holt die aktuell angesagten (trending) GIFs von Giphy
 * @param limit Anzahl der GIFs pro Seite
 * @param page Seitenzahl (1-basiert)
 */
export async function fetchTrendingGifs(limit = 20, page = 1): Promise<GifItem[]> {
  const offset = (page - 1) * limit;
  const url = `${BASE_URL}/trending?api_key=${GIPHY_API_KEY}&limit=${limit}&offset=${offset}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Fehler beim Laden der Trending GIFs");
  const data = await res.json();
  return data.data.map(mapGiphyToGifItem);
}

/**
 * Sucht GIFs anhand eines Suchbegriffs
 * @param query Suchbegriff
 * @param limit Anzahl der GIFs pro Seite
 * @param page Seitenzahl (1-basiert)
 */
export async function searchGifs(query: string, limit = 20, page = 1): Promise<GifItem[]> {
  const offset = (page - 1) * limit;
  const url = `${BASE_URL}/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Fehler bei der GIF-Suche");
  const data = await res.json();
  return data.data.map(mapGiphyToGifItem);
}

/**
 * Holt GIFs zu einer bestimmten Kategorie (z.B. "reactions", "animals")
 * @param category Kategorie-Name
 * @param limit Anzahl der GIFs pro Seite
 * @param page Seitenzahl (1-basiert)
 */
export async function fetchGifsByCategory(category: string, limit = 20, page = 1): Promise<GifItem[]> {
  // Für Giphy gibt es keine echte Kategorie-API, daher als Workaround eine Suche mit dem Kategorienamen
  return searchGifs(category, limit, page);
}
