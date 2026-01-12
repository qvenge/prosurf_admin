import styles from './UserCell.module.scss';

interface UserCellUser {
  firstName?: string | null;
  lastName?: string | null;
  photoUrl?: string | null;
}

interface UserCellProps {
  user?: UserCellUser | null;
  secondaryText?: string | null;
  fallbackName?: string;
  className?: string;
}

export function UserCell({ user, secondaryText, fallbackName = 'Без имени', className }: UserCellProps) {
  if (!user) {
    return <span className={styles.empty}>—</span>;
  }

  const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || fallbackName;
  const initial = (user.firstName?.[0] || '?').toUpperCase();

  return (
    <div className={className ? `${styles.userCell} ${className}` : styles.userCell}>
      {user.photoUrl ? (
        <img src={user.photoUrl} alt="" className={styles.avatar} />
      ) : (
        <div className={styles.avatarPlaceholder}>{initial}</div>
      )}
      <div className={styles.info}>
        <div className={styles.name}>{name}</div>
        {secondaryText && <div className={styles.secondary}>{secondaryText}</div>}
      </div>
    </div>
  );
}
