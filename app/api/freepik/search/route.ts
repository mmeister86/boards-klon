import { NextResponse } from "next/server";
import { z } from "zod";

// Dynamische Route, kein Caching
export const dynamic = 'force-dynamic';

// --- Neue Interfaces basierend auf der API-Dokumentation ---
interface FreepikApiAuthor {
  id: number;
  name: string;
  avatar?: string;
  slug?: string;
}

interface FreepikApiImageSource {
  url: string;
  key?: string;
  size?: string;
}

interface FreepikApiImage {
  type: "photo" | "vector" | string; // Erlaube auch andere Strings, falls die API mehr zurückgibt
  orientation?: string;
  source?: FreepikApiImageSource;
}

interface FreepikApiMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  clean_search?: boolean;
}

// Angepasstes Interface für ein einzelnes Ergebnis-Item
interface FreepikItem {
  id: number | string; // ID kann Nummer oder String sein
  title: string; // Feld existiert jetzt
  url: string;
  filename?: string;
  image?: FreepikApiImage; // Verschachteltes Objekt
  author?: FreepikApiAuthor; // Verschachteltes Objekt
  premium?: boolean; // Flag für Premium-Status
  // Füge weitere Felder bei Bedarf hinzu (licenses, meta, related, stats etc.)
}

// Angepasstes Interface für die gesamte API-Antwort
interface FreepikApiResponse {
  data: FreepikItem[]; // Ergebnisse sind im 'data'-Array
  meta: FreepikApiMeta; // Meta-Informationen direkt unter 'meta'
}

// Validierungsschema für die Suchanfrage
const searchQuerySchema = z.object({
  q: z.string().min(1),
  page: z.number().optional(),
});

// Konfiguration für die Freepik API
const FREEPIK_API_KEY = process.env.FREEPIK_API_KEY;
const FREEPIK_API_BASE = "https://api.freepik.com/v1";

// Hilfsfunktion zur Validierung des API-Schlüssels
function validateApiKey() {
  if (!FREEPIK_API_KEY) {
    throw new Error("FREEPIK_API_KEY is not configured");
  }
}

// Hilfsfunktion zur Normalisierung der API-Antwort
function normalizeFreepikResponse(apiResponse: FreepikApiResponse) {
  // Stelle sicher, dass apiResponse und apiResponse.data existieren
  const items = apiResponse?.data?.map((item: FreepikItem) => {
    // Prüfen, ob es sich um ein Premium-Asset handelt
    const isPremium = item.premium === true;
    
    return {
      id: String(item.id), // Konvertiere ID zu String für Konsistenz
      type: "photo" as const,
      title: item.title, // Verwende item.title
      thumbnail: item.image?.source?.url, // Verwende item.image.source.url
      url: item.url, // Bleibt gleich (URL zur Freepik-Seite)
      author: item.author?.name, // Bleibt gleich
      premium: isPremium, // Premium-Status weitergeben
    };
  }) || []; // Fallback auf leeres Array, falls data nicht existiert

  // Extrahiere Paginierungsdaten aus apiResponse.meta
  const pagination = apiResponse?.meta ? {
    current: apiResponse.meta.current_page,
    total: apiResponse.meta.last_page, // last_page repräsentiert die Gesamtseitenzahl
    // 'total items' ist apiResponse.meta.total, falls benötigt
  } : undefined;

  return {
    items: items,
    pagination: pagination,
  };
}

// GET /api/freepik/search
export async function GET(request: Request) {
  // Füge einen Log ganz am Anfang der Funktion hinzu
  console.log("--- ENTERING /api/freepik/search GET handler ---");

  try {
    // Log vor validateApiKey
    console.log("Validating API key...");
    validateApiKey();
    console.log("API key validated.");

    // URL-Parameter extrahieren
    console.log("Parsing search parameters...");
    const { searchParams } = new URL(request.url);
    const query = searchQuerySchema.parse({
      q: searchParams.get("q"),
      type: searchParams.get("type"),
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
    });
    console.log("Search parameters parsed:", query);

    // Konstruiere die URL mit dem Suchbegriff
    let fetchUrl = `${FREEPIK_API_BASE}/resources?term=${encodeURIComponent(query.q)}&page=${query.page}`;

    // Füge den Filter für Fotos hinzu
    fetchUrl += '&filters[content_type][photo]=1';

    console.log("Fetching from Freepik API:", fetchUrl); // Log der URL

    const response = await fetch(fetchUrl, {
      headers: {
        "x-freepik-api-key": FREEPIK_API_KEY!,
      },
    });

    // Logge den Status der Freepik-Antwort
    console.log(`Freepik API response status: ${response.status}`);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        `Freepik API error response: ${response.status} ${response.statusText}`,
        errorBody
      );
      throw new Error(`Freepik API error: ${response.statusText}`);
    }

    let rawData: FreepikApiResponse;
    try {
      console.log("Attempting to parse Freepik response body as JSON...");
      rawData = await response.json();
      console.log("Successfully parsed Freepik response JSON:", rawData);
    } catch (jsonError) {
      console.error("Failed to parse Freepik response as JSON:", jsonError);
      // Optional: Versuche, den Body als Text zu lesen, um zu sehen, was drinsteht
      try {
        const textBody = await response.text(); // Erneuter Versuch, Body zu lesen (kann fehlschlagen, wenn schon gelesen)
        console.error("Freepik response body (text):", textBody);
      } catch (textError) {
        console.error("Could not read Freepik response body as text either:", textError);
      }
      throw new Error("Invalid JSON response from Freepik API");
    }

    console.log("Calling normalizeFreepikResponse with raw data...");
    const normalizedData = normalizeFreepikResponse(rawData);
    console.log("Result after normalization:", normalizedData);

    console.log("Returning normalized data via NextResponse...");
    return NextResponse.json(normalizedData);

  } catch (error) {
    // Dieser Catch fängt Fehler aus validateApiKey, fetch, response.ok check, json parsing, normalize
    console.error("Freepik search error (outer catch block):", error);
    return NextResponse.json(
      { error: "FREEPIK_API_ERROR", message: "Failed to search Freepik" },
      { status: 500 }
    );
  }
}