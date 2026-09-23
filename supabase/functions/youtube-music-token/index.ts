import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { code, action, redirectUri } = await req.json();

    // Handle auth URL generation
    if (action === 'get_auth_url') {
      const clientId = Deno.env.get('YOUTUBE_MUSIC_CLIENT_ID');
      if (!clientId) {
        throw new Error('YouTube Music Client ID not configured');
      }

      const scope = 'https://www.googleapis.com/auth/youtube.readonly';
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scope)}&` +
        `access_type=offline&` +
        `prompt=consent`;

      console.log('Generated YouTube Music auth URL');

      return new Response(
        JSON.stringify({ authUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle token refresh
    if (action === 'refresh') {
      const refreshToken = code; // In this case, code is the refresh token
      
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: Deno.env.get('YOUTUBE_MUSIC_CLIENT_ID') ?? '',
          client_secret: Deno.env.get('YOUTUBE_MUSIC_CLIENT_SECRET') ?? '',
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('Token refresh failed:', errorText);
        throw new Error('Failed to refresh YouTube Music token');
      }

      const tokens = await tokenResponse.json();
      
      console.log('YouTube Music token refreshed successfully');

      return new Response(
        JSON.stringify({
          access_token: tokens.access_token,
          expires_in: tokens.expires_in,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle initial token exchange
    if (!code) {
      throw new Error('No authorization code provided');
    }

    console.log('Exchanging YouTube Music authorization code for tokens');

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: Deno.env.get('YOUTUBE_MUSIC_CLIENT_ID') ?? '',
        client_secret: Deno.env.get('YOUTUBE_MUSIC_CLIENT_SECRET') ?? '',
        redirect_uri: `${req.headers.get('origin')}/auth/youtube-callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      throw new Error('Failed to exchange authorization code');
    }

    const tokens = await tokenResponse.json();

    // Update user profile to mark YouTube Music as connected
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ music_service: 'youtube' })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to update user profile:', updateError);
    }

    console.log('YouTube Music tokens obtained successfully');

    return new Response(
      JSON.stringify({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in youtube-music-token function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
