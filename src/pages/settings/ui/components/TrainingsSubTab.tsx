import { ImageGallery } from './ImageGallery';
import { ContentTextManager } from './ContentTextManager';
import styles from './ContentTab.module.scss';

export function TrainingsSubTab() {
  return (
    <div className={styles.root}>
      <ImageGallery title="Галерея: тренировки по серфингу" tags={['training:surfing']} />
      <ImageGallery title="Галерея: тренировки по серфскейту" tags={['training:surfskate']} />
      <ContentTextManager title="Тексты: Тренировки" keyPrefix="training." />
    </div>
  );
}
