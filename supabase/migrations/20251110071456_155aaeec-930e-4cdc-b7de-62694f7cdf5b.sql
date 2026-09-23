-- Add audio_playback_enabled column to user_preferences table
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS audio_playback_enabled BOOLEAN DEFAULT TRUE;