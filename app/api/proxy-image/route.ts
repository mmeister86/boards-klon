// Next.js App Router: Proxy-API-Endpoint für Bilder
// Erlaubt das serverseitige Laden beliebiger Bild-URLs, um CORS/Hotlinking-Probleme zu umgehen
// Query-Parameter: ?url=https://example.com/bild.jpg

import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  // 1. Bild-URL aus Query lesen
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');
  if (!url) {
    return new Response(JSON.stringify({ error: 'Fehlender oder ungültiger url-Parameter.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // 2. Serverseitig Bild laden (fetch ist im App Router nativ verfügbar)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Lemonspace-ImageProxy/1.0)',
        'Accept': 'image/*,*/*;q=0.8',
        'Referer': url,
      },
      redirect: 'follow',
    });

    // 3. Prüfen, ob ein Bild geliefert wird
    const contentType = response.headers.get('content-type') || '';
    if (!response.ok || !contentType.startsWith('image/')) {
      return new Response(
        JSON.stringify({
          error: `Die angeforderte Ressource ist kein Bild (Content-Type: ${contentType || 'unbekannt'})`,
          status: response.status,
        }),
        {
          status: 422,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 4. Bilddaten streamen
    // Optional: Cache-Control setzen
    return new Response(response.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    // Fehler beim Laden oder Weiterleiten
    return new Response(JSON.stringify({ error: 'Fehler beim Laden des Bildes über den Proxy.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
