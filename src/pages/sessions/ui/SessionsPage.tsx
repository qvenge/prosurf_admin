import { Header } from '@/shared/ui';
import { SessionsTable } from './components/SessionsTable';
import styles from './SessionsPage.module.scss';

export function SessionsPage() {
  return (
    <>
      <Header title={'Записи'} />
      <div className={styles.page}>
        <SessionsTable className={styles.table} />
      </div>
    </>
  );
}