-- Storage configuration for SAVING PIG

-- 1. Create the bucket for evidence images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('evidences', 'evidences', false);

-- 2. Storage Policies

-- Allow users to upload their own evidence
CREATE POLICY "Users can upload their own evidence"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'evidences' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own evidence
CREATE POLICY "Users can view their own evidence"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'evidences' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own evidence
CREATE POLICY "Users can update their own evidence"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'evidences' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own evidence
CREATE POLICY "Users can delete their own evidence"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'evidences' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
