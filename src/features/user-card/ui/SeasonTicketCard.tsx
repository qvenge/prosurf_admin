import type { SeasonTicket } from '@/shared/api';
import { TextButton } from '@/shared/ui';
import { formatDate } from '@/shared/lib/format-utils';
import styles from './SeasonTicketCard.module.scss';

interface SeasonTicketCardProps {
  ticket: SeasonTicket;
  onCancel: () => void;
  isCancelling: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Активен',
  EXPIRED: 'Истёк',
  CANCELLED: 'Отменён',
};

export function SeasonTicketCard({ ticket, onCancel, isCancelling }: SeasonTicketCardProps) {
  const expirationDate = formatDate(ticket.validUntil);
  const isActive = ticket.status === 'ACTIVE';

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.planName}>{ticket.plan.name}</span>
        <span className={`${styles.status} ${styles[`status${ticket.status}`]}`}>
          {STATUS_LABELS[ticket.status]}
        </span>
      </div>

      <div className={styles.details}>
        <div className={styles.detail}>
          <span className={styles.label}>Осталось проходов:</span>
          <span className={styles.value}>
            {ticket.remainingPasses} / {ticket.plan.passes}
          </span>
        </div>
        <div className={styles.detail}>
          <span className={styles.label}>Действует до:</span>
          <span className={styles.value}>{expirationDate}</span>
        </div>
      </div>

      {isActive && (
        <div className={styles.actions}>
          <TextButton
            type="secondary"
            size="s"
            onClick={onCancel}
            disabled={isCancelling}
          >
            {isCancelling ? 'Отмена...' : 'Отменить'}
          </TextButton>
        </div>
      )}
    </div>
  );
}
