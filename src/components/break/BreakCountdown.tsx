import { useEffect, useState } from 'react';
import { useBreak } from '@/contexts/BreakContext';

interface BreakCountdownProps {
  className?: string;
}

export const BreakCountdown = ({ className }: BreakCountdownProps) => {
  const { nextBreakTime, isBreakActive } = useBreak();
  const [timeDisplay, setTimeDisplay] = useState('--:--');

  useEffect(() => {
    const interval = setInterval(() => {
      if (nextBreakTime && !isBreakActive) {
        const now = new Date();
        const diff = nextBreakTime.getTime() - now.getTime();
        
        if (diff <= 0) {
          setTimeDisplay('Now');
          return;
        }

        const totalMinutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        if (hours > 0) {
          setTimeDisplay(`${hours}h ${minutes}m`);
        } else {
          setTimeDisplay(`${minutes} min`);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextBreakTime, isBreakActive]);

  return <span className={className}>{timeDisplay}</span>;
};
