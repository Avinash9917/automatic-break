// Local Storage Database Fallback for 100% Guaranteed Offline & Standalone Operation

export interface LocalUser {
  id: string;
  email: string;
  password?: string;
  fullName?: string;
  createdAt: string;
}

export interface LocalSession {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
  user: {
    id: string;
    email: string;
    user_metadata: {
      full_name?: string;
    };
    aud: string;
    role: string;
    created_at: string;
  };
}

const LOCAL_USERS_KEY = 'abt_local_users';
const LOCAL_SESSION_KEY = 'abt_current_session';
const LOCAL_PREFS_KEY = 'abt_user_preferences';
const LOCAL_SESSIONS_KEY = 'abt_break_sessions';
const LOCAL_PHOTOS_KEY = 'abt_gallery_photos';
const LOCAL_PROFILES_KEY = 'abt_user_profiles';

export const getLocalUsers = (): LocalUser[] => {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveLocalUsers = (users: LocalUser[]) => {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
};

export const getLocalSession = (): LocalSession | null => {
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveLocalSession = (session: LocalSession | null) => {
  if (session) {
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(LOCAL_SESSION_KEY);
  }
};

export const createLocalSession = (email: string, fullName?: string): LocalSession => {
  const users = getLocalUsers();
  let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    user = {
      id: `local-user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      email,
      fullName: fullName || email.split('@')[0],
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    saveLocalUsers(users);
  }

  const session: LocalSession = {
    access_token: `mock-token-${Date.now()}`,
    token_type: 'bearer',
    expires_in: 3600 * 24 * 30, // 30 days
    expires_at: Math.floor(Date.now() / 1000) + 3600 * 24 * 30,
    user: {
      id: user.id,
      email: user.email,
      user_metadata: {
        full_name: user.fullName || fullName || email.split('@')[0],
      },
      aud: 'authenticated',
      role: 'authenticated',
      created_at: user.createdAt,
    },
  };

  saveLocalSession(session);
  return session;
};

// Local Preferences
export const getLocalPreferences = (userId: string) => {
  try {
    const raw = localStorage.getItem(`${LOCAL_PREFS_KEY}_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return {
    id: `pref-${userId}`,
    user_id: userId,
    break_frequency_minutes: 60,
    break_duration_minutes: 5,
    content_types: ['photos', 'music'],
    photo_timeframe_start: 12,
    photo_timeframe_end: 24,
    music_genres: ['ambient', 'classical', 'nature'],
    smart_scheduling: true,
    notification_enabled: true,
    notification_warning_minutes: 2,
    audio_playback_enabled: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

export const saveLocalPreferences = (userId: string, updates: Record<string, unknown>) => {
  const current = getLocalPreferences(userId);
  const updated = {
    ...current,
    ...updates,
    updated_at: new Date().toISOString(),
  };
  localStorage.setItem(`${LOCAL_PREFS_KEY}_${userId}`, JSON.stringify(updated));
  return updated;
};

// Local Break Sessions
export const getLocalBreakSessions = (userId: string) => {
  try {
    const raw = localStorage.getItem(`${LOCAL_SESSIONS_KEY}_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveLocalBreakSession = (userId: string, session: Record<string, unknown>) => {
  const sessions = getLocalBreakSessions(userId);
  const existingIndex = sessions.findIndex((s: { id: unknown }) => s.id === session.id);
  if (existingIndex >= 0) {
    sessions[existingIndex] = { ...sessions[existingIndex], ...session };
  } else {
    sessions.unshift(session);
  }
  localStorage.setItem(`${LOCAL_SESSIONS_KEY}_${userId}`, JSON.stringify(sessions));
  return session;
};

// Local Gallery Photos
export const getLocalGalleryPhotos = (userId: string) => {
  try {
    const raw = localStorage.getItem(`${LOCAL_PHOTOS_KEY}_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveLocalGalleryPhoto = (userId: string, photo: Record<string, unknown>) => {
  const photos = getLocalGalleryPhotos(userId);
  photos.unshift(photo);
  localStorage.setItem(`${LOCAL_PHOTOS_KEY}_${userId}`, JSON.stringify(photos));
  return photo;
};

export const deleteLocalGalleryPhoto = (userId: string, photoId: string) => {
  const photos = getLocalGalleryPhotos(userId).filter((p: { id: string }) => p.id !== photoId);
  localStorage.setItem(`${LOCAL_PHOTOS_KEY}_${userId}`, JSON.stringify(photos));
};

export const updateLocalGalleryPhoto = (userId: string, photoId: string, updates: Record<string, unknown>) => {
  const photos = getLocalGalleryPhotos(userId).map((p: { id: string }) =>
    p.id === photoId ? { ...p, ...updates } : p
  );
  localStorage.setItem(`${LOCAL_PHOTOS_KEY}_${userId}`, JSON.stringify(photos));
  return photos;
};
