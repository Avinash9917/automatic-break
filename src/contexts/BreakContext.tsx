import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPreferences, UserPreferences } from '@/hooks/useUserPreferences';
import { useBreakSessions, BreakSession, BreakStats } from '@/hooks/useBreakSessions';

export interface BreakSettings {
  frequency: number; // minutes
  duration: number; // minutes
  contentTypes: ('photos' | 'music')[];
  notificationsEnabled: boolean;
  warningMinutes: number;
  smartScheduling: boolean;
  musicGenres: string[];
  audioPlaybackEnabled: boolean;
  photoTimeframeStart: number;
  photoTimeframeEnd: number;
}

interface BreakContextType {
  settings: BreakSettings;
  updateSettings: (settings: Partial<BreakSettings>) => Promise<void>;
  nextBreakTime: Date | null;
  isBreakActive: boolean;
  startBreak: () => Promise<void>;
  endBreak: (endedEarly?: boolean, rating?: number) => Promise<void>;
  postponeBreak: (minutes: number) => void;
  requestNotificationPermission: () => Promise<boolean>;
  notificationPermission: NotificationPermission;
  currentSessionId: string | null;
  sessions: BreakSession[];
  stats: BreakStats | null;
}

const BreakContext = createContext<BreakContextType | undefined>(undefined);

export const BreakProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { preferences, loading: prefsLoading, updatePreferences } = useUserPreferences();
  const { sessions, stats, createSession, endSession } = useBreakSessions();
  
  const [settings, setSettings] = useState<BreakSettings>({
    frequency: 60,
    duration: 5,
    contentTypes: ['photos', 'music'],
    notificationsEnabled: true,
    warningMinutes: 2,
    smartScheduling: true,
    musicGenres: ['ambient', 'classical', 'nature'],
    audioPlaybackEnabled: true,
    photoTimeframeStart: 12,
    photoTimeframeEnd: 24,
  });

  const [nextBreakTime, setNextBreakTime] = useState<Date | null>(null);
  const [isBreakActive, setIsBreakActive] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  // Load settings from database
  useEffect(() => {
    if (preferences && !prefsLoading) {
      setSettings({
        frequency: preferences.break_frequency_minutes ?? 60,
        duration: preferences.break_duration_minutes ?? 5,
        contentTypes: (preferences.content_types as ('photos' | 'music')[]) || ['photos', 'music'],
        notificationsEnabled: preferences.notification_enabled ?? true,
        warningMinutes: preferences.notification_warning_minutes ?? 2,
        smartScheduling: preferences.smart_scheduling ?? true,
        musicGenres: preferences.music_genres || ['ambient', 'classical', 'nature'],
        audioPlaybackEnabled: preferences.audio_playback_enabled ?? true,
        photoTimeframeStart: preferences.photo_timeframe_start ?? 12,
        photoTimeframeEnd: preferences.photo_timeframe_end ?? 24,
      });
    }
  }, [preferences, prefsLoading]);

  const scheduleNextBreak = useCallback(() => {
    const next = new Date();
    next.setMinutes(next.getMinutes() + settings.frequency);
    setNextBreakTime(next);
  }, [settings.frequency]);

  // Initialize next break time
  useEffect(() => {
    if (!nextBreakTime && user) {
      scheduleNextBreak();
    }
  }, [user, nextBreakTime, scheduleNextBreak]);

  const sendNotification = useCallback((title: string, body: string) => {
    if (
      settings.notificationsEnabled &&
      notificationPermission === 'granted' &&
      typeof Notification !== 'undefined'
    ) {
      try {
        new Notification(title, {
          body,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
        });
      } catch (e) {
        console.error('Notification error:', e);
      }
    }
  }, [settings.notificationsEnabled, notificationPermission]);

  const startBreak = useCallback(async () => {
    if (!user) return;
    
    const contentType = settings.contentTypes.length === 2 
      ? 'mixed' 
      : settings.contentTypes[0] || 'photos';
    
    const { data, error } = await createSession(contentType, settings.duration);
    
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to start break session',
      });
      return;
    }
    
    if (data) {
      setCurrentSessionId(data.id);
    }
    
    setIsBreakActive(true);
    sendNotification('Break Time!', 'Time to take a break and relax');
    toast({
      title: 'Break time started',
      description: `Enjoy your ${settings.duration} minute break`,
    });
  }, [user, settings.contentTypes, settings.duration, createSession, sendNotification, toast]);

  // Check for break time
  useEffect(() => {
    const interval = setInterval(() => {
      if (nextBreakTime && !isBreakActive) {
        const now = new Date();
        const timeUntilBreak = nextBreakTime.getTime() - now.getTime();
        
        // Warning notification
        if (
          settings.notificationsEnabled &&
          timeUntilBreak <= settings.warningMinutes * 60 * 1000 &&
          timeUntilBreak > (settings.warningMinutes - 1) * 60 * 1000
        ) {
          sendNotification(
            'Break Time Soon',
            `Your break will start in ${settings.warningMinutes} minutes`
          );
        }

        // Start break
        if (timeUntilBreak <= 0) {
          startBreak();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextBreakTime, isBreakActive, settings, sendNotification, startBreak]);

  const endBreak = async (endedEarly = false, rating?: number) => {
    if (currentSessionId) {
      await endSession(currentSessionId, endedEarly, rating);
      setCurrentSessionId(null);
    }
    
    setIsBreakActive(false);
    scheduleNextBreak();
    toast({
      title: 'Break ended',
      description: 'Back to work! Next break scheduled.',
    });
  };

  const postponeBreak = (minutes: number) => {
    if (nextBreakTime) {
      const postponed = new Date(nextBreakTime);
      postponed.setMinutes(postponed.getMinutes() + minutes);
      setNextBreakTime(postponed);
      toast({
        title: 'Break postponed',
        description: `Your break has been postponed by ${minutes} minutes`,
      });
    }
  };

  const updateSettings = async (newSettings: Partial<BreakSettings>) => {
    if (!user) return;
    
    setSettings(prev => ({ ...prev, ...newSettings }));
    
    // Save to database
    const dbUpdates: Partial<UserPreferences> = {};
    if (newSettings.frequency !== undefined) {
      dbUpdates.break_frequency_minutes = newSettings.frequency;
    }
    if (newSettings.duration !== undefined) {
      dbUpdates.break_duration_minutes = newSettings.duration;
    }
    if (newSettings.contentTypes !== undefined) {
      dbUpdates.content_types = newSettings.contentTypes;
    }
    if (newSettings.notificationsEnabled !== undefined) {
      dbUpdates.notification_enabled = newSettings.notificationsEnabled;
    }
    if (newSettings.warningMinutes !== undefined) {
      dbUpdates.notification_warning_minutes = newSettings.warningMinutes;
    }
    if (newSettings.smartScheduling !== undefined) {
      dbUpdates.smart_scheduling = newSettings.smartScheduling;
    }
    if (newSettings.musicGenres !== undefined) {
      dbUpdates.music_genres = newSettings.musicGenres;
    }
    if (newSettings.audioPlaybackEnabled !== undefined) {
      dbUpdates.audio_playback_enabled = newSettings.audioPlaybackEnabled;
    }
    if (newSettings.photoTimeframeStart !== undefined) {
      dbUpdates.photo_timeframe_start = newSettings.photoTimeframeStart;
    }
    if (newSettings.photoTimeframeEnd !== undefined) {
      dbUpdates.photo_timeframe_end = newSettings.photoTimeframeEnd;
    }
    
    await updatePreferences(dbUpdates);
    
    // Reschedule next break if frequency changed
    if (newSettings.frequency) {
      const next = new Date();
      next.setMinutes(next.getMinutes() + newSettings.frequency);
      setNextBreakTime(next);
    }
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (typeof Notification === 'undefined') {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  return (
    <BreakContext.Provider
      value={{
        settings,
        updateSettings,
        nextBreakTime,
        isBreakActive,
        startBreak,
        endBreak,
        postponeBreak,
        requestNotificationPermission,
        notificationPermission,
        currentSessionId,
        sessions,
        stats,
      }}
    >
      {children}
    </BreakContext.Provider>
  );
};

export const useBreak = () => {
  const context = useContext(BreakContext);
  if (context === undefined) {
    throw new Error('useBreak must be used within a BreakProvider');
  }
  return context;
};
