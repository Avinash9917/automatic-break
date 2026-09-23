import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Image, Music } from 'lucide-react';

interface ContentTypeTogglesProps {
  photos: boolean;
  music: boolean;
  onPhotosChange: (checked: boolean) => void;
  onMusicChange: (checked: boolean) => void;
}

export const ContentTypeToggles = ({
  photos,
  music,
  onPhotosChange,
  onMusicChange,
}: ContentTypeTogglesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Types</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Checkbox
            id="photos"
            checked={photos}
            onCheckedChange={onPhotosChange}
          />
          <Label htmlFor="photos" className="flex items-center gap-2 cursor-pointer">
            <Image className="h-4 w-4" />
            Photos from memories
          </Label>
        </div>
        <div className="flex items-center gap-3">
          <Checkbox
            id="music"
            checked={music}
            onCheckedChange={onMusicChange}
          />
          <Label htmlFor="music" className="flex items-center gap-2 cursor-pointer">
            <Music className="h-4 w-4" />
            Relaxing music
          </Label>
        </div>
      </CardContent>
    </Card>
  );
};
