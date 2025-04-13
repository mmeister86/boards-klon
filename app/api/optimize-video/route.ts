import { NextResponse } from 'next/server';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs/promises'; // Use promises API for async operations
import os from 'os';             // To get temporary directory
import path from 'path';
import { v4 as uuidv4 } from 'uuid'; // For unique temporary filenames
// Import Supabase client
import { createClient } from '@supabase/supabase-js';
import { updateProgress } from './progress/route';

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

// Define the output directories
const outputDir = path.join(process.cwd(), 'public', 'optimized-videos');
const previewDir = path.join(process.cwd(), 'public', 'video-previews');

// Ensure the output directories exist (run once on server start)
Promise.all([
  fs.mkdir(outputDir, { recursive: true }),
  fs.mkdir(previewDir, { recursive: true })
]).catch(console.error);

// Helper function to generate and upload preview images
async function generateAndUploadPreviews(
  inputPath: string,
  userId: string,
  baseFilename: string
): Promise<{ preview512: string; preview128: string }> {
  // Create preview paths with the original filename pattern
  const preview512StoragePath = `${userId}/${baseFilename}_512.jpg`;
  const preview128StoragePath = `${userId}/${baseFilename}_128.jpg`;

  // Get video frame rate to calculate the 10th frame timestamp
  const metadata = await new Promise<{ streams: Array<{ r_frame_rate?: string }> }>((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) reject(err);
      resolve(metadata);
    });
  });

  // Calculate timestamp for 10th frame (default to 1/30 if frame rate can't be determined)
  const frameRate = metadata.streams[0]?.r_frame_rate
    ? metadata.streams[0].r_frame_rate.split('/').map(Number).reduce((a, b) => a / b)
    : 30;
  const tenthFrameTime = 10 / frameRate;

  // Create temporary paths for the preview files
  const tempDir = os.tmpdir();
  const preview512Path = path.join(tempDir, `preview-512-${uuidv4()}.jpg`);
  const preview128Path = path.join(tempDir, `preview-128-${uuidv4()}.jpg`);

  // Generate 512x512 preview
  await new Promise<void>((resolve, reject) => {
    ffmpeg(inputPath)
      .screenshots({
        timestamps: [tenthFrameTime],
        filename: path.basename(preview512Path),
        folder: path.dirname(preview512Path),
        size: '512x512'
      })
      .on('end', () => resolve())
      .on('error', reject);
  });

  // Generate 128x128 preview
  await new Promise<void>((resolve, reject) => {
    ffmpeg(inputPath)
      .screenshots({
        timestamps: [tenthFrameTime],
        filename: path.basename(preview128Path),
        folder: path.dirname(preview128Path),
        size: '128x128'
      })
      .on('end', () => resolve())
      .on('error', reject);
  });

  // Upload previews to Supabase
  const preview512Buffer = await fs.readFile(preview512Path);
  const preview128Buffer = await fs.readFile(preview128Path);

  // Upload both previews to the previews bucket with the new naming pattern
  const [preview512Upload, preview128Upload] = await Promise.all([
    supabaseAdmin.storage
      .from('previews')
      .upload(preview512StoragePath, preview512Buffer, {
        contentType: 'image/jpeg',
        upsert: false,
      }),
    supabaseAdmin.storage
      .from('previews')
      .upload(preview128StoragePath, preview128Buffer, {
        contentType: 'image/jpeg',
        upsert: false,
      })
  ]);

  if (preview512Upload.error) throw new Error(`Failed to upload 512x512 preview: ${preview512Upload.error.message}`);
  if (preview128Upload.error) throw new Error(`Failed to upload 128x128 preview: ${preview128Upload.error.message}`);

  // Get public URLs from the previews bucket
  const preview512Url = supabaseAdmin.storage.from('previews').getPublicUrl(preview512StoragePath).data.publicUrl;
  const preview128Url = supabaseAdmin.storage.from('previews').getPublicUrl(preview128StoragePath).data.publicUrl;

  // Cleanup local preview files
  await Promise.all([
    fs.unlink(preview512Path),
    fs.unlink(preview128Path)
  ]);

  return {
    preview512: preview512Url,
    preview128: preview128Url
  };
}

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
        .videoCodec('libx264')
        .outputOptions([
          '-crf 28',
          '-movflags +faststart',
          '-pix_fmt yuv420p'
        ])
        .toFormat('mp4')
        .on('start', (cmd) => {
          console.log('FFmpeg started (compress only):', cmd);
          updateProgress(0);
        })
        .on('progress', (p) => {
          const percent = p.percent ? Math.floor(p.percent) : 0;
          console.log(`Processing: ${percent}% done`);
          updateProgress(percent);
        })
        .on('end', () => {
          console.log('FFmpeg compression finished successfully.');
          updateProgress(100);
          resolve();
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err.message);
          console.error('FFmpeg error details:', err);
          reject(new Error(`FFmpeg compression failed: ${err.message}`));
        })
        .save(localOutputPath as string);
    });

    // Generate and upload preview images
    console.log('Generating preview images...');
    let previewUrls = null;
    try {
      previewUrls = await generateAndUploadPreviews(
        tempInputPath,
        userId,
        fileNameWithoutExt
      );
      console.log('Preview images generated and uploaded successfully');
    } catch (previewError) {
      console.error('Preview generation error:', previewError);
      // Continue with video upload even if preview generation fails
    }

    // --- Upload Optimized File to Supabase Storage ---
    if (!localOutputPath) {
      throw new Error('Internal error: Local output path was not set.');
    }
    console.log(`Reading compressed file from: ${localOutputPath}`);
    const optimizedFileBuffer = await fs.readFile(localOutputPath);

    // --- Use userId in storage path ---
    const storagePath = `${userId}/${outputFilename}`;
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
    return NextResponse.json({
      message: 'Video compressed and uploaded successfully!',
      storageUrl: supabasePublicUrl,
      previewUrl512: previewUrls?.preview512 || null,
      previewUrl128: previewUrls?.preview128 || null
    });

  } catch (error: unknown) {
    // --- Centralized Error Handling ---
    let errorMessage = 'Internal Server Error';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
      console.error('[API Route Error]:', error.stack);
      console.error('[API Route Error Details]:', error);

      // More specific error handling
      if (errorMessage.includes('Invalid or missing') || errorMessage.includes('User ID missing')) {
        statusCode = 400;
      } else if (errorMessage.includes('FFmpeg')) {
        console.error('[FFmpeg Error Details]:', errorMessage);
        errorMessage = 'Video processing failed. Please try a different format or contact support.';
        statusCode = 500;
      } else if (errorMessage.includes('Failed to upload')) {
        console.error('[Upload Error Details]:', errorMessage);
        errorMessage = 'Failed to upload video. Please try again or contact support.';
        statusCode = 500;
      } else if (errorMessage.includes('Could not get public URL')) {
        console.error('[URL Error Details]:', errorMessage);
        errorMessage = 'Failed to generate video URL. Please try again or contact support.';
        statusCode = 500;
      }
    } else {
      console.error('[API Route Unknown Error]:', error);
      errorMessage = 'An unknown error occurred during video processing';
    }

    // ALWAYS return the error structure from the catch block
    return NextResponse.json({
      error: errorMessage,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: statusCode });

  } finally {
    // --- Cleanup: Delete temporary files ---
    console.log('[Cleanup] Entering finally block.');
    if (tempInputPath) {
      console.log(`[Cleanup] Attempting to delete temp input: ${tempInputPath}`);
      fs.unlink(tempInputPath)
        .then(() => console.log(`[Cleanup] Successfully deleted temp input: ${tempInputPath}`))
        .catch(err => console.error(`[Cleanup] Error deleting temp input ${tempInputPath}:`, err));
    } else {
      console.log('[Cleanup] tempInputPath was null or undefined, skipping unlink.');
    }

    if (localOutputPath) {
      console.log(`[Cleanup] Attempting to delete local output: ${localOutputPath}`);
      fs.unlink(localOutputPath)
        .then(() => console.log(`[Cleanup] Successfully deleted local output: ${localOutputPath}`))
        .catch(err => console.error(`[Cleanup] Error deleting local output ${localOutputPath}:`, err));
    } else {
       console.log('[Cleanup] localOutputPath was null or undefined, skipping unlink.');
    }
    console.log('[Cleanup] Exiting finally block.');
  }
}
