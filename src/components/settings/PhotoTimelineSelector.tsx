import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface PhotoTimelineSelectorProps {
  startMonths: number;
  endMonths: number;
  onStartChange: (value: number) => void;
  onEndChange: (value: number) => void;
}

export const PhotoTimelineSelector = ({
  startMonths,
  endMonths,
  onStartChange,
  onEndChange,
}: PhotoTimelineSelectorProps) => {
  const formatMonths = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years === 0) return `${remainingMonths} months`;
    if (remainingMonths === 0) return `${years} year${years > 1 ? 's' : ''}`;
    return `${years}y ${remainingMonths}m`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Photo Timeline Range</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>From {formatMonths(startMonths)} ago</Label>
          <Slider
            value={[startMonths]}
            onValueChange={(vals) => onStartChange(vals[0])}
            min={6}
            max={24}
            step={1}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label>To {formatMonths(endMonths)} ago</Label>
          <Slider
            value={[endMonths]}
            onValueChange={(vals) => onEndChange(vals[0])}
            min={12}
            max={36}
            step={1}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
};
