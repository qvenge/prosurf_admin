import { useState } from 'react';
import { UploadImageInput, Icon, ButtonContainer } from '@/shared/ui';
import { CameraRegular, TrashRegular } from '@/shared/ds/icons';
import styles from './EventForm.module.scss';

export function EventFormImages() {
  const [images, setImages] = useState<{ id: string; file: File; preview: string }[]>([]);

  const handleImageChange = (data: { file: File; preview: string }[] | { file: File; preview: string } | null) => {
    if (!data) return;

    const newImages = Array.isArray(data) ? data : [data];
    const timestamp = Date.now();

    setImages((prev) => {
      const remainingSlots = MAX_IMAGES - prev.length;
      const imagesToAdd = newImages.slice(0, remainingSlots).map((img, index) => ({
        id: `${timestamp}-${index}`,
        file: img.file,
        preview: img.preview,
      }));

      return [...prev, ...imagesToAdd];
    });
  };

  const handleImageRemove = (imageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const MAX_IMAGES = 6;
  const canAddMore = images.length < MAX_IMAGES;

  return (
    <div className={styles.photosSection}>
      <p className={styles.photoHint}>Добавьте до 6 фотографий</p>
      <div className={styles.photoGrid}>
        {images.map((image) => (
          <div key={image.id} className={styles.photoUpload}>
            <div className={styles.imagePreview}>
              <img
                src={image.preview}
                alt="Event image"
                className={styles.imagePreviewImg}
              />
              <ButtonContainer
                className={styles.imageRemove}
                onClick={(e) => handleImageRemove(image.id, e)}
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
