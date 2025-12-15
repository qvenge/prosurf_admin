import { UploadImageInput } from '../upload-image-input';
import { ButtonContainer } from '../button';
import { Icon } from '../icon';
import { CameraRegular, XBold } from '@/shared/ds/icons';
import clsx from 'clsx';
import styles from './ImageGalleryGrid.module.scss';

export interface ImageItem {
  id: string;
  url: string;
  alt?: string;
}

export interface ImageGalleryGridProps {
  images: ImageItem[];
  onRemove: (id: string) => void;
  onUpload: (data: { file: File; preview: string }[] | { file: File; preview: string } | null) => void;
  maxImages?: number;
  multiple?: boolean;
  uploadLabel?: string;
  uploadingLabel?: string;
  isUploading?: boolean;
  isDeleting?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ImageGalleryGrid({
  images,
  onRemove,
  onUpload,
  maxImages,
  multiple = true,
  uploadLabel = 'Добавить',
  uploadingLabel = 'Загрузка...',
  isUploading = false,
  isDeleting = false,
  disabled = false,
  className,
}: ImageGalleryGridProps) {
  const canAddMore = maxImages === undefined || images.length < maxImages;
  const isDisabled = disabled || isUploading || isDeleting;

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDeleting) {
      onRemove(id);
    }
  };

  return (
    <div className={clsx(styles.grid, className)}>
      {images.map((image) => (
        <div key={image.id} className={styles.imageItem}>
          <img
            src={image.url}
            alt={image.alt ?? 'Image'}
            className={styles.image}
          />
          <ButtonContainer
            className={styles.removeButton}
            onClick={(e) => handleRemove(image.id, e)}
            disabled={isDeleting}
          >
            <Icon src={XBold} width={16} height={16} />
          </ButtonContainer>
        </div>
      ))}

      {canAddMore && (
        <UploadImageInput
          className={styles.addButton}
          multiple={multiple}
          onChange={onUpload}
          disabled={isDisabled}
        >
          <Icon src={CameraRegular} width={20} height={20} />
          <span className={styles.addText}>
            {isUploading ? uploadingLabel : uploadLabel}
          </span>
        </UploadImageInput>
      )}
    </div>
  );
}
