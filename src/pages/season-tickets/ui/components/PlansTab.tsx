import type { SeasonTicketPlan } from '@/shared/api';
import { PlansTable } from './PlansTable';
import styles from './PlansTab.module.scss';

interface PlansTabProps {
  onEdit: (plan: SeasonTicketPlan) => void;
  onDelete: (plan: SeasonTicketPlan) => void;
}

export function PlansTab({ onEdit, onDelete }: PlansTabProps) {
  return (
    <div className={styles.content}>
      <PlansTable
        className={styles.table}
        handleEdit={onEdit}
        handleDelete={onDelete}
      />
    </div>
  );
}
