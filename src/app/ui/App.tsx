
import { Outlet, useLocation, useNavigate } from 'react-router';
import { useAuthStatus } from '@/shared/api';
import { useEffect } from 'react';
import styles from './App.module.scss';
import { NavigationBar } from '@/shared/ui';
import { navItems } from './nav-items';

export function App() {
  const { isAuthenticated, isLoading } = useAuthStatus();
  const location = useLocation();
  const navigate = useNavigate();

  console.log('isAuthenticated', isAuthenticated)
  console.log('isLoading', isLoading)

  useEffect(() => {
    if (!isLoading) {
      const isOnLoginPage = location.pathname.startsWith('/login');

      if (!isAuthenticated && !isOnLoginPage) {
        navigate('/login', { replace: true });
      } else if (isAuthenticated && isOnLoginPage) {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, location.pathname, navigate]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className={styles.wrapper}>
        <main className={styles.main}>
          <div>Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <NavigationBar className={styles.sidebar} items={navItems} />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}