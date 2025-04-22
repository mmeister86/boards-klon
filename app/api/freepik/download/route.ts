import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { v4 as uuidv4 } from 'uuid';
import { optimizeImageWithSharp } from "@/lib/sharp-optimizer";
import sharp from 'sharp';

// Dynamische Route, kein Caching
export const dynamic = 'force-dynamic';

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

// Hilfsfunktion zum Generieren und Hochladen von Vorschaubildern
async function generateAndUploadPreview(
  supabase: ReturnType<typeof createServerClient>,
  originalBuffer: Buffer,
  userId: string,
  baseUuid: string,
  size: number,
  quality: number
): Promise<string | null> {
  const previewFileName = `${userId}/${baseUuid}-preview-${size}.webp`;
  try {
    console.log(`Generating ${size}x${size} preview...`);
    const previewBuffer = await sharp(originalBuffer)
      .resize(size, size, { fit: 'cover' })
      .webp({ quality })
      .toBuffer();

    console.log(`Uploading ${size}x${size} preview to Supabase: ${previewFileName}`);
    const { error: previewUploadError } = await supabase.storage
      .from('previews')
      .upload(previewFileName, previewBuffer, {
        contentType: 'image/webp',
        upsert: true,
      });

    if (previewUploadError) {
      console.error(`Error uploading ${size}x${size} preview:`, previewUploadError);
      return null;
    }

    // Öffentliche URL für die Vorschau abrufen
    const { data: previewUrlData } = supabase.storage
      .from('previews')
      .getPublicUrl(previewFileName);

    console.log(`${size}x${size} preview uploaded successfully.`);
    return previewUrlData.publicUrl || null;

  } catch (error) {
    console.error(`Error generating or uploading ${size}x${size} preview:`, error);
    return null;
  }
}

// POST /api/freepik/download
export async function POST(request: Request) {
  console.log("--- ENTERING /api/freepik/download POST handler ---");
  
  try {
    console.log("Validating API key...");
    validateApiKey();
    console.log("API key validated.");

    console.log("Parsing request body...");
    const body = await request.json();
    const { id } = assetIdSchema.parse(body);
    console.log("Request body parsed, asset ID:", id);

    // Supabase Client mit Server-Kontext erstellen
    const supabase = createServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "SERVER_ERROR", message: "Supabase client could not be initialized" },
        { status: 500 }
      );
    }

    // Authentifizierungsprüfung
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Nutzer muss angemeldet sein
    if (!session) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "Sie müssen angemeldet sein, um Medien herunterzuladen" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log("Authenticated user ID:", userId);

    // Download-URL von Freepik abrufen
    console.log(`Fetching download URL for asset ID ${id}...`);
    const response = await fetch(`${FREEPIK_API_BASE}/resources/${id}/download`, {
      headers: {
        "x-freepik-api-key": FREEPIK_API_KEY!,
      },
    });

    console.log(`Freepik API response status: ${response.status}`);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        `Freepik API error response: ${response.status} ${response.statusText}`,
        errorBody
      );
      
      // Fehlerbehandlung für alle API-Fehler
      return NextResponse.json(
        { 
          error: "API_ERROR", 
          message: `Fehler: ${response.statusText}` 
        }, 
        { status: response.status }
      );
    }

    console.log("Parsing response as JSON...");
    const data = await response.json();
    console.log("Successfully parsed response:", data);

    // Lade das Bild von der Freepik-URL herunter
    console.log("Downloading image from Freepik URL...");
    const imageResponse = await fetch(data.data.url);
    if (!imageResponse.ok) {
      throw new Error("Failed to download image from Freepik");
    }

    // Bestimme den MIME-Typ
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    console.log("Image content type:", contentType);
    
    // Bild in einen Buffer umwandeln
    const imageArrayBuffer = await imageResponse.arrayBuffer();
    const imageBuffer = Buffer.from(imageArrayBuffer);
    const filename = data.data.filename || `freepik-${id}.jpg`;
    const mediaId = uuidv4();
    const bucketName = 'images';
    
    // Bild optimieren
    console.log("Optimizing image with Sharp...");
    const { optimizedBuffer, contentType: optimizedContentType } = 
      await optimizeImageWithSharp(imageBuffer, contentType);
    
    // Optimiertes Bild hochladen
    console.log(`Uploading optimized image to user's storage bucket...`);
    const filePath = `${userId}/${mediaId}.webp`; // Immer .webp für optimierte Bilder
    
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, optimizedBuffer, {
        contentType: optimizedContentType,
        upsert: true,
      });

    if (uploadError) {
      console.error("Error uploading image to storage:", uploadError);
      return NextResponse.json(
        { error: "UPLOAD_ERROR", message: "Fehler beim Hochladen des Bildes" },
        { status: 500 }
      );
    }
    
    // URL zum hochgeladenen Bild abrufen
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    const publicUrl = urlData.publicUrl;
    
    // Vorschaubilder generieren
    console.log("Generating preview images...");
    const previewUrl512 = await generateAndUploadPreview(
      supabase,
      imageBuffer,
      userId,
      mediaId,
      512,
      75
    );
    
    const previewUrl128 = await generateAndUploadPreview(
      supabase,
      imageBuffer,
      userId,
      mediaId,
      128,
      70
    );

    // In die Medienbibliothek des Nutzers einfügen
    const { data: mediaItem, error: dbError } = await supabase
      .from('media_items')
      .insert({
        id: mediaId,
        file_name: filename,
        file_type: optimizedContentType,
        url: publicUrl,
        size: optimizedBuffer.length,
        // Vorschaubilder hinzufügen
        preview_url: null,
        preview_url_512: previewUrl512,
        preview_url_128: previewUrl128,
        // Breite und Höhe können wir aus der Optimierung ableiten
        width: 0, // Wird clientseitig aktualisiert beim Laden
        height: 0, // Wird clientseitig aktualisiert beim Laden
        user_id: userId
      })
      .select()
      .single();

    if (dbError) {
      console.error("Error adding to media_items:", dbError);
      // Trotzdem eine Antwort mit der URL zurückgeben
      return NextResponse.json({
        downloadUrl: publicUrl,
        partialSuccess: true,
        message: "Bild hochgeladen, aber nicht zur Mediathek hinzugefügt"
      });
    }

    console.log("Media successfully added with ID:", mediaId);
    
    // Vollständige Antwort mit Mediendaten und Vorschaubildern
    return NextResponse.json({
      downloadUrl: publicUrl,
      mediaItem: {
        id: mediaItem.id,
        url: mediaItem.url,
        title: mediaItem.file_name,
        type: mediaItem.file_type,
        preview_url_512: mediaItem.preview_url_512,
        preview_url_128: mediaItem.preview_url_128
      }
    });
    
  } catch (error) {
    console.error("Freepik download error:", error);
    return NextResponse.json(
      { error: "SERVER_ERROR", message: "Fehler beim Verarbeiten der Anfrage" },
      { status: 500 }
    );
  }
}