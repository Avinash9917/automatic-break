import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Shield, HelpCircle, LogOut } from 'lucide-react';

interface AccountActionsProps {
  onExportData: () => void;
  onPrivacySettings: () => void;
  onSupport: () => void;
  onLogout: () => void;
}

export const AccountActions = ({
  onExportData,
  onPrivacySettings,
  onSupport,
  onLogout,
}: AccountActionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={onExportData}
        >
          <Download className="h-4 w-4 mr-2" />
          Export My Data
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={onPrivacySettings}
        >
          <Shield className="h-4 w-4 mr-2" />
          Privacy Settings
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={onSupport}
        >
          <HelpCircle className="h-4 w-4 mr-2" />
          Support & Feedback
        </Button>
        <Button
          variant="destructive"
          className="w-full justify-start"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </CardContent>
    </Card>
  );
};
