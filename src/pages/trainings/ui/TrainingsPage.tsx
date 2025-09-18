import { Header } from '@/shared/ui';
import { TrainingsTable } from './TrainingsTable';
import styles from './TrainingsPage.module.scss';

export function TrainingsPage() {
  return (
    <>
      <Header title={'Тренировки'} />
      <div className={styles.page}>
        <TrainingsTable className={styles.table} />
      </div>
    </>
  );
}