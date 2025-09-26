import { Header } from '@/shared/ui';
import { EventsTable } from '@/features/events-table';
import { EventForm } from '@/features/event-form';
import styles from './TrainingsPage.module.scss';
import { SegmentedButtons, Button, Icon, SideModal } from '@/shared/ui';
import { PlusBold } from '@/shared/ds/icons';
import { useState } from 'react';

const eventTypeOptions = [
  { value: 'training:surfing', label: 'Серфинг' },
  { value: 'training:surfskate', label: 'Серфскейт' },
];

export function TrainingsPage() {
  const [selectedEventType, setSelectedEventType] = useState(eventTypeOptions[0].value);
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
      <Header title={'Тренировки'}>
        <SegmentedButtons
          options={eventTypeOptions}
          value={selectedEventType}
          onChange={(value) => {
            setSelectedEventType(value);
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
        <EventsTable
          className={styles.table}
          eventType={selectedEventType}
          handleEdit={handleEdit}
        />
      </div>
      {isModalOpen && (
        <SideModal onClose={handleClose}>
          <EventForm onClose={handleClose} eventId={editingEventId} />
        </SideModal>
      )}
    </>
  );
}