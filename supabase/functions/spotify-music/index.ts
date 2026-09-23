import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, genres, service = 'spotify', accessToken } = await req.json();
    
    // Validate genres input for security
    if (genres && !Array.isArray(genres)) {
      return new Response(
        JSON.stringify({ error: 'genres must be an array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (genres && genres.length > 10) {
      return new Response(
        JSON.stringify({ error: 'Maximum 10 genres allowed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate each genre string to prevent injection
    const validGenres = genres?.filter((g: unknown) => 
      typeof g === 'string' && 
      g.length > 0 && 
      g.length <= 50 &&
      /^[a-zA-Z0-9\s-]+$/.test(g)
    );

    // YouTube Music integration (requires access token)
    if (service === 'youtube' && accessToken) {
      if (action === 'fetch') {
        // Fetch playlists from YouTube Music API
        const searchTerms = validGenres?.length > 0 ? validGenres : ['relaxing music', 'ambient music', 'meditation music'];
        const playlists = [];

        for (const term of searchTerms.slice(0, 3)) {
          try {
            const response = await fetch(
              `https://www.googleapis.com/youtube/v3/search?` +
              `part=snippet&` +
              `q=${encodeURIComponent(term + ' playlist')}&` +
              `type=playlist&` +
              `maxResults=5&` +
              `videoCategoryId=10`, // Music category
              {
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                },
              }
            );

            if (response.ok) {
              const data = await response.json();
              interface YouTubeItem {
                id?: { playlistId?: string };
                snippet?: {
                  title?: string;
                  description?: string;
                  thumbnails?: { medium?: { url?: string } };
                };
              }
              const playlistItems = data.items?.map((item: YouTubeItem) => ({
                id: item.id?.playlistId || '',
                title: item.snippet?.title || '',
                url: `https://www.youtube.com/embed/playlist?list=${item.id?.playlistId || ''}`,
                genre: term,
                description: item.snippet?.description || '',
                thumbnail: item.snippet?.thumbnails?.medium?.url,
              })) || [];
              playlists.push(...playlistItems);
            }
          } catch (error) {
            console.error('Error fetching YouTube playlist:', error);
          }
        }

        console.log(`Found ${playlists.length} YouTube Music playlists`);

        return new Response(
          JSON.stringify({ playlists }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Spotify/Curated playlists (default)
    const relaxingPlaylists = [
      {
        id: '1',
        title: 'Peaceful Piano',
        url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO',
        genre: 'classical',
        description: 'Relax and indulge with beautiful piano pieces',
      },
      {
        id: '2',
        title: 'Ambient Relaxation',
        url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZd79rJ6a7lp',
        genre: 'ambient',
        description: 'Softly soothing ambient music',
      },
      {
        id: '3',
        title: 'Nature Sounds',
        url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZGPinyDUx7c',
        genre: 'nature',
        description: 'Calming sounds from nature',
      },
      {
        id: '4',
        title: 'Meditation Music',
        url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX9uKNf5jGX6m',
        genre: 'meditation',
        description: 'Music for mindfulness and meditation',
      },
      {
        id: '5',
        title: 'Lofi Beats',
        url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWWQRwui0ExPn',
        genre: 'lofi',
        description: 'Chill lofi beats to relax',
      },
    ];

    // Filter by validated genres if provided
    const filtered = validGenres && validGenres.length > 0
      ? relaxingPlaylists.filter(p => validGenres.includes(p.genre))
      : relaxingPlaylists;

    return new Response(
      JSON.stringify({ playlists: filtered }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
