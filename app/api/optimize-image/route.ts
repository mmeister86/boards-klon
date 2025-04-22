import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
// import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
// Importiere die neue Sharp-Optimierungsfunktion
import { optimizeImageWithSharp } from "@/lib/sharp-optimizer";
// Importiere sharp direkt für die Vorschau-Generierung
import sharp from 'sharp';

// Definiere die erwartete Struktur einer erfolgreichen Antwort
// Füge optionale Felder für Vorschau-URLs hinzu
interface SuccessResponse {
  message: string;
  publicUrl: string;
  previewUrl512?: string | null; // Optional: URL für 512px Vorschau
  previewUrl128?: string | null; // Optional: URL für 128px Vorschau
}

// Definiere die erwartete Struktur einer Fehlerantwort
interface ErrorResponse {
  error: string;
}

// Hilfsfunktion zum sicheren Generieren und Hochladen von Vorschauen
async function generateAndUploadPreview(
  supabase: ReturnType<typeof createServerClient>, // Typ für Supabase Client
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
      .resize(size, size, { fit: 'cover' }) // Größe anpassen, Seitenverhältnis beibehalten, ggf. zuschneiden
      .webp({ quality }) // In WebP konvertieren mit angegebener Qualität
      .toBuffer();

    console.log(`Uploading ${size}x${size} preview to Supabase: ${previewFileName}`);
    const { error: previewUploadError } = await (await supabase).storage
      .from('previews') // In den 'previews'-Bucket hochladen
      .upload(previewFileName, previewBuffer, {
        contentType: 'image/webp',
        upsert: false,
      });

    if (previewUploadError) {
      console.error(`Error uploading ${size}x${size} preview:`, previewUploadError);
      return null; // Fehler loggen, aber nicht den gesamten Prozess abbrechen
    }

    // Öffentliche URL für die Vorschau abrufen
    const { data: previewUrlData } = (await supabase).storage
      .from('previews')
      .getPublicUrl(previewFileName);

    console.log(`${size}x${size} preview uploaded successfully. URL: ${previewUrlData.publicUrl}`);
    return previewUrlData.publicUrl || null;

  } catch (error) {
    console.error(`Error generating or uploading ${size}x${size} preview:`, error);
    return null; // Fehler loggen, null zurückgeben
  }
}

// POST-Handler für die Bildoptimierungs-API-Route
export async function POST(
  request: NextRequest
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
//   const cookieStore = cookies();
  // Erstellt einen Supabase-Client für Server-seitige Operationen
  const supabase = createServerClient();

  try {
    // 1. Authentifizierung prüfen
    const {
      data: { user },
      error: authError,
    } = await (await supabase).auth.getUser();

    if (authError || !user) {
      console.error("API Route: Authentication failed.", authError);
      return NextResponse.json(
        { error: "Nicht autorisiert. Bitte melden Sie sich an." },
        { status: 401 }
      );
    }

    // 2. Datei aus FormData extrahieren
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Keine Datei im Upload gefunden." },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Ungültiger Dateityp. Nur Bilder sind erlaubt." },
        { status: 400 }
      );
    }

    // 3. Datei in Buffer umwandeln
    const originalFileBuffer = Buffer.from(await file.arrayBuffer());

    // 4. Bild mit Sharp optimieren
    const { optimizedBuffer, contentType: optimizedContentType } =
      await optimizeImageWithSharp(originalFileBuffer, file.type);

    // 5. Eindeutigen Dateinamen für das Hauptbild generieren
    // Da der Pfad nur die UUID verwendet, ist die Bereinigung des Namens hier nicht nötig.
    // const originalFilename = file.name || 'image.webp';
    // const fileExt = path.extname(originalFilename);
    // const fileNameWithoutExt = path.basename(originalFilename, fileExt);
    // const sanitizedFileNameWithoutExt = sanitizeFilename(fileNameWithoutExt);

    const fileUuid = uuidv4(); // Generiere die UUID einmal
    const uniqueFileName = `${user.id}/${fileUuid}.webp`;

    // 6. Optimierte Hauptdatei in Supabase Storage hochladen
    console.log(
      `Uploading optimized image to Supabase storage at path: ${uniqueFileName} with contentType: ${optimizedContentType}`
    );
    const { data: uploadData, error: uploadError } = await (await supabase).storage
      .from("images")
      .upload(uniqueFileName, optimizedBuffer, {
        contentType: optimizedContentType,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase storage upload error:", uploadError);
      throw new Error(
        `Fehler beim Hochladen des optimierten Bildes: ${uploadError.message}`
      );
    }

    // 7. Öffentliche URL des Hauptbildes von Supabase abrufen
    const {
      data: { publicUrl },
    } = (await supabase).storage.from("images").getPublicUrl(uploadData.path);

    if (!publicUrl) {
      console.error("Failed to get public URL from Supabase for:", uploadData.path);
      // Hier könnten wir versuchen, die bereits hochgeladene Datei wieder zu löschen
      await (await supabase).storage.from("images").remove([uploadData.path]);
      throw new Error("Konnte die öffentliche URL für das Hauptbild nicht abrufen.");
    }

    console.log("Main image optimized and uploaded successfully:", publicUrl);

    // --- NEU: Vorschauen generieren und hochladen ---
    // Verwende den *originalen* Buffer für die Vorschau-Generierung
    const previewUrl512 = await generateAndUploadPreview(
        supabase,
        originalFileBuffer,
        user.id,
        fileUuid, // Verwende dieselbe Basis-UUID
        512,
        75 // Qualität für 512px Vorschau
    );
    const previewUrl128 = await generateAndUploadPreview(
        supabase,
        originalFileBuffer,
        user.id,
        fileUuid, // Verwende dieselbe Basis-UUID
        128,
        70 // Qualität für 128px Vorschau
    );
    // --- Ende Vorschau-Generierung ---

    // 8. Erfolgreiche Antwort mit allen URLs zurückgeben
    return NextResponse.json({
      message: "Bild erfolgreich optimiert und hochgeladen",
      publicUrl: publicUrl,
      previewUrl512: previewUrl512, // Füge die 512px Vorschau-URL hinzu (kann null sein)
      previewUrl128: previewUrl128, // Füge die 128px Vorschau-URL hinzu (kann null sein)
    });
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Interner Serverfehler.",
      },
      { status: 500 }
    );
  }
}
