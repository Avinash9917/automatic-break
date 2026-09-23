import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loading } from '@/components/Loading';

const YouTubeCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const error = params.get('error');

        if (error) {
          throw new Error(error);
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        // Exchange code for tokens
        const { data, error: tokenError } = await supabase.functions.invoke(
          'youtube-music-token',
          {
            body: { code },
          }
        );

        if (tokenError) throw tokenError;

        // Store tokens in sessionStorage
        sessionStorage.setItem('youtube_music_access_token', data.access_token);
        if (data.refresh_token) {
          sessionStorage.setItem('youtube_music_refresh_token', data.refresh_token);
        }
        
        const expiryTime = Date.now() + (data.expires_in * 1000);
        sessionStorage.setItem('youtube_music_token_expiry', expiryTime.toString());

        toast({
          title: 'Connected!',
          description: 'YouTube Music has been connected successfully',
        });

        navigate('/settings/integrations');
      } catch (error) {
        console.error('YouTube Music OAuth error:', error);
        toast({
          variant: 'destructive',
          title: 'Connection Failed',
          description: error.message || 'Failed to connect YouTube Music',
        });
        navigate('/settings/integrations');
      }
    };

    handleCallback();
  }, [navigate, toast]);

  return <Loading />;
};

export default YouTubeCallback;
