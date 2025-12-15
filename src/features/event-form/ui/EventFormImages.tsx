import { useMemo, useEffect } from 'react';
import { ImageGalleryGrid, type ImageItem } from '@/shared/ui';
import { joinApiUrls } from '@/shared/api';
import { useEventFormContext } from '../lib/context';
import { maxImages } from '../lib/constants';
import styles from './EventForm.module.scss';

export function EventFormImages() {
  const { formData, handleImageAdd, handleImageRemove, handleExistingImageRemove } = useEventFormContext();

  // Build full URLs for existing images
  const existingImageUrls = useMemo(() =>
    joinApiUrls(formData.existingImages),
    [formData.existingImages]
  );

  // Create preview URLs for new File objects
  const newImagePreviews = useMemo(() =>
    formData.images.map((file) => URL.createObjectURL(file)),
    [formData.images]
  );

  // Cleanup preview URLs when component unmounts or images change
  useEffect(() => {
    return () => {
      newImagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [newImagePreviews]);

  // Combine all images into ImageItem format
  const images: ImageItem[] = useMemo(() => [
    ...existingImageUrls.map((url, index) => ({
      id: `existing-${index}`,
      url,
      alt: `Event image ${index + 1}`,
    })),
    ...newImagePreviews.map((url, index) => ({
      id: `new-${index}`,
      url,
      alt: `New image ${index + 1}`,
    })),
  ], [existingImageUrls, newImagePreviews]);

  const handleUpload = (data: { file: File; preview: string }[] | { file: File; preview: string } | null) => {
    if (!data) return;

    const newImages = Array.isArray(data) ? data : [data];
    const files = newImages.map((img) => img.file);

    if (files.length > 0) {
      handleImageAdd(files);
    }
  };

  const handleRemove = (id: string) => {
    if (id.startsWith('existing-')) {
      const index = parseInt(id.replace('existing-', ''), 10);
      handleExistingImageRemove(index);
    } else if (id.startsWith('new-')) {
      const index = parseInt(id.replace('new-', ''), 10);
      handleImageRemove(index);
    }
  };

  return (
    <div className={styles.photosSection}>
      <p className={styles.photoHint}>
        <span className={styles.photoHintLabel}>Фотографии:</span> не более {maxImages}
      </p>
      <ImageGalleryGrid
        images={images}
        onRemove={handleRemove}
        onUpload={handleUpload}
        maxImages={maxImages}
        multiple
      />
    </div>
  );
}
