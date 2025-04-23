import { NextResponse } from 'next/server';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs/promises'; // Use promises API for async operations
import os from 'os';             // To get temporary directory
import path from 'path';
import { v4 as uuidv4 } from 'uuid'; // For unique temporary filenames
// Import Supabase client
// import { createClient } from '@supabase/supabase-js'; // Entfernt: Server Client verwenden
import { createServerClient } from "@/lib/supabase/server"; // Hinzugefügt: Server Client

// --- Supabase Client Setup ---
// Ensure env variables are loaded (Next.js does this automatically in API routes)
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; // Nicht mehr direkt benötigt
// const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Nicht mehr direkt benötigt

// if (!supabaseUrl || !supabaseServiceKey) { // Prüfung nicht mehr hier nötig
//   console.error('Missing Supabase environment variables');
//   // Optional: throw an error to prevent the route from running without config
//   // throw new Error('Supabase configuration missing');
// }

// Create a single Supabase client instance for the route
// Use service key for elevated privileges (e.g., bypassing RLS for uploads)
// const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!, { // Entfernt: Server Client verwenden
//   auth: {
//     // Required for service role client
//     persistSession: false,
//     autoRefreshToken: false,
//   }
// });
// --- End Supabase Setup ---

// Define the output directory for optimized audios
// Erstellt ein Verzeichnis zum Speichern der optimierten Audiodateien, falls es noch nicht existiert.
const outputDir = path.join(process.cwd(), 'public', 'optimized-audios');

// Ensure the output directory exists (run once on server start)
// Stellt sicher, dass das Ausgabeverzeichnis beim Serverstart erstellt wird.
fs.mkdir(outputDir, { recursive: true }).catch(console.error);

// --- Hinzugefügt: Hilfsfunktion zum Bereinigen von Dateinamen ---
const sanitizeFilename = (filename: string): string => {
  // Umlaute und ß ersetzen
  const umlautMap: { [key: string]: string } = {
    ä: "ae",
    ö: "oe",
    ü: "ue",
    Ä: "Ae",
    Ö: "Oe",
    Ü: "Ue",
    ß: "ss",
  };
  let sanitized = filename;
  for (const key in umlautMap) {
    sanitized = sanitized.replace(new RegExp(key, "g"), umlautMap[key]);
  }

  // Leerzeichen durch Unterstriche ersetzen und ungültige Zeichen entfernen
  // Entfernt alle Zeichen außer Buchstaben, Zahlen, Punkt, Unterstrich, Bindestrich
  return sanitized
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "");
};
// --- Ende Hilfsfunktion ---

// Define the POST handler for the App Router
export async function POST(request: Request) {
  let tempInputPath: string | null = null;
  let localOutputPath: string | null = null;
  const supabase = createServerClient(); // Hinzugefügt: Server Client Instanz

  try {
    // +++ Hinzugefügt: Authentifizierung prüfen +++
    const {
      data: { user },
      error: authError,
    } = await (await supabase).auth.getUser();

    if (authError || !user) {
      console.error("API Route (Audio): Authentication failed.", authError);
      return NextResponse.json(
        { error: "Nicht autorisiert. Bitte melden Sie sich an." },
        { status: 401 }
      );
    }
    const userId = user.id; // Hinzugefügt: userId aus der Session holen
    // +++ Ende Authentifizierung +++

    const formData = await request.formData();
    const file = formData.get('audio'); // Changed from 'video' to 'audio'
    // --- Get userId from FormData --- // Entfernt
    // const userId = formData.get('userId'); // Entfernt

    // Validate the file
    // Überprüft, ob eine gültige Audiodatei hochgeladen wurde.
    if (!file || typeof file === 'string' || !('name' in file) || !('size' in file) || !('type' in file) || file.size === 0) {
      return NextResponse.json(
        { error: 'Invalid or missing audio file.' }, // Updated error message
        { status: 400 }
      );
    }
    // --- Validate userId --- // Entfernt
    // Überprüft, ob eine gültige Benutzer-ID angegeben wurde.
    // if (!userId || typeof userId !== 'string') { // Entfernt
    //   return NextResponse.json( // Entfernt
    //     { error: 'User ID missing or invalid.' }, // Entfernt
    //     { status: 400 } // Bad Request // Entfernt
    //   ); // Entfernt
    // } // Entfernt

    // Basic audio type check (optional, but recommended)
    // Führt eine grundlegende Überprüfung des MIME-Typs durch, um sicherzustellen, dass es sich um eine Audiodatei handelt.
    if (!file.type.startsWith('audio/')) {
        return NextResponse.json(
            { error: 'Invalid file type. Only audio files are accepted.' },
            { status: 400 }
        );
    }

    // Get file content as ArrayBuffer, then convert to Node Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create a unique temporary file path
    // Erstellt einen eindeutigen Pfad für die temporäre Eingabedatei.
    const tempDir = os.tmpdir();
    // Benennt die temporäre Datei eindeutig unter Verwendung von UUID und dem ursprünglichen Dateinamen.
    // Wichtig: Hier den *Originalnamen* für die temporäre Datei verwenden, falls FFmpeg ihn braucht.
    const tempFilename = `${uuidv4()}-${file.name}`;
    tempInputPath = path.join(tempDir, tempFilename);

    // Define output paths based on original filename
    const originalFilename = file.name || 'audio.mp3'; // Default filename if needed
    const fileExt = path.extname(originalFilename);
    const fileNameWithoutExt = path.basename(originalFilename, fileExt);

    // --- Hinzugefügt: Dateinamen vor Verwendung bereinigen ---
    const sanitizedFileNameWithoutExt = sanitizeFilename(fileNameWithoutExt);
    // --- Ende Bereinigung ---

    // Use a unique name for the output file as well
    // Verwende den bereinigten Namen für die Ausgabedatei
    const outputFilename = `${uuidv4()}-${sanitizedFileNameWithoutExt}_optimized.aac`; // Output as AAC
    localOutputPath = path.join(outputDir, outputFilename);

    // Write temp input file
    // Schreibt den Inhalt der hochgeladenen Datei in die temporäre Eingabedatei.
    await fs.writeFile(tempInputPath, buffer);
    console.log(`Temporary input audio file created at: ${tempInputPath}`);

    console.log(`Optimizing audio for user: ${userId}`);
    console.log(`Local output path: ${localOutputPath}`);

    // --- FFmpeg Processing (Audio Compression) ---
    // Verwendet FFmpeg, um die Audiodatei zu komprimieren.
    await new Promise<void>((resolve, reject) => {
      ffmpeg(tempInputPath as string)
        .audioCodec('aac')       // Use AAC codec for good quality and compatibility
        .audioBitrate('128k')    // Set audio bitrate to 128kbps
        .outputOptions('-strict', '-2') // Necessary for some AAC encoding versions
        .on('start', (cmd) => console.log('FFmpeg started (audio compress):', cmd))
        .on('progress', (p) => console.log(`Processing: ${p.percent ? Math.floor(p.percent) : 'N/A'}% done`))
        .on('end', () => {
          console.log('FFmpeg audio compression finished successfully.');
          resolve();
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err.message);
          reject(new Error(`FFmpeg audio compression failed: ${err.message}`)); // Updated error message
        })
        .save(localOutputPath as string);
    });

    // --- Upload Optimized File to Supabase Storage ---
    if (!localOutputPath) {
      throw new Error('Internal error: Local output path was not set.');
    }
    console.log(`Reading compressed audio file from: ${localOutputPath}`);
    const optimizedFileBuffer = await fs.readFile(localOutputPath);

    // --- Use userId in storage path ---
    // Definiert den Speicherpfad in Supabase Storage, einschließlich der Benutzer-ID.
    const storagePath = `${userId}/${outputFilename}`; // Store in folder named after userId (aus Session)
    console.log(`Uploading compressed audio file to Supabase Storage at: audio/${storagePath}`); // Changed bucket to 'audio'

    // Lädt die komprimierte Audiodatei in den 'audio'-Bucket von Supabase Storage hoch.
    // Verwende den Server Client
    const { data: uploadData, error: uploadError } = await (await supabase).storage // Geändert: supabase statt supabaseAdmin
      .from('audio') // Changed bucket name to 'audio'
      .upload(storagePath, optimizedFileBuffer, {
        contentType: 'audio/aac', // Set content type explicitly for AAC
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase Storage upload error:', uploadError);
      throw new Error(`Failed to upload optimized audio to storage: ${uploadError.message}`); // Updated error message
    }

    console.log('Successfully uploaded audio to Supabase Storage:', uploadData);

    // --- Get Public URL from Supabase ---
    // Ruft die öffentliche URL der hochgeladenen Audiodatei von Supabase ab.
    console.log(`Attempting to get public URL for path: ${storagePath}`);
    // Verwende den Server Client
    const { data: urlData } = (await supabase).storage // Geändert: supabase statt supabaseAdmin
      .from('audio') // Changed bucket name to 'audio'
      .getPublicUrl(storagePath);
    console.log("getPublicUrl data:", JSON.stringify(urlData, null, 2));

    // Stricter check - check if data exists and publicUrl is non-empty
    // Überprüft, ob die öffentliche URL erfolgreich abgerufen wurde.
    if (!urlData || !urlData.publicUrl) {
       console.error('Failed to get public URL from Supabase Storage. Data:', urlData);
       // Throw specific error to be caught below
       throw new Error(`Could not get public URL for audio. Path: ${storagePath}. Check bucket permissions/path validity.`); // Updated error message
    }

    const supabasePublicUrl = urlData.publicUrl;
    console.log(`Supabase Public URL for audio successfully retrieved: ${supabasePublicUrl}`);

    // --- Explicit Success Return ---
    // If we reach here, everything succeeded.
    // Gibt eine Erfolgsmeldung und die öffentliche URL der Audiodatei zurück.
    return NextResponse.json({
      message: 'Audio compressed and uploaded successfully!', // Updated success message
      storageUrl: supabasePublicUrl // Ensure this key is sent ONLY on full success
    });

  } catch (error: unknown) {
    // --- Centralized Error Handling ---
    // Fängt alle Fehler ab, die während der Verarbeitung auftreten.
    let errorMessage = 'Internal Server Error';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
      console.error('[API Route Error - Audio]:', error.stack); // Added context
      // Refine status codes based on error messages
      if (errorMessage.includes('Invalid or missing') || errorMessage.includes('User ID missing') || errorMessage.includes('Invalid file type')) statusCode = 400; // Updated checks
      else if (errorMessage.includes('FFmpeg')) statusCode = 500;
      else if (errorMessage.includes('Failed to upload')) statusCode = 500;
      else if (errorMessage.includes('Could not get public URL')) statusCode = 500; // Explicitly handle URL error
      // Add more specific checks if needed
    } else {
      console.error('[API Route Unknown Error - Audio]:', error); // Added context
      errorMessage = 'An unknown error occurred during audio processing'; // Updated error message
    }

    // ALWAYS return the error structure from the catch block
    // Gibt eine standardisierte Fehlermeldung zurück.
    return NextResponse.json({ error: errorMessage }, { status: statusCode });

  } finally {
    // --- Cleanup: Delete temporary files ---
    // Löscht die temporäre Eingabe- und Ausgabedatei, unabhängig davon, ob ein Fehler aufgetreten ist oder nicht.
    if (tempInputPath) {
      fs.unlink(tempInputPath).then(() => console.log(`Deleted temp input audio: ${tempInputPath}`)).catch(err => console.error(`Error deleting ${tempInputPath}:`, err));
    }
    if (localOutputPath) {
      fs.unlink(localOutputPath).then(() => console.log(`Deleted local output audio: ${localOutputPath}`)).catch(err => console.error(`Error deleting ${localOutputPath}:`, err));
    }
  }
}
