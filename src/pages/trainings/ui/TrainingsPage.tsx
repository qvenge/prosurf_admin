import { Header } from '@/shared/ui';
import styles from './TrainingsPage.module.scss';

export function TrainingsPage({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header title={'Тренировки'} />
      <div className={styles.page}>
        {children}
      </div>
    </>
  );
}