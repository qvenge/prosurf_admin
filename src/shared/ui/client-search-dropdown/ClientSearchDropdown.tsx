'use client';

import { type RefObject } from 'react';
import { type Client } from '@/shared/api';
import { Dropdown } from '@/shared/ui/dropdown';
import { Loader } from '@/shared/ui/loader';
import styles from './ClientSearchDropdown.module.scss';

export interface ClientSearchDropdownProps {
  isOpen: boolean;
  clients: Client[];
  isLoading: boolean;
  searchQuery: string;
  minQueryLength?: number;
  onSelectClient: (client: Client) => void;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
}

export function ClientSearchDropdown({
  isOpen,
  clients,
  isLoading,
  searchQuery,
  minQueryLength = 2,
  onSelectClient,
  onClose,
  anchorRef,
}: ClientSearchDropdownProps) {
  const showDropdown = isOpen && searchQuery.length >= minQueryLength;

  if (!showDropdown) {
    return null;
  }

  return (
    <Dropdown
      isOpen={showDropdown}
      onClose={onClose}
      togglerRef={anchorRef}
      className={styles.dropdown}
    >
      {isLoading ? (
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
                onClick={() => onSelectClient(client)}
              >
                <span className={styles.clientName}>
                  {[client.firstName, client.lastName].filter(Boolean).join(' ') || 'Без имени'}
                </span>
                {client.phone && (
                  <span className={styles.clientPhone}>{client.phone}</span>
                )}
                {client.email && (
                  <span className={styles.clientEmail}>{client.email}</span>
                )}
                {client.username && (
                  <span className={styles.clientUsername}>@{client.username}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.empty}>Клиенты не найдены</div>
      )}
    </Dropdown>
  );
}
