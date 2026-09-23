import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getLocalBreakSessions, saveLocalBreakSession } from '@/lib/localAuthDb';

export interface BreakSession {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  scheduled_duration: number;
  actual_duration: number | null;
  content_type: 'photos' | 'music' | 'mixed';
  effectiveness_rating: number | null;
  ended_early: boolean;
  created_at: string;
}

export interface BreakStats {
  total_breaks: number;
  total_minutes: number;
  average_rating: number;
  completion_rate: number;
}

export const useBreakSessions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<BreakSession[]>([]);
  const [stats, setStats] = useState<BreakStats | null>(null);
  const [loading, setLoading] = useState(true);

  const calculateLocalStats = (localSessions: BreakSession[]): BreakStats => {
    const total_breaks = localSessions.length;
    const total_minutes = localSessions.reduce((acc, s) => acc + (s.actual_duration || s.scheduled_duration || 0), 0);
    const rated = localSessions.filter(s => s.effectiveness_rating !== null && s.effectiveness_rating !== undefined);
    const avgRating = rated.length > 0
      ? rated.reduce((acc, s) => acc + (s.effectiveness_rating || 0), 0) / rated.length
      : 5;
    const completed = localSessions.filter(s => !s.ended_early).length;
    const completion_rate = total_breaks > 0 ? Math.round((completed / total_breaks) * 100) : 100;

    return {
      total_breaks,
      total_minutes,
      average_rating: Math.round(avgRating * 10) / 10,
      completion_rate,
    };
  };

  const fetchSessions = useCallback(async (limit = 10) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('break_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(limit);

      if (!error && data && data.length > 0) {
        setSessions(data as BreakSession[]);
        setLoading(false);
        return;
      }
    } catch {
      // Fall through
    }

    const localList = getLocalBreakSessions(user.id) as BreakSession[];
    setSessions(localList.slice(0, limit));
    setLoading(false);
  }, [user]);

  const fetchStats = useCallback(async (days = 30) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('get_user_break_stats', {
        user_uuid: user.id,
        days,
      });

      if (!error && data && data.length > 0) {
        setStats({
          total_breaks: Number(data[0].total_breaks),
          total_minutes: Number(data[0].total_minutes),
          average_rating: Number(data[0].average_rating),
          completion_rate: Number(data[0].completion_rate),
        });
        return;
      }
    } catch {
      // Fall through
    }

    const localList = getLocalBreakSessions(user.id) as BreakSession[];
    setStats(calculateLocalStats(localList));
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchSessions();
      fetchStats();
    }
  }, [user, fetchSessions, fetchStats]);

  const createSession = async (
    contentType: 'photos' | 'music' | 'mixed',
    scheduledDuration: number
  ) => {
    if (!user) return { data: null, error: new Error('No user logged in') };

    const newSession: BreakSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      user_id: user.id,
      started_at: new Date().toISOString(),
      ended_at: null,
      scheduled_duration: scheduledDuration,
      actual_duration: null,
      content_type: contentType,
      effectiveness_rating: null,
      ended_early: false,
      created_at: new Date().toISOString(),
    };

    // Save locally
    saveLocalBreakSession(user.id, newSession as unknown as Record<string, unknown>);

    try {
      const { data, error } = await supabase
        .from('break_sessions')
        .insert({
          user_id: user.id,
          started_at: newSession.started_at,
          scheduled_duration: scheduledDuration,
          content_type: contentType,
        })
        .select()
        .single();

      if (!error && data) {
        await fetchSessions();
        return { data, error: null };
      }
    } catch {
      // Fallback works with local session
    }

    await fetchSessions();
    await fetchStats();
    return { data: newSession, error: null };
  };

  const endSession = async (
    sessionId: string,
    endedEarly: boolean,
    effectivenessRating?: number
  ) => {
    if (!user) return { error: new Error('No user logged in') };

    const localList = getLocalBreakSessions(user.id) as BreakSession[];
    const session = localList.find((s) => s.id === sessionId) || sessions.find((s) => s.id === sessionId);

    const endedAt = new Date();
    const startedAt = session ? new Date(session.started_at) : new Date();
    const actualDuration = Math.max(1, Math.round((endedAt.getTime() - startedAt.getTime()) / 1000 / 60));

    const updates = {
      ended_at: endedAt.toISOString(),
      actual_duration: actualDuration,
      ended_early: endedEarly,
      effectiveness_rating: effectivenessRating || 5,
    };

    saveLocalBreakSession(user.id, { id: sessionId, ...updates });

    try {
      await supabase
        .from('break_sessions')
        .update(updates)
        .eq('id', sessionId);
    } catch {
      // Silent catch
    }

    await fetchSessions();
    await fetchStats();
    return { error: null };
  };

  const rateContent = async (
    sessionId: string,
    contentType: 'photo' | 'music',
    contentId: string,
    rating: -1 | 0 | 1
  ) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      await supabase.from('content_ratings').insert({
        user_id: user.id,
        break_session_id: sessionId,
        content_type: contentType,
        content_id: contentId,
        rating,
      });
    } catch {
      // Silent catch
    }

    return { error: null };
  };

  return {
    sessions,
    stats,
    loading,
    createSession,
    endSession,
    rateContent,
    refreshSessions: fetchSessions,
    refreshStats: fetchStats,
  };
};
