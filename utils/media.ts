// Utility-Funktionen für die Mediathek

/**
 * Bestimmt den korrekten Bucket basierend auf dem Dateityp
 */
export const getBucketForFile = (file: File): string => {
  if (file.type.startsWith("image/")) return "images";
  if (file.type.startsWith("video/")) return "videos";
  if (file.type.startsWith("audio/")) return "audio";
  return "documents";
};

/**
 * Ermittelt die Dimensionen eines Bildes
 */
export const getImageDimensions = async (
  file: File
): Promise<{ width: number; height: number }> => {
  if (!file.type.startsWith("image/")) {
    return { width: 0, height: 0 };
  }

  return new Promise((resolve) => {
    const img = new (window.Image as { new (): HTMLImageElement })();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
      });
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
    };
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Extrahiert den Dateipfad aus einer URL
 */
export const getFilePathFromUrl = (url: string): string => {
  try {
    const matches = url.match(/\/public\/[^/]+\/(.+)$/);
    if (!matches || !matches[1]) {
      throw new Error("Invalid URL format");
    }
    return decodeURIComponent(matches[1]);
  } catch (error) {
    console.error("Error parsing URL:", error);
    throw new Error("Could not extract file path from URL");
  }
};

/**
 * Prüft, ob eine Datei die maximale Größe überschreitet
 */
export const isFileSizeValid = (file: File, maxSizeMB: number = 50): boolean => {
  // Prüft, ob die Datei kleiner oder gleich 50MB ist (Standardwert angepasst)
  return file.size <= maxSizeMB * 1024 * 1024;
};

/**
 * Formatiert die Dateigröße in eine lesbare Form
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};
