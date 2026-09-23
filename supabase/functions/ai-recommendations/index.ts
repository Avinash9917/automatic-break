import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { break_history, preferences } = await req.json();
    
    // Input validation
    if (break_history && (!Array.isArray(break_history) || break_history.length > 100)) {
      return new Response(JSON.stringify({ error: 'break_history must be an array with max 100 items' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (preferences && typeof preferences !== 'object') {
      return new Response(JSON.stringify({ error: 'preferences must be an object' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Fetch user's break stats and content ratings - using authenticated user.id
    const { data: stats } = await supabase.rpc('get_user_break_stats', {
      user_uuid: user.id,
      days: 30
    });

    const { data: ratings } = await supabase
      .from('content_ratings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    // Build context for AI
    const context = {
      total_breaks: stats?.[0]?.total_breaks || 0,
      average_rating: stats?.[0]?.average_rating || 0,
      completion_rate: stats?.[0]?.completion_rate || 0,
      preferences: preferences,
      recent_ratings: ratings || [],
    };

    // Generate recommendations using Lovable AI
    const systemPrompt = `You are a wellness and break optimization AI assistant. Based on the user's break history and preferences, provide personalized recommendations to improve their break effectiveness and enjoyment.

User Context:
- Total breaks in last 30 days: ${context.total_breaks}
- Average effectiveness rating: ${context.average_rating}/5
- Completion rate: ${context.completion_rate}%
- Content preferences: ${JSON.stringify(context.preferences)}
- Recent content ratings: ${context.recent_ratings.length} ratings

Provide 3-5 specific, actionable recommendations for improving break quality. Consider:
1. Break frequency and duration optimization
2. Content type suggestions based on ratings
3. Time of day recommendations
4. Activities to try during breaks
5. Patterns to avoid based on low ratings

Format your response as a JSON array of recommendations, each with:
{
  "title": "Short, actionable title",
  "description": "2-3 sentence explanation",
  "priority": "high" | "medium" | "low",
  "category": "timing" | "content" | "duration" | "wellness"
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Generate personalized break recommendations for me.' }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const recommendations = data.choices[0].message.content;

    // Parse and validate recommendations
    let parsedRecommendations;
    try {
      parsedRecommendations = JSON.parse(recommendations);
    } catch {
      // If AI didn't return valid JSON, wrap it in a default format
      parsedRecommendations = [{
        title: 'Personalized Recommendations',
        description: recommendations,
        priority: 'medium',
        category: 'wellness'
      }];
    }

    return new Response(JSON.stringify({ recommendations: parsedRecommendations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating recommendations:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
