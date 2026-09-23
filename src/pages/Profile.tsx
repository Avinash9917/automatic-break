import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useProfileUpload } from '@/hooks/useProfileUpload';
import { Layout } from '@/components/Layout';
import { TopNavigation } from '@/components/navigation/TopNavigation';
import { BottomTabBar } from '@/components/navigation/BottomTabBar';
import { ProfileInfo } from '@/components/profile/ProfileInfo';
import { AccountActions } from '@/components/profile/AccountActions';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, signOut } = useAuth();
  const { handleFileUpload, uploading } = useProfileUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEditPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleExportData = async () => {
    try {
      // Create a data export with user profile and preferences
      const exportData = {
        profile,
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `profile-data-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Data Exported',
        description: 'Your profile data has been downloaded',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: 'Failed to export your data',
      });
    }
  };

  const handlePrivacySettings = () => {
    toast({
      title: 'Privacy Settings',
      description: 'Privacy settings page coming soon',
    });
  };

  const handleSupport = () => {
    toast({
      title: 'Support',
      description: 'For support, please contact support@automaticbreaktime.com',
    });
  };

  const handleLogout = async () => {
    await signOut();
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out',
    });
    navigate('/');
  };

  return (
    <ProtectedRoute>
      <Layout>
        <TopNavigation title="Profile" showBack={false} />
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex-1 overflow-y-auto pb-20 pt-16">
          <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
            <ProfileInfo
              name={profile?.full_name || user?.email?.split('@')[0] || 'User'}
              email={user?.email || ''}
              avatarUrl={profile?.avatar_url}
              onEditPhoto={handleEditPhoto}
              uploading={uploading}
            />

            <AccountActions
              onExportData={handleExportData}
              onPrivacySettings={handlePrivacySettings}
              onSupport={handleSupport}
              onLogout={handleLogout}
            />
          </div>
        </div>

        <BottomTabBar />
      </Layout>
    </ProtectedRoute>
  );
};

export default Profile;
