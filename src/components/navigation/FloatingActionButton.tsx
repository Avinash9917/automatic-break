import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  onClick: () => void;
  className?: string;
}

export const FloatingActionButton = ({ onClick, className }: FloatingActionButtonProps) => {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className={cn(
        'fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-40',
        'bg-primary hover:bg-primary/90 text-primary-foreground',
        className
      )}
    >
      <Play className="h-6 w-6" />
    </Button>
  );
};
