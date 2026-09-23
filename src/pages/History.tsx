import { Layout } from '@/components/Layout';
import { BottomTabBar } from '@/components/navigation/BottomTabBar';
import { TopNavigation } from '@/components/navigation/TopNavigation';
import { BreakCalendar } from '@/components/history/BreakCalendar';
import { BreakStatsChart } from '@/components/history/BreakStatsChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBreak } from '@/contexts/BreakContext';
import { useMemo } from 'react';

const History = () => {
  const { toast } = useToast();
  const { sessions, stats } = useBreak();

  // Process sessions into calendar dates
  const breakDates = useMemo(() => {
    return sessions.map(session => new Date(session.started_at));
  }, [sessions]);

  // Process sessions into weekly chart data
  const weeklyData = useMemo(() => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const breaksByDay = sessions
      .filter(session => new Date(session.started_at) >= weekAgo)
      .reduce((acc, session) => {
        const day = new Date(session.started_at).getDay();
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);
    
    return daysOfWeek.map((day, index) => ({
      day,
      breaks: breaksByDay[index] || 0,
    }));
  }, [sessions]);

  const handleExport = () => {
    const exportData = {
      sessions,
      stats,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `break-history-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Data Exported",
      description: "Your break history has been downloaded.",
    });
  };

  return (
    <Layout>
      <TopNavigation 
        title="Break History" 
        showBack={false}
        rightAction={
          <Button variant="ghost" size="icon" onClick={handleExport}>
            <Download className="h-5 w-5" />
          </Button>
        }
      />
      <div className="pb-20 pt-6 px-4 max-w-lg mx-auto space-y-4">
        <BreakCalendar breakDates={breakDates} />
        
        <BreakStatsChart data={weeklyData} />

        <Card>
          <CardHeader>
            <CardTitle>Monthly Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Breaks</span>
              <span className="font-semibold">{stats?.total_breaks || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Time</span>
              <span className="font-semibold">{stats?.total_minutes || 0} minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Average Effectiveness</span>
              <span className="font-semibold">{stats?.completion_rate || 0}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Average Rating</span>
              <span className="font-semibold">{stats?.average_rating?.toFixed(1) || 'N/A'} / 5</span>
            </div>
          </CardContent>
        </Card>
      </div>
      <BottomTabBar />
    </Layout>
  );
};

export default History;
