import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Music } from 'lucide-react';

interface MusicGenreSelectorProps {
  selectedGenres: string[];
  onGenresChange: (genres: string[]) => void;
}

const AVAILABLE_GENRES = [
  { id: 'ambient', label: 'Ambient', description: 'Atmospheric and spacious sounds' },
  { id: 'classical', label: 'Classical', description: 'Peaceful piano and orchestral music' },
  { id: 'nature', label: 'Nature Sounds', description: 'Rain, ocean, forest sounds' },
  { id: 'meditation', label: 'Meditation', description: 'Mindfulness and relaxation' },
  { id: 'lofi', label: 'Lo-fi Beats', description: 'Chill hip-hop instrumental beats' },
  { id: 'acoustic', label: 'Acoustic', description: 'Gentle acoustic guitar and strings' },
  { id: 'jazz', label: 'Smooth Jazz', description: 'Mellow jazz for relaxation' },
  { id: 'instrumental', label: 'Instrumental', description: 'Calming instrumental music' },
];

export const MusicGenreSelector = ({
  selectedGenres,
  onGenresChange,
}: MusicGenreSelectorProps) => {
  const handleGenreToggle = (genreId: string) => {
    if (selectedGenres.includes(genreId)) {
      onGenresChange(selectedGenres.filter(g => g !== genreId));
    } else {
      onGenresChange([...selectedGenres, genreId]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Music className="h-5 w-5 text-primary" />
          <CardTitle>Music Genres</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground mb-4">
          Select the types of relaxing music you'd like to hear during breaks
        </p>
        <div className="grid gap-4">
          {AVAILABLE_GENRES.map((genre) => (
            <div key={genre.id} className="flex items-start gap-3">
              <Checkbox
                id={genre.id}
                checked={selectedGenres.includes(genre.id)}
                onCheckedChange={() => handleGenreToggle(genre.id)}
                className="mt-1"
              />
              <div className="flex-1 space-y-1">
                <Label
                  htmlFor={genre.id}
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  {genre.label}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {genre.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        {selectedGenres.length === 0 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
            Select at least one genre to enable music during breaks
          </p>
        )}
      </CardContent>
    </Card>
  );
};
