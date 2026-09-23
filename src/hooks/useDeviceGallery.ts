import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getLocalGalleryPhotos, saveLocalGalleryPhoto, deleteLocalGalleryPhoto, updateLocalGalleryPhoto } from '@/lib/localAuthDb';

export interface GalleryPhoto {
  id: string;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
  photo_date?: string;
  selected_for_breaks?: boolean;
  url?: string;
}

const DEFAULT_SAMPLE_PHOTOS: GalleryPhoto[] = [
  {
    id: 'sample-1',
    file_path: 'sample-1.jpg',
    file_name: 'Serene Sunset Lake',
    file_size: 1024 * 350,
    mime_type: 'image/jpeg',
    uploaded_at: new Date().toISOString(),
    photo_date: new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString(),
    selected_for_breaks: true,
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
  },
  {
    id: 'sample-2',
    file_path: 'sample-2.jpg',
    file_name: 'Misty Pine Forest',
    file_size: 1024 * 420,
    mime_type: 'image/jpeg',
    uploaded_at: new Date().toISOString(),
    photo_date: new Date(Date.now() - 450 * 24 * 3600 * 1000).toISOString(),
    selected_for_breaks: true,
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800',
  },
  {
    id: 'sample-3',
    file_path: 'sample-3.jpg',
    file_name: 'Golden Mountain Range',
    file_size: 1024 * 510,
    mime_type: 'image/jpeg',
    uploaded_at: new Date().toISOString(),
    photo_date: new Date(Date.now() - 600 * 24 * 3600 * 1000).toISOString(),
    selected_for_breaks: true,
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
  },
];

export const useDeviceGallery = () => {
  const [photos, setPhotos] = useState<GalleryPhoto[]>(DEFAULT_SAMPLE_PHOTOS);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPhotos = useCallback(async () => {
    if (!user) {
      setPhotos(DEFAULT_SAMPLE_PHOTOS);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('gallery_photos')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const photosWithUrls = await Promise.all(
          (data || []).map(async (photo) => {
            const { data: urlData } = await supabase.storage
              .from('user-gallery')
              .createSignedUrl(photo.file_path, 3600);

            return {
              ...photo,
              url: urlData?.signedUrl || photo.url,
            };
          })
        );
        setPhotos(photosWithUrls);
        setLoading(false);
        return;
      }
    } catch {
      // Fall through to local gallery
    }

    const localPhotos = getLocalGalleryPhotos(user.id) as GalleryPhoto[];
    if (localPhotos.length > 0) {
      setPhotos(localPhotos);
    } else {
      setPhotos(DEFAULT_SAMPLE_PHOTOS);
    }
    setLoading(false);
  }, [user]);

  const uploadPhoto = async (file: File, photoDate?: Date): Promise<boolean> => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Not authenticated',
        description: 'Please log in to upload photos.',
      });
      return false;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    if (!validTypes.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Invalid file type',
        description: 'Please upload a JPEG, PNG, or WebP image.',
      });
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: 'Please upload an image smaller than 10MB.',
      });
      return false;
    }

    setLoading(true);
    try {
      // Read file into Data URL
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const newPhoto: GalleryPhoto = {
        id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file_path: file.name,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        uploaded_at: new Date().toISOString(),
        photo_date: photoDate?.toISOString() || new Date().toISOString(),
        selected_for_breaks: true,
        url: dataUrl,
      };

      saveLocalGalleryPhoto(user.id, newPhoto as unknown as Record<string, unknown>);

      // Try Supabase in background
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
        await supabase.storage.from('user-gallery').upload(fileName, file);
        await supabase.from('gallery_photos').insert({
          user_id: user.id,
          file_path: fileName,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          photo_date: photoDate?.toISOString(),
        });
      } catch {
        // Safe ignore
      }

      toast({
        title: 'Photo added! 📸',
        description: 'Your photo will be featured in upcoming mindful breaks.',
      });

      await fetchPhotos();
      return true;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Upload failed';
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: msg,
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getSelectedPhotos = (): GalleryPhoto[] => {
    return photos.filter(photo => photo.selected_for_breaks !== false);
  };

  const togglePhotoSelection = async (photoId: string, selected: boolean) => {
    if (!user) return;

    updateLocalGalleryPhoto(user.id, photoId, { selected_for_breaks: selected });
    setPhotos(photos.map(photo =>
      photo.id === photoId
        ? { ...photo, selected_for_breaks: selected }
        : photo
    ));

    try {
      await supabase
        .from('gallery_photos')
        .update({ selected_for_breaks: selected })
        .eq('id', photoId)
        .eq('user_id', user.id);
    } catch {
      // Silent catch
    }

    toast({
      title: selected ? 'Photo included' : 'Photo unselected',
      description: selected
        ? 'This photo will appear during breaks.'
        : 'This photo will be skipped during breaks.',
    });
  };

  const selectAllPhotos = async (selected: boolean) => {
    if (!user) return;

    photos.forEach(p => {
      updateLocalGalleryPhoto(user.id, p.id, { selected_for_breaks: selected });
    });
    setPhotos(photos.map(photo => ({ ...photo, selected_for_breaks: selected })));

    try {
      await supabase
        .from('gallery_photos')
        .update({ selected_for_breaks: selected })
        .eq('user_id', user.id);
    } catch {
      // Silent catch
    }

    toast({
      title: selected ? 'All photos selected' : 'All photos deselected',
      description: selected
        ? 'All photos will appear during breaks.'
        : 'No photos will appear during breaks.',
    });
  };

  const deletePhoto = async (photoId: string, filePath: string) => {
    if (!user) return;

    deleteLocalGalleryPhoto(user.id, photoId);
    setPhotos(photos.filter(p => p.id !== photoId));

    try {
      await supabase.storage.from('user-gallery').remove([filePath]);
      await supabase.from('gallery_photos').delete().eq('id', photoId);
    } catch {
      // Silent catch
    }

    toast({
      title: 'Photo deleted',
      description: 'The photo has been removed from your gallery.',
    });
  };

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  return {
    photos,
    loading,
    uploadPhoto,
    deletePhoto,
    refreshPhotos: fetchPhotos,
    getSelectedPhotos,
    togglePhotoSelection,
    selectAllPhotos,
  };
};
