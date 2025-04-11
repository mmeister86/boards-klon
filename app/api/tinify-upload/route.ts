import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import tinify from "tinify";
import { type SupabaseClient } from "@supabase/supabase-js";

// Hilfsfunktion zum Bereinigen von Dateinamen (aus image-block.tsx kopiert)
const sanitizeFilename = (filename: string): string => {
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
  return sanitized
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "");
};

// Funktion zum Hochladen und Komprimieren
async function compressAndUpload(
  file: File,
  supabaseClient: SupabaseClient,
  userId: string,
  apiKey: string
): Promise<string> {
  console.log(`API Route: Compressing file: ${file.name}`);
  tinify.key = apiKey;

  const sanitizedFileName = sanitizeFilename(file.name);
  const filePath = `${userId}/${Date.now()}-${sanitizedFileName}`;
  console.log(`API Route: Upload path: ${filePath}`);

  try {
    // Bild komprimieren
    const fileBuffer = await file.arrayBuffer();
    const compressedBuffer = await tinify
      .fromBuffer(Buffer.from(fileBuffer))
      .toBuffer();
    console.log(
      `API Route: Compression complete. Original: ${file.size}, Compressed: ${compressedBuffer.byteLength}`
    );

    // Komprimiertes Bild hochladen
    const { error: uploadError } = await supabaseClient.storage
      .from("images")
      .upload(filePath, compressedBuffer, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("API Route: Supabase upload error:", uploadError);
      throw uploadError;
    }

    // Public URL abrufen
    const { data } = supabaseClient.storage
      .from("images")
      .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      throw new Error("API Route: Could not get public URL after upload.");
    }

    console.log(`API Route: Upload successful. URL: ${data.publicUrl}`);
    return data.publicUrl;

  } catch (error: unknown) {
    // Detailliertes Tinify-Fehlerhandling
    if (error instanceof tinify.AccountError) {
      console.error("API Route: TinyPNG Account Error:", error.message);
      throw new Error(`TinyPNG authorization failed: ${error.message}`);
    } else if (error instanceof tinify.ClientError) {
      console.error("API Route: TinyPNG Client Error:", error.message);
      throw new Error(`TinyPNG could not process the image: ${error.message}`);
    } else if (error instanceof tinify.ServerError) {
      console.error("API Route: TinyPNG Server Error:", error.message);
      throw new Error(`TinyPNG service temporary unavailable: ${error.message}`);
    } else if (error instanceof tinify.ConnectionError) {
      console.error("API Route: TinyPNG Connection Error:", error.message);
      throw new Error(`Could not connect to TinyPNG: ${error.message}`);
    } else {
      console.error("API Route: Error during image processing:", error);
      if (error instanceof Error) throw error;
      throw new Error(`An unknown error occurred: ${String(error)}`);
    }
  }
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const apiKey = process.env.TINIFY_API_KEY; // Server-side key
  if (!apiKey) {
    console.error("API Route: TINIFY_API_KEY not configured on server.");
    return NextResponse.json(
      { error: "Image processing service not configured." },
      { status: 500 }
    );
  }

  // --- FIX: Use createServerClient (from @supabase/ssr) for Route Handlers ---
  const cookieStore = cookies(); // Get cookie store
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
  // ---------------------------------------------------------------------

  // Now get the user using the client created with the *same* library as middleware
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // This check should now work correctly
    console.log("API Route: No user session found using createServerClient.")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log(`API Route: User ${user.id} authenticated.`);

  try {
    // Pass the correctly initialized Supabase client
    const publicUrl = await compressAndUpload(file, supabase, user.id, apiKey);
    return NextResponse.json({ publicUrl });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("API Route: Failed POST handler:", errorMessage);
    return NextResponse.json(
      { error: `Failed to process image: ${errorMessage}` },
      { status: 500 }
    );
  }
}
