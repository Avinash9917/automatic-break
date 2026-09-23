import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, Volume2, Loader2, Music, Youtube } from 'lucide-react';
import { useMusicStreaming, Playlist } from '@/hooks/useMusicStreaming';
import { useYouTubeMusic } from '@/hooks/useYouTubeMusic';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

export const MusicPreview = () => {
  const { profile } = useAuth();
  const { isConnected: youtubeConnected } = useYouTubeMusic();
  const { playlists, loading, fetchPlaylists } = useMusicStreaming();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);

  useEffect(() => {
    if (playlists.length > 0 && !currentPlaylist) {
      setCurrentPlaylist(playlists[0]);
    }
  }, [playlists, currentPlaylist]);

  const handleTestPlayback = async () => {
    if (!currentPlaylist) {
      await fetchPlaylists();
    }
    setIsPlaying(!isPlaying);
  };

  const getMusicSource = () => {
    if (profile?.music_service === 'youtube' && youtubeConnected) {
      return { name: 'YouTube Music', icon: Youtube, color: 'text-red-500' };
    }
    return { name: 'Curated Playlists', icon: Music, color: 'text-green-500' };
  };

  const musicSource = getMusicSource();
  const MusicIcon = musicSource.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <Volume2 className="h-5 w-5 text-accent" />
            </div>
            <div>
              <CardTitle>Music Preview</CardTitle>
              <CardDescription>Test your music playback</CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="gap-1">
            <MusicIcon className={`h-3 w-3 ${musicSource.color}`} />
            {musicSource.name}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Preview a sample playlist to test your music connection before starting a break.
        </p>

        {currentPlaylist && isPlaying && (
          <div className="rounded-lg overflow-hidden bg-muted/50 p-4">
            <div className="flex items-start gap-3 mb-3">
              {currentPlaylist.thumbnail && (
                <img 
                  src={currentPlaylist.thumbnail} 
                  alt={currentPlaylist.title}
                  className="w-16 h-16 rounded object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{currentPlaylist.title}</h4>
                <p className="text-xs text-muted-foreground">{currentPlaylist.genre}</p>
              </div>
            </div>
            <div className="rounded overflow-hidden">
              <iframe
                src={currentPlaylist.url}
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title={currentPlaylist.title}
              />
            </div>
          </div>
        )}

        <Button 
          onClick={handleTestPlayback}
          variant={isPlaying ? "secondary" : "default"}
          className="w-full gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : isPlaying ? (
            <>
              <Pause className="h-4 w-4" />
              Stop Preview
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Test Playback
            </>
          )}
        </Button>

        {isPlaying && (
          <p className="text-xs text-center text-muted-foreground">
            This is how music will play during your breaks
          </p>
        )}
      </CardContent>
    </Card>
  );
};
