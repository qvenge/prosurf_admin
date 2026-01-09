import { ConfirmModal } from '@/shared/ui';
import { useDeleteSeasonTicketPlan, type SeasonTicketPlan } from '@/shared/api';

interface DeletePlanModalProps {
  plan: SeasonTicketPlan;
  onClose: () => void;
}

export function DeletePlanModal({ plan, onClose }: DeletePlanModalProps) {
  const deletePlanMutation = useDeleteSeasonTicketPlan();

  const handleDelete = async () => {
    try {
      await deletePlanMutation.mutateAsync(plan.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete plan:', error);
    }
  };

  return (
    <ConfirmModal
      open={true}
      onClose={onClose}
      onConfirm={handleDelete}
      title="Удалить абонемент?"
      description={
        <>
          Вы уверены, что хотите удалить абонемент <strong>{plan.name}</strong>?
          Это действие нельзя отменить.
        </>
      }
      variant="danger"
      cancelText="Отмена"
      confirmText="Удалить"
      confirmLoadingText="Удаление..."
      isLoading={deletePlanMutation.isPending}
    />
  );
}
