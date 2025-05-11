import { NextResponse } from 'next/server';
// Importiere die Hilfsfunktion zum Auslesen des Fortschritts
import { getCurrentProgress } from './progress-utils';

/**
 * GET-Handler für den Fortschritts-Endpoint
 * Gibt den aktuellen Fortschritt des Audio-Uploads/der Optimierung zurück
 * Beispiel-Response: { progress: 42 }
 */
export async function GET() {
  return NextResponse.json({ progress: getCurrentProgress() });
}
