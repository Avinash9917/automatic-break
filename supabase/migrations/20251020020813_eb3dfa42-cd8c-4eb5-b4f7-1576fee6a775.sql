-- Create user_preferences table for break settings
CREATE TABLE public.user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  break_frequency_minutes INTEGER DEFAULT 60 CHECK (break_frequency_minutes >= 15 AND break_frequency_minutes <= 240),
  break_duration_minutes INTEGER DEFAULT 5 CHECK (break_duration_minutes >= 1 AND break_duration_minutes <= 15),
  content_types TEXT[] DEFAULT '{"photos","music"}',
  photo_timeframe_start INTEGER DEFAULT 365,
  photo_timeframe_end INTEGER DEFAULT 730,
  music_genres TEXT[] DEFAULT '{"ambient","classical","nature"}',
  smart_scheduling BOOLEAN DEFAULT TRUE,
  notification_enabled BOOLEAN DEFAULT TRUE,
  notification_warning_minutes INTEGER DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS for user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_preferences
CREATE POLICY "Users can view their own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Create break_sessions table for tracking breaks
CREATE TABLE public.break_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  scheduled_duration INTEGER NOT NULL,
  actual_duration INTEGER,
  content_type TEXT CHECK (content_type IN ('photos', 'music', 'mixed')),
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  ended_early BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index for efficient queries
CREATE INDEX idx_break_sessions_user_started ON public.break_sessions(user_id, started_at DESC);

-- Enable RLS for break_sessions
ALTER TABLE public.break_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for break_sessions
CREATE POLICY "Users can view their own break sessions"
  ON public.break_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own break sessions"
  ON public.break_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own break sessions"
  ON public.break_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Create content_ratings table for AI learning
CREATE TABLE public.content_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  break_session_id UUID REFERENCES public.break_sessions(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('photo', 'music')),
  content_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= -1 AND rating <= 1),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index for content ratings
CREATE INDEX idx_content_ratings_user_type ON public.content_ratings(user_id, content_type, rating);

-- Enable RLS for content_ratings
ALTER TABLE public.content_ratings ENABLE ROW LEVEL SECURITY;

-- RLS policies for content_ratings
CREATE POLICY "Users can view their own content ratings"
  ON public.content_ratings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own content ratings"
  ON public.content_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at on user_preferences
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get user break statistics
CREATE OR REPLACE FUNCTION public.get_user_break_stats(user_uuid UUID, days INTEGER DEFAULT 30)
RETURNS TABLE (
  total_breaks BIGINT,
  total_minutes INTEGER,
  average_rating NUMERIC,
  completion_rate NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_breaks,
    COALESCE(SUM(actual_duration), 0)::INTEGER as total_minutes,
    ROUND(AVG(effectiveness_rating), 2) as average_rating,
    ROUND(
      (COUNT(*) FILTER (WHERE ended_early = FALSE)::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 
      2
    ) as completion_rate
  FROM public.break_sessions
  WHERE user_id = user_uuid
    AND started_at >= NOW() - (days || ' days')::INTERVAL;
END;
$$;

-- Function to create default preferences for new users
CREATE OR REPLACE FUNCTION public.create_default_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to create default preferences when user profile is created
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_preferences();