import type { Client } from '@/shared/api';
import { TextInput } from '@/shared/ui';
import { APP_TIMEZONE } from '@/shared/lib/timezone';
import styles from './Profile.module.scss';

export interface ProfileProps {
  client: Client;
  onDeletePhoto?: () => void;
}

function formatBirthDate(dateString: string | null | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = date.toLocaleDateString('ru-RU', { day: '2-digit', timeZone: APP_TIMEZONE });
  const month = date.toLocaleDateString('ru-RU', { month: '2-digit', timeZone: APP_TIMEZONE });
  const year = date.toLocaleDateString('ru-RU', { year: 'numeric', timeZone: APP_TIMEZONE });
  return `${day}.${month}.${year}г`;
}

function getInitials(firstName?: string | null, lastName?: string | null): string {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return first + last || '?';
}

export function Profile({ client, onDeletePhoto: _onDeletePhoto }: ProfileProps) {
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
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Telegram</span>
            <div className={styles.fieldValue}>
              <a
                href={`https://t.me/${client.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.usernameLink}
              >
                @{client.username}
              </a>
            </div>
          </div>
        )}
        {client.dateOfBirth && (
          <TextInput
            label="Дата рождения"
            value={formatBirthDate(client.dateOfBirth)}
            readOnly
          />
        )}
      </div>
    </div>
  );
}
