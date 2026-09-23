-- Add photo_date column to store when the photo was actually taken
ALTER TABLE gallery_photos 
ADD COLUMN photo_date TIMESTAMP WITH TIME ZONE;

-- Add index for faster date queries
CREATE INDEX idx_gallery_photos_photo_date ON gallery_photos(photo_date);