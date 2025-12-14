import { ImageGallery } from './ImageGallery';
import { ContentTextManager } from './ContentTextManager';
import styles from './ContentTab.module.scss';

export function HomeSubTab() {
  return (
    <div className={styles.root}>
      <ImageGallery title="Галерея: главная" tags={['home']} />
      <ImageGallery title="Галерея: о нас" tags={['about']} />
      <ContentTextManager title="Тексты: Главная страница" keyPrefix="home." />
    </div>
  );
}
