-- Enable RLS on the media_items table
ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;

-- Create a user_id column to track ownership
ALTER TABLE media_items ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();

-- Policy for viewing media items (all authenticated users can view)
CREATE POLICY "Users can view all media items"
ON media_items
FOR SELECT
TO authenticated
USING (true);

-- Policy for inserting media items (authenticated users can insert their own)
CREATE POLICY "Users can insert their own media items"
ON media_items
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy for updating media items (users can only update their own)
CREATE POLICY "Users can update their own media items"
ON media_items
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for deleting media items (users can only delete their own)
CREATE POLICY "Users can delete their own media items"
ON media_items
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Storage bucket policies
-- Images bucket
CREATE POLICY "Users can view all images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'images');

CREATE POLICY "Users can upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'images'
  AND (storage.foldername(name))[1] != 'private'
);

CREATE POLICY "Users can update their own images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (auth.uid() = owner)
WITH CHECK (bucket_id = 'images');

CREATE POLICY "Users can delete their own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (auth.uid() = owner AND bucket_id = 'images');

-- Videos bucket
CREATE POLICY "Users can view all videos"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'videos');

CREATE POLICY "Users can upload videos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'videos'
  AND (storage.foldername(name))[1] != 'private'
);

CREATE POLICY "Users can update their own videos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (auth.uid() = owner)
WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Users can delete their own videos"
ON storage.objects
FOR DELETE
TO authenticated
USING (auth.uid() = owner AND bucket_id = 'videos');

-- Audio bucket
CREATE POLICY "Users can view all audio"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'audio');

CREATE POLICY "Users can upload audio"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'audio'
  AND (storage.foldername(name))[1] != 'private'
);

CREATE POLICY "Users can update their own audio"
ON storage.objects
FOR UPDATE
TO authenticated
USING (auth.uid() = owner)
WITH CHECK (bucket_id = 'audio');

CREATE POLICY "Users can delete their own audio"
ON storage.objects
FOR DELETE
TO authenticated
USING (auth.uid() = owner AND bucket_id = 'audio');

-- Documents bucket
CREATE POLICY "Users can view all documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

CREATE POLICY "Users can upload documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] != 'private'
);

CREATE POLICY "Users can update their own documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (auth.uid() = owner)
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Users can delete their own documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (auth.uid() = owner AND bucket_id = 'documents');
