import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface NotificationSettingsProps {
  enabled: boolean;
  warningMinutes: number;
  onEnabledChange: (enabled: boolean) => void;
  onWarningMinutesChange: (minutes: number) => void;
}

export const NotificationSettings = ({
  enabled,
  warningMinutes,
  onEnabledChange,
  onWarningMinutesChange,
}: NotificationSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="notifications-enabled" className="cursor-pointer">
            Enable Notifications
          </Label>
          <Switch
            id="notifications-enabled"
            checked={enabled}
            onCheckedChange={onEnabledChange}
          />
        </div>
        {enabled && (
          <div className="space-y-2">
            <Label>Warning time: {warningMinutes} minutes before</Label>
            <Slider
              value={[warningMinutes]}
              onValueChange={(vals) => onWarningMinutesChange(vals[0])}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
