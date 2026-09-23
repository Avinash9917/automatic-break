import { useRef } from 'react';
import { useDeviceGallery } from '@/hooks/useDeviceGallery';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, Trash2, Image as ImageIcon, CheckSquare, Square } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

export const DeviceGalleryManager = () => {
  const { photos, loading, uploadPhoto, deletePhoto, togglePhotoSelection, selectAllPhotos } = useDeviceGallery();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedCount = photos.filter(p => p.selected_for_breaks).length;
  const allSelected = photos.length > 0 && selectedCount === photos.length;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Upload all files without date picker
    for (let i = 0; i < files.length; i++) {
      await uploadPhoto(files[i]);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Device Gallery</h3>
          <p className="text-sm text-muted-foreground">
            Select photos to show during breaks
          </p>
        </div>
        <div className="flex gap-2">
          {photos.length > 0 && (
            <Button
              onClick={() => selectAllPhotos(!allSelected)}
              disabled={loading}
              variant="outline"
              className="gap-2"
            >
              {allSelected ? <Square className="h-4 w-4" /> : <CheckSquare className="h-4 w-4" />}
              {allSelected ? 'Deselect All' : 'Select All'}
            </Button>
          )}
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload Photos
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {photos.length === 0 ? (
        <Card className="p-12 text-center">
          <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h4 className="text-lg font-semibold text-foreground mb-2">No photos yet</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Upload photos to see them during your breaks
          </p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            variant="outline"
          >
            Upload Your First Photo
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <Card 
              key={photo.id} 
              className={cn(
                "relative group overflow-hidden cursor-pointer transition-all",
                photo.selected_for_breaks 
                  ? "ring-2 ring-primary shadow-lg" 
                  : "opacity-60 hover:opacity-80"
              )}
              onClick={() => togglePhotoSelection(photo.id, !photo.selected_for_breaks)}
            >
              {/* Selection checkbox overlay */}
              <div className="absolute top-2 left-2 z-10">
                <div className={cn(
                  "w-6 h-6 rounded border-2 flex items-center justify-center transition-all",
                  photo.selected_for_breaks 
                    ? "bg-primary border-primary" 
                    : "bg-background/80 border-muted-foreground"
                )}>
                  {photo.selected_for_breaks && (
                    <CheckSquare className="h-4 w-4 text-primary-foreground" />
                  )}
                </div>
              </div>

              <img
                src={photo.url}
                alt={photo.file_name}
                className="w-full h-48 object-cover"
              />

              {/* Delete button on hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete photo?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this photo from your gallery.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deletePhoto(photo.id, photo.file_path)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
          ))}
        </div>
      )}

      {photos.length > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          {selectedCount} of {photos.length} {photos.length === 1 ? 'photo' : 'photos'} selected for breaks
        </p>
      )}
    </div>
  );
};
