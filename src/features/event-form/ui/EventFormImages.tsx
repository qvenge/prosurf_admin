import { useMemo, useEffect } from 'react';
import { UploadImageInput, Icon, ButtonContainer } from '@/shared/ui';
import { CameraRegular, XBold } from '@/shared/ds/icons';
import { useEventFormContext } from '../lib/context';
import { maxImages } from '../lib/constants';
import styles from './EventForm.module.scss';

export function EventFormImages() {
  const { formData, handleImageAdd, handleImageRemove, handleExistingImageRemove } = useEventFormContext();

  const apiBaseUrl = import.meta.env.VITE_API_URL || '';

  // Build full URLs for existing images
  const existingImageUrls = useMemo(() =>
    formData.existingImages.map(url =>
      url.startsWith('http') ? url : `${apiBaseUrl}${url}`
    ),
    [formData.existingImages, apiBaseUrl]
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

  const handleImageChange = (data: { file: File; preview: string }[] | { file: File; preview: string } | null) => {
    if (!data) return;

    const newImages = Array.isArray(data) ? data : [data];
    const files = newImages.map((img) => img.file);

    if (files.length > 0) {
      handleImageAdd(files);
    }
  };

  const handleRemoveNew = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    handleImageRemove(index);
  };

  const handleRemoveExisting = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    handleExistingImageRemove(index);
  };

  const totalImages = formData.existingImages.length + formData.images.length;
  const canAddMore = totalImages < maxImages;

  return (
    <div className={styles.photosSection}>
      <p className={styles.photoHint}>
        <span className={styles.photoHintLabel}>Фотографии:</span> не более {maxImages}
      </p>
      <div className={styles.photoGrid}>
        {/* Existing images */}
        {existingImageUrls.map((url, index) => (
          <div key={`existing-${index}`} className={styles.photoItem}>
            <img
              src={url}
              alt={`Event image ${index + 1}`}
              className={styles.photoImage}
            />
            <ButtonContainer
              className={styles.photoRemove}
              onClick={(e) => handleRemoveExisting(index, e)}
            >
              <Icon src={XBold} width={16} height={16} />
            </ButtonContainer>
          </div>
        ))}

        {/* New images */}
        {newImagePreviews.map((preview, index) => (
          <div key={`new-${index}`} className={styles.photoItem}>
            <img
              src={preview}
              alt={`New image ${index + 1}`}
              className={styles.photoImage}
            />
            <ButtonContainer
              className={styles.photoRemove}
              onClick={(e) => handleRemoveNew(index, e)}
            >
              <Icon src={XBold} width={16} height={16} />
            </ButtonContainer>
          </div>
        ))}

        {/* Upload button */}
        {canAddMore && (
          <UploadImageInput
            className={styles.photoAdd}
            multiple
            onChange={handleImageChange}
          >
            <Icon src={CameraRegular} width={20} height={20} />
            <span className={styles.photoAddText}>Добавить</span>
          </UploadImageInput>
        )}
      </div>
    </div>
  );
}
