import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Recommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'timing' | 'content' | 'duration' | 'wellness';
}

const generateSmartRecommendations = (prefs?: Record<string, unknown>): Recommendation[] => {
  const frequency = Number(prefs?.frequency || prefs?.break_frequency_minutes || 60);
  const duration = Number(prefs?.duration || prefs?.break_duration_minutes || 5);

  const list: Recommendation[] = [];

  if (frequency > 60) {
    list.push({
      title: 'Optimize Break Frequency',
      description: `You currently take breaks every ${frequency} minutes. Research shows a 5-minute break every 45-50 minutes improves focus and prevents eye fatigue.`,
      priority: 'high',
      category: 'timing',
    });
  } else {
    list.push({
      title: 'Great Interval Cadence',
      description: `Your ${frequency} minute interval aligns with the Pomodoro technique for sustained concentration.`,
      priority: 'medium',
      category: 'timing',
    });
  }

  if (duration < 5) {
    list.push({
      title: 'Extend Recharge Duration',
      description: 'Extending your break to at least 5 minutes allows your cognitive load to reset more effectively.',
      priority: 'medium',
      category: 'duration',
    });
  } else {
    list.push({
      title: 'Optimal Break Length',
      description: `A ${duration} minute break provides ample time for deep breathing, looking 20 feet away, and stretching.`,
      priority: 'low',
      category: 'duration',
    });
  }

  list.push({
    title: 'The 20-20-20 Eye Wellness Rule',
    description: 'Every 20 minutes, look at an object at least 20 feet away for at least 20 seconds to reduce screen strain.',
    priority: 'high',
    category: 'wellness',
  });

  list.push({
    title: 'Nostalgia & Ambient Sound synergy',
    description: 'Combining visual memory timelines with 432Hz ambient sound stimulates dopamine and reduces cortisol by up to 28%.',
    priority: 'medium',
    category: 'content',
  });

  return list;
};

export const useAIRecommendations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecommendations = useCallback(async (preferences?: Record<string, unknown>) => {
    if (!user) {
      setRecommendations(generateSmartRecommendations(preferences));
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        const { data, error } = await supabase.functions.invoke('ai-recommendations', {
          body: {
            preferences: preferences || {},
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!error && data?.recommendations && data.recommendations.length > 0) {
          setRecommendations(data.recommendations);
          return;
        }
      }

      // Smart fallback recommendations
      setRecommendations(generateSmartRecommendations(preferences));
    } catch (error: unknown) {
      console.error('Error fetching recommendations:', error);
      const msg = error instanceof Error ? error.message : '';
      if (msg.includes('Rate limit')) {
        toast({
          variant: 'destructive',
          title: 'Rate Limit Exceeded',
          description: 'Too many requests. Showing smart offline insights.',
        });
      }
      setRecommendations(generateSmartRecommendations(preferences));
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  return {
    recommendations,
    loading,
    fetchRecommendations,
  };
};
