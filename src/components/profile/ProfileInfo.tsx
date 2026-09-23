import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';

interface ProfileInfoProps {
  name: string;
  email: string;
  avatarUrl?: string | null;
  onEditPhoto: () => void;
  uploading?: boolean;
}

export const ProfileInfo = ({ name, email, avatarUrl, onEditPhoto, uploading }: ProfileInfoProps) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <Button
              size="icon"
              variant="secondary"
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
              onClick={onEditPhoto}
              disabled={uploading}
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          <div>
            <p className="font-semibold text-lg text-foreground">{name}</p>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
