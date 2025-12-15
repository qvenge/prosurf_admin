import { Button } from '@/shared/ui';
import { useCancelSeasonTicket, type SeasonTicketAdmin } from '@/shared/api';
import styles from './CancelTicketModal.module.scss';

interface CancelTicketModalProps {
  ticket: SeasonTicketAdmin;
  onClose: () => void;
}

export function CancelTicketModal({ ticket, onClose }: CancelTicketModalProps) {
  const cancelMutation = useCancelSeasonTicket();

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync(ticket.id);
      onClose();
    } catch (error) {
      console.error('Failed to cancel ticket:', error);
    }
  };

  const isLoading = cancelMutation.isPending;

  const ownerName = [ticket.owner.firstName, ticket.owner.lastName]
    .filter(Boolean)
    .join(' ') || 'Без имени';

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.content}>
          <h3 className={styles.title}>Отменить абонемент?</h3>
          <p className={styles.description}>
            Вы уверены, что хотите отменить абонемент <strong>«{ticket.plan.name}»</strong> пользователя <strong>{ownerName}</strong>?
          </p>
          <p className={styles.info}>
            Осталось посещений: {ticket.remainingPasses} из {ticket.totalPasses}
          </p>
        </div>
        <div className={styles.actions}>
          <Button
            type="secondary"
            size="l"
            onClick={onClose}
            disabled={isLoading}
          >
            Назад
          </Button>
          <Button
            type="primary"
            size="l"
            onClick={handleCancel}
            disabled={isLoading}
            className={styles.cancelButton}
          >
            {isLoading ? 'Отмена...' : 'Отменить'}
          </Button>
        </div>
      </div>
    </div>
  );
}
