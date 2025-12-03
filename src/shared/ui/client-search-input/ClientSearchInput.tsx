'use client';

import { useState, useRef, useCallback } from 'react';
import { useClientsInfinite, type Client } from '@/shared/api';
import { TextInput } from '@/shared/ui/text-input';
import { Dropdown } from '@/shared/ui/dropdown';
import { Loader } from '@/shared/ui/loader';
import { useDebounce } from '@/shared/lib/hooks/useDebounce';
import styles from './ClientSearchInput.module.scss';

export interface ClientSearchInputProps {
  label?: string;
  placeholder?: string;
  error?: boolean;
  hint?: string;
  disabled?: boolean;
  selectedClient: Client | null;
  onSelectClient: (client: Client | null) => void;
  onPhoneChange: (phone: string) => void;
  phoneValue: string;
}

export function ClientSearchInput({
  label = 'Телефон',
  placeholder = '+7 (900) 123-45-67',
  error,
  hint,
  disabled,
  selectedClient,
  onSelectClient,
  onPhoneChange,
  phoneValue,
}: ClientSearchInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);
  const inputRef = useRef<HTMLDivElement>(null);

  // Only search when query has at least 2 characters and no client is selected
  const shouldSearch = debouncedQuery.length >= 2 && !selectedClient;

  const { data, isLoading, isFetching } = useClientsInfinite(
    shouldSearch ? { q: debouncedQuery, limit: 10 } : undefined,
  );

  const clients = data?.pages.flatMap(page => page.items) ?? [];
  const showDropdown = isOpen && debouncedQuery.length >= 2 && !selectedClient;

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onPhoneChange(value);
    setSearchQuery(value);

    // Clear selected client when user starts typing again
    if (selectedClient) {
      onSelectClient(null);
    }

    setIsOpen(true);
  }, [selectedClient, onSelectClient, onPhoneChange]);

  const handleSelectClient = useCallback((client: Client) => {
    onSelectClient(client);
    onPhoneChange(client.phone || '');
    setIsOpen(false);
    setSearchQuery('');
  }, [onSelectClient, onPhoneChange]);

  const handleClearSelection = useCallback(() => {
    onSelectClient(null);
    onPhoneChange('');
    setSearchQuery('');
  }, [onSelectClient, onPhoneChange]);

  const handleFocus = useCallback(() => {
    if (!selectedClient && searchQuery.length >= 2) {
      setIsOpen(true);
    }
  }, [selectedClient, searchQuery]);

  const handleBlur = useCallback(() => {
    // Delay to allow click on dropdown item
    setTimeout(() => setIsOpen(false), 200);
  }, []);

  const selectedHint = selectedClient
    ? `Выбран: ${[selectedClient.firstName, selectedClient.lastName].filter(Boolean).join(' ') || 'Клиент'}`
    : hint;

  return (
    <div className={styles.root} ref={inputRef}>
      <TextInput
        type="tel"
        name="phone"
        label={label}
        placeholder={placeholder}
        value={phoneValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        error={error}
        hint={selectedHint}
        disabled={disabled}
        required
      >
        {selectedClient && (
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

      <Dropdown
        isOpen={showDropdown}
        onClose={() => setIsOpen(false)}
        togglerRef={inputRef}
        className={styles.dropdown}
      >
        {isLoading || isFetching ? (
          <div className={styles.loading}>
            <Loader />
          </div>
        ) : clients.length > 0 ? (
          <ul className={styles.clientList}>
            {clients.map(client => (
              <li key={client.id}>
                <button
                  type="button"
                  className={styles.clientItem}
                  onClick={() => handleSelectClient(client)}
                >
                  <span className={styles.clientName}>
                    {[client.firstName, client.lastName].filter(Boolean).join(' ') || 'Без имени'}
                  </span>
                  {client.phone && (
                    <span className={styles.clientPhone}>{client.phone}</span>
                  )}
                  {client.username && (
                    <span className={styles.clientEmail}>@{client.username}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        ) : debouncedQuery.length >= 2 ? (
          <div className={styles.empty}>Клиенты не найдены</div>
        ) : null}
      </Dropdown>
    </div>
  );
}
