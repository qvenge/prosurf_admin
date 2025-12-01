import type { Client } from '@/shared/api';
import { TextInput } from '@/shared/ui';
import styles from './Profile.module.scss';

export interface ProfileProps {
  client: Client;
  onDeletePhoto?: () => void;
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}г`;
}

function getInitials(firstName?: string | null, lastName?: string | null): string {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return first + last || '?';
}

export function Profile({ client, onDeletePhoto }: ProfileProps) {
  return (
    <div className={styles.root}>
      <div className={styles.avatarSection}>
        {client.photoUrl ? (
          <img
            className={styles.avatar}
            src={client.photoUrl}
            alt={`${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Avatar'}
          />
        ) : (
          <div className={styles.avatarPlaceholder}>
            {getInitials(client.firstName, client.lastName)}
          </div>
        )}
      </div>

      <div className={styles.inputs}>
        <TextInput
          label="Имя"
          value={client.firstName || ''}
          readOnly
        />
        <TextInput
          label="Фамилия"
          value={client.lastName || ''}
          readOnly
        />
        <TextInput
          label="Телефон"
          value={client.phone || ''}
          readOnly
        />
        <TextInput
          label="Telegram ID"
          value={client.telegramId}
          readOnly
        />
        {client.username && (
          <TextInput
            label="Username"
            value={`@${client.username}`}
            readOnly
          />
        )}
        {client.dateOfBirth && (
          <TextInput
            label="Дата рождения"
            value={formatDate(client.dateOfBirth)}
            readOnly
          />
        )}
      </div>
    </div>
  );
}
