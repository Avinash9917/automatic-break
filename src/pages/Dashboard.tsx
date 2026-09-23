import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { BottomTabBar } from '@/components/navigation/BottomTabBar';
import { FloatingActionButton } from '@/components/navigation/FloatingActionButton';
import { BreakStatusCard } from '@/components/dashboard/BreakStatusCard';
import { QuickSettingsToggle } from '@/components/dashboard/QuickSettingsToggle';
import { RecentBreakCard } from '@/components/dashboard/RecentBreakCard';
import { TodayStats } from '@/components/dashboard/TodayStats';
import { useBreak } from '@/contexts/BreakContext';
import { useBreakNotifications } from '@/hooks/useBreakNotifications';
import { useToast } from '@/hooks/use-toast';
import { Interactive3DCard } from '@/components/3d/Interactive3DCard';
import { Button } from '@/components/ui/button';
import { Play, Sparkles, Wind } from 'lucide-react';
import { Wellness3DScene } from '@/components/3d/Wellness3DScene';

const Dashboard = () => {
  const { toast } = useToast();
  const { settings, updateSettings, nextBreakTime, startBreak, isBreakActive, sessions, stats } = useBreak();
  const { requestPermission, permission } = useBreakNotifications();
  const [minutesUntilBreak, setMinutesUntilBreak] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (nextBreakTime) {
        const diff = nextBreakTime.getTime() - Date.now();
        const minutes = Math.max(0, Math.floor(diff / (1000 * 60)));
        setMinutesUntilBreak(minutes);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [nextBreakTime]);

  const handleTakeBreak = () => {
    startBreak();
  };

  const handleNotificationsToggle = async (enabled: boolean) => {
    if (enabled && permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) {
        toast({
          title: 'Permission denied',
          description: 'Please enable notifications in browser settings',
          variant: 'destructive',
        });
        return;
      }
    }
    updateSettings({ notificationsEnabled: enabled });
  };

  return (
    <Layout>
      <div className="pb-24 pt-6 px-4 max-w-lg mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Your digital mindfulness & recharge center</p>
          </div>
          <Button
            onClick={handleTakeBreak}
            size="sm"
            className="rounded-full bg-gradient-to-r from-primary to-purple-600 gap-1.5 shadow-lg hover:scale-105 transition-transform"
          >
            <Play className="h-4 w-4" /> Start Break
          </Button>
        </div>
        
        {/* Interactive 3D Mini Wellness Orb Widget */}
        <Interactive3DCard intensity={10}>
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/15 via-purple-500/10 to-accent/15 border border-primary/20 p-5 shadow-lg">
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-semibold">
                  <Wind className="h-3 w-3" /> 3D Ambient Sync
                </div>
                <h3 className="text-lg font-bold text-foreground">Interactive Mindful Core</h3>
                <p className="text-xs text-muted-foreground">Move your cursor to interact with the relaxation field</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTakeBreak}
                className="rounded-full border-primary/30 backdrop-blur-md hover:bg-primary/15"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1 text-primary" /> Recharge
              </Button>
            </div>
            <div className="h-36 w-full -my-2 relative pointer-events-none select-none">
              <Wellness3DScene mode="ambient" className="min-h-[144px]" />
            </div>
          </div>
        </Interactive3DCard>

        {/* Break Status Card */}
        <Interactive3DCard intensity={8}>
          <BreakStatusCard nextBreakMinutes={minutesUntilBreak} isActive={isBreakActive} />
        </Interactive3DCard>
        
        {/* Quick Settings */}
        <Interactive3DCard intensity={8}>
          <QuickSettingsToggle
            notificationsEnabled={settings.notificationsEnabled}
            smartSchedulingEnabled={settings.smartScheduling}
            onNotificationsChange={handleNotificationsToggle}
            onSmartSchedulingChange={(enabled) => updateSettings({ smartScheduling: enabled })}
          />
        </Interactive3DCard>

        {/* Today's Stats */}
        {stats && (
          <Interactive3DCard intensity={8}>
            <TodayStats 
              breaksTaken={stats.total_breaks} 
              totalMinutes={stats.total_minutes} 
              effectiveness={stats.completion_rate} 
            />
          </Interactive3DCard>
        )}

        {/* Recent Breaks List */}
        <div className="space-y-3 pt-2">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span>Recent Break Sessions</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-normal">
              {sessions.length} recorded
            </span>
          </h2>
          {sessions.slice(0, 3).map((session) => {
            const timestamp = new Date(session.started_at);
            const duration = session.actual_duration || session.scheduled_duration;
            const type = session.content_type;
            const rating = session.effectiveness_rating || 0;
            
            return (
              <RecentBreakCard 
                key={session.id} 
                break_={{ id: session.id, timestamp, duration, type, rating }} 
              />
            );
          })}
          {sessions.length === 0 && (
            <div className="text-center py-6 border border-dashed rounded-xl border-border/80">
              <p className="text-muted-foreground text-sm">No breaks taken yet today.</p>
              <Button onClick={handleTakeBreak} variant="link" className="text-primary text-sm mt-1">
                Take your first 3D recharge session →
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <FloatingActionButton onClick={handleTakeBreak} />
      <BottomTabBar />
    </Layout>
  );
};

export default Dashboard;
