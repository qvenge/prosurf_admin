import { Header } from '@/shared/ui';
import { PlansTable } from './components/PlansTable';
import { PlanForm } from './components/PlanForm';
import styles from './SeasonTicketsPage.module.scss';
import type { SeasonTicketPlan } from '@/shared/api';
import { SegmentedButtons, Button, Icon, SideModal } from '@/shared/ui';
import { PlusBold } from '@/shared/ds/icons';
import { useState } from 'react';

const tabs = [
  { value: 'plans', label: 'Абонементы' },
  { value: 'season-tickets', label: 'Пользователи' },
];

export function SeasonTicketsPage() {
  const [selectedTab, setSelectedTab] = useState(tabs[0].value);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editinPlan, setEditingPlan] = useState<SeasonTicketPlan | undefined>(undefined);

  const handleCreate = () => {
    setEditingPlan(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (pland: SeasonTicketPlan) => {
    setEditingPlan(pland);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingPlan(undefined);
  };

  return (
    <>
      <Header title={'Абонементы'}>
        <SegmentedButtons
          options={tabs}
          value={selectedTab}
          onChange={(value) => {
            setSelectedTab(value);
          }}
        />
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
      </Header>
      <div className={styles.page}>
        <PlansTable
          className={styles.table}
          handleEdit={handleEdit}
        />
      </div>
      {isModalOpen && (
        <SideModal onClose={handleClose}>
          <PlanForm onClose={handleClose} planData={editinPlan} />
        </SideModal>
      )}
    </>
  );
}