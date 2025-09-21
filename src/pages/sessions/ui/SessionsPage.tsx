import { Header } from '@/shared/ui';
import { SessionsTable } from './components/SessionsTable';
import styles from './SessionsPage.module.scss';
import { SegmentedButtons } from '@/shared/ui';
import { useState } from 'react';

const eventTypeOptions = [
  { value: 'training:surfing', label: 'Серфинг' },
  { value: 'training:surfskate', label: 'Серфскейт' },
  { value: 'tour', label: 'Туры' },
  { value: 'activity', label: 'Ивенты' },
];

export function SessionsPage() {
  const [selectedEventType, setSelectedEventType] = useState(eventTypeOptions[0].value);

  return (
    <>
      <Header title={'Записи'}>
        <SegmentedButtons
          options={eventTypeOptions}
          value={selectedEventType}
          onChange={(value) => {
            setSelectedEventType(value);
          }}
        />
      </Header>
      <div className={styles.page}>
        <SessionsTable eventType={selectedEventType} className={styles.table} />
      </div>
    </>
  );
}