import { useActionState, useState, useRef, useCallback } from 'react';
import { Button, TextButton, TextInput, Icon, ClientSearchDropdown } from '@/shared/ui';
import { CaretLeftBold } from '@/shared/ds/icons';
import { useBookSession, type BookingCreateDto, type GuestContact, type Client, isApiError, getErrorMessage } from '@/shared/api';
import { generateIdempotencyKey, formatPhoneNumber } from '@/shared/lib/string';
import { useClientSearch } from '@/shared/lib/hooks/useClientSearch';
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

type SearchableField = 'phone' | 'email' | 'firstName' | 'lastName';

interface FormValues {
  phone: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface FieldConfig {
  name: SearchableField;
  type: 'tel' | 'email' | 'text';
  label: string;
  placeholder: string;
}

const FIELDS_CONFIG: FieldConfig[] = [
  { name: 'phone', type: 'tel', label: 'Телефон', placeholder: '+7 (900) 123-45-67' },
  { name: 'email', type: 'email', label: 'Почта', placeholder: 'Введите почту' },
  { name: 'firstName', type: 'text', label: 'Имя', placeholder: 'Введите имя' },
  { name: 'lastName', type: 'text', label: 'Фамилия', placeholder: 'Введите фамилию' },
];

const INITIAL_FORM_VALUES: FormValues = {
  phone: '', email: '', firstName: '', lastName: ''
};

export function AddBookingForm({ sessionId, onBack, onSuccess }: AddBookingFormProps) {
  const bookSession = useBookSession();

  // State for client selection
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Unified state for form fields
  const [formValues, setFormValues] = useState<FormValues>(INITIAL_FORM_VALUES);

  // State for search dropdown
  const [activeField, setActiveField] = useState<SearchableField | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Unified refs for dropdown positioning
  const fieldRefs = useRef<Record<SearchableField, HTMLDivElement | null>>({
    phone: null, email: null, firstName: null, lastName: null
  });

  // Get current search value based on active field
  const currentSearchValue = activeField ? formValues[activeField] : '';

  // Client search
  const { clients, isLoading, isFetching, debouncedQuery } = useClientSearch({
    query: currentSearchValue,
    enabled: !selectedClient && activeField !== null && isDropdownOpen,
  });

  // Handle field change
  const handleFieldChange = useCallback((field: SearchableField, value: string) => {
    setFormValues(prev => ({ ...prev, [field]: value }));

    // Clear selected client when user starts typing
    if (selectedClient) {
      setSelectedClient(null);
    }

    setIsDropdownOpen(true);
  }, [selectedClient]);

  // Handle field focus
  const handleFieldFocus = useCallback((field: SearchableField) => {
    setActiveField(field);
    if (!selectedClient) {
      setIsDropdownOpen(true);
    }
  }, [selectedClient]);

  // Handle field blur
  const handleFieldBlur = useCallback(() => {
    // Delay to allow click on dropdown item
    setTimeout(() => {
      setIsDropdownOpen(false);
    }, 200);
  }, []);

  // Handle client selection
  const handleSelectClient = useCallback((client: Client) => {
    setSelectedClient(client);
    setFormValues({
      phone: client.phone || '',
      email: client.email || '',
      firstName: client.firstName || '',
      lastName: client.lastName || '',
    });
    setIsDropdownOpen(false);
    setActiveField(null);
  }, []);

  // Handle clear selection
  const handleClearSelection = useCallback(() => {
    setSelectedClient(null);
    setFormValues(INITIAL_FORM_VALUES);
  }, []);

  const handleSubmit = async (_state: FormState, data: FormData) => {
    try {
      // If a client is selected, use clientId
      if (selectedClient) {
        const bookingData: BookingCreateDto = {
          quantity: 1,
          clientId: selectedClient.id,
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
      }

      // Otherwise use guestContact (manual entry)
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

  const selectedHint = selectedClient
    ? `Выбран: ${[selectedClient.firstName, selectedClient.lastName].filter(Boolean).join(' ') || 'Клиент'}`
    : undefined;

  const showDropdown = isDropdownOpen && !selectedClient && debouncedQuery.length >= 2;

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

        {FIELDS_CONFIG.map(({ name, type, label, placeholder }) => {
          // Phone field needs to be uncontrolled due to IMask conflict with React controlled inputs
          const isPhoneField = name === 'phone';

          return (
            <div
              key={name}
              ref={(el) => { fieldRefs.current[name] = el; }}
              className={styles.searchableField}
            >
              <TextInput
                // Key changes when client is selected/cleared to remount with new defaultValue
                key={isPhoneField ? `phone-${selectedClient?.id || 'manual'}` : name}
                type={type}
                name={name}
                label={label}
                placeholder={placeholder}
                // Phone uses defaultValue (uncontrolled) to work with IMask, others use value (controlled)
                {...(isPhoneField
                  ? { defaultValue: formValues.phone }
                  : { value: formValues[name] }
                )}
                onChange={(e) => handleFieldChange(name, e.target.value)}
                onFocus={() => handleFieldFocus(name)}
                onBlur={handleFieldBlur}
                error={Boolean(state?.errors?.[name])}
                hint={isPhoneField ? (selectedHint || state?.errors?.phone?.[0]) : state?.errors?.[name]?.[0]}
                disabled={pending}
                required={!isPhoneField && !selectedClient}
              >
                {isPhoneField && selectedClient && (
                  <button
                    type="button"
                    className={styles.clearButton}
                    onClick={handleClearSelection}
                    aria-label="Очистить выбор"
                  >
                    ×
                  </button>
                )}
              </TextInput>
              {activeField === name && (
                <ClientSearchDropdown
                  isOpen={showDropdown}
                  clients={clients}
                  isLoading={isLoading || isFetching}
                  searchQuery={debouncedQuery}
                  onSelectClient={handleSelectClient}
                  onClose={() => setIsDropdownOpen(false)}
                  anchorRef={{ current: fieldRefs.current[name] }}
                />
              )}
            </div>
          );
        })}
      </form>
      <Button type="primary" size='l' htmlType='submit' form="addBookingForm" disabled={pending || bookSession.isPending} loading={pending || bookSession.isPending}>
        Записать
      </Button>
    </div>
  );
}
