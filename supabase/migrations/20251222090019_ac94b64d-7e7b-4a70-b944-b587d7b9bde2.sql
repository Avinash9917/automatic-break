-- Add UPDATE policy for gallery_photos table
CREATE POLICY "Users can update their own gallery photos metadata" 
ON public.gallery_photos 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);