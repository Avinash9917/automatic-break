import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Image, Music } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RecentBreak {
  id: string;
  timestamp: Date;
  duration: number;
  type: 'photos' | 'music' | 'mixed';
  rating?: number;
}

interface RecentBreakCardProps {
  break_: RecentBreak;
}

export const RecentBreakCard = ({ break_ }: RecentBreakCardProps) => {
  const getIcon = () => {
    if (break_.type === 'photos') return <Image className="h-5 w-5" />;
    if (break_.type === 'music') return <Music className="h-5 w-5" />;
    return <Image className="h-5 w-5" />;
  };

  return (
    <Card className="hover:bg-accent/5 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              {getIcon()}
            </div>
            <div>
              <p className="font-medium text-foreground">
                {break_.duration} minute break
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(break_.timestamp, { addSuffix: true })}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="capitalize">
            {break_.type}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
