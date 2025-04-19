import { NextResponse } from 'next/server';
import { searchGifs, getTrendingGifs } from '@/components/gif/giphy-api'; // Importiere die Giphy API-Funktionen

// Umgebungsvariable für den Giphy API Key prüfen
const GIPHY_API_KEY = process.env.GIPHY_API_KEY;

if (!GIPHY_API_KEY) {
  console.error("GIPHY_API_KEY environment variable is not set.");
  // Im Entwicklungsmodus vielleicht einen Fehler werfen, in Produktion nur loggen?
  // throw new Error("GIPHY_API_KEY is not configured.");
}

/**
 * Handler für GET-Anfragen an /api/giphy
 * Sucht nach GIFs oder holt trendige GIFs basierend auf Query-Parametern.
 *
 * Query Parameter:
 * - query?: Suchbegriff für GIFs. Wenn nicht angegeben, werden trendige GIFs geholt.
 * - offset?: Offset für die Paginierung der Ergebnisse (Standard: 0).
 * - limit?: Anzahl der zurückzugebenden GIFs (Standard: 20).
 */
export async function GET(request: Request) {
  if (!GIPHY_API_KEY) {
    return NextResponse.json(
      { error: 'Giphy API key is not configured on the server.' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  try {
    let data;
    if (query) {
      // Suche nach GIFs, wenn ein Suchbegriff vorhanden ist
      console.log(`Searching Giphy for: ${query}, Limit: ${limit}, Offset: ${offset}`);
      const page = Math.floor(offset / limit) + 1;
      data = await searchGifs(GIPHY_API_KEY, query, limit, page);
    } else {
      // Hole trendige GIFs, wenn kein Suchbegriff vorhanden ist
      console.log(`Fetching trending Gifs from Giphy, Limit: ${limit}, Offset: ${offset}`);
      const page = Math.floor(offset / limit) + 1;
      data = await getTrendingGifs(GIPHY_API_KEY, limit, page);
    }
    // Sende die Daten von Giphy zurück an den Client
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching from Giphy API:', error);
    // Gib eine generische Fehlermeldung zurück, um API-Schlüssel etc. nicht preiszugeben
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
        { error: 'Failed to fetch from Giphy API', details: message },
        { status: 500 }
    );
  }
}
