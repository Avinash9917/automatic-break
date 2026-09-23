import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getLocalPreferences, saveLocalPreferences } from '@/lib/localAuthDb';

export interface UserPreferences {
  id: string;
  user_id: string;
  break_frequency_minutes: number;
  break_duration_minutes: number;
  content_types: string[];
  photo_timeframe_start: number;
  photo_timeframe_end: number;
  music_genres: string[];
  smart_scheduling: boolean;
  notification_enabled: boolean;
  notification_warning_minutes: number;
  audio_playback_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export const useUserPreferences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPreferences = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && data) {
        setPreferences(data as UserPreferences);
        setLoading(false);
        return;
      }
    } catch {
      // Fallback to local
    }

    const localPrefs = getLocalPreferences(user.id);
    setPreferences(localPrefs as UserPreferences);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchPreferences();
      
      let channel: any = null;
      try {
        channel = supabase
          .channel('user_preferences_changes')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'user_preferences',
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              if (payload.new) {
                setPreferences(payload.new as UserPreferences);
              }
            }
          )
          .subscribe();
      } catch {
        // Safe ignore
      }

      return () => {
        if (channel) {
          supabase.removeChannel(channel);
        }
      };
    }
  }, [user, fetchPreferences]);

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user) return { error: new Error('No user logged in') };

    // Always update local storage first for instantaneous UI update & offline reliability
    const localUpdated = saveLocalPreferences(user.id, updates as Record<string, unknown>);
    setPreferences(localUpdated as UserPreferences);

    try {
      await supabase
        .from('user_preferences')
        .update(updates)
        .eq('user_id', user.id);
    } catch {
      // Silent catch - local data is safely saved
    }

    return { error: null };
  };

  return {
    preferences,
    loading,
    updatePreferences,
    refreshPreferences: fetchPreferences,
  };
};
