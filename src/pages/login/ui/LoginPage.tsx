
import { LoginForm } from './LoginForm';
import { Logotype } from '@/shared/ui';

import styles from './LoginPage.module.scss';
import { Suspense } from 'react';

export function LoginPage() {
  return (
    <div className={styles.page}>
      <Logotype className={styles.logotype} />
      <Suspense>
        <LoginForm action={(...args: any[]) => Promise.resolve(console.log('LOGIN_FORM', ...args))} className={styles.form} />
      </Suspense>
    </div>
  );
}