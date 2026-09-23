import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useYouTubeMusic } from './useYouTubeMusic';
import { useAuth } from '@/contexts/AuthContext';

export interface Playlist {
  id: string;
  title: string;
  url: string;
  genre: string;
  description: string;
  thumbnail?: string;
}

const DEFAULT_PLAYLISTS: Playlist[] = [
  {
    id: '1',
    title: 'Peaceful Piano Relax',
    url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO',
    genre: 'classical',
    description: 'Relax and indulge with beautiful soothing piano pieces',
    thumbnail: 'https://images.unsplash.com/photo-1520523839898-50712825e3a7?w=300',
  },
  {
    id: '2',
    title: 'Deep Ambient Calm',
    url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZd79rJ6a7lp',
    genre: 'ambient',
    description: 'Soft atmospheric soundscapes for deep focus and stress relief',
    thumbnail: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=300',
  },
  {
    id: '3',
    title: 'Rainforest Nature Sounds',
    url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZGPinyDUx7c',
    genre: 'nature',
    description: 'Natural birdsong, soft rainfall, and forest breeze',
    thumbnail: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=300',
  },
  {
    id: '4',
    title: 'Mindful Meditation',
    url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX9uKNf5jGX6m',
    genre: 'meditation',
    description: 'Harmonic frequencies to calm the autonomic nervous system',
    thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300',
  },
  {
    id: '5',
    title: 'Chill Lofi Beats',
    url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWWQRwui0ExPn',
    genre: 'lofi',
    description: 'Mellow beats for a smooth mental reset',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300',
  },
];

export const useMusicStreaming = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const { isConnected: youtubeConnected, getValidToken } = useYouTubeMusic();
  const [playlists, setPlaylists] = useState<Playlist[]>(DEFAULT_PLAYLISTS);
  const [loading, setLoading] = useState(false);
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(DEFAULT_PLAYLISTS[0]);

  const fetchPlaylists = useCallback(async (genres?: string[]) => {
    setLoading(true);
    try {
      const musicService = profile?.music_service || 'spotify';
      let accessToken = null;

      if (musicService === 'youtube' && youtubeConnected) {
        accessToken = await getValidToken();
      }

      const { data, error } = await supabase.functions.invoke('spotify-music', {
        body: { 
          action: 'fetch', 
          genres,
          service: musicService,
          accessToken,
        },
      });

      if (!error && data?.playlists && data.playlists.length > 0) {
        setPlaylists(data.playlists);
        if (!currentPlaylist && data.playlists.length > 0) {
          setCurrentPlaylist(data.playlists[0]);
        }
        return data.playlists;
      }
      
      // Fallback to local curated playlists filtered by genre
      const filtered = genres && genres.length > 0
        ? DEFAULT_PLAYLISTS.filter(p => genres.includes(p.genre))
        : DEFAULT_PLAYLISTS;
      
      setPlaylists(filtered.length > 0 ? filtered : DEFAULT_PLAYLISTS);
      return filtered.length > 0 ? filtered : DEFAULT_PLAYLISTS;
    } catch (error) {
      console.error('Music fetch error:', error);
      toast({
        variant: 'destructive',
        title: 'Notice',
        description: 'Using offline curated relaxing playlists',
      });
      setPlaylists(DEFAULT_PLAYLISTS);
      return DEFAULT_PLAYLISTS;
    } finally {
      setLoading(false);
    }
  }, [profile?.music_service, youtubeConnected, getValidToken, currentPlaylist, toast]);

  const selectPlaylist = (playlist: Playlist) => {
    setCurrentPlaylist(playlist);
  };

  const getRandomPlaylist = (): Playlist | null => {
    if (playlists.length === 0) return DEFAULT_PLAYLISTS[0];
    const randomIndex = Math.floor(Math.random() * playlists.length);
    return playlists[randomIndex];
  };

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  return {
    playlists,
    loading,
    currentPlaylist,
    fetchPlaylists,
    selectPlaylist,
    getRandomPlaylist,
  };
};
