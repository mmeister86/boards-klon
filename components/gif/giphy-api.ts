"use client";

import type { Category } from "./category-filter"

// NEU: Exportiere GifItem Interface
export interface GifItem {
  id: string;
  title: string;
  url: string;
  previewUrl: string;
  width: number;
  height: number;
}

// NEU: Typ für das rohe Objekt aus der Giphy API
interface GiphyApiItem {
  id: string;
  title?: string; // Titel kann fehlen
  images: {
    original: {
      url: string;
      width: string; // Giphy API gibt Strings zurück
      height: string;
    };
    fixed_width_small: { // Wird für previewUrl verwendet
      url: string;
      width?: string;
      height?: string;
    };
    // Ggf. weitere Bildformate hinzufügen, falls benötigt
    fixed_height_still?: { // Wird in types.ts für den Block verwendet
        url: string;
        width?: string;
        height?: string;
    };
  };
  // Ggf. weitere Giphy-Eigenschaften hinzufügen
}


const BASE_URL = "https://api.giphy.com/v1/gifs"

// Define available categories
export const CATEGORIES: Category[] = [
  { id: "favorites", name: "Favorites", emoji: "⭐" },
  { id: "trending", name: "Trending", emoji: "🔥" },
  { id: "reactions", name: "Reactions", emoji: "😮" },
  { id: "emotions", name: "Emotions", emoji: "😂" },
  { id: "animals", name: "Animals", emoji: "🐶" },
  { id: "memes", name: "Memes", emoji: "🎭" },
  { id: "tv", name: "TV & Movies", emoji: "🎬" },
  { id: "sports", name: "Sports", emoji: "⚽" },
  { id: "gaming", name: "Gaming", emoji: "🎮" },
  { id: "anime", name: "Anime", emoji: "🌸" },
  { id: "food", name: "Food", emoji: "🍕" },
  { id: "celebration", name: "Celebration", emoji: "🎉" },
  { id: "love", name: "Love", emoji: "❤️" },
]

// Favorites management
const FAVORITES_STORAGE_KEY = "gif-picker-favorites"

export function getFavoriteGifs(): GifItem[] {
  if (typeof window === "undefined") return []

  try {
    const storedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY)
    return storedFavorites ? JSON.parse(storedFavorites) : []
  } catch (error) {
    console.error("Error loading favorites from localStorage:", error)
    return []
  }
}

export function addFavoriteGif(gif: GifItem): void {
  if (typeof window === "undefined") return

  try {
    const favorites = getFavoriteGifs()
    // Check if already in favorites
    if (!favorites.some((fav) => fav.id === gif.id)) {
      const updatedFavorites = [...favorites, gif]
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updatedFavorites))
    }
  } catch (error) {
    console.error("Error adding favorite to localStorage:", error)
  }
}

export function removeFavoriteGif(gifId: string): void {
  if (typeof window === "undefined") return

  try {
    const favorites = getFavoriteGifs()
    const updatedFavorites = favorites.filter((gif) => gif.id !== gifId)
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updatedFavorites))
  } catch (error) {
    console.error("Error removing favorite from localStorage:", error)
  }
}

export function isGifFavorite(gifId: string): boolean {
  const favorites = getFavoriteGifs()
  return favorites.some((gif) => gif.id === gifId)
}

// UPDATED: Accepts apiKey, uses page for pagination
export async function fetchTrendingGifs(apiKey: string, limit = 20, page = 1): Promise<GifItem[]> {
  if (!apiKey) throw new Error("API key is required for fetchTrendingGifs");
  try {
    const offset = (page - 1) * limit
    const response = await fetch(`${BASE_URL}/trending?api_key=${apiKey}&limit=${limit}&offset=${offset}&rating=g`)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()

    return data.data.map((item: GiphyApiItem): GifItem => ({
      id: item.id,
      title: item.title || "Untitled GIF",
      url: item.images.original.url,
      previewUrl: item.images.fixed_width_small.url,
      width: Number.parseInt(item.images.original.width),
      height: Number.parseInt(item.images.original.height),
    }))
  } catch (error) {
    console.error("Error fetching trending GIFs:", error)
    return []
  }
}

// UPDATED: Accepts apiKey, uses page for pagination
export async function fetchGifsByCategory(apiKey: string, category: string, limit = 20, page = 1): Promise<GifItem[]> {
  if (!apiKey) throw new Error("API key is required for fetchGifsByCategory");
  // Handle favorites category
  if (category === "favorites") {
    const favorites = getFavoriteGifs()
    // Simple pagination for favorites
    const start = (page - 1) * limit
    const end = start + limit
    return favorites.slice(start, end)
  }

  try {
    const offset = (page - 1) * limit

    // If trending, use the trending endpoint
    if (category === "trending") {
      // Pass the apiKey down
      return fetchTrendingGifs(apiKey, limit, page)
    }

    // For other categories, use the search endpoint with the category as the query
    const response = await fetch(
      `${BASE_URL}/search?api_key=${apiKey}&q=${encodeURIComponent(category)}&limit=${limit}&offset=${offset}&rating=g`,
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()

    return data.data.map((item: GiphyApiItem): GifItem => ({
      id: item.id,
      title: item.title || "Untitled GIF",
      url: item.images.original.url,
      previewUrl: item.images.fixed_width_small.url,
      width: Number.parseInt(item.images.original.width),
      height: Number.parseInt(item.images.original.height),
    }))
  } catch (error) {
    console.error(`Error fetching GIFs for category ${category}:`, error)
    return []
  }
}

// UPDATED: Accepts apiKey, uses page for pagination
export async function searchGifs(apiKey: string, query: string, limit = 20, page = 1): Promise<GifItem[]> {
  if (!apiKey) throw new Error("API key is required for searchGifs");
  if (!query.trim()) return []

  try {
    const offset = (page - 1) * limit
    const response = await fetch(
      `${BASE_URL}/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}&rating=g`,
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()

    return data.data.map((item: GiphyApiItem): GifItem => ({
      id: item.id,
      title: item.title || "Untitled GIF",
      url: item.images.original.url,
      previewUrl: item.images.fixed_width_small.url,
      width: Number.parseInt(item.images.original.width),
      height: Number.parseInt(item.images.original.height),
    }))
  } catch (error) {
    console.error("Error searching GIFs:", error)
    return []
  }
}

// UPDATED: Assign the modified fetchTrendingGifs
export const getTrendingGifs = fetchTrendingGifs
