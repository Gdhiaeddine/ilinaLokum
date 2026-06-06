ALTER TABLE purchase_orders
  ADD COLUMN IF NOT EXISTS image_url TEXT;

INSERT INTO storage.buckets (id, name, public)
VALUES ('purchase-images', 'purchase-images', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

CREATE POLICY "Users can read their own purchase images" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'purchase-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can upload their own purchase images" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'purchase-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own purchase images" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'purchase-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'purchase-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own purchase images" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'purchase-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
