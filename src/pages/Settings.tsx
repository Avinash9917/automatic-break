import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { BottomTabBar } from '@/components/navigation/BottomTabBar';
import { TopNavigation } from '@/components/navigation/TopNavigation';
import { BreakFrequencySlider } from '@/components/settings/BreakFrequencySlider';
import { BreakDurationSelector } from '@/components/settings/BreakDurationSelector';
import { ContentTypeToggles } from '@/components/settings/ContentTypeToggles';
import { PhotoTimelineSelector } from '@/components/settings/PhotoTimelineSelector';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { MusicGenreSelector } from '@/components/settings/MusicGenreSelector';
import { MusicPreview } from '@/components/settings/MusicPreview';
import { DeviceGalleryManager } from '@/components/settings/DeviceGalleryManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useBreak } from '@/contexts/BreakContext';
import { useToast } from '@/hooks/use-toast';
import { Settings as SettingsIcon, Plug } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { settings, updateSettings } = useBreak();
  
  const [breakFrequency, setBreakFrequency] = useState(settings.frequency);
  const [breakDuration, setBreakDuration] = useState(settings.duration);
  const [photosEnabled, setPhotosEnabled] = useState(settings.contentTypes.includes('photos'));
  const [musicEnabled, setMusicEnabled] = useState(settings.contentTypes.includes('music'));
  const [photoStart, setPhotoStart] = useState(settings.photoTimeframeStart || 12);
  const [photoEnd, setPhotoEnd] = useState(settings.photoTimeframeEnd || 24);
  const [notificationsEnabled, setNotificationsEnabled] = useState(settings.notificationsEnabled);
  const [warningMinutes, setWarningMinutes] = useState(settings.warningMinutes);
  const [musicGenres, setMusicGenres] = useState<string[]>(settings.musicGenres || ['ambient', 'classical', 'nature']);

  const handleSave = () => {
    const contentTypes: ('photos' | 'music')[] = [];
    if (photosEnabled) contentTypes.push('photos');
    if (musicEnabled) contentTypes.push('music');

    updateSettings({
      frequency: breakFrequency,
      duration: breakDuration,
      contentTypes,
      notificationsEnabled,
      warningMinutes,
      musicGenres,
      photoTimeframeStart: photoStart,
      photoTimeframeEnd: photoEnd,
    });

    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  return (
    <Layout>
      <TopNavigation title="Settings" showBack={false} />
      <div className="pb-20 pt-6 px-4 max-w-lg mx-auto space-y-4">
        {/* Integrations Card */}
        <Card className="cursor-pointer hover:bg-accent/5 transition-colors" onClick={() => navigate('/settings/integrations')}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Plug className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>Integrations</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Connect Google Photos and music streaming services
            </p>
          </CardContent>
        </Card>

        {/* Break Settings Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10">
                <SettingsIcon className="h-5 w-5 text-secondary" />
              </div>
              <CardTitle>Break Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
        <BreakFrequencySlider value={breakFrequency} onChange={setBreakFrequency} />
        
        <BreakDurationSelector value={breakDuration} onChange={setBreakDuration} />
        
        <ContentTypeToggles
          photos={photosEnabled}
          music={musicEnabled}
          onPhotosChange={setPhotosEnabled}
          onMusicChange={setMusicEnabled}
        />

        {photosEnabled && (
          <PhotoTimelineSelector
            startMonths={photoStart}
            endMonths={photoEnd}
            onStartChange={setPhotoStart}
            onEndChange={setPhotoEnd}
          />
        )}

        {musicEnabled && (
          <MusicGenreSelector
            selectedGenres={musicGenres}
            onGenresChange={setMusicGenres}
          />
        )}

        <NotificationSettings
          enabled={notificationsEnabled}
          warningMinutes={warningMinutes}
          onEnabledChange={setNotificationsEnabled}
          onWarningMinutesChange={setWarningMinutes}
        />

            <Button onClick={handleSave} className="w-full">
              Save Settings
            </Button>
          </CardContent>
        </Card>

        {/* Audio Playback Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Audio Playback</CardTitle>
            <CardDescription>
              Enable background music during photo breaks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label htmlFor="audio-playback" className="text-sm font-medium">
                  Enable Audio Playback
                </label>
                <p className="text-sm text-muted-foreground">
                  Play relaxing music while viewing photos
                </p>
              </div>
              <Switch
                id="audio-playback"
                checked={settings.audioPlaybackEnabled}
                onCheckedChange={(checked) =>
                  updateSettings({ audioPlaybackEnabled: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Music Preview - Only show when music is enabled */}
        {musicEnabled && <MusicPreview />}

        {/* Device Gallery Manager */}
        <Card>
          <CardHeader>
            <CardTitle>Device Gallery</CardTitle>
            <CardDescription>
              Upload and manage photos from your device
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DeviceGalleryManager />
          </CardContent>
        </Card>
      </div>
      <BottomTabBar />
    </Layout>
  );
};

export default Settings;
