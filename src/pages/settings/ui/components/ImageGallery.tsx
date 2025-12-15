import { Skeleton, ImageGalleryGrid } from '@/shared/ui';
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
      {isLoading ? (
        <div className={styles.skeletonContainer}>
          <Skeleton className={styles.skeletonImage} />
          <Skeleton className={styles.skeletonImage} />
        </div>
      ) : (
        <ImageGalleryGrid
          images={images.map((image) => ({
            id: image.id,
            url: image.url,
            alt: image.originalName,
          }))}
          onRemove={handleDelete}
          onUpload={handleUpload}
          isUploading={isUploading}
          isDeleting={isDeleting}
          multiple
        />
      )}
    </div>
  );
}
