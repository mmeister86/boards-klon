import { NextResponse } from "next/server";
import { z } from "zod";

// Füge 'export const dynamic = 'force-dynamic';' hinzu,
// um das Caching dieser Route zu verhindern und sicherzustellen,
// dass der Handler-Code bei jeder Anfrage ausgeführt wird.
export const dynamic = 'force-dynamic';

// Passe die TypeScript-Interfaces an die tatsächliche API-Antwortstruktur an.

// --- Alte Interfaces (werden angepasst oder ersetzt) ---
// interface FreepikAuthor { ... }
// interface FreepikThumbnail { ... }
// interface FreepikItem { ... }
// interface FreepikPagination { ... }
// interface FreepikApiResponse { ... }

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
  type: z.enum(["photo", "video"]).optional(),
  page: z.number().optional(),
});

// Validierungsschema für die Asset-ID
const assetIdSchema = z.object({
  id: z.string(),
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
  const items = apiResponse?.data?.map((item: FreepikItem) => ({
    id: String(item.id), // Konvertiere ID zu String für Konsistenz
    // Verwende 'item.image.type' falls vorhanden, sonst fallback auf einen Standard oder leeren String
    type: item.image?.type === "photo" || item.image?.type === "vector" ? "photo" : "unknown", // Vorerst nur 'photo' oder 'unknown'
    title: item.title, // Verwende item.title
    thumbnail: item.image?.source?.url, // Verwende item.image.source.url
    url: item.url, // Bleibt gleich (URL zur Freepik-Seite)
    author: item.author?.name, // Bleibt gleich
  })) || []; // Fallback auf leeres Array, falls data nicht existiert

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

    // Entferne den 'type'-Filter vorerst, um die Suche zu testen.
    let fetchUrl = `${FREEPIK_API_BASE}/resources?term=${encodeURIComponent(
      query.q
    )}&page=${query.page}`;

    // Füge den Foto-Filter hinzu, falls der Typ 'photo' ist (später prüfen, ob video geht)
    if (query.type === 'photo') {
      fetchUrl += '&filters[content_type][photo]=1';
    } else if (query.type === 'video') {
      // Aktuell keine klare Doku für Video-Filter via /resources
      // Man könnte versuchen, &filters[content_type][video]=1 zu senden oder den Typ weglassen?
      // Vorerst: Keine Videos filtern, wenn Video ausgewählt ist (könnte alle Typen zurückgeben)
      console.warn("Video type selected, but specific filter is not applied via /resources endpoint.");
      // Optional: Fügen Sie hier einen experimentellen Filter hinzu, falls gewünscht.
      // fetchUrl += '&filters[content_type][video]=1';
    }

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

// POST /api/freepik/download
export async function POST(request: Request) {
  try {
    validateApiKey();

    const body = await request.json();
    const { id } = assetIdSchema.parse(body);

    // Download-URL von Freepik abrufen
    const response = await fetch(`${FREEPIK_API_BASE}/resources/${id}/download`, {
      headers: {
        "x-freepik-api-key": FREEPIK_API_KEY!,
      },
    });

    if (!response.ok) {
      throw new Error(`Freepik API error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json({ downloadUrl: data.url });
  } catch (error) {
    console.error("Freepik download error:", error);
    return NextResponse.json(
      { error: "FREEPIK_API_ERROR", message: "Failed to get download URL" },
      { status: 500 }
    );
  }
}
