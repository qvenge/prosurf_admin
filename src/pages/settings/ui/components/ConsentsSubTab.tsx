import { ContentTextManager } from './ContentTextManager';
import styles from './ContentTab.module.scss';

export function ConsentsSubTab() {
  return (
    <div className={styles.root}>
      <ContentTextManager title="Тексты: Согласия" keyPrefix="consent." />
    </div>
  );
}
