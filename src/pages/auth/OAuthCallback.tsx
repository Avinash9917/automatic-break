import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loading } from '@/components/Loading';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState('Processing...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        const error = params.get('error');

        // Check for errors
        if (error) {
          throw new Error(error);
        }

        // Verify CSRF token
        const savedState = sessionStorage.getItem('google_oauth_state');
        if (!state || state !== savedState) {
          throw new Error('Invalid state parameter - possible CSRF attack');
        }

        sessionStorage.removeItem('google_oauth_state');

        if (!code) {
          throw new Error('No authorization code received');
        }

        setStatus('Exchanging authorization code...');

        // Exchange code for tokens
        const { data, error: exchangeError } = await supabase.functions.invoke(
          'google-photos-token',
          {
            body: { code, action: 'exchange' },
          }
        );

        if (exchangeError) throw exchangeError;

        if (data?.access_token) {
          // Store tokens in session storage (in production, consider more secure storage)
          sessionStorage.setItem('google_photos_access_token', data.access_token);
          if (data.refresh_token) {
            sessionStorage.setItem('google_photos_refresh_token', data.refresh_token);
          }
          sessionStorage.setItem(
            'google_photos_token_expiry',
            String(Date.now() + data.expires_in * 1000)
          );

          toast({
            title: 'Success!',
            description: 'Google Photos connected successfully',
          });

          navigate('/settings/integrations');
        } else {
          throw new Error('No access token received');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        toast({
          variant: 'destructive',
          title: 'Connection Failed',
          description: error instanceof Error ? error.message : 'Failed to connect Google Photos',
        });
        navigate('/settings/integrations');
      }
    };

    handleCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loading />
        <p className="text-foreground">{status}</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
