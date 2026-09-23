import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TopNavigationProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  className?: string;
}

export const TopNavigation = ({ 
  title, 
  showBack = true, 
  rightAction,
  className 
}: TopNavigationProps) => {
  const navigate = useNavigate();

  return (
    <header className={cn('sticky top-0 bg-card border-b border-border z-40', className)}>
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-2 flex-1">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-lg font-semibold text-foreground truncate">{title}</h1>
        </div>
        {rightAction && <div className="ml-2">{rightAction}</div>}
      </div>
    </header>
  );
};
