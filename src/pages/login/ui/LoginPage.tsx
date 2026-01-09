
import { LoginForm } from './LoginForm';
import { Logotype } from '@/shared/ui';
import { useLoginWithCredentials, ApiErrorClass } from '@/shared/api';
import { useNavigate } from 'react-router';

import styles from './LoginPage.module.scss';
import { Suspense } from 'react';
import type { FormState } from './LoginForm/LoginForm';

export function LoginPage() {
  const navigate = useNavigate();
  const { mutateAsync: login } = useLoginWithCredentials();

  const handleLogin = async (_: FormState, formData: FormData): Promise<FormState> => {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const callbackUrl = formData.get('callbackUrl') as string;

    try {
      await login({
        email: email,
        password: password
      });

      navigate(callbackUrl || '/');
      return undefined;
    } catch (error: unknown) {
      console.error('Login failed:', error);

      // Handle ApiErrorClass from our API layer
      if (error instanceof ApiErrorClass) {
        return {
          message: error.error.message || 'Ошибка авторизации'
        };
      }

      // Fallback for other error types (Axios, Zod, etc.)
      const axiosError = error as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } };
      if (axiosError?.response?.data?.errors) {
        return {
          errors: axiosError.response.data.errors
        };
      }

      return {
        message: axiosError?.response?.data?.message || 'Ошибка авторизации'
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