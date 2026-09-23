import { useEffect } from 'react';
import { useBreak } from '@/contexts/BreakContext';
import { useToast } from '@/hooks/use-toast';

export const useBreakNotifications = () => {
  const { requestNotificationPermission, notificationPermission, settings } = useBreak();
  const { toast } = useToast();

  useEffect(() => {
    // Request permission on mount if notifications are enabled
    if (settings.notificationsEnabled && notificationPermission === 'default') {
      requestNotificationPermission().then((granted) => {
        if (!granted) {
          toast({
            title: 'Notifications blocked',
            description: 'Please enable notifications in your browser settings to receive break reminders.',
            variant: 'destructive',
          });
        }
      });
    }
  }, [settings.notificationsEnabled, notificationPermission, requestNotificationPermission, toast]);

  // Register service worker for notifications if supported
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(() => {
        // Service Worker ready for notifications
      });
    }
  }, []);

  return {
    requestPermission: requestNotificationPermission,
    permission: notificationPermission,
    isSupported: typeof Notification !== 'undefined',
  };
};
