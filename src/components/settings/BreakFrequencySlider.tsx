import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface BreakFrequencySliderProps {
  value: number;
  onChange: (value: number) => void;
}

export const BreakFrequencySlider = ({ value, onChange }: BreakFrequencySliderProps) => {
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Break Frequency</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Every {formatTime(value)}</Label>
            <span className="text-sm text-muted-foreground">{value} minutes</span>
          </div>
          <Slider
            value={[value]}
            onValueChange={(vals) => onChange(vals[0])}
            min={15}
            max={240}
            step={15}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>15 min</span>
            <span>4 hours</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
