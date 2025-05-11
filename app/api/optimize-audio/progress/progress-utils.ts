// --- Globale Variable zum Speichern des aktuellen Fortschritts (0-100) ---
let currentProgress = 0;

/**
 * Setzt den aktuellen Fortschritt (wird von der Haupt-API-Route aufgerufen)
 * @param progress Zahl zwischen 0 und 100, die den Fortschritt angibt
 */
export function setProgress(progress: number) {
  currentProgress = progress;
}

/**
 * Gibt den aktuellen Fortschrittswert zurück
 * @returns Fortschritt als Zahl (0-100)
 */
export function getCurrentProgress(): number {
  return currentProgress;
}
