import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useYouTubeMusic = () => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = () => {
    const token = sessionStorage.getItem('youtube_music_access_token');
    const expiry = sessionStorage.getItem('youtube_music_token_expiry');
    
    if (token && expiry) {
      const isValid = Date.now() < parseInt(expiry);
      setIsConnected(isValid);
    } else {
      setIsConnected(false);
    }
  };

  const initiateAuth = async () => {
    try {
      // Get the OAuth URL from our edge function which has access to the client ID
      const { data, error } = await supabase.functions.invoke('youtube-music-token', {
        body: { action: 'get_auth_url', redirectUri: `${window.location.origin}/auth/youtube-callback` },
      });

      if (error) throw error;
      
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Failed to initiate YouTube Music auth:', error);
      toast({
        variant: 'destructive',
        title: 'Connection Failed',
        description: 'Failed to connect to YouTube Music. Please try again.',
      });
    }
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = sessionStorage.getItem('youtube_music_refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const { data, error } = await supabase.functions.invoke('youtube-music-token', {
        body: { code: refreshToken, action: 'refresh' },
      });

      if (error) throw error;

      sessionStorage.setItem('youtube_music_access_token', data.access_token);
      const expiryTime = Date.now() + (data.expires_in * 1000);
      sessionStorage.setItem('youtube_music_token_expiry', expiryTime.toString());

      setIsConnected(true);
      return data.access_token;
    } catch (error) {
      console.error('Failed to refresh YouTube Music token:', error);
      setIsConnected(false);
      throw error;
    }
  };

  const getValidToken = async () => {
    const token = sessionStorage.getItem('youtube_music_access_token');
    const expiry = sessionStorage.getItem('youtube_music_token_expiry');

    if (!token || !expiry) {
      return null;
    }

    // Check if token is expired or will expire in the next 5 minutes
    if (Date.now() >= parseInt(expiry) - 300000) {
      try {
        return await refreshAccessToken();
      } catch (error) {
        return null;
      }
    }

    return token;
  };

  const disconnect = () => {
    sessionStorage.removeItem('youtube_music_access_token');
    sessionStorage.removeItem('youtube_music_refresh_token');
    sessionStorage.removeItem('youtube_music_token_expiry');
    setIsConnected(false);
    
    toast({
      title: 'Disconnected',
      description: 'YouTube Music has been disconnected',
    });
  };

  return {
    isConnected,
    initiateAuth,
    getValidToken,
    disconnect,
  };
};
