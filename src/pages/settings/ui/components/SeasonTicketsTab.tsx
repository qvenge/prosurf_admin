import { useState } from 'react';
import { Button, Icon, SideModal } from '@/shared/ui';
import { PlusBold } from '@/shared/ds/icons';
import { type SeasonTicketPlan } from '@/shared/api';
import { PlansTable } from './PlansTable';
import { PlanForm } from './PlanForm';
import { DeletePlanModal } from './DeletePlanModal';
import styles from './SeasonTicketsTab.module.scss';

export function SeasonTicketsTab() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingPlan, setEditingPlan] = useState<SeasonTicketPlan | undefined>(undefined);
  const [deletingPlan, setDeletingPlan] = useState<SeasonTicketPlan | undefined>(undefined);

  const handleCreate = () => {
    setEditingPlan(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (plan: SeasonTicketPlan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleDelete = (plan: SeasonTicketPlan) => {
    setDeletingPlan(plan);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingPlan(undefined);
  };

  const handleCloseDeleteModal = () => {
    setDeletingPlan(undefined);
  };

  return (
    <>
      <div className={styles.header}>
        <Button
          type="primary"
          size="l"
          onClick={handleCreate}
        >
          <Icon
            className={styles.addIcon}
            src={PlusBold}
            width={20}
            height={20}
          />
          Добавить
        </Button>
      </div>
      <div className={styles.content}>
        <PlansTable
          className={styles.table}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
      </div>
      {isModalOpen && (
        <SideModal onClose={handleClose}>
          <PlanForm
            onClose={handleClose}
            planData={editingPlan}
          />
        </SideModal>
      )}
      {deletingPlan && (
        <DeletePlanModal
          plan={deletingPlan}
          onClose={handleCloseDeleteModal}
        />
      )}
    </>
  );
}
