// import { Icon, Skeleton, SkeletonItem, UploadImageInput } from '@/shared/ui';
// import { CameraRegular, XBold } from '@/shared/ds/icons';
// import { useImages, useUploadImages, useDeleteImage } from '@/shared/api';
import { ImageGallery } from './ImageGallery';
import styles from './ContentTab.module.scss';

export function ContentTab() {
  return (
    <div className={styles.root}>
      <ImageGallery title="Галерея: главная" tags={['home']} />
      <ImageGallery title="Галерея: о нас" tags={['about']} />
      <ImageGallery title="Галерея: тренировки по серфингу" tags={['training:surfing']} />
      <ImageGallery title="Галерея: тренировки по серфскейту" tags={['training:surfskate']} />
    </div>
  );
}
