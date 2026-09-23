import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface BreakStatusCardProps {
  nextBreakMinutes: number;
  isActive: boolean;
}

export const BreakStatusCard = ({ nextBreakMinutes, isActive }: BreakStatusCardProps) => {
  return (
    <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Break Status</span>
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Scheduled"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <Clock className="h-8 w-8 text-primary" />
          <div>
            <p className="text-2xl font-bold text-foreground">{nextBreakMinutes} min</p>
            <p className="text-sm text-muted-foreground">Until next break</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
