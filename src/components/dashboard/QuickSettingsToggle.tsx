import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface QuickSettingsToggleProps {
  notificationsEnabled: boolean;
  smartSchedulingEnabled: boolean;
  onNotificationsChange: (enabled: boolean) => void;
  onSmartSchedulingChange: (enabled: boolean) => void;
}

export const QuickSettingsToggle = ({
  notificationsEnabled,
  smartSchedulingEnabled,
  onNotificationsChange,
  onSmartSchedulingChange,
}: QuickSettingsToggleProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="notifications" className="cursor-pointer">
            Notifications
          </Label>
          <Switch
            id="notifications"
            checked={notificationsEnabled}
            onCheckedChange={onNotificationsChange}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="smart-scheduling" className="cursor-pointer">
            Smart Scheduling
          </Label>
          <Switch
            id="smart-scheduling"
            checked={smartSchedulingEnabled}
            onCheckedChange={onSmartSchedulingChange}
          />
        </div>
      </CardContent>
    </Card>
  );
};
