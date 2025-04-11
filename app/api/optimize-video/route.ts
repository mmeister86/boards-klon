import { NextResponse } from 'next/server';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs/promises'; // Use promises API for async operations
import os from 'os';             // To get temporary directory
import path from 'path';
import { v4 as uuidv4 } from 'uuid'; // For unique temporary filenames
// Import Supabase client
import { createClient } from '@supabase/supabase-js';

// --- Supabase Client Setup ---
// Ensure env variables are loaded (Next.js does this automatically in API routes)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  // Optional: throw an error to prevent the route from running without config
  // throw new Error('Supabase configuration missing');
}

// Create a single Supabase client instance for the route
// Use service key for elevated privileges (e.g., bypassing RLS for uploads)
const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!, {
  auth: {
    // Required for service role client
    persistSession: false,
    autoRefreshToken: false,
  }
});
// --- End Supabase Setup ---

// Define the output directory for optimized videos
const outputDir = path.join(process.cwd(), 'public', 'optimized-videos');

// Ensure the output directory exists (run once on server start)
fs.mkdir(outputDir, { recursive: true }).catch(console.error);

// Define the POST handler for the App Router
export async function POST(request: Request) {
  let tempInputPath: string | null = null;
  let localOutputPath: string | null = null;

  try {
    const formData = await request.formData();
    const file = formData.get('video');
    // --- Get userId from FormData ---
    const userId = formData.get('userId');

    // Validate the file
    if (!file || typeof file === 'string' || !(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: 'Invalid or missing video file.' },
        { status: 400 }
      );
    }
    // --- Validate userId ---
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'User ID missing or invalid.' },
        { status: 400 } // Bad Request
      );
    }

    // Get file content as ArrayBuffer, then convert to Node Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create a unique temporary file path
    const tempDir = os.tmpdir();
    const tempFilename = `${uuidv4()}-${file.name}`;
    tempInputPath = path.join(tempDir, tempFilename);

    // Define output paths based on original filename
    const originalFilename = file.name || 'video.mp4';
    const fileExt = path.extname(originalFilename);
    const fileNameWithoutExt = path.basename(originalFilename, fileExt);
    // Use a unique name for the output file as well to avoid potential local clashes if processed concurrently
    const outputFilename = `${uuidv4()}-${fileNameWithoutExt}_optimized${fileExt}`;
    localOutputPath = path.join(outputDir, outputFilename);

    // Write temp input file
    await fs.writeFile(tempInputPath, buffer);
    console.log(`Temporary input file created at: ${tempInputPath}`);

    console.log(`Optimizing video for user: ${userId}`);
    console.log(`Local output path: ${localOutputPath}`);

    // --- FFmpeg Processing (Compression Only) ---
    await new Promise<void>((resolve, reject) => {
      ffmpeg(tempInputPath as string)
        .videoCodec('libx264') // Keep codec for compression
        // .size('1280x720') // REMOVED: Keep original size
        .outputOptions('-crf 28') // Keep CRF for compression level
        .on('start', (cmd) => console.log('FFmpeg started (compress only):', cmd))
        .on('progress', (p) => console.log(`Processing: ${p.percent ? Math.floor(p.percent) : 'N/A'}% done`))
        .on('end', () => {
          console.log('FFmpeg compression finished successfully.');
          resolve();
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err.message);
          reject(new Error(`FFmpeg compression failed: ${err.message}`));
        })
        .save(localOutputPath as string);
    });

    // --- Upload Optimized File to Supabase Storage ---
    if (!localOutputPath) {
      throw new Error('Internal error: Local output path was not set.');
    }
    console.log(`Reading compressed file from: ${localOutputPath}`);
    const optimizedFileBuffer = await fs.readFile(localOutputPath);

    // --- Use userId in storage path ---
    const storagePath = `${userId}/${outputFilename}`; // Store in folder named after userId
    console.log(`Uploading compressed file to Supabase Storage at: videos/${storagePath}`);

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('videos')
      .upload(storagePath, optimizedFileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase Storage upload error:', uploadError);
      throw new Error(`Failed to upload optimized video to storage: ${uploadError.message}`);
    }

    console.log('Successfully uploaded to Supabase Storage:', uploadData);

    // --- Get Public URL from Supabase ---
    console.log(`Attempting to get public URL for path: ${storagePath}`);
    const { data: urlData } = supabaseAdmin.storage
      .from('videos')
      .getPublicUrl(storagePath);
    console.log("getPublicUrl data:", JSON.stringify(urlData, null, 2));

    // Stricter check - check if data exists and publicUrl is non-empty
    if (!urlData || !urlData.publicUrl) {
       console.error('Failed to get public URL from Supabase Storage. Data:', urlData);
       // Throw specific error to be caught below
       throw new Error(`Could not get public URL. Path: ${storagePath}. Check bucket permissions/path validity.`);
    }

    const supabasePublicUrl = urlData.publicUrl;
    console.log(`Supabase Public URL successfully retrieved: ${supabasePublicUrl}`);

    // --- Explicit Success Return ---
    // If we reach here, everything succeeded.
    return NextResponse.json({
      message: 'Video compressed and uploaded successfully!',
      storageUrl: supabasePublicUrl // Ensure this key is sent ONLY on full success
    });

  } catch (error: unknown) {
    // --- Centralized Error Handling ---
    let errorMessage = 'Internal Server Error';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
      console.error('[API Route Error]:', error.stack);
      // Refine status codes based on error messages
      if (errorMessage.includes('Invalid or missing') || errorMessage.includes('User ID missing')) statusCode = 400;
      else if (errorMessage.includes('FFmpeg')) statusCode = 500;
      else if (errorMessage.includes('Failed to upload')) statusCode = 500;
      else if (errorMessage.includes('Could not get public URL')) statusCode = 500; // Explicitly handle URL error
      // Add more specific checks if needed
    } else {
      console.error('[API Route Unknown Error]:', error);
      errorMessage = 'An unknown error occurred during video processing';
    }

    // ALWAYS return the error structure from the catch block
    return NextResponse.json({ error: errorMessage }, { status: statusCode });

  } finally {
    // --- Cleanup: Delete temporary files ---
    if (tempInputPath) {
      // Add null check before unlinking (though logically redundant here)
      fs.unlink(tempInputPath).then(() => console.log(`Deleted temp input: ${tempInputPath}`)).catch(err => console.error(`Error deleting ${tempInputPath}:`, err));
    }
    if (localOutputPath) {
      // Add null check before unlinking
      fs.unlink(localOutputPath).then(() => console.log(`Deleted local output: ${localOutputPath}`)).catch(err => console.error(`Error deleting ${localOutputPath}:`, err));
    }
  }
}
