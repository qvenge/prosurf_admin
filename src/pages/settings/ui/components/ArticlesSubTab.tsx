import { ContentTextManager } from './ContentTextManager';
import styles from './ContentTab.module.scss';

export function ArticlesSubTab() {
  return (
    <div className={styles.root}>
      <ContentTextManager title="Тексты: Статьи" keyPrefix="article." />
    </div>
  );
}
