import { useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { TopNavigation } from '@/components/navigation/TopNavigation';
import { BottomTabBar } from '@/components/navigation/BottomTabBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Lightbulb, Clock, Heart, Zap } from 'lucide-react';
import { useAIRecommendations } from '@/hooks/useAIRecommendations';
import { useBreak } from '@/contexts/BreakContext';
import { Loading } from '@/components/Loading';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const categoryIcons = {
  timing: Clock,
  content: Heart,
  duration: Zap,
  wellness: Lightbulb,
};

const priorityColors = {
  high: 'destructive',
  medium: 'default',
  low: 'secondary',
} as const;

const Recommendations = () => {
  const { recommendations, loading, fetchRecommendations } = useAIRecommendations();
  const { settings } = useBreak();

  useEffect(() => {
    fetchRecommendations(settings as unknown as Record<string, unknown>);
  }, [fetchRecommendations, settings]);

  const handleRefresh = () => {
    fetchRecommendations(settings as unknown as Record<string, unknown>);
  };

  return (
    <ProtectedRoute>
      <Layout>
        <TopNavigation 
          title="AI Recommendations" 
          showBack={false}
          rightAction={
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          }
        />
        
        <div className="pb-20 pt-6 px-4 max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <Lightbulb className="h-12 w-12 mx-auto text-primary" />
            <h1 className="text-2xl font-bold text-foreground">
              Personalized Break Insights
            </h1>
            <p className="text-muted-foreground">
              AI-powered suggestions to optimize your break experience
            </p>
          </div>

          {loading ? (
            <Loading />
          ) : recommendations.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">
                  Start taking breaks to receive personalized recommendations!
                </p>
                <Button 
                  onClick={handleRefresh} 
                  className="mt-4"
                  variant="outline"
                >
                  Generate Recommendations
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec, index) => {
                const Icon = categoryIcons[rec.category] || Lightbulb;
                return (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{rec.title}</CardTitle>
                            <div className="flex gap-2 mt-2">
                              <Badge variant={priorityColors[rec.priority]}>
                                {rec.priority}
                              </Badge>
                              <Badge variant="outline">
                                {rec.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        {rec.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-sm">About AI Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>
                These recommendations are generated using AI based on your break history, 
                preferences, and effectiveness ratings. Refresh to get new suggestions as 
                your usage patterns evolve.
              </p>
            </CardContent>
          </Card>
        </div>

        <BottomTabBar />
      </Layout>
    </ProtectedRoute>
  );
};

export default Recommendations;
