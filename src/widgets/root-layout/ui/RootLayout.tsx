
import { Outlet } from 'react-router';
import styles from './RootLayout.module.scss';
import { NavigationBar } from '@/shared/ui';
import { navItems } from '../nav-items';

export function RootLayout() {
  return (
    <div className={styles.wrapper}>
      <NavigationBar className={styles.sidebar} items={navItems} />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}