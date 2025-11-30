import { useState } from 'react';
import { EventsTable } from '@/features/events-table';
import { EventForm } from '@/features/event-form';
import { Button, Icon, SideModal, Header } from '@/shared/ui';
import { PlusBold } from '@/shared/ds/icons';
import styles from './TemplatesPage.module.scss';

const categoryOptions = [
  { value: 'training:surfing', label: 'Серфинг' },
  { value: 'training:surfskate', label: 'Серфскейт' },
  { value: 'tour', label: 'Тур' },
  { value: 'activity', label: 'Активность' },
];

export function TemplatesPage() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEventId, setEditingEventId] = useState<string | undefined>(undefined);

  const handleCreate = () => {
    setEditingEventId(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (eventId: string) => {
    setEditingEventId(eventId);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingEventId(undefined);
  };

  return (
    <>
      <Header title={'Шаблоны'}>
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
        <EventsTable
          className={styles.table}
          handleEdit={handleEdit}
        />
      </div>
      {isModalOpen && (
        <SideModal onClose={handleClose}>
          <EventForm
            categories={categoryOptions.map(option => ({
              ...option,
              selected: option.value === categoryOptions[0].value
            }))}
            onClose={handleClose}
            eventId={editingEventId}
          />
        </SideModal>
      )}
    </>
  );
}
