
import { Outlet, useLocation, useNavigate } from 'react-router';
import { useAuthStatus } from '@/shared/api';
import { useEffect } from 'react';
import styles from './App.module.scss';

export function App() {
  const { isAuthenticated, isLoading } = useAuthStatus();
  const location = useLocation();
  const navigate = useNavigate();
  const isOnLoginPage = location.pathname.startsWith('/login');

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated && !isOnLoginPage) {
      navigate(`/login?callbackUrl=${encodeURIComponent(location.pathname)}`, { replace: true });
    } 
    // else if (isAuthenticated && isOnLoginPage) {
    //   navigate('/', { replace: true });
    // }
  }, [isAuthenticated, isLoading, isOnLoginPage, location.pathname, navigate]);

  if (isLoading || (!isAuthenticated && !isOnLoginPage)) {
    return (
      <div className={styles.wrapper}>
        <main className={styles.main}>
          <div>Loading...</div>
        </main>
      </div>
    );
  }

  return <Outlet />;
}