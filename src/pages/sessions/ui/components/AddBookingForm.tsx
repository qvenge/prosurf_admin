import { useActionState } from 'react';
import { Button, TextButton, TextInput, Icon } from '@/shared/ui';
import { CaretLeftBold } from '@/shared/ds/icons';
import { useBookSession, type BookingCreateDto, type GuestContact, isApiError, getErrorMessage } from '@/shared/api';
import { generateIdempotencyKey, formatPhoneNumber } from '@/shared/lib/string';
import styles from './SessionDetails.module.scss';

export type FormState =
  | {
      errors?: {
        phone?: string[];
        email?: string[];
        firstName?: string[];
        lastName?: string[];
      };
      message?: string;
    }
  | undefined

export interface AddBookingFormProps {
  sessionId: string;
  onBack: () => void;
  onSuccess?: () => void;
}

export function AddBookingForm({ sessionId, onBack, onSuccess }: AddBookingFormProps) {
  const bookSession = useBookSession();

  const handleSubmit = async (_state: FormState, data: FormData) => {
    try {
      const rawPhone = data.get('phone') as string;
      const formattedPhone = formatPhoneNumber(rawPhone);

      // Validate phone format before sending to API
      const phoneRegex = /^\+?[0-9]{7,15}$/;
      if (!phoneRegex.test(formattedPhone)) {
        return {
          errors: {
            phone: ['Номер телефона должен содержать 7–15 цифр, при необходимости начинаться с +']
          },
          message: 'Неверный формат номера телефона'
        } as FormState;
      }

      const guestContact: GuestContact = {
        phone: formattedPhone,
        email: data.get('email') as string || undefined,
        firstName: data.get('firstName') as string || undefined,
        lastName: data.get('lastName') as string || undefined,
      };

      const bookingData: BookingCreateDto = {
        quantity: 1,
        guestContact,
        status: 'CONFIRMED', // Admin booking
      };

      await bookSession.mutateAsync({
        sessionId,
        data: bookingData,
        idempotencyKey: generateIdempotencyKey()
      });

      onSuccess?.();
      onBack();
      return { message: 'Бронирование успешно создано' };
    } catch (error: unknown) {
      const errors: {
        phone?: string[];
        email?: string[];
        firstName?: string[];
        lastName?: string[];
      } = {};

      if (isApiError(error) && error.status === 422 && error.error?.details) {
        // Handle validation errors from API (422 Unprocessable Entity for validation)
        const validationErrors = error.error.details as Record<string, string[]>;
        for (const [field, messages] of Object.entries(validationErrors)) {
          if (field === 'phone' || field === 'email' || field === 'firstName' || field === 'lastName') {
            errors[field] = messages;
          }
        }
      }

      return {
        errors,
        message: getErrorMessage(error)
      } as FormState;
    }
  };

  const [state, action, pending] = useActionState(handleSubmit, undefined);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <TextButton type="secondary" size='m' onClick={onBack}>
          <Icon src={CaretLeftBold} width={20} height={20} /> Назад
        </TextButton>
      </div>
      <form id='addBookingForm' className={styles.addBookingForm} action={action}>
        {state?.message && !state.errors && (
          <div style={{ color: 'green', marginBottom: '16px' }}>
            {state.message}
          </div>
        )}
        {state?.message && state.errors && (
          <div style={{ color: 'red', marginBottom: '16px' }}>
            {state.message}
          </div>
        )}
        <TextInput
          type="tel"
          name="phone"
          label="Телефон"
          placeholder="+7 (900) 123-45-67"
          error={Boolean(state?.errors?.phone)}
          hint={state?.errors?.phone?.[0]}
          disabled={pending}
          required
        />
        <TextInput
          type="email"
          name="email"
          label="Почта"
          placeholder="Введите почту"
          error={Boolean(state?.errors?.email)}
          hint={state?.errors?.email?.[0]}
          disabled={pending}
          required
        />
        <TextInput
          type="text"
          name="firstName"
          label="Имя"
          placeholder="Ввдите имя"
          error={Boolean(state?.errors?.firstName)}
          hint={state?.errors?.firstName?.[0]}
          disabled={pending}
          required
        />
        <TextInput
          type="text"
          name="lastName"
          label="Фамилия"
          placeholder="Введите фамилию"
          error={Boolean(state?.errors?.lastName)}
          hint={state?.errors?.lastName?.[0]}
          disabled={pending}
          required
        />
      </form>
      <Button type="primary" size='l' htmlType='submit' form="addBookingForm" disabled={pending || bookSession.isPending} loading={pending || bookSession.isPending}>
        Записать
      </Button>
    </div>
  );
}