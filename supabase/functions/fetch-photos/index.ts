import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { access_token, start_date = 365, end_date = 730, count = 10 } = await req.json();
    
    // Comprehensive input validation
    if (!access_token || typeof access_token !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid access token' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (access_token.length > 2048) {
      return new Response(JSON.stringify({ error: 'Access token too long' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (typeof start_date !== 'number' || start_date < 0 || start_date > 3650) {
      return new Response(JSON.stringify({ error: 'start_date must be between 0 and 3650 days' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (typeof end_date !== 'number' || end_date < 0 || end_date > 3650) {
      return new Response(JSON.stringify({ error: 'end_date must be between 0 and 3650 days' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (start_date >= end_date) {
      return new Response(JSON.stringify({ error: 'start_date must be less than end_date' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (typeof count !== 'number' || count < 1 || count > 50) {
      return new Response(JSON.stringify({ error: 'Count must be between 1 and 50' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate date range (1-2 years ago)
    const now = new Date();
    const oneYearAgo = new Date(now.getTime() - (start_date || 365) * 24 * 60 * 60 * 1000);
    const twoYearsAgo = new Date(now.getTime() - (end_date || 730) * 24 * 60 * 60 * 1000);

    // Search for photos in the specified date range
    const searchResponse = await fetch('https://photoslibrary.googleapis.com/v1/mediaItems:search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pageSize: count,
        filters: {
          dateFilter: {
            ranges: [{
              startDate: {
                year: twoYearsAgo.getFullYear(),
                month: twoYearsAgo.getMonth() + 1,
                day: twoYearsAgo.getDate(),
              },
              endDate: {
                year: oneYearAgo.getFullYear(),
                month: oneYearAgo.getMonth() + 1,
                day: oneYearAgo.getDate(),
              },
            }],
          },
          mediaTypeFilter: {
            mediaTypes: ['PHOTO'],
          },
        },
      }),
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('Google Photos API error:', errorText);
      throw new Error(`Google Photos API error: ${searchResponse.status}`);
    }

    const data = await searchResponse.json();
    
    interface MediaItem {
      id: string;
      baseUrl: string;
      filename: string;
      mimeType: string;
      mediaMetadata?: {
        creationTime?: string;
        width?: string;
        height?: string;
      };
    }

    // Extract relevant photo information
    const photos = (data.mediaItems || []).map((item: MediaItem) => ({
      id: item.id,
      url: item.baseUrl,
      filename: item.filename,
      mimeType: item.mimeType,
      creationTime: item.mediaMetadata?.creationTime,
      width: item.mediaMetadata?.width,
      height: item.mediaMetadata?.height,
    }));

    return new Response(JSON.stringify({ photos }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching photos:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
