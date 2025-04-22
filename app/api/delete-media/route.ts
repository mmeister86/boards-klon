// File: app/api/delete-media/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@/lib/supabase/server'; // Use server client for user auth check

// --- Supabase Admin Client Setup ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables for admin client');
  // Avoid running without config
  throw new Error('Supabase admin configuration missing');
}

const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});
// --- End Supabase Admin Setup ---

// Helper to extract storage path from URL
function getStoragePathFromUrl(url: string | null | undefined, bucketName: string): string | null {
  if (!url) return null;
  try {
    const urlPath = new URL(url).pathname;
    const pathParts = urlPath.split('/');
    const bucketIndex = pathParts.findIndex(part => part === bucketName);
    if (bucketIndex !== -1) {
      // Decode URI components in the final path
      return pathParts.slice(bucketIndex + 1).map(decodeURIComponent).join('/');
    }
    console.warn(`Could not find bucket '${bucketName}' in URL path: ${urlPath}`);
    return null;
  } catch (e) {
    console.error(`Error parsing URL or extracting path: ${url}`, e);
    return null;
  }
}

export async function POST(request: Request) {
  const supabaseUserClient = createServerClient(); // For getting authenticated user

  try {
    // 1. Get Authenticated User
    const { data: { user }, error: userError } = await (await supabaseUserClient).auth.getUser();
    if (userError || !user) {
      console.error('Delete API: User not authenticated.', userError);
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    // 2. Get mediaItemId from request body
    const { mediaItemId } = await request.json();
    if (!mediaItemId || typeof mediaItemId !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid mediaItemId.' }, { status: 400 });
    }
    console.log(`[Delete API] User ${user.id} attempting to delete media item ${mediaItemId}`);

    // 3. Fetch Media Item Record (using Admin client to bypass RLS if needed)
    const { data: mediaItem, error: fetchError } = await supabaseAdmin
      .from('media_items')
      .select('*') // Select all fields including URLs
      .eq('id', mediaItemId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') { // Not found
        return NextResponse.json({ error: 'Media item not found.' }, { status: 404 });
      }
      console.error(`[Delete API] Error fetching media item ${mediaItemId}:`, fetchError);
      throw fetchError; // Throw other errors
    }

    if (!mediaItem) { // Should be caught by PGRST116, but double-check
       return NextResponse.json({ error: 'Media item not found.' }, { status: 404 });
    }

    // 4. Verify Ownership
    if (mediaItem.user_id !== user.id) {
      console.warn(`[Delete API] User ${user.id} attempted to delete media item ${mediaItemId} owned by ${mediaItem.user_id}. Denied.`);
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }
    console.log(`[Delete API] Ownership verified for user ${user.id} and item ${mediaItemId}.`);

    // 5. Delete Files from Storage (using Admin client)
    const errors: string[] = [];

    // Determine main bucket and path
    const fileType = mediaItem.file_type;
    let mainBucket: string | null = null;
    if (fileType.startsWith('image/')) mainBucket = 'images';
    else if (fileType.startsWith('video/')) mainBucket = 'videos';
    else if (fileType.startsWith('audio/')) mainBucket = 'audio';
    else if (fileType.startsWith('application/') || fileType.startsWith('text/')) mainBucket = 'documents'; // Broader document check

    const mainPath = mainBucket ? getStoragePathFromUrl(mediaItem.url, mainBucket) : null;

    // Delete main file
    if (mainBucket && mainPath) {
      console.log(`[Delete API] Attempting to delete main file. Bucket: ${mainBucket}, Path: ${mainPath}`);
      const { error: mainDeleteError } = await supabaseAdmin.storage
        .from(mainBucket)
        .remove([mainPath]);
      if (mainDeleteError) {
        console.error(`[Delete API] Error deleting main file ${mainPath} from ${mainBucket}:`, mainDeleteError);
        errors.push(`Failed to delete main file: ${mainDeleteError.message}`);
        // Continue even if deletion fails, to attempt DB cleanup
      } else {
         console.log(`[Delete API] Successfully deleted main file ${mainPath} from ${mainBucket}`);
      }
    } else {
        console.warn(`[Delete API] Could not determine path or bucket for main file URL: ${mediaItem.url}`);
    }

    // Delete previews
    const previewPathsToDelete: string[] = [];
    const preview512Path = getStoragePathFromUrl(mediaItem.preview_url_512, 'previews');
    const preview128Path = getStoragePathFromUrl(mediaItem.preview_url_128, 'previews');
    if (preview512Path) previewPathsToDelete.push(preview512Path);
    if (preview128Path) previewPathsToDelete.push(preview128Path);

    if (previewPathsToDelete.length > 0) {
      console.log(`[Delete API] Attempting to delete preview files. Bucket: previews, Paths: ${JSON.stringify(previewPathsToDelete)}`);
      const { error: previewDeleteError } = await supabaseAdmin.storage
        .from('previews')
        .remove(previewPathsToDelete);
      if (previewDeleteError) {
        console.error(`[Delete API] Error deleting preview files ${JSON.stringify(previewPathsToDelete)}:`, previewDeleteError);
        errors.push(`Failed to delete preview files: ${previewDeleteError.message}`);
         // Continue even if deletion fails
      } else {
         console.log(`[Delete API] Successfully deleted preview files: ${JSON.stringify(previewPathsToDelete)}`);
      }
    }

    // 6. Delete Database Record (using Admin client)
    console.log(`[Delete API] Attempting to delete database record for item ${mediaItemId}`);
    const { error: dbDeleteError } = await supabaseAdmin
      .from('media_items')
      .delete()
      .eq('id', mediaItemId); // Match on ID should be sufficient here

    if (dbDeleteError) {
      console.error(`[Delete API] Error deleting database record ${mediaItemId}:`, dbDeleteError);
      errors.push(`Failed to delete database record: ${dbDeleteError.message}`);
    } else {
       console.log(`[Delete API] Successfully deleted database record for item ${mediaItemId}`);
    }

    // 7. Return Response
    if (errors.length > 0) {
      // Return success but include errors encountered during cleanup
      return NextResponse.json({
        message: 'Deletion initiated, but some cleanup steps failed.',
        errors: errors
      }, { status: 207 }); // Multi-Status
    }

    return NextResponse.json({ message: 'Media item deleted successfully.' });

  } catch (error: unknown) {
    console.error('[Delete API] Unhandled error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
}
