import type { Client } from '@/shared/api';
import styles from './Profile.module.scss';

export interface ProfileProps {
  client: Client;
}

export function Profile({ client }: ProfileProps) {
  return (
    <div className={styles.root}>
      <div>Telegram ID: {client.telegramId}</div>
      {client.username && <div>Username: @{client.username}</div>}
      {client.firstName && <div>Имя: {client.firstName}</div>}
      {client.lastName && <div>Фамилия: {client.lastName}</div>}
      {client.phone && <div>Телефон: {client.phone}</div>}
    </div>
  );
}