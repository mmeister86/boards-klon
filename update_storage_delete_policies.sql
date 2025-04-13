-- =====================================================================
-- WARNING: Please verify the policy names before running this script!
-- Find the exact names of your existing DELETE policies in the Supabase dashboard
-- (Storage -> Policies or Database -> Policies -> storage.objects)
-- and replace the placeholder names below (e.g., '"Delete Policy for Videos"').
-- =====================================================================

-- Drop existing DELETE policies (Replace placeholder names with your actual policy names)
DROP POLICY IF EXISTS "Delete Policy for Audio" ON storage.objects; -- Replace with actual name if different
DROP POLICY IF EXISTS "Delete Policy for Images" ON storage.objects; -- Replace with actual name if different
DROP POLICY IF EXISTS "Delete Policy for Videos" ON storage.objects; -- Replace with actual name if different
DROP POLICY IF EXISTS "Delete Policy for Documents" ON storage.objects; -- Replace with actual name if different
DROP POLICY IF EXISTS "Delete Policy for Previews" ON storage.objects; -- Replace with actual name if different

-- Create new DELETE policies allowing owners to delete
CREATE POLICY "Allow authenticated users to delete own audio files"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'audio' AND auth.uid() = owner );

CREATE POLICY "Allow authenticated users to delete own image files"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'images' AND auth.uid() = owner );

CREATE POLICY "Allow authenticated users to delete own video files"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'videos' AND auth.uid() = owner );

CREATE POLICY "Allow authenticated users to delete own document files"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'documents' AND auth.uid() = owner );

CREATE POLICY "Allow authenticated users to delete own preview files"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'previews' AND auth.uid() = owner );

-- =====================================================================
-- End of script
-- =====================================================================
