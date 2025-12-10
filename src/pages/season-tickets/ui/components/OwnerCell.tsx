import type { SeasonTicketOwnerInfo } from '@/shared/api';
import styles from './OwnerCell.module.scss';

interface OwnerCellProps {
  owner?: SeasonTicketOwnerInfo | null;
}

export function OwnerCell({ owner }: OwnerCellProps) {
  if (!owner) {
    return <span className={styles.empty}>—</span>;
  }

  const name = [owner.firstName, owner.lastName].filter(Boolean).join(' ') || 'Без имени';

  return (
    <div className={styles.ownerCell}>
      {owner.photoUrl ? (
        <img src={owner.photoUrl} alt="" className={styles.avatar} />
      ) : (
        <div className={styles.avatarPlaceholder}>
          {(owner.firstName?.[0] || '?').toUpperCase()}
        </div>
      )}
      <div className={styles.info}>
        <div className={styles.name}>{name}</div>
        {owner.phone && <div className={styles.phone}>{owner.phone}</div>}
      </div>
    </div>
  );
}
