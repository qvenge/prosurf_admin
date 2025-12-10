import { Button } from '@/shared/ui';
import { useDeleteSeasonTicketPlan, type SeasonTicketPlan } from '@/shared/api';
import styles from './DeletePlanModal.module.scss';

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

  const isLoading = deletePlanMutation.isPending;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.content}>
          <h3 className={styles.title}>Удалить абонемент?</h3>
          <p className={styles.description}>
            Вы уверены, что хотите удалить абонемент <strong>«{plan.name}»</strong>? Это действие нельзя отменить.
          </p>
        </div>
        <div className={styles.actions}>
          <Button
            type="secondary"
            size="l"
            onClick={onClose}
            disabled={isLoading}
          >
            Отмена
          </Button>
          <Button
            type="primary"
            size="l"
            onClick={handleDelete}
            disabled={isLoading}
            className={styles.deleteButton}
          >
            {isLoading ? 'Удаление...' : 'Удалить'}
          </Button>
        </div>
      </div>
    </div>
  );
}
