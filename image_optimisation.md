Okay, let's adapt the code snippets to explicitly support your self-hosted Supabase instance at `supabase.matthias.lol`.

The core principle remains the same: the `supabase-js` client library handles the URL abstraction. The crucial part is ensuring that **all** client initializations (browser, server-side, middleware, edge function) receive the correct URL (`https://supabase.matthias.lol`) and the corresponding `anon` key (and `service_role` key where needed). This is typically done via environment variables.

Here are the revised snippets with comments highlighting the importance of environment variable configuration for your self-hosted setup.

**1. Supabase Client (Browser)**

No code change needed here, but ensure your `.env.local` (or equivalent environment variable provider) is correctly set.

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";

/**
 * Creates a Supabase client for browser environments with refresh support.
 * Reads URL and Anon Key from environment variables.
 *
 * **IMPORTANT FOR SELF-HOSTED:**
 * Ensure NEXT_PUBLIC_SUPABASE_URL is set to "https://supabase.matthias.lol"
 * Ensure NEXT_PUBLIC_SUPABASE_ANON_KEY is set to the public anon key of your self-hosted instance.
 */
export function createClient() {
  if (typeof window === "undefined") {
    console.warn("createClient should only be called in browser environments");
    return undefined;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "Supabase URL or Anon Key missing from environment variables."
    );
    // You might want to throw an error or return a dummy client depending on desired behavior
    return undefined;
  }

  try {
    // Create a fresh client instance each time
    const client = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);

    if (!client) {
      throw new Error("Failed to create Supabase client");
    }

    return client;
  } catch (error) {
    console.error("Error creating Supabase client:", error);
    return undefined;
  }
}
```

**2. Supabase Client (Server Components)**

Again, no code change, just relies on environment variables being set correctly in your Next.js server environment.

```typescript
// lib/supabase/server.ts
import { createServerClient as createSupaServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/types";

/**
 * Creates a Supabase client for server components with cookie handling.
 * Reads URL and Anon Key from environment variables.
 *
 * **IMPORTANT FOR SELF-HOSTED:**
 * Ensure NEXT_PUBLIC_SUPABASE_URL is set to "https://supabase.matthias.lol"
 * Ensure NEXT_PUBLIC_SUPABASE_ANON_KEY is set to the public anon key of your self-hosted instance.
 * These need to be available in the server environment where Next.js runs.
 */
export function createServerClient() {
  const cookieStore = cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "Supabase URL or Anon Key missing from server environment variables."
    );
    // Handle error appropriately - maybe throw or return a non-functional client
    throw new Error("Supabase configuration missing on the server.");
  }

  return createSupaServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name, value, options) {
        try {
          cookieStore.set(name, value, options);
        } catch (err) {
          console.debug("Cookie set error in server client:", err);
        }
      },
      remove(name, options) {
        try {
          cookieStore.set(name, "", { ...options, maxAge: 0 });
        } catch (err) {
          console.debug("Cookie remove error in server client:", err);
        }
      },
    },
  });
}
```

**3. Supabase Client (Middleware)**

Relies on environment variables being set correctly in your Next.js middleware environment.

```typescript
// lib/supabase/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/types";

/**
 * Creates a Supabase client for middleware with proper cookie handling.
 * Reads URL and Anon Key from environment variables.
 *
 * **IMPORTANT FOR SELF-HOSTED:**
 * Ensure NEXT_PUBLIC_SUPABASE_URL is set to "https://supabase.matthias.lol"
 * Ensure NEXT_PUBLIC_SUPABASE_ANON_KEY is set to the public anon key of your self-hosted instance.
 * These need to be available in the middleware environment.
 */
export function createMiddlewareClient(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "Supabase URL or Anon Key missing from middleware environment variables."
    );
    // Return a response indicating configuration error, or handle differently
     return {
        supabase: null, // Indicate client creation failed
        response: NextResponse.json(
          { error: "Server configuration error" },
          { status: 500 }
        ),
     };
  }


  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name, value, options) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({ request: { headers: request.headers } }); // Recreate response to apply updated cookies
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options) {
        request.cookies.set({ name, value: "", ...options, maxAge: 0 });
         response = NextResponse.next({ request: { headers: request.headers } }); // Recreate response
        response.cookies.set({ name, value: "", ...options, maxAge: 0 });
      },
    },
  });

  return { supabase, response };
}
```

**4. Supabase Edge Function (`process-image`)**

The Deno code relies on environment variables being set *within the Coolify function's environment*.

```typescript
// supabase/functions/process-image/index.ts
import { serve } from 'std/http/server.ts';
import { corsHeaders } from 'cors';
import { SupabaseClient, createClient } from 'supabase';
import { Image } from '@nesterow/image';

const STORAGE_BUCKET = 'images'; // Ensure this bucket exists on supabase.matthias.lol

// --- IMPORTANT FOR SELF-HOSTED ---
// These environment variables MUST be set in your Coolify Edge Function environment:
// - SUPABASE_URL: "https://supabase.matthias.lol"
// - SUPABASE_ANON_KEY: Your self-hosted public anon key
// - SUPABASE_SERVICE_ROLE_KEY: Your self-hosted service role key
// ---------------------------------
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
  console.error('Missing Supabase environment variables in Edge Function!');
  // Optional: throw an error during startup if essential vars are missing
  // throw new Error("Missing Supabase config in Edge Function environment.");
}


// Helper function to create Supabase client with user's auth
function createAuthedClient(req: Request): SupabaseClient | null {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !supabaseUrl || !supabaseAnonKey) {
     console.error("Cannot create authed client: Missing auth header or base Supabase config.");
    return null;
  }
  try {
    return createClient(
      supabaseUrl,
      supabaseAnonKey,
      { global: { headers: { Authorization: authHeader } } }
    );
  } catch (e) {
     console.error("Error creating authed Supabase client:", e);
     return null;
  }
}

// Helper to create Admin client
function createAdminClient(): SupabaseClient | null {
   if (!supabaseUrl || !serviceRoleKey) {
      console.error("Cannot create admin client: Missing URL or Service Role Key.");
      return null;
   }
    try {
       return createClient(supabaseUrl, serviceRoleKey);
    } catch (e) {
       console.error("Error creating admin Supabase client:", e);
       return null;
    }
}


// Helper to generate unique file paths (no change needed)
function createProcessedPaths(userId: string, originalFileName: string) {
  // ... (implementation remains the same) ...
  const timestamp = Date.now();
  const nameWithoutExt = originalFileName.substring(0, originalFileName.lastIndexOf('.'))
                            .replace(/[^a-zA-Z0-9._-]/g, '') // Sanitize
                            .replace(/\s+/g, '_').substring(0, 50); // Limit length
  const base = `${userId}/${timestamp}-${nameWithoutExt}`;
  return {
    processed: `${base}-processed.webp`,
    preview512: `${base}-prev512.webp`,
    preview128: `${base}-prev128.webp`,
  };
}

console.log(`Process-image function booting up... Target: ${supabaseUrl}`);

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Ensure base config is loaded
  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
     return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
     });
  }


  try {
    const supabaseAdmin = createAdminClient();
    const supabase = createAuthedClient(req);

    if (!supabase || !supabaseAdmin) {
       return new Response(JSON.stringify({ error: 'Failed to initialize Supabase clients' }), {
           status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
       });
    }

    // Verify user authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser();
     if (userError || !user) {
       console.error('Auth error:', userError);
       return new Response(JSON.stringify({ error: userError?.message || 'Authentication required' }), {
         status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
       });
     }
     console.log(`Processing request for user: ${user.id}`);


    // Get file path from request body
    const { stagingPath, originalFileName, originalFileType, originalFileSize } = await req.json();
     if (!stagingPath || !originalFileName || !originalFileType) {
        console.error('Missing parameters:', { stagingPath, originalFileName, originalFileType });
       return new Response(JSON.stringify({ error: 'Missing stagingPath, originalFileName, or originalFileType' }), {
         status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
       });
     }
     console.log(`Received staging path: ${stagingPath}`);

    // --- Add non-image handling if needed ---
    if (!originalFileType.startsWith('image/')) {
       console.warn(`Non-image file type (${originalFileType}) received. Skipping processing.`);
       return new Response(JSON.stringify({ error: 'Only image processing is currently supported by this function.' }), {
           status: 415, // Unsupported Media Type
           headers: { ...corsHeaders, 'Content-Type': 'application/json' },
       });
    }
    // ---------------------------------------


    // Download original image from staging path
    console.log(`Downloading from bucket '${STORAGE_BUCKET}', path '${stagingPath}'`);
    // Use Admin client for reliable access to staging files, regardless of RLS
    const { data: blob, error: downloadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .download(stagingPath);

    if (downloadError || !blob) {
       console.error('Download error:', downloadError);
       return new Response(JSON.stringify({ error: `Failed to download staging file: ${downloadError?.message || 'Unknown download error'}` }), {
         status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
       });
     }
     console.log('Download successful.');


    // Decode image using the image library
    const image = await Image.decode(await blob.arrayBuffer());
    const { width: originalWidth, height: originalHeight } = image;
    console.log(`Image decoded: ${originalWidth}x${originalHeight}`);

    const processedPaths = createProcessedPaths(user.id, originalFileName);

    // --- Process and Upload (using the user's authenticated client for uploads) ---
    const uploadPromises = [];
    let processedSize = 0;

    // 1. Compress Original (to WebP)
    console.log('Processing: Compressing original...');
    image.resize(Image.RESIZE_AUTO, Image.RESIZE_AUTO);
    const compressedBuffer = await image.encodeWEBP(65);
    processedSize = compressedBuffer.byteLength;
    uploadPromises.push(
      supabase.storage // Use user client for uploads respecting RLS
        .from(STORAGE_BUCKET)
        .upload(processedPaths.processed, compressedBuffer, { contentType: 'image/webp', upsert: true })
    );
    console.log(`Processed original size: ${processedSize} bytes`);

    // 2. Generate 512px Preview
     console.log('Processing: Generating 512px preview...');
     image.resize(image.width > image.height ? 512 : Image.RESIZE_AUTO, image.height >= image.width ? 512 : Image.RESIZE_AUTO);
     const preview512Buffer = await image.encodeWEBP(50);
     uploadPromises.push(
       supabase.storage // Use user client
         .from(STORAGE_BUCKET)
         .upload(processedPaths.preview512, preview512Buffer, { contentType: 'image/webp', upsert: true })
     );
      console.log(`Processed 512px size: ${preview512Buffer.byteLength} bytes`);


    // 3. Generate 128px Preview
     console.log('Processing: Generating 128px preview...');
     image.resize(image.width > image.height ? 128 : Image.RESIZE_AUTO, image.height >= image.width ? 128 : Image.RESIZE_AUTO);
     const preview128Buffer = await image.encodeWEBP(40);
     uploadPromises.push(
       supabase.storage // Use user client
         .from(STORAGE_BUCKET)
         .upload(processedPaths.preview128, preview128Buffer, { contentType: 'image/webp', upsert: true })
     );
     console.log(`Processed 128px size: ${preview128Buffer.byteLength} bytes`);


    // Await all uploads
    console.log('Awaiting uploads...');
    const uploadResults = await Promise.all(uploadPromises);

    // Check for upload errors
    const uploadErrors = uploadResults.map(res => res.error).filter(Boolean);
    if (uploadErrors.length > 0) {
      console.error('Upload errors:', uploadErrors);
      await supabaseAdmin.storage.from(STORAGE_BUCKET).remove([
          processedPaths.processed, processedPaths.preview512, processedPaths.preview128,
      ]).catch(console.error); // Attempt cleanup
      return new Response(JSON.stringify({ error: `Failed to upload processed files: ${uploadErrors[0]?.message}` }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log('Uploads successful.');

    // Get public URLs (these will use the SUPABASE_URL env var correctly)
    const { data: processedUrlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(processedPaths.processed);
    const { data: preview512UrlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(processedPaths.preview512);
    const { data: preview128UrlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(processedPaths.preview128);

    // --- Add record to database (using user's client) ---
    const mediaItemData = {
        user_id: user.id,
        file_name: originalFileName,
        file_type: originalFileType,
        url: processedUrlData?.publicUrl || null, // Fallback to null
        size: processedSize,
        width: originalWidth,
        height: originalHeight,
        preview_512_url: preview512UrlData?.publicUrl || null, // Fallback to null
        preview_128_url: preview128UrlData?.publicUrl || null, // Fallback to null
    };

    console.log('Inserting into database:', mediaItemData);
    const { data: insertedRecord, error: dbError } = await supabase
      .from('media_items')
      .insert(mediaItemData)
      .select()
      .single();

    if (dbError || !insertedRecord) {
      console.error('Database insert error:', dbError);
       await supabaseAdmin.storage.from(STORAGE_BUCKET).remove([
           processedPaths.processed, processedPaths.preview512, processedPaths.preview128,
       ]).catch(console.error); // Attempt cleanup
       return new Response(JSON.stringify({ error: `Database insert failed: ${dbError?.message}` }), {
         status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
       });
     }
     console.log('Database insert successful:', insertedRecord);


    // --- Delete original staging file (use admin client) ---
    console.log(`Deleting staging file: ${stagingPath}`);
    const { error: deleteError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .remove([stagingPath]);

     if (deleteError) {
       console.warn(`Failed to delete staging file: ${deleteError.message}. Manual cleanup might be needed.`);
     } else {
         console.log('Staging file deleted successfully.');
     }


    // --- Return success response ---
    return new Response(JSON.stringify({ mediaItem: insertedRecord }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Unhandled error in Edge Function:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

**5. Client-Side Invocation Helper**

No change needed here, as it uses the `supabase` client which should already be initialized with your self-hosted URL.

```typescript
// lib/supabase/media.ts (or storage.ts)
import { SupabaseClient } from '@supabase/supabase-js';
// ... other imports ...

const STAGING_BUCKET = 'images'; // Or your chosen staging bucket name
const FUNCTIONS_URL_PROCESS_IMAGE = 'process-image';

/**
 * Uploads the original file to a staging path and triggers the
 * server-side processing Edge Function.
 * @returns The newly created media item record from the database, or null on failure.
 */
export async function uploadAndProcessMedia(
  supabase: SupabaseClient,
  userId: string,
  file: File
): Promise<DbMediaItem | null> { // Assuming DbMediaItem is your database type
  if (!userId) {
    console.error('User ID is required.');
    return null;
  }

  // 1. Upload original to staging path
  const stagingPath = `staging/${userId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`; // Sanitize staging path name
  console.log(`Uploading original to staging: ${stagingPath}`);

  const { error: uploadError } = await supabase.storage
    .from(STAGING_BUCKET)
    .upload(stagingPath, file, {
      cacheControl: '0',
      upsert: false,
    });

  if (uploadError) {
    console.error('Staging upload error:', uploadError);
    toast.error(`Fehler beim Initialisieren des Uploads für ${file.name}`); // User feedback
    return null;
  }
  console.log('Staging upload successful.');

  // 2. Invoke Edge Function
  console.log('Invoking Edge Function:', FUNCTIONS_URL_PROCESS_IMAGE);
  try {
    const { data, error: functionError } = await supabase.functions.invoke(
      FUNCTIONS_URL_PROCESS_IMAGE,
      {
        body: {
          stagingPath: stagingPath,
          originalFileName: file.name,
          originalFileType: file.type,
          originalFileSize: file.size,
        },
      }
    );

    if (functionError) {
      console.error('Edge Function invocation error:', functionError);
      await supabase.storage.from(STAGING_BUCKET).remove([stagingPath]).catch(console.error); // Cleanup
      toast.error(`Verarbeitung für ${file.name} fehlgeschlagen: ${functionError.message}`);
      throw functionError;
    }

    console.log('Edge Function response:', data);

    if (!data || !data.mediaItem) {
       console.error('Edge Function did not return expected mediaItem data.');
       await supabase.storage.from(STAGING_BUCKET).remove([stagingPath]).catch(console.error); // Cleanup
       toast.error(`Verarbeitung für ${file.name} fehlgeschlagen: Ungültige Server-Antwort.`);
       throw new Error('Processing failed: Invalid response from server.');
    }

    // 3. Return the media item data
    return data.mediaItem as DbMediaItem; // Cast to your DB type

  } catch (error) {
    console.error('Error during media processing invocation:', error);
    if (!uploadError) { // Avoid double cleanup attempt if staging upload failed
        await supabase.storage.from(STAGING_BUCKET).remove([stagingPath]).catch(console.error);
    }
    // Toast error was likely shown inside the block or already
    return null;
  }
}

// ... other utility functions ...
```

**6. `next.config.mjs`**

Your existing configuration already correctly specifies the hostname. Ensure it remains:

```mjs
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "supabase.matthias.lol", // Correct hostname for self-hosted
        port: "",
        pathname: "/storage/v1/object/public/**", // Allows images from any public bucket path
      },
      // Add other allowed image domains if needed
    ],
  },
  // ... other config
};

export default nextConfig;
```

**Summary of Changes & Actions:**

1.  **Environment Variables:** This is the **most critical** step. Ensure `NEXT_PUBLIC_SUPABASE_URL="https://supabase.matthias.lol"` and `NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key"` are set for your Next.js app (both browser and server environments).
2.  **Coolify Function Environment:** Set the corresponding `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` environment variables within the Coolify settings for your `process-image` Edge Function.
3.  **Code Updates:** The code snippets above now include comments emphasizing the environment variable dependency and slight improvements for error handling in the function.
4.  **Deployment:** Deploy the updated Edge Function to your self-hosted Supabase instance using the Supabase CLI.
5.  **CORS:** Double-check the CORS settings in your self-hosted Supabase instance (Project Settings -> API -> CORS Configuration) to allow requests from your Next.js application's domain(s).

The core logic relies heavily on correct configuration rather than significant code changes.
