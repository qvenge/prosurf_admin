import { ConfirmModal } from '@/shared/ui';
import { useCancelSeasonTicket, type SeasonTicketAdmin } from '@/shared/api';

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

  const ownerName = [ticket.owner.firstName, ticket.owner.lastName]
    .filter(Boolean)
    .join(' ') || 'Без имени';

  return (
    <ConfirmModal
      open={true}
      onClose={onClose}
      onConfirm={handleCancel}
      title="Отменить абонемент?"
      description={
        <>
          Вы уверены, что хотите отменить абонемент <strong>{ticket.plan.name}</strong>{' '}
          пользователя <strong>{ownerName}</strong>?
        </>
      }
      info={`Осталось посещений: ${ticket.remainingPasses} из ${ticket.totalPasses}`}
      variant="danger"
      cancelText="Назад"
      confirmText="Отменить"
      confirmLoadingText="Отмена..."
      isLoading={cancelMutation.isPending}
    />
  );
}
