import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout } from '@/components/Layout';
import { WifiOff, RefreshCw } from 'lucide-react';

const Offline = () => {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <Layout>
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4">
              <WifiOff className="h-16 w-16 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">You're Offline</CardTitle>
            <CardDescription className="text-base">
              No internet connection detected. Some features may be limited.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Don't worry! You can still view cached content and your break history.
              New content will sync when you're back online.
            </p>
            <Button onClick={handleRetry} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Offline;
