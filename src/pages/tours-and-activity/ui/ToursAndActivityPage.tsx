import { Header } from '@/shared/ui';
import { EventsTable } from '@/features/events-table';
import { EventForm } from '@/features/event-form';
import { SegmentedButtons, Button, Icon, SideModal } from '@/shared/ui';
import { PlusBold } from '@/shared/ds/icons';
import { useState } from 'react';

import styles from './ToursAndActivityPage.module.scss';

const eventTypeOptions = [
  { value: 'tour', label: 'Туры' },
  { value: 'activity', label: 'Ивенты' },
];

export function ToursAndActivityPage() {
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
      <Header title={'События'}>
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
          {selectedEventType === 'tour' ? 'Добавить тур' : 'Добавить ивент'}
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
          <EventForm
            eventId={editingEventId}
            onClose={handleClose}
            rangeMode={selectedEventType === 'tour'}
            labels={[selectedEventType]}
          />
        </SideModal>
      )}
    </>
  );
}