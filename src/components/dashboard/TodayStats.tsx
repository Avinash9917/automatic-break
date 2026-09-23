import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coffee, Clock, TrendingUp } from 'lucide-react';

interface TodayStatsProps {
  breaksTaken: number;
  totalMinutes: number;
  effectiveness: number;
}

export const TodayStats = ({ breaksTaken, totalMinutes, effectiveness }: TodayStatsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coffee className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">Breaks Taken</span>
          </div>
          <span className="text-lg font-semibold text-foreground">{breaksTaken}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">Total Minutes</span>
          </div>
          <span className="text-lg font-semibold text-foreground">{totalMinutes}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">Effectiveness</span>
          </div>
          <span className="text-lg font-semibold text-foreground">{effectiveness}%</span>
        </div>
      </CardContent>
    </Card>
  );
};
