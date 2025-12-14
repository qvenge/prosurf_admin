import { ImageGallery } from './ImageGallery';
import { ContentTextManager } from './ContentTextManager';
import styles from './ContentTab.module.scss';

export function ContentTab() {
  return (
    <div className={styles.root}>
      <ImageGallery title="Галерея: главная" tags={['home']} />
      <ImageGallery title="Галерея: о нас" tags={['about']} />
      <ImageGallery title="Галерея: тренировки по серфингу" tags={['training:surfing']} />
      <ImageGallery title="Галерея: тренировки по серфскейту" tags={['training:surfskate']} />

      <ContentTextManager title="Тексты: Главная страница" keyPrefix="home." />
      <ContentTextManager title="Тексты: Согласия" keyPrefix="consent." />
      <ContentTextManager title="Тексты: Тренировки" keyPrefix="training." />
      <ContentTextManager title="Тексты: Статьи" keyPrefix="article." />
    </div>
  );
}
