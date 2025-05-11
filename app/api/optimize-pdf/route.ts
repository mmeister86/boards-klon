import { NextResponse } from 'next/server';
// import { compress } from 'compress-pdf'; // Entfernt, da wir Ghostscript direkt aufrufen
import fs from 'fs/promises'; // Use promises API for async operations
import os from 'os';             // To get temporary directory
import path from 'path';
import { v4 as uuidv4 } from 'uuid'; // For unique temporary filenames
// Import Supabase client
// import { createClient } from '@supabase/supabase-js'; // Entfernt: Server Client verwenden
import { createServerClient } from "@/lib/supabase/server"; // Hinzugefügt: Server Client

// --- Supabase Client Setup ---
// Stellt sicher, dass Umgebungsvariablen geladen sind
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; // Nicht mehr direkt benötigt
// const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Nicht mehr direkt benötigt

// if (!supabaseUrl || !supabaseServiceKey) { // Prüfung nicht mehr hier nötig
//   console.error('Fehlende Supabase-Umgebungsvariablen');
//   // Optional: Fehler auslösen, um zu verhindern, dass die Route ohne Konfiguration ausgeführt wird
//   // throw new Error('Supabase-Konfiguration fehlt');
// }

// Erstellt eine einzelne Supabase-Client-Instanz für die Route
// Verwendet den Service Key für erhöhte Berechtigungen (z. B. Umgehung von RLS für Uploads)
// const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!, { // Entfernt: Server Client verwenden
//   auth: {
//     // Erforderlich für den Service Role Client
//     persistSession: false,
//     autoRefreshToken: false,
//   }
// });
// --- Ende Supabase Setup ---

// Definiert das Ausgabeverzeichnis für optimierte PDFs
// Erstellt ein Verzeichnis zum Speichern der optimierten PDF-Dateien, falls es noch nicht existiert.
const outputDir = path.join(process.cwd(), 'public', 'optimized-pdfs');

// Stellt sicher, dass das Ausgabeverzeichnis existiert (einmal beim Serverstart ausführen)
// Stellt sicher, dass das Ausgabeverzeichnis beim Serverstart erstellt wird.
fs.mkdir(outputDir, { recursive: true }).catch(console.error);

// --- Hilfsfunktion zum Bereinigen von Dateinamen (kopiert von video-block.tsx) ---
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
  return sanitized
    .replace(/\s+/g, "_") // Ersetzt ein oder mehrere Leerzeichen durch einen Unterstrich
    .replace(/[^a-zA-Z0-9._-]/g, ""); // Entfernt alle Zeichen außer Buchstaben, Zahlen, Punkt, Unterstrich, Bindestrich
};

// --- Hilfsfunktion: Ghostscript-Pfad dynamisch bestimmen ---
/**
 * Liefert den Pfad zum Ghostscript-Binary.
 * - Nutzt zuerst die Umgebungsvariable GHOSTSCRIPT_PATH, falls gesetzt.
 * - Sonst versucht es 'gs' (muss im PATH liegen, Standard auf Servern).
 * - Optional: Fallback auf bekannte Pfade (z.B. Mac Homebrew, Linux).
 *
 * So bleibt der Code portabel und funktioniert in verschiedenen Umgebungen.
 */
function getGhostscriptPath(): string {
  // 1. Umgebungsvariable (z.B. für Produktion konfigurierbar)
  if (process.env.GHOSTSCRIPT_PATH) {
    return process.env.GHOSTSCRIPT_PATH;
  }
  // 2. Standard: Nur 'gs' (funktioniert, wenn im PATH)
  return 'gs';
  // 3. (Optional) Weitere Fallbacks könnten ergänzt werden:
  // return fs.existsSync('/usr/bin/gs') ? '/usr/bin/gs' : 'gs';
}

// Definiert den POST-Handler für den App Router
export async function POST(request: Request) {
  let tempInputPath: string | null = null;
  let localOutputPath: string | null = null; // Define local output path variable
  let tempGsOutputPath: string | null = null; // Deklariere tempGsOutputPath außerhalb des try-blocks
  let tempPngOutputPath: string | null = null; // Hinzugefügt: Pfad für temporäre PNG-Vorschau
  const supabase = await createServerClient(); // Hinzugefügt: Server Client Instanz

  try {
    // +++ Hinzugefügt: Authentifizierung prüfen +++
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("API Route (PDF): Authentication failed.", authError);
      return NextResponse.json(
        { error: "Nicht autorisiert. Bitte melden Sie sich an." },
        { status: 401 }
      );
    }
    const userId = user.id; // Hinzugefügt: userId aus der Session holen
    // +++ Ende Authentifizierung +++

    const formData = await request.formData();
    const file = formData.get('pdf'); // Erwartet ein 'pdf'-Feld
    // --- Holt die userId aus FormData --- // Entfernt
    // const userId = formData.get('userId'); // Entfernt

    // Validiert die Datei
    // Überprüft, ob eine gültige PDF-Datei hochgeladen wurde.
    if (!file || typeof file === 'string' || !('name' in file) || !('size' in file) || !('type' in file) || file.size === 0) {
      return NextResponse.json(
        { error: 'Ungültige oder fehlende PDF-Datei.' }, // Angepasste Fehlermeldung
        { status: 400 }
      );
    }
    // --- Validiert die userId --- // Entfernt
    // Überprüft, ob eine gültige Benutzer-ID angegeben wurde.
    // if (!userId || typeof userId !== 'string') { // Entfernt
    //   return NextResponse.json( // Entfernt
    //     { error: 'Benutzer-ID fehlt oder ist ungültig.' }, // Entfernt
    //     { status: 400 } // Bad Request // Entfernt
    //   ); // Entfernt
    // } // Entfernt

    // Grundlegende PDF-Typ-Überprüfung
    // Führt eine Überprüfung des MIME-Typs durch, um sicherzustellen, dass es sich um eine PDF-Datei handelt.
    if (file.type !== 'application/pdf') {
        return NextResponse.json(
            { error: 'Ungültiger Dateityp. Nur PDF-Dateien werden akzeptiert.' },
            { status: 400 }
        );
    }

    // Holt den Dateiinhalt als ArrayBuffer und konvertiert ihn dann in einen Node Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Erstellt einen eindeutigen temporären Dateipfad
    // Erstellt einen eindeutigen Pfad für die temporäre Eingabedatei.
    const tempDir = os.tmpdir();
    // Benennt die temporäre Datei eindeutig unter Verwendung von UUID und dem ursprünglichen Dateinamen.
    const tempFilename = `${uuidv4()}-${file.name}`;
    tempInputPath = path.join(tempDir, tempFilename);

    // Definiert Ausgabepfade basierend auf dem ursprünglichen Dateinamen
    const originalFilename = file.name || 'document.pdf'; // Standard-Dateiname, falls erforderlich
    const fileExt = path.extname(originalFilename);
    const fileNameWithoutExt = path.basename(originalFilename, fileExt);

    // *** Bereinige den Dateinamen OHNE Erweiterung ***
    const sanitizedFileNameWithoutExt = sanitizeFilename(fileNameWithoutExt);

    // Verwendet auch für die Ausgabedatei einen eindeutigen Namen, um mögliche lokale Konflikte bei gleichzeitiger Verarbeitung zu vermeiden
    // Erstellt einen eindeutigen Namen für die Ausgabedatei MIT dem bereinigten Namen
    const outputFilename = `${uuidv4()}-${sanitizedFileNameWithoutExt}_optimized${fileExt}`; // Füge die Original-Erweiterung wieder hinzu
    localOutputPath = path.join(outputDir, outputFilename); // Pfad für die lokale Ausgabe

    // Schreibt die temporäre Eingabedatei
    // Schreibt den Inhalt der hochgeladenen Datei in die temporäre Eingabedatei.
    await fs.writeFile(tempInputPath, buffer);
    console.log(`Temporäre Eingabe-PDF-Datei erstellt unter: ${tempInputPath}`);

    console.log(`Optimiere PDF für Benutzer: ${userId}`);
    console.log(`Lokaler Ausgabepfad: ${localOutputPath}`);

    // --- PDF-Komprimierung mit Ghostscript direkt über child_process ---
    // Da compress-pdf die Optionen nicht zuverlässig übernimmt, rufen wir gs direkt auf.
    const { spawn } = await import('child_process');
    // Weise den Wert innerhalb des try-blocks zu
    tempGsOutputPath = path.join(os.tmpdir(), `${uuidv4()}_gsoutput.pdf`); // Temporäre Ausgabedatei für Ghostscript

    console.log(`Komprimiere PDF direkt mit Ghostscript: Input=${tempInputPath}, Output=${tempGsOutputPath}`);

    // Definiere die Argumente für Ghostscript
    const gsArgs = [
      '-q',                          // Quiet mode
      '-dNOPAUSE',                   // No pausing after each page
      '-dBATCH',                     // Exit after processing
      '-dSAFER',                     // Safer mode
      '-sDEVICE=pdfwrite',           // Output device
      '-dCompatibilityLevel=1.4',    // PDF compatibility level
      '-dPDFSETTINGS=/screen',       // *** Verwende /screen für bessere Kompatibilität ***
      '-dEmbedAllFonts=true',
      '-dSubsetFonts=true',
      '-dAutoRotatePages=/None',
      // Behalte vorerst die Bild-Downsampling-Optionen, auch wenn es Text ist
      '-dColorImageDownsampleType=/Bicubic',
      '-dColorImageResolution=100',
      '-dGrayImageDownsampleType=/Bicubic',
      '-dGrayImageResolution=100',
      '-dMonoImageDownsampleType=/Bicubic',
      '-dMonoImageResolution=100',
      `-sOutputFile=${tempGsOutputPath}`, // Ghostscript-Ausgabedatei
      '-sOwnerPassword=',
      '-sUserPassword=',
      tempInputPath                 // Eingabedatei
    ];

    // Führe Ghostscript aus und warte auf das Ergebnis
    await new Promise<void>((resolve, reject) => {
      // Nutze dynamisch ermittelten Ghostscript-Pfad
      const gsProcess = spawn(getGhostscriptPath(), gsArgs); // <-- Dynamisch statt hartkodiert

      let stdErrOutput = '';
      gsProcess.stderr.on('data', (data) => {
        stdErrOutput += data.toString();
        console.error(`Ghostscript stderr: ${data}`);
      });

      gsProcess.on('error', (error) => {
        console.error('Failed to start Ghostscript process.', error);
        reject(new Error(`Failed to start Ghostscript: ${error.message}`));
      });

      gsProcess.on('close', (code) => {
        if (code === 0) {
          console.log('Ghostscript-Prozess erfolgreich abgeschlossen.');
          resolve();
        } else {
          console.error(`Ghostscript process exited with code ${code}.`);
          console.error('Ghostscript stderr details:\n', stdErrOutput);
          reject(new Error(`Ghostscript failed with exit code ${code}. stderr: ${stdErrOutput}`));
        }
      });
    });

    // Lese die von Ghostscript erstellte Ausgabedatei
    const compressedBuffer = await fs.readFile(tempGsOutputPath);
    console.log(`Komprimierte PDF erfolgreich von ${tempGsOutputPath} gelesen.`);

    // --- Generiere PNG-Vorschau der ersten Seite ---
    tempPngOutputPath = path.join(os.tmpdir(), `${uuidv4()}_preview.png`);
    console.log(`Generiere PNG-Vorschau für ${tempInputPath} nach ${tempPngOutputPath}`);

    const gsPreviewArgs = [
        '-q',
        '-dNOPAUSE',
        '-dBATCH',
        '-dSAFER',
        '-sDEVICE=pngalpha',         // PNG-Ausgabe mit Transparenz
        '-r150',                   // Auflösung (150 DPI)
        '-dFirstPage=1',           // Nur die erste Seite
        '-dLastPage=1',            // Nur die erste Seite
        `-sOutputFile=${tempPngOutputPath}`, // PNG-Ausgabedatei
        tempInputPath              // Original-PDF als Input verwenden
    ];

    await new Promise<void>((resolve, reject) => {
        // Nutze auch hier dynamisch ermittelten Ghostscript-Pfad
        const gsPreviewProcess = spawn(getGhostscriptPath(), gsPreviewArgs); // <-- Dynamisch statt hartkodiert
        let previewStdErr = '';
        gsPreviewProcess.stderr.on('data', (data) => { previewStdErr += data.toString(); });
        gsPreviewProcess.on('error', (error) => {
            console.error('Failed to start Ghostscript for preview.', error);
            reject(new Error(`Failed to start Ghostscript for preview: ${error.message}`));
        });
        gsPreviewProcess.on('close', (code) => {
            if (code === 0) {
                console.log('Ghostscript PNG preview generation successful.');
                resolve();
            } else {
                console.error(`Ghostscript preview process exited with code ${code}.`);
                console.error('Ghostscript preview stderr details:\n', previewStdErr);
                // Fahre fort, aber ohne Vorschau-URL
                console.warn('Could not generate preview image.');
                tempPngOutputPath = null; // Stelle sicher, dass keine Vorschau hochgeladen wird
                resolve(); // Nicht ablehnen, Upload der PDF soll trotzdem erfolgen
            }
        });
    });

    let previewUrl: string | null = null;
    // --- Lade Vorschau-PNG hoch, falls erfolgreich generiert ---
    if (tempPngOutputPath) {
        try {
            const previewBuffer = await fs.readFile(tempPngOutputPath);
            const previewFilename = `${path.basename(outputFilename, '.pdf')}_preview.png`; // z.B. uuid-basename_optimized_preview.png
            const previewStoragePath = `${userId}/${previewFilename}`; // userId aus Session verwenden

            console.log(`Lade PNG-Vorschau hoch nach: previews/${previewStoragePath}`);

            // Lade Vorschau hoch, ignoriere das zurückgegebene Datenobjekt
            // Verwende den Server Client (kein Admin Client mehr)
            const { error: previewUploadError } = await supabase.storage // Geändert: supabase statt supabaseAdmin
                .from('previews') // Annahme: 'previews' Bucket existiert!
                .upload(previewStoragePath, previewBuffer, {
                    contentType: 'image/png',
                    upsert: false,
                });

            if (previewUploadError) {
                throw previewUploadError; // Wird im äußeren Catch behandelt
            }

            // Hole öffentliche URL für die Vorschau
            // Verwende den Server Client
            const { data: previewUrlData } = supabase.storage // Geändert: supabase statt supabaseAdmin
                .from('previews')
                .getPublicUrl(previewStoragePath);

            if (!previewUrlData || !previewUrlData.publicUrl) {
                console.error('Failed to get public URL for preview from Supabase Storage.');
                // Fahre fort ohne previewUrl
            } else {
                previewUrl = previewUrlData.publicUrl;
                console.log(`Supabase Public URL for preview: ${previewUrl}`);
            }

        } catch (previewError) {
            console.error('Error uploading or getting URL for preview image:', previewError);
            // Fahre ohne Vorschau fort
            previewUrl = null;
        }
    }

    // Schreibt den komprimierten Buffer in die *endgültige* lokale Ausgabedatei (optional, aber behält die Struktur bei)
    await fs.writeFile(localOutputPath, compressedBuffer);
    console.log(`Komprimierte PDF-Datei geschrieben nach: ${localOutputPath}`);

    // --- Lädt die optimierte Datei in Supabase Storage hoch ---
    if (!localOutputPath) {
      throw new Error('Interner Fehler: Lokaler Ausgabepfad wurde nicht festgelegt.');
    }
    console.log(`Lese komprimierte PDF-Datei von: ${localOutputPath}`);
    // Lese die gerade geschriebene Datei erneut, um sie hochzuladen
    const optimizedFileBuffer = await fs.readFile(localOutputPath);

    // --- Verwendet userId im Speicherpfad ---
    // Definiert den Speicherpfad in Supabase Storage, einschließlich der Benutzer-ID.
    const storagePath = `${userId}/${outputFilename}`; // Speichert im Ordner mit dem Namen der userId (aus Session)
    console.log(`Lade komprimierte PDF-Datei in Supabase Storage hoch unter: documents/${storagePath}`); // Bucket auf 'documents' geändert

    // Lädt die komprimierte PDF-Datei in den 'documents'-Bucket von Supabase Storage hoch.
    // Verwende den Server Client
    const { data: uploadData, error: uploadError } = await supabase.storage // Geändert: supabase statt supabaseAdmin
      .from('documents') // Bucket-Name auf 'documents' geändert
      .upload(storagePath, optimizedFileBuffer, {
        contentType: 'application/pdf', // Inhaltstyp explizit für PDF festlegen
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase Storage Upload-Fehler:', uploadError);
      throw new Error(`Fehler beim Hochladen der optimierten PDF in den Speicher: ${uploadError.message}`); // Angepasste Fehlermeldung
    }

    console.log('PDF erfolgreich in Supabase Storage hochgeladen:', uploadData);

    // --- Holt die öffentliche URL von Supabase ---
    // Ruft die öffentliche URL der hochgeladenen PDF-Datei von Supabase ab.
    console.log(`Versuche, öffentliche URL für Pfad abzurufen: ${storagePath}`);
    // Verwende den Server Client
    const { data: urlData } = supabase.storage // Geändert: supabase statt supabaseAdmin
      .from('documents') // Bucket-Name auf 'documents' geändert
      .getPublicUrl(storagePath);
    console.log("getPublicUrl Daten:", JSON.stringify(urlData, null, 2));

    // Striktere Prüfung - prüft, ob Daten vorhanden sind und publicUrl nicht leer ist
    // Überprüft, ob die öffentliche URL erfolgreich abgerufen wurde.
    if (!urlData || !urlData.publicUrl) {
       console.error('Fehler beim Abrufen der öffentlichen URL von Supabase Storage. Daten:', urlData);
       // Spezifischen Fehler auslösen, der unten abgefangen wird
       throw new Error(`Konnte öffentliche URL für PDF nicht abrufen. Pfad: ${storagePath}. Überprüfen Sie die Bucket-Berechtigungen/Pfadgültigkeit.`); // Angepasste Fehlermeldung
    }

    const supabasePublicUrl = urlData.publicUrl;
    console.log(`Supabase Public URL für PDF erfolgreich abgerufen: ${supabasePublicUrl}`);

    // --- Explizite Erfolgsrückgabe ---
    // Wenn wir hier ankommen, war alles erfolgreich.
    // Gibt eine Erfolgsmeldung und die URLs zurück.
    // Nach dem Upload: Lege einen Eintrag in der media_items-Tabelle an, damit das PDF in Mediathek und Sidebar erscheint
    // Die wichtigsten Felder: user_id, file_name, file_type, url, size, uploaded_at, preview_url_512, preview_url_128
    // --- Entfernt: Nach dem Upload keinen Eintrag mehr in media_items anlegen ---
    // const { error: dbError } = await supabase
    //   .from('media_items')
    //   .insert([
    //     {
    //       user_id: userId,
    //       file_name: file.name,
    //       file_type: file.type,
    //       url: supabasePublicUrl,
    //       size: file.size,
    //       uploaded_at: new Date().toISOString(),
    //       preview_url_512: previewUrl,
    //       preview_url_128: null,
    //     }
    //   ]);
    // if (dbError) {
    //   console.error('Fehler beim Einfügen in media_items:', dbError);
    //   // Optional: Fehlerbehandlung, aber PDF ist trotzdem im Storage
    // }
    return NextResponse.json({
      message: 'PDF erfolgreich komprimiert und hochgeladen!',
      storageUrl: supabasePublicUrl, // URL der optimierten PDF
      previewUrl: previewUrl       // URL der PNG-Vorschau (kann null sein)
    });

  } catch (error: unknown) {
    // --- Zentralisierte Fehlerbehandlung ---
    // Fängt alle Fehler ab, die während der Verarbeitung auftreten.
    let errorMessage = 'Internal Server Error';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
      console.error('[API Route Error - PDF]:', error.stack); // Kontext hinzugefügt
      // Statuscodes basierend auf Fehlermeldungen verfeinern
      if (errorMessage.includes('Ungültige oder fehlende') || errorMessage.includes('Benutzer-ID fehlt') || errorMessage.includes('Ungültiger Dateityp')) statusCode = 400; // Prüfungen angepasst
      else if (errorMessage.includes('compress-pdf') || errorMessage.includes('Ghostscript')) statusCode = 500; // Fehler bei der Komprimierung
      else if (errorMessage.includes('Fehler beim Hochladen')) statusCode = 500;
      else if (errorMessage.includes('Konnte öffentliche URL nicht abrufen')) statusCode = 500; // Explizite Behandlung von URL-Fehlern
      // Bei Bedarf spezifischere Prüfungen hinzufügen
    } else {
      console.error('[API Route Unknown Error - PDF]:', error); // Kontext hinzugefügt
      errorMessage = 'Ein unbekannter Fehler ist während der PDF-Verarbeitung aufgetreten'; // Angepasste Fehlermeldung
    }

    // IMMER die Fehlerstruktur aus dem Catch-Block zurückgeben
    // Gibt eine standardisierte Fehlermeldung zurück.
    return NextResponse.json({ error: errorMessage }, { status: statusCode });

  } finally {
    // --- Bereinigung: Löscht temporäre Dateien ---
    // Löscht die temporäre Eingabe- und Ausgabedatei, unabhängig davon, ob ein Fehler aufgetreten ist oder nicht.
    if (tempInputPath) {
      fs.unlink(tempInputPath).then(() => console.log(`Gelöschte temporäre Eingabe-PDF: ${tempInputPath}`)).catch(err => console.error(`Fehler beim Löschen von ${tempInputPath}:`, err));
    }
    // Lösche die *endgültige* lokale Ausgabedatei
    if (localOutputPath) {
        fs.unlink(localOutputPath).then(() => console.log(`Gelöschte lokale Ausgabe-PDF: ${localOutputPath}`)).catch(err => console.error(`Fehler beim Löschen von ${localOutputPath}:`, err));
    }
    // Lösche die temporäre Ghostscript-Ausgabedatei (PDF)
    if (tempGsOutputPath) {
        fs.unlink(tempGsOutputPath).catch(err => console.error(`Fehler beim Löschen von ${tempGsOutputPath}:`, err));
    }
    // Hinzugefügt: Lösche die temporäre PNG-Ausgabedatei
    if (tempPngOutputPath) {
        fs.unlink(tempPngOutputPath).catch(err => console.error(`Fehler beim Löschen von ${tempPngOutputPath}:`, err));
    }
  }
}
