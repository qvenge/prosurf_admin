import { useSeasonTicketAdmin } from '@/shared/api';
import { formatDate } from '@/shared/lib/format-utils';
import styles from './SeasonTicketDetails.module.scss';

interface SeasonTicketDetailsProps {
  ticketId: string;
  onPlanClick?: (planId: string) => void;
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Активен',
  CANCELLED: 'Отменён',
};

export function SeasonTicketDetails({ ticketId, onPlanClick }: SeasonTicketDetailsProps) {
  const { data: ticket, isLoading } = useSeasonTicketAdmin(ticketId);

  if (isLoading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  if (!ticket) {
    return <div className={styles.loading}>Абонемент не найден</div>;
  }

  const isExpired = new Date(ticket.validUntil) < new Date();
  const passesPercent = ticket.totalPasses > 0
    ? (ticket.remainingPasses / ticket.totalPasses) * 100
    : 0;

  const ownerName = [ticket.owner.firstName, ticket.owner.lastName]
    .filter(Boolean)
    .join(' ') || 'Без имени';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Абонемент</h2>
        <span className={`${styles.status} ${styles[`status${ticket.status}`]}`}>
          {STATUS_LABELS[ticket.status] || ticket.status}
        </span>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Владелец</h3>
        <div className={styles.ownerRow}>
          {ticket.owner.photoUrl ? (
            <img src={ticket.owner.photoUrl} alt="" className={styles.avatar} />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {(ticket.owner.firstName?.[0] || '?').toUpperCase()}
            </div>
          )}
          <div className={styles.ownerInfo}>
            <div className={styles.ownerName}>{ownerName}</div>
            {ticket.owner.phone && (
              <div className={styles.ownerPhone}>{ticket.owner.phone}</div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>План</h3>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Название</span>
          <span
            className={`${styles.fieldValue} ${styles.planLink}`}
            onClick={() => onPlanClick?.(ticket.plan.id)}
          >
            {ticket.plan.name}
          </span>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Посещения</h3>
        <div className={styles.passesBar}>
          <div className={styles.passesProgress}>
            <div
              className={styles.passesProgressFill}
              style={{ width: `${passesPercent}%` }}
            />
          </div>
          <span className={styles.passesText}>
            {ticket.remainingPasses} / {ticket.totalPasses}
          </span>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Даты</h3>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Дата покупки</span>
          <span className={styles.fieldValue}>{formatDate(ticket.createdAt)}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Действителен до</span>
          <span className={`${styles.fieldValue} ${isExpired ? styles.expired : ''}`}>
            {formatDate(ticket.validUntil)}
            {isExpired && ' (истёк)'}
          </span>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Системная информация</h3>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>ID</span>
          <span className={styles.fieldValue}>{ticket.id}</span>
        </div>
      </div>
    </div>
  );
}
