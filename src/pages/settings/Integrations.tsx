import { Layout } from '@/components/Layout';
import { Link } from 'react-router-dom';
import { BottomTabBar } from '@/components/navigation/BottomTabBar';
import { TopNavigation } from '@/components/navigation/TopNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGooglePhotos } from '@/hooks/useGooglePhotos';
import { useYouTubeMusic } from '@/hooks/useYouTubeMusic';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useDeviceGallery } from '@/hooks/useDeviceGallery';
import { Camera, Music, CheckCircle, XCircle, Youtube, ImagePlus } from 'lucide-react';

const Integrations = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { isConnected: googlePhotosConnected, initiateAuth } = useGooglePhotos();
  const { isConnected: youtubeConnected, initiateAuth: initiateYouTubeAuth, disconnect: disconnectYouTube } = useYouTubeMusic();
  const { photos } = useDeviceGallery();

  const handleDisconnectGooglePhotos = () => {
    sessionStorage.removeItem('google_photos_access_token');
    sessionStorage.removeItem('google_photos_refresh_token');
    sessionStorage.removeItem('google_photos_token_expiry');
    
    toast({
      title: 'Disconnected',
      description: 'Google Photos has been disconnected',
    });
  };

  return (
    <Layout>
      <TopNavigation title="Integrations" showBack />
      <div className="pb-20 pt-6 px-4 max-w-lg mx-auto space-y-4">
        {/* Google Photos Integration */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Camera className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Google Photos</CardTitle>
                  <CardDescription>Access your photo memories</CardDescription>
                </div>
              </div>
              {googlePhotosConnected ? (
                <Badge variant="default" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  Not Connected
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect your Google Photos to display nostalgic memories from 1-2 years ago during
              your break times.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Read-only access to your photos</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Date-based filtering (1-2 years back)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Secure OAuth authentication</span>
              </div>
            </div>
            {googlePhotosConnected ? (
              <div className="flex gap-2">
                <Button onClick={handleDisconnectGooglePhotos} variant="outline" className="flex-1">
                  Disconnect
                </Button>
                <Button onClick={initiateAuth} variant="default" className="flex-1">
                  Reconnect
                </Button>
              </div>
            ) : (
              <Button onClick={initiateAuth} className="w-full">
                Connect Google Photos
              </Button>
            )}
          </CardContent>
        </Card>

        {/* YouTube Music Integration */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <Youtube className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <CardTitle>YouTube Music</CardTitle>
                  <CardDescription>Stream personalized playlists</CardDescription>
                </div>
              </div>
              {youtubeConnected ? (
                <Badge variant="default" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  Not Connected
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect YouTube Music to access personalized playlists and recommendations based on your
              listening preferences during break times.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Personalized playlists</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Your liked songs and history</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Secure OAuth authentication</span>
              </div>
            </div>
            {youtubeConnected ? (
              <div className="flex gap-2">
                <Button onClick={disconnectYouTube} variant="outline" className="flex-1">
                  Disconnect
                </Button>
                <Button onClick={initiateYouTubeAuth} variant="default" className="flex-1">
                  Reconnect
                </Button>
              </div>
            ) : (
              <Button onClick={initiateYouTubeAuth} className="w-full">
                Connect YouTube Music
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Spotify Integration (Curated) */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Music className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <CardTitle>Curated Playlists</CardTitle>
                  <CardDescription>No login required</CardDescription>
                </div>
              </div>
              <Badge variant="default" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Access hand-picked relaxing playlists from Spotify without any login. Perfect for ambient,
              classical, nature sounds, and meditation music.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Curated relaxing playlists</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Multiple genres available</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>No setup required</span>
              </div>
            </div>
            <Button variant="outline" className="w-full" disabled>
              Always Available
            </Button>
          </CardContent>
        </Card>

        {/* Device Gallery - Always Available */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <ImagePlus className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Device Gallery</CardTitle>
                  <CardDescription>
                    {photos.length} {photos.length === 1 ? 'photo' : 'photos'} uploaded
                  </CardDescription>
                </div>
              </div>
              <Badge variant="default" className="gap-1 bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                <CheckCircle className="h-3 w-3" />
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload photos from your device to display during breaks. Photos are stored securely
              and only visible to you.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Secure private storage</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>No external account needed</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Full control over your photos</span>
              </div>
            </div>
            <Button variant="default" className="w-full" asChild>
              <Link to="/settings">Manage Photos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <BottomTabBar />
    </Layout>
  );
};

export default Integrations;
