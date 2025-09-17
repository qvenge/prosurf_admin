
import { Outlet } from 'react-router';
import styles from './App.module.scss';

export function App() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
}