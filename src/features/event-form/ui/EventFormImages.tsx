import { useMemo } from 'react';
import { UploadImageInput, Icon, ButtonContainer } from '@/shared/ui';
import { CameraRegular, TrashRegular } from '@/shared/ds/icons';
import { useEventFormContext } from '../lib/context';
import { maxImages } from '../lib/constants';
import styles from './EventForm.module.scss';

export function EventFormImages() {
  const { formData, handleImageAdd, handleImageRemove } = useEventFormContext();

  // Create preview URLs for File objects
  const imagePreviews = useMemo(() => {
    return formData.images.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
  }, [formData.images]);

  // Cleanup preview URLs when component unmounts
  useMemo(() => {
    return () => {
      imagePreviews.forEach(({ preview }) => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  const handleImageChange = (data: { file: File; preview: string }[] | { file: File; preview: string } | null) => {
    if (!data) return;

    const newImages = Array.isArray(data) ? data : [data];
    const files = newImages.map((img) => img.file);

    // Limit to max images (10 per OpenAPI spec)
    const remainingSlots = maxImages - formData.images.length;
    const filesToAdd = files.slice(0, remainingSlots);

    if (filesToAdd.length > 0) {
      handleImageAdd(filesToAdd);
    }
  };

  const handleRemove = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    handleImageRemove(index);
  };

  const canAddMore = formData.images.length < maxImages;

  return (
    <div className={styles.photosSection}>
      <p className={styles.photoHint}>Добавьте до {maxImages} фотографий</p>
      <div className={styles.photoGrid}>
        {imagePreviews.map((image, index) => (
          <div key={index} className={styles.photoUpload}>
            <div className={styles.imagePreview}>
              <img
                src={image.preview}
                alt={`Event image ${index + 1}`}
                className={styles.imagePreviewImg}
              />
              <ButtonContainer
                className={styles.imageRemove}
                onClick={(e) => handleRemove(index, e)}
              >
                <Icon src={TrashRegular} width={20} height={20} />
              </ButtonContainer>
            </div>
          </div>
        ))}

        {canAddMore && (
          <UploadImageInput
            className={styles.photoUpload}
            multiple
            onChange={handleImageChange}
          >
            <div className={styles.uploadPlaceholder}>
              <Icon src={CameraRegular} width={36} height={36} />
            </div>
          </UploadImageInput>
        )}
      </div>
    </div>
  );
}
