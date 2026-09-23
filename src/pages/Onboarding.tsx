import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Layout } from '@/components/Layout';
import { useToast } from '@/hooks/use-toast';
import { useBreak } from '@/contexts/BreakContext';
import { useAuth } from '@/contexts/AuthContext';
import { Image, Music, Heart, Coffee, Book, Sparkles, CheckCircle2 } from 'lucide-react';

const interests = [
  { id: 'photos', label: 'Nostalgic Photos', icon: Image },
  { id: 'music', label: 'Relaxing Music', icon: Music },
  { id: 'wellness', label: 'Wellness Tips', icon: Heart },
  { id: 'coffee', label: 'Coffee Breaks', icon: Coffee },
  { id: 'reading', label: 'Reading Suggestions', icon: Book },
  { id: 'mindfulness', label: 'Mindfulness', icon: Sparkles },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateSettings } = useBreak();
  const { updateProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['photos', 'music']);
  const [breakFrequency, setBreakFrequency] = useState([60]);
  const [musicService, setMusicService] = useState<'spotify' | 'youtube'>('spotify');

  const handleInterestToggle = (interestId: string) => {
    setSelectedInterests(prev =>
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleComplete = async () => {
    const contentTypes: ('photos' | 'music')[] = [];
    if (selectedInterests.includes('photos')) contentTypes.push('photos');
    if (selectedInterests.includes('music')) contentTypes.push('music');
    if (contentTypes.length === 0) contentTypes.push('photos', 'music');

    await updateSettings({
      frequency: breakFrequency[0],
      contentTypes,
    });

    await updateProfile({
      music_service: musicService,
    });

    toast({
      title: 'Setup Complete!',
      description: 'Your preferences have been saved. Welcome to Automatic Break Time!',
    });
    navigate('/dashboard');
  };

  return (
    <Layout>
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <Card className="w-full max-w-2xl">
          {step === 1 && (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold">Welcome! 👋</CardTitle>
                <CardDescription className="text-lg">
                  Let's set up your personalized break experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
                  <p className="text-muted-foreground">
                    Automatic Break Time helps you take meaningful breaks throughout your day
                    with nostalgic photos, relaxing music, and smart scheduling.
                  </p>
                </div>
                <Button onClick={() => setStep(2)} className="w-full" size="lg">
                  Get Started
                </Button>
              </CardContent>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle>Select Your Interests</CardTitle>
                <CardDescription>
                  Choose what you'd like to experience during your breaks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {interests.map((interest) => {
                    const Icon = interest.icon;
                    const isSelected = selectedInterests.includes(interest.id);
                    
                    return (
                      <div
                        key={interest.id}
                        onClick={() => handleInterestToggle(interest.id)}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleInterestToggle(interest.id)}
                        />
                        <Icon className="h-5 w-5 text-primary" />
                        <Label className="cursor-pointer flex-1">{interest.label}</Label>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={() => setStep(3)} className="flex-1">
                    Continue
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle>Break Frequency</CardTitle>
                <CardDescription>
                  How often would you like to take breaks?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Every {breakFrequency[0]} minutes</span>
                    <span className="text-sm text-muted-foreground">
                      ({Math.floor(480 / breakFrequency[0])} breaks per 8-hour day)
                    </span>
                  </div>
                  <Slider
                    value={breakFrequency}
                    onValueChange={setBreakFrequency}
                    min={15}
                    max={240}
                    step={15}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>15 min</span>
                    <span>2 hrs</span>
                    <span>4 hrs</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={() => setStep(4)} className="flex-1">
                    Continue
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {step === 4 && (
            <>
              <CardHeader>
                <CardTitle>Music Service</CardTitle>
                <CardDescription>
                  Choose your preferred music streaming service
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() => setMusicService('spotify')}
                    className={`p-6 rounded-lg border-2 cursor-pointer transition-colors text-center ${
                      musicService === 'spotify'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Music className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="font-medium">Spotify</p>
                  </div>
                  <div
                    onClick={() => setMusicService('youtube')}
                    className={`p-6 rounded-lg border-2 cursor-pointer transition-colors text-center ${
                      musicService === 'youtube'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Music className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="font-medium">YouTube Music</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  You'll be able to connect your account in the settings later
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleComplete} className="flex-1">
                    Complete Setup
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default Onboarding;
