import { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { Loader2, ArrowLeft } from 'lucide-react';

const resetSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

type ResetFormData = z.infer<typeof resetSchema>;

const ResetPassword = () => {
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ResetFormData) => {
    setIsLoading(true);
    
    const { error } = await resetPassword(data.email);

    setIsLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Reset Failed',
        description: error.message,
      });
      return;
    }

    setEmailSent(true);
    toast({
      title: 'Check your email',
      description: 'We sent you a password reset link.',
    });
  };

  return (
    <Layout>
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            <CardDescription>
              {emailSent 
                ? 'Check your email for the reset link' 
                : 'Enter your email to receive a password reset link'}
            </CardDescription>
          </CardHeader>
          {!emailSent && (
            <>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="you@example.com" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Send Reset Link'
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <Link 
                  to="/auth/login" 
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </Link>
              </CardFooter>
            </>
          )}
          {emailSent && (
            <CardFooter>
              <Link to="/auth/login" className="w-full">
                <Button variant="outline" className="w-full">
                  Return to Login
                </Button>
              </Link>
            </CardFooter>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default ResetPassword;
