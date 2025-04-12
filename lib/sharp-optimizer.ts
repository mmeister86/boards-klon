import sharp from 'sharp';

// Definiert die Struktur des Rückgabeobjekts für die Optimierungsfunktion
interface OptimizeResult {
  optimizedBuffer: Buffer; // Der Buffer mit den optimierten Bilddaten
  contentType: string;     // Der MIME-Typ des optimierten Bildes (z.B. 'image/webp')
}

/**
 * Optimiert einen Bild-Buffer mit Sharp und konvertiert ihn in das WebP-Format.
 * @param inputBuffer Der rohe Bild-Buffer, der optimiert werden soll.
 * @param originalContentType Der ursprüngliche MIME-Typ des Bildes (wird derzeit nicht verwendet, aber für zukünftige Erweiterungen beibehalten).
 * @returns Ein Promise, das zu einem Objekt mit dem optimierten Buffer und dem neuen Content-Typ ('image/webp') aufgelöst wird.
 * @throws Wirft einen Fehler, wenn die Optimierung fehlschlägt.
 */
export async function optimizeImageWithSharp(
  inputBuffer: Buffer,
  originalContentType: string // Behalte den ursprünglichen Typ für mögliche zukünftige Logik
): Promise<OptimizeResult> {
  console.log(`Optimizing image (${originalContentType}) with Sharp to WebP...`);
  try {
    // Verwendet sharp, um den Eingabe-Buffer zu verarbeiten
    const optimizedBuffer = await sharp(inputBuffer)
      .webp({ quality: 80 }) // Konvertiert das Bild in WebP mit einer Qualität von 80
      .toBuffer();           // Gibt das Ergebnis als Buffer zurück

    console.log(`Sharp optimization successful. Original size: ${inputBuffer.length}, Optimized size: ${optimizedBuffer.length}`);

    // Gibt den optimierten Buffer und den neuen Content-Typ zurück
    return {
      optimizedBuffer,
      contentType: 'image/webp', // Der Content-Typ ist jetzt immer WebP
    };
  } catch (error) {
    // Loggt einen Fehler, falls die Sharp-Verarbeitung fehlschlägt
    console.error("Error optimizing image with Sharp:", error);
    // Wirft den Fehler weiter, damit er von der aufrufenden API-Route behandelt werden kann
    throw new Error(`Image optimization failed: ${error instanceof Error ? error.message : 'Unknown Sharp error'}`);
  }
}
