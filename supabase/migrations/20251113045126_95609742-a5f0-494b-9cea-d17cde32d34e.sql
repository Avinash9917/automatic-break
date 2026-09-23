-- Add selected_for_breaks column to gallery_photos table
ALTER TABLE gallery_photos 
ADD COLUMN selected_for_breaks BOOLEAN DEFAULT true;

-- Add index for faster queries
CREATE INDEX idx_gallery_photos_selected ON gallery_photos(user_id, selected_for_breaks) WHERE selected_for_breaks = true;