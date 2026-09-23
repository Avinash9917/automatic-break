-- Create storage bucket for user gallery photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-gallery', 'user-gallery', false);

-- Allow users to upload their own photos
CREATE POLICY "Users can upload their own gallery photos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'user-gallery' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own photos
CREATE POLICY "Users can view their own gallery photos"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'user-gallery' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own photos
CREATE POLICY "Users can delete their own gallery photos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'user-gallery' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create table to track gallery photos metadata
CREATE TABLE public.gallery_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, file_path)
);

-- Enable RLS on gallery_photos
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;

-- Users can view their own gallery photos
CREATE POLICY "Users can view their own gallery photos metadata"
ON public.gallery_photos
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own gallery photos
CREATE POLICY "Users can insert their own gallery photos metadata"
ON public.gallery_photos
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own gallery photos
CREATE POLICY "Users can delete their own gallery photos metadata"
ON public.gallery_photos
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_gallery_photos_user_id ON public.gallery_photos(user_id);