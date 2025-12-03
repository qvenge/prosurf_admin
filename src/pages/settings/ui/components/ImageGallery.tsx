import { Icon, Skeleton, SkeletonItem, UploadImageInput } from '@/shared/ui';
import { CameraRegular, XBold } from '@/shared/ds/icons';
import { useImages, useUploadImages, useDeleteImage } from '@/shared/api';
import styles from './ImageGallery.module.scss';

export interface ImageGalleryProps {
  title: string;
  tags: string[];
}

export function ImageGallery({ title, tags }: ImageGalleryProps) {
  const { data, isLoading } = useImages({ 'tags.any': tags });
  const uploadMutation = useUploadImages();
  const deleteMutation = useDeleteImage();

  const images = data?.items ?? [];

  const handleUpload = (files: { file: File; preview: string }[] | { file: File; preview: string } | null) => {
    if (!files) return;

    const fileArray = Array.isArray(files) ? files : [files];
    const filesToUpload = fileArray.map((f) => f.file);

    uploadMutation.mutate({ files: filesToUpload, tags });
  };

  const handleDelete = (imageId: string) => {
    deleteMutation.mutate(imageId);
  };

  const isUploading = uploadMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  return (
    <div className={styles.root}>
      <h4 className={styles.title}>{title}</h4>
      <p className={styles.subtitle}>
        <span className={styles.subtitleLabel}>Фотографии:</span>
        {' '}
        <span className={styles.subtitleValue}>не более 10</span>
      </p>
      <div className={styles.gallery}>
        {isLoading ? (
          <Skeleton>
            <SkeletonItem className={styles.skeletonImage} />
            <SkeletonItem className={styles.skeletonImage} />
          </Skeleton>
        ) : (
          <>
            {images.map((image) => (
              <div key={image.id} className={styles.imageCard}>
                <div className={styles.imageWrapper}>
                  <img
                    className={styles.image}
                    src={image.url}
                    alt={image.originalName}
                  />
                </div>
                <button
                  className={styles.removeButton}
                  type="button"
                  onClick={() => handleDelete(image.id)}
                  disabled={isDeleting}
                >
                  <Icon
                    className={styles.removeIcon}
                    src={XBold}
                    width={16}
                    height={16}
                  />
                </button>
              </div>
            ))}
            <UploadImageInput
              className={styles.addButton}
              multiple
              onChange={handleUpload}
              disabled={isUploading}
            >
              <Icon
                className={styles.addIcon}
                src={CameraRegular}
                width={20}
                height={20}
              />
              <span className={styles.addText}>
                {isUploading ? 'Загрузка...' : 'Добавить'}
              </span>
            </UploadImageInput>
          </>
        )}
      </div>
    </div>
  );
}
