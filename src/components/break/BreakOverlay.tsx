import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { X, ChevronLeft, ChevronRight, ThumbsUp, ThumbsDown, Music as MusicIcon, Volume2, VolumeX, Sparkles, Wind } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBreak } from '@/contexts/BreakContext';
import { useGooglePhotos } from '@/hooks/useGooglePhotos';
import { useBreakSessions } from '@/hooks/useBreakSessions';
import { useMusicStreaming } from '@/hooks/useMusicStreaming';
import { useDeviceGallery } from '@/hooks/useDeviceGallery';
import { Wellness3DScene } from '@/components/3d/Wellness3DScene';

interface BreakContent {
  id: string;
  type: 'photo' | 'music' | '3d';
  url: string;
  title?: string;
}

export const BreakOverlay = () => {
  const { isBreakActive, settings, endBreak, currentSessionId } = useBreak();
  const { fetchPhotos } = useGooglePhotos();
  const { getRandomPlaylist } = useMusicStreaming();
  const { rateContent } = useBreakSessions();
  const { getSelectedPhotos } = useDeviceGallery();
  const [timeRemaining, setTimeRemaining] = useState(settings.duration * 60);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [content, setContent] = useState<BreakContent[]>([]);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [musicUrl, setMusicUrl] = useState<string>('');
  const [view3DMode, setView3DMode] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Load content when break starts
  useEffect(() => {
    if (isBreakActive) {
      const loadContent = async () => {
        const newContent: BreakContent[] = [];
        
        const hasPhotos = settings.contentTypes.includes('photos');
        const hasMusic = settings.contentTypes.includes('music');
        
        if (hasPhotos) {
          // Add device gallery photos that are selected for breaks
          const selectedPhotos = getSelectedPhotos();
          if (selectedPhotos && selectedPhotos.length > 0) {
            selectedPhotos.forEach(photo => {
              if (photo.url) {
                newContent.push({
                  id: photo.id,
                  type: 'photo',
                  url: photo.url,
                  title: photo.file_name,
                });
              }
            });
          }

          // Add Google Photos with configured timeframe
          const startDays = (settings.photoTimeframeStart || 12) * 30;
          const endDays = (settings.photoTimeframeEnd || 24) * 30;
          const fetchedPhotos = await fetchPhotos(startDays, endDays);
          if (fetchedPhotos && fetchedPhotos.length > 0) {
            fetchedPhotos.forEach(photo => {
              newContent.push({
                id: photo.id,
                type: 'photo',
                url: photo.url,
                title: photo.filename,
              });
            });
          }
        }

        if (hasMusic) {
          const randomPlaylist = getRandomPlaylist();
          if (randomPlaylist) {
            setMusicUrl(randomPlaylist.url);
            if (!hasPhotos) {
              newContent.push({
                id: randomPlaylist.id,
                type: 'music',
                url: randomPlaylist.url,
                title: randomPlaylist.title,
              });
            }
          }
        }

        // Always add a 3D Mindful Breathing option for deep relaxation
        newContent.push({
          id: '3d-mindful-breathing',
          type: '3d',
          url: '',
          title: 'Mindful 3D Breathing Orb (Breathe In... Breathe Out)',
        });

        setContent(newContent);
        setCurrentIndex(0);
      };

      loadContent();
    } else {
      setContent([]);
      setMusicUrl('');
      setCurrentIndex(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBreakActive]);

  useEffect(() => {
    if (isBreakActive) {
      setTimeRemaining(settings.duration * 60);
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            endBreak();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isBreakActive, settings.duration, endBreak]);

  useEffect(() => {
    const timer = setTimeout(() => setShowControls(false), 3500);
    return () => clearTimeout(timer);
  }, [currentIndex, showControls]);

  // Control audio element volume and auto-play
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      
      if (musicUrl && isBreakActive) {
        audioRef.current.play().catch(() => {
          // Auto-play policy silent handle
        });
      }
    }
  }, [volume, isMuted, musicUrl, isBreakActive]);

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume[0]);
    if (newVolume[0] > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  if (!isBreakActive) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePrevious = () => {
    if (content.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? content.length - 1 : prev - 1));
    setShowControls(true);
  };

  const handleNext = () => {
    if (content.length === 0) return;
    setCurrentIndex((prev) => (prev === content.length - 1 ? 0 : prev + 1));
    setShowControls(true);
  };

  const handleRating = async (positive: boolean) => {
    if (!currentSessionId || content.length === 0 || !content[currentIndex]) return;
    
    const currentContent = content[currentIndex];
    const rating = positive ? 1 : -1;
    
    await rateContent(
      currentSessionId,
      currentContent.type === 'music' ? 'music' : 'photo',
      currentContent.id,
      rating
    );
  };

  const currentItem = content[currentIndex];

  return (
    <div
      className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md animate-fade-in select-none"
      onMouseMove={() => setShowControls(true)}
      onClick={() => setShowControls(true)}
    >
      {/* Background Audio */}
      {settings.audioPlaybackEnabled && musicUrl && (
        <audio
          ref={audioRef}
          autoPlay
          loop
          src={musicUrl}
          className="hidden"
        />
      )}

      {/* Main Content Area */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        {(!currentItem || currentItem.type === '3d') ? (
          // 3D Breathing Ambient Space
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <div className="absolute inset-0 pointer-events-none">
              <Wellness3DScene mode="breathing" />
            </div>
            <div className="relative z-10 text-center space-y-3 p-6 max-w-lg bg-background/40 backdrop-blur-md rounded-2xl border border-primary/20 shadow-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-medium">
                <Wind className="h-4 w-4 animate-pulse" />
                <span>Synchronize Your Breathing</span>
              </div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-400 to-accent bg-clip-text text-transparent">
                Deep Calm Recharge
              </h3>
              <p className="text-muted-foreground text-sm">
                Inhale as the 3D orb expands • Exhale slowly as it contracts
              </p>
            </div>
          </div>
        ) : currentItem.type === 'photo' ? (
          // Photo Display Mode
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <div className="absolute inset-0 opacity-25 pointer-events-none">
              <Wellness3DScene mode="ambient" />
            </div>
            <img
              src={currentItem.url}
              alt={currentItem.title || 'Break moment photo'}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl z-10 border border-white/10"
            />
          </div>
        ) : currentItem.type === 'music' ? (
          // Music Stream Display
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 p-4">
            <div className="max-w-3xl w-full px-4 text-center z-10 space-y-6">
              <div className="inline-flex p-5 rounded-full bg-primary/20 shadow-lg animate-pulse">
                <MusicIcon className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-3xl font-bold text-foreground">
                {currentItem.title || 'Curated Soundscapes'}
              </h3>
              <p className="text-muted-foreground text-base">
                Let your mind unwind to relaxing soundscapes
              </p>
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-primary/20 bg-background/30 backdrop-blur-md">
                <iframe
                  src={currentItem.url}
                  width="100%"
                  height="300"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  title={currentItem.title || 'Music player'}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 z-10">
            <Sparkles className="h-10 w-10 text-primary animate-spin" />
            <p className="text-xl font-medium text-foreground">Loading relaxing moments...</p>
          </div>
        )}
      </div>

      {/* Controls Overlay */}
      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-300 pointer-events-none',
          showControls ? 'opacity-100' : 'opacity-0'
        )}
      >
        {/* Floating Timer Pill */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-background/85 backdrop-blur-md px-6 py-2.5 rounded-full border border-primary/30 shadow-xl pointer-events-auto flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping" />
          <p className="text-2xl font-bold tracking-tight text-foreground">{formatTime(timeRemaining)}</p>
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Remaining</span>
        </div>

        {/* Left / Right Carousel Controls */}
        {content.length > 1 && (
          <>
            <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-auto">
              <Button
                size="icon"
                variant="secondary"
                className="h-12 w-12 rounded-full bg-background/80 backdrop-blur-md shadow-lg border border-white/10 hover:scale-110 transition-transform"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            </div>

            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-auto">
              <Button
                size="icon"
                variant="secondary"
                className="h-12 w-12 rounded-full bg-background/80 backdrop-blur-md shadow-lg border border-white/10 hover:scale-110 transition-transform"
                onClick={handleNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </>
        )}

        {/* Volume & Audio Controls */}
        {settings.audioPlaybackEnabled && musicUrl && (
          <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-background/85 backdrop-blur-md px-4 py-2.5 rounded-full border border-primary/20 shadow-lg pointer-events-auto">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={toggleMute}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              onValueChange={handleVolumeChange}
              max={1}
              step={0.01}
              className="w-24"
            />
          </div>
        )}

        {/* Thumbs Up / Down Rating */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-auto">
          <Button
            size="icon"
            variant="secondary"
            className="h-12 w-12 rounded-full bg-background/85 backdrop-blur-md shadow-lg hover:scale-110 transition-transform"
            onClick={() => handleRating(false)}
            title="Less like this"
          >
            <ThumbsDown className="h-5 w-5" />
          </Button>

          <Button
            size="icon"
            variant="secondary"
            className="h-12 w-12 rounded-full bg-background/85 backdrop-blur-md shadow-lg hover:scale-110 transition-transform text-primary"
            onClick={() => handleRating(true)}
            title="More like this"
          >
            <ThumbsUp className="h-5 w-5" />
          </Button>
        </div>

        {/* End Break Early */}
        <div className="absolute bottom-6 right-6 pointer-events-auto">
          <Button
            size="sm"
            variant="destructive"
            className="rounded-full gap-2 px-5 py-5 shadow-lg hover:scale-105 transition-transform"
            onClick={() => endBreak(true)}
          >
            <X className="h-4 w-4" />
            End Break
          </Button>
        </div>
      </div>

      {/* Content Title Tag */}
      {currentItem?.title && (
        <div
          className={cn(
            'absolute bottom-20 left-1/2 -translate-x-1/2 bg-background/85 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 shadow-lg transition-opacity duration-300 pointer-events-none',
            showControls ? 'opacity-100' : 'opacity-0'
          )}
        >
          <p className="text-sm font-medium text-foreground">{currentItem.title}</p>
        </div>
      )}
    </div>
  );
};
