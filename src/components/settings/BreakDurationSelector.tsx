import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface BreakDurationSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

const durations = [1, 2, 3, 5, 10, 15];

export const BreakDurationSelector = ({ value, onChange }: BreakDurationSelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Break Duration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {durations.map((duration) => (
            <Button
              key={duration}
              variant={value === duration ? 'default' : 'outline'}
              onClick={() => onChange(duration)}
              className="w-full"
            >
              {duration} min
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
