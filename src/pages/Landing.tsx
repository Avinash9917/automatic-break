import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout } from '@/components/Layout';
import { Clock, Image, Music, Calendar, Brain, Shield, Sparkles, Play, Zap } from 'lucide-react';
import { Wellness3DScene } from '@/components/3d/Wellness3DScene';
import { Interactive3DCard } from '@/components/3d/Interactive3DCard';
import { useBreak } from '@/contexts/BreakContext';

const features = [
  {
    icon: Clock,
    title: 'Smart Break Scheduling',
    description: 'Automatic interruptions at customizable intervals to promote healthy screen time habits',
    gradient: 'from-blue-500/20 to-indigo-500/20',
  },
  {
    icon: Image,
    title: 'Nostalgic Memories',
    description: 'Relive photos from 1-2 years ago from Google Photos & your device during break time',
    gradient: 'from-purple-500/20 to-pink-500/20',
  },
  {
    icon: Music,
    title: 'Relaxing 432Hz Soundscapes',
    description: 'Enjoy ambient melodies and curated Spotify & YouTube music that calm the nervous system',
    gradient: 'from-emerald-500/20 to-teal-500/20',
  },
  {
    icon: Calendar,
    title: 'Personalized Timing',
    description: 'Set your preferred break frequency, duration, and gentle warning reminders',
    gradient: 'from-amber-500/20 to-orange-500/20',
  },
  {
    icon: Brain,
    title: '3D Mindful Breathing',
    description: 'Interactive 3D geometry and particle fields synchronized with proven relaxation rhythms',
    gradient: 'from-violet-500/20 to-purple-500/20',
  },
  {
    icon: Shield,
    title: 'Focus Protection',
    description: 'Smart snoozing and offline mode that never disrupt critical workflow moments',
    gradient: 'from-cyan-500/20 to-blue-500/20',
  },
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Remote Developer',
    content: 'The nostalgic photo breaks and 3D breathing sphere completely changed how I recharge between coding sprints!',
  },
  {
    name: 'Michael Torres',
    role: 'UX Designer',
    content: 'I used to get severe eye strain. Now I look forward to taking breaks with relaxing soundscapes.',
  },
  {
    name: 'Emma Williams',
    role: 'Product Manager',
    content: 'The smart scheduling is brilliant. It fits right into our daily workflow and keeps our team energized.',
  },
];

const Landing = () => {
  const navigate = useNavigate();
  const { startBreak } = useBreak();

  return (
    <Layout>
      {/* Hero Section with Interactive 3D Canvas */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 py-16 overflow-hidden bg-gradient-to-b from-background via-background/90 to-primary/5">
        {/* Background 3D Wellness Scene */}
        <div className="pointer-events-none absolute inset-0 z-0 opacity-45 select-none">
          <Wellness3DScene mode="hero" />
        </div>

        <div className="relative z-10 text-center space-y-8 max-w-4xl mx-auto backdrop-blur-[2px] p-6 rounded-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-2 shadow-sm animate-fade-in">
            <Sparkles className="h-4 w-4 animate-spin" />
            <span>Interactive 3D Digital Wellness Platform</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-foreground tracking-tight leading-tight">
            Take Meaningful Breaks with{' '}
            <span className="bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent">
              Automatic Break Time
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Recharge your mind with 3D breathing rhythms, nostalgic photo timelines, and soothing soundscapes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              onClick={() => navigate('/auth/register')} 
              size="lg"
              className="text-lg px-8 py-6 rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 shadow-xl hover:scale-105 transition-all duration-200"
            >
              Get Started Free <Zap className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              onClick={() => startBreak()} 
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 rounded-xl border-primary/30 backdrop-blur-md hover:bg-primary/10 hover:scale-105 transition-all duration-200"
            >
              <Play className="mr-2 h-5 w-5 text-primary" /> Test Live 3D Break
            </Button>
            <Button 
              onClick={() => navigate('/auth/login')} 
              variant="ghost"
              size="lg"
              className="text-lg px-6 py-6 rounded-xl hover:bg-muted/50"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section with 3D Tilt Cards */}
      <section className="py-24 px-4 bg-background relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase tracking-wider">
              Supercharged Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Everything You Need for Digital Wellness
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Engineered with science-backed mindfulness intervals and multimedia sensory resets.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Interactive3DCard key={index} intensity={12}>
                  <Card className={`h-full border border-primary/15 bg-gradient-to-br ${feature.gradient} backdrop-blur-sm hover:border-primary/40 transition-colors`}>
                    <CardHeader>
                      <div className="h-14 w-14 rounded-2xl bg-primary/15 flex items-center justify-center mb-4 shadow-md">
                        <Icon className="h-7 w-7 text-primary" />
                      </div>
                      <CardTitle className="text-2xl font-semibold">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base text-foreground/80 leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Interactive3DCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 bg-muted/20 border-y border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold text-foreground">
              Loved by Creators, Developers & Students
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands who transformed screen fatigue into daily vitality
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Interactive3DCard key={index} intensity={8}>
                <Card className="h-full bg-background/60 backdrop-blur-md border border-border/70 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">{testimonial.name}</CardTitle>
                    <CardDescription className="text-primary font-medium">{testimonial.role}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground italic leading-relaxed">"{testimonial.content}"</p>
                  </CardContent>
                </Card>
              </Interactive3DCard>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 px-4 bg-gradient-to-b from-background via-primary/5 to-background relative overflow-hidden">
        <div className="max-w-3xl mx-auto text-center space-y-8 relative z-10 backdrop-blur-sm p-8 rounded-3xl border border-primary/20 shadow-2xl">
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground">
            Ready to Transform Your Daily Routine?
          </h2>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">
            Experience healthier habits today with automated, enjoyable breaks.
          </p>
          <div className="pt-2">
            <Button 
              onClick={() => navigate('/auth/register')} 
              size="lg"
              className="text-lg px-10 py-6 rounded-xl bg-gradient-to-r from-primary via-purple-600 to-accent hover:opacity-95 shadow-2xl hover:scale-105 transition-all"
            >
              Create Free Account
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Landing;
