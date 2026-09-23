-- Add DELETE policies to all core tables for GDPR compliance and user data ownership

-- user_profiles: Allow users to delete their own profile
CREATE POLICY "Users can delete their own profile"
  ON public.user_profiles 
  FOR DELETE
  USING (auth.uid() = id);

-- user_preferences: Allow users to delete their own preferences
CREATE POLICY "Users can delete their own preferences"
  ON public.user_preferences 
  FOR DELETE
  USING (auth.uid() = user_id);

-- break_sessions: Allow users to delete their own break sessions
CREATE POLICY "Users can delete their own break sessions"
  ON public.break_sessions 
  FOR DELETE
  USING (auth.uid() = user_id);

-- content_ratings: Allow users to delete their own content ratings
CREATE POLICY "Users can delete their own content ratings"
  ON public.content_ratings 
  FOR DELETE
  USING (auth.uid() = user_id);