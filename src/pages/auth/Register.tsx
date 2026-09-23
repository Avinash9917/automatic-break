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
import { Loader2, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { Wellness3DScene } from '@/components/3d/Wellness3DScene';

const registerSchema = z.object({
  fullName: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp, signInAsDemo, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    
    const { error } = await signUp(data.email, data.password, data.fullName);

    setIsLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Notice',
        description: error.message || 'Creating account in offline local mode.',
      });
      navigate('/onboarding');
      return;
    }

    toast({
      title: 'Account created! 🎉',
      description: "Welcome! Let's personalize your 3D break experience.",
    });
    
    navigate('/onboarding');
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
        <div className="pointer-events-none absolute top-10 right-10 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl animate-pulse z-0" />
        <div className="pointer-events-none absolute bottom-10 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse delay-700 z-0" />

        <div className="w-full max-w-md relative z-20">
          <Card className="w-full backdrop-blur-xl bg-background/90 border border-primary/25 shadow-2xl animate-fade-in hover:border-primary/40 transition-all duration-300">
            <CardHeader className="space-y-2 text-center pb-4">
              <div className="mx-auto w-14 h-14 bg-gradient-to-br from-primary via-purple-500 to-accent rounded-2xl flex items-center justify-center shadow-xl ring-4 ring-primary/20">
                <Sparkles className="h-7 w-7 text-primary-foreground animate-spin" />
              </div>
              <CardTitle className="text-3xl font-extrabold bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent">
                Create Account
              </CardTitle>
              <CardDescription className="text-sm">
                Start your 3D digital wellness & recharge journey
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* 1-Click Instant Demo Button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleDemoLogin}
                disabled={isDemoLoading}
                className="w-full h-11 text-xs font-semibold border-primary/40 bg-gradient-to-r from-primary/10 via-purple-500/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 hover:border-primary transition-all shadow-md gap-2"
              >
                {isDemoLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Entering Demo...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 text-amber-500 fill-amber-500 animate-bounce" />
                    <span>Instant 1-Click Demo (No Signup Required)</span>
                  </>
                )}
              </Button>

              <div className="relative w-full my-1">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/80" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background/90 px-3 text-muted-foreground font-medium">
                    Or create your custom account
                  </span>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs font-medium">Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            type="text" 
                            placeholder="Alex Morgan" 
                            className="h-10 backdrop-blur-sm bg-background/70 focus:ring-2 focus:ring-primary/30" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs font-medium">Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="you@example.com" 
                            className="h-10 backdrop-blur-sm bg-background/70 focus:ring-2 focus:ring-primary/30" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs font-medium">Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            className="h-10 backdrop-blur-sm bg-background/70 focus:ring-2 focus:ring-primary/30" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs font-medium">Confirm Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            className="h-10 backdrop-blur-sm bg-background/70 focus:ring-2 focus:ring-primary/30" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-primary via-purple-600 to-accent hover:opacity-95 transition-all shadow-lg hover:shadow-xl hover:scale-[1.01] mt-2" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ShieldCheck className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>

            <CardFooter className="flex flex-col space-y-2 pt-2 border-t border-border/50">
              <div className="text-xs text-muted-foreground text-center">
                Already have an account?{' '}
                <Link to="/auth/login" className="text-primary font-semibold hover:underline">
                  Sign in
                </Link>
              </div>
              <Link 
                to="/" 
                className="text-xs text-muted-foreground hover:text-foreground text-center transition-colors"
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

export default Register;
