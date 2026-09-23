import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useProfileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { uploadAvatar } = useAuth();
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Invalid file type',
        description: 'Please upload a JPEG, PNG, WebP, or GIF image.',
      });
      return null;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: 'Please upload an image smaller than 2MB.',
      });
      return null;
    }

    setUploading(true);

    const { url, error } = await uploadAvatar(file);

    setUploading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: error.message,
      });
      return null;
    }

    toast({
      title: 'Success',
      description: 'Profile photo updated successfully.',
    });

    return url;
  };

  return { handleFileUpload, uploading };
};
