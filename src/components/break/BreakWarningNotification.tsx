import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, X } from 'lucide-react';
import { useBreak } from '@/contexts/BreakContext';
import { cn } from '@/lib/utils';

export const BreakWarningNotification = () => {
  const { nextBreakTime, startBreak, postponeBreak, settings, isBreakActive } = useBreak();
  const [showWarning, setShowWarning] = useState(false);
  const [timeUntilBreak, setTimeUntilBreak] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (nextBreakTime && !isBreakActive) {
        const now = new Date();
        const timeLeft = nextBreakTime.getTime() - now.getTime();
        const secondsLeft = Math.floor(timeLeft / 1000);
        
        setTimeUntilBreak(secondsLeft);
        
        // Show warning in the last 2 minutes
        if (secondsLeft <= settings.warningMinutes * 60 && secondsLeft > 0) {
          setShowWarning(true);
        } else {
          setShowWarning(false);
        }
      } else {
        setShowWarning(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextBreakTime, isBreakActive, settings.warningMinutes]);

  if (!showWarning) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return `${secs}s`;
  };

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
      <Card className="w-80 shadow-lg border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Break Time Soon
            </CardTitle>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => setShowWarning(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Your break will start in{' '}
            <span className="font-semibold text-foreground">{formatTime(timeUntilBreak)}</span>
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                postponeBreak(5);
                setShowWarning(false);
              }}
              className="flex-1"
            >
              Postpone 5min
            </Button>
            <Button
              size="sm"
              onClick={() => {
                startBreak();
                setShowWarning(false);
              }}
              className="flex-1"
            >
              Take Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
