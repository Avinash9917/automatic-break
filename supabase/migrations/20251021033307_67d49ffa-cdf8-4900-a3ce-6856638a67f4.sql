-- Add UPDATE policy to content_ratings table
CREATE POLICY "Users can update their own content ratings"
ON public.content_ratings
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);