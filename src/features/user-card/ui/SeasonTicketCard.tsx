import type { SeasonTicket } from '@/shared/api';
import { IconButton } from '@/shared/ui';
import { TrashRegular, ArrowCounterClockwiseRegular } from '@/shared/ds/icons';
import { formatDate } from '@/shared/lib/format-utils';
import styles from './SeasonTicketCard.module.scss';

interface SeasonTicketCardProps {
  ticket: SeasonTicket;
  isDeleted?: boolean;
  disabled?: boolean;
  onDelete: () => void;
  onRestore: () => void;
}

export function SeasonTicketCard({
  ticket,
  isDeleted = false,
  disabled = false,
  onDelete,
  onRestore
}: SeasonTicketCardProps) {
  return (
    <div className={`${styles.card} ${isDeleted ? styles.deleted : ''}`}>
      <div className={styles.content}>
        <span className={styles.name}>{ticket.plan.name}</span>
        <div className={styles.details}>
          <div className={styles.detail}>
            Осталось: {ticket.remainingPasses} из {ticket.plan.passes}
          </div>
          <div className={styles.detail}>
            до {formatDate(ticket.validUntil)}
          </div>
        </div>
      </div>

      <IconButton
        type="secondary"
        size="l"
        src={isDeleted ? ArrowCounterClockwiseRegular : TrashRegular}
        onClick={isDeleted ? onRestore : onDelete}
        disabled={disabled}
      />
    </div>
  );
}
