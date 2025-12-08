import type { ClientInfo } from '@/shared/api';
import styles from './ClientCell.module.scss';

interface ClientCellProps {
  client?: ClientInfo | null;
}

export function ClientCell({ client }: ClientCellProps) {
  if (!client) {
    return <span className={styles.empty}>—</span>;
  }

  const name = [client.firstName, client.lastName].filter(Boolean).join(' ') || 'Без имени';

  return (
    <div className={styles.clientCell}>
      {client.photoUrl ? (
        <img src={client.photoUrl} alt="" className={styles.avatar} />
      ) : (
        <div className={styles.avatarPlaceholder}>
          {(client.firstName?.[0] || '?').toUpperCase()}
        </div>
      )}
      <div className={styles.info}>
        <div className={styles.name}>{name}</div>
        {client.phone && <div className={styles.phone}>{client.phone}</div>}
      </div>
    </div>
  );
}
