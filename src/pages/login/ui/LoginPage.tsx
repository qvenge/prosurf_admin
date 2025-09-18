
import { LoginForm } from './LoginForm';
import { Logotype } from '@/shared/ui';
import { useLoginWithCredentials } from '@/shared/api';
import { useNavigate } from 'react-router';

import styles from './LoginPage.module.scss';
import { Suspense } from 'react';
import type { FormState } from './LoginForm/LoginForm';

export function LoginPage() {
  const navigate = useNavigate();
  const { mutateAsync: login, isPending } = useLoginWithCredentials();

  const handleLogin = async (state: FormState, formData: FormData): Promise<FormState> => {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const callbackUrl = formData.get('callbackUrl') as string;

    try {
      await login({
        login: email,
        password: password
      });

      navigate(callbackUrl || '/');
      return undefined;
    } catch (error: any) {
      console.error('Login failed:', error);

      if (error?.response?.data?.errors) {
        return {
          errors: error.response.data.errors
        };
      }

      return {
        message: error?.response?.data?.message || 'Ошибка авторизации'
      };
    }
  };

  return (
    <div className={styles.page}>
      <Logotype className={styles.logotype} />
      <Suspense>
        <LoginForm action={handleLogin} className={styles.form} />
      </Suspense>
    </div>
  );
}