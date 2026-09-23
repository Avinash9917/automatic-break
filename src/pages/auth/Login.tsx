import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Layout } from '@/components/Layout';
import { Loader2, Timer, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { Wellness3DScene } from '@/components/3d/Wellness3DScene';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signInAsDemo, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    
    const { error } = await signIn(data.email, data.password);

    setIsLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message || 'Please check your email and password.',
      });
      return;
    }

    toast({
      title: 'Welcome back! ✨',
      description: 'You have successfully logged in.',
    });
    
    navigate('/dashboard');
  };

  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    await signInAsDemo();
    setIsDemoLoading(false);
    navigate('/dashboard');
  };

  return (
    <Layout>
      <div className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden bg-background">
        {/* Interactive 3D Background Canvas */}
        <div className="pointer-events-none absolute inset-0 opacity-40 z-0 select-none">
          <Wellness3DScene mode="ambient" />
        </div>

        {/* Ambient Glow Orbs */}
        <div className="pointer-events-none absolute top-20 left-10 w-48 h-48 bg-primary/20 rounded-full blur-3xl animate-pulse z-0" />
        <div className="pointer-events-none absolute bottom-20 right-10 w-64 h-64 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000 z-0" />

        <div className="w-full max-w-md relative z-20">
          <Card className="w-full backdrop-blur-xl bg-background/90 border border-primary/25 shadow-2xl animate-fade-in hover:border-primary/40 transition-all duration-300">
            <CardHeader className="space-y-3 text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center animate-scale-in shadow-xl ring-4 ring-primary/20">
                <Timer className="h-8 w-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-3xl font-extrabold bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-base">
                Sign in to continue your mindful break journey
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-2 space-y-4">
              {/* 1-Click Instant Demo Access Button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleDemoLogin}
                disabled={isDemoLoading}
                className="w-full h-12 text-sm font-semibold border-primary/40 bg-gradient-to-r from-primary/10 via-purple-500/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 hover:border-primary transition-all shadow-md gap-2"
              >
                {isDemoLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Launching Demo...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 text-amber-500 fill-amber-500 animate-bounce" />
                    <span>Instant 1-Click Demo Login</span>
                    <Sparkles className="h-3.5 w-3.5 text-primary ml-auto" />
                  </>
                )}
              </Button>

              <div className="relative w-full my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/80" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background/90 px-3 text-muted-foreground font-medium">
                    Or sign in with email
                  </span>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-sm font-medium">Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="you@example.com" 
                            className="h-11 backdrop-blur-sm bg-background/70 transition-all duration-200 focus:ring-2 focus:ring-primary/30" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-sm font-medium">Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            className="h-11 backdrop-blur-sm bg-background/70 transition-all duration-200 focus:ring-2 focus:ring-primary/30"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="text-right">
                    <Link 
                      to="/auth/reset-password" 
                      className="text-xs text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-11 text-base font-semibold bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:scale-[1.01]" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ShieldCheck className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>

            <CardFooter className="flex flex-col space-y-3 pt-4 border-t border-border/50">
              <Link 
                to="/auth/register" 
                className="w-full"
              >
                <Button 
                  variant="ghost" 
                  className="w-full h-10 border border-primary/20 hover:bg-primary/10 transition-all"
                >
                  Don't have an account? Create one
                </Button>
              </Link>

              <Link 
                to="/" 
                className="text-xs text-center text-muted-foreground hover:text-foreground transition-colors mx-auto"
              >
                ← Back to home
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
