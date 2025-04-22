// Favoriten-Logik für GIF Picker (global, über alle Blöcke)
// Speichert Favoriten im localStorage des Browsers

import { GifItem } from "./types";

const FAVORITES_STORAGE_KEY = "gif-picker-favorites";

/**
 * Gibt alle gespeicherten Favoriten zurück
 */
export function getFavoriteGifs(): GifItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as GifItem[]) : [];
  } catch (e) {
    console.error("Fehler beim Laden der Favoriten:", e);
    return [];
  }
}

/**
 * Fügt ein GIF zu den Favoriten hinzu (falls noch nicht vorhanden)
 */
export function addFavoriteGif(gif: GifItem): void {
  if (typeof window === "undefined") return;
  try {
    const favorites = getFavoriteGifs();
    if (!favorites.some((f) => f.id === gif.id)) {
      localStorage.setItem(
        FAVORITES_STORAGE_KEY,
        JSON.stringify([...favorites, gif])
      );
    }
  } catch (e) {
    console.error("Fehler beim Hinzufügen zu Favoriten:", e);
  }
}

/**
 * Entfernt ein GIF aus den Favoriten
 */
export function removeFavoriteGif(gifId: string): void {
  if (typeof window === "undefined") return;
  try {
    const favorites = getFavoriteGifs();
    const updated = favorites.filter((f) => f.id !== gifId);
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Fehler beim Entfernen aus Favoriten:", e);
  }
}

/**
 * Prüft, ob ein GIF bereits Favorit ist
 */
export function isGifFavorite(gifId: string): boolean {
  if (typeof window === "undefined") return false;
  return getFavoriteGifs().some((f) => f.id === gifId);
}
