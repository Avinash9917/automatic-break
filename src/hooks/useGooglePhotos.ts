import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Photo {
  id: string;
  url: string;
  filename: string;
  creationTime: string;
}

const DEFAULT_MOCK_PHOTOS: Photo[] = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    filename: 'Mountain Vista',
    creationTime: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
    filename: 'Beach Sunset',
    creationTime: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
    filename: 'Forest Path',
    creationTime: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const useGooglePhotos = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_PHOTOS_CLIENT_ID || '';
  const REDIRECT_URI = `${window.location.origin}/auth/callback`;
  const SCOPES = 'https://www.googleapis.com/auth/photoslibrary.readonly';

  const initiateAuth = () => {
    if (!GOOGLE_CLIENT_ID) {
      toast({
        variant: 'destructive',
        title: 'Configuration Error',
        description: 'Google Photos integration is not configured',
      });
      return;
    }

    // Generate CSRF token for OAuth security
    const state = crypto.randomUUID();
    sessionStorage.setItem('google_oauth_state', state);

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(SCOPES)}&` +
      `access_type=offline&` +
      `state=${state}&` +
      `prompt=consent`;
    
    window.location.href = authUrl;
  };

  const refreshAccessToken = useCallback(async (refreshToken: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('google-photos-token', {
        body: { refresh_token: refreshToken, action: 'refresh' },
      });

      if (error) throw error;

      if (data?.access_token) {
        sessionStorage.setItem('google_photos_access_token', data.access_token);
        sessionStorage.setItem(
          'google_photos_token_expiry',
          String(Date.now() + data.expires_in * 1000)
        );
        setAccessToken(data.access_token);
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      // Clear invalid tokens
      sessionStorage.removeItem('google_photos_access_token');
      sessionStorage.removeItem('google_photos_refresh_token');
      sessionStorage.removeItem('google_photos_token_expiry');
      setAccessToken(null);
    }
  }, []);

  const checkTokenExpiry = useCallback(async () => {
    const expiry = sessionStorage.getItem('google_photos_token_expiry');
    if (!expiry || Date.now() >= parseInt(expiry, 10)) {
      const refreshToken = sessionStorage.getItem('google_photos_refresh_token');
      if (refreshToken) {
        await refreshAccessToken(refreshToken);
      }
    }
  }, [refreshAccessToken]);

  const fetchPhotos = useCallback(async (startDate = 365, endDate = 730, count = 10): Promise<Photo[]> => {
    const token = sessionStorage.getItem('google_photos_access_token');
    
    if (!token) {
      setPhotos(DEFAULT_MOCK_PHOTOS);
      return DEFAULT_MOCK_PHOTOS;
    }

    await checkTokenExpiry();

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-photos', {
        body: {
          access_token: token,
          start_date: startDate,
          end_date: endDate,
          count,
        },
      });

      if (error) throw error;

      if (data?.photos && data.photos.length > 0) {
        setPhotos(data.photos);
        return data.photos;
      }
      setPhotos(DEFAULT_MOCK_PHOTOS);
      return DEFAULT_MOCK_PHOTOS;
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast({
        variant: 'destructive',
        title: 'Photos notice',
        description: 'Showing offline sample memories while reconnecting to Google Photos',
      });
      setPhotos(DEFAULT_MOCK_PHOTOS);
      return DEFAULT_MOCK_PHOTOS;
    } finally {
      setLoading(false);
    }
  }, [checkTokenExpiry, toast]);

  useEffect(() => {
    const token = sessionStorage.getItem('google_photos_access_token');
    if (token) {
      setAccessToken(token);
      checkTokenExpiry();
    }
  }, [checkTokenExpiry]);

  return {
    photos,
    loading,
    accessToken,
    isConnected: !!accessToken || !!profile?.google_photos_connected,
    initiateAuth,
    fetchPhotos,
  };
};
