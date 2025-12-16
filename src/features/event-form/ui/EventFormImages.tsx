import { useMemo, useEffect } from 'react';
import { ImageGalleryGrid, UploadImageInput, ButtonContainer, Icon, type ImageItem } from '@/shared/ui';
import { joinApiUrls, joinApiUrl } from '@/shared/api';
import { CameraRegular, XBold } from '@/shared/ds/icons';
import { useEventFormContext } from '../lib/context';
import { maxImages } from '../lib/constants';
import styles from './EventForm.module.scss';

export function EventFormImages() {
  const {
    formData,
    handleImageAdd,
    handleImageRemove,
    handleExistingImageRemove,
    handlePreviewImageChange,
    handlePreviewImageRemove,
  } = useEventFormContext();

  // Preview image URL (existing or new file preview)
  const previewUrl = useMemo(() => {
    if (formData.previewImage) {
      return URL.createObjectURL(formData.previewImage);
    }
    if (formData.existingPreviewImage) {
      return joinApiUrl(formData.existingPreviewImage);
    }
    return null;
  }, [formData.previewImage, formData.existingPreviewImage]);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (formData.previewImage && previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [formData.previewImage, previewUrl]);

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

  const handlePreviewUpload = (data: { file: File; preview: string }[] | { file: File; preview: string } | null) => {
    if (!data) return;
    const file = Array.isArray(data) ? data[0]?.file : data.file;
    if (file) {
      handlePreviewImageChange(file);
    }
  };

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
      {/* Preview Image Section */}
      <div className={styles.previewSection}>
        <p className={styles.photoHint}>
          <span className={styles.photoHintLabel}>Превью:</span> основное изображение события
        </p>
        {previewUrl ? (
          <div className={styles.previewImageContainer}>
            <img src={previewUrl} alt="Preview" className={styles.previewImage} />
            <ButtonContainer
              className={styles.previewRemoveButton}
              onClick={handlePreviewImageRemove}
            >
              <Icon src={XBold} width={16} height={16} />
            </ButtonContainer>
          </div>
        ) : (
          <UploadImageInput
            className={styles.previewUploadButton}
            multiple={false}
            onChange={handlePreviewUpload}
          >
            <Icon src={CameraRegular} width={20} height={20} />
            <span className={styles.previewUploadText}>Добавить</span>
          </UploadImageInput>
        )}
      </div>

      {/* Gallery Section */}
      <p className={styles.photoHint}>
        <span className={styles.photoHintLabel}>Галерея:</span> не более {maxImages}
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
