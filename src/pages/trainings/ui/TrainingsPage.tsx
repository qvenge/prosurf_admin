import { Header } from '@/shared/ui';
import { TrainingsTable } from './components/TrainingsTable';
import styles from './TrainingsPage.module.scss';
import { SegmentedButtons } from '@/shared/ui';
import { useState } from 'react';

const eventTypeOptions = [
  { value: 'training:surfing', label: 'Серфинг' },
  { value: 'training:surfskate', label: 'Серфскейт' },
];

export function TrainingsPage() {
  const [selectedEventType, setSelectedEventType] = useState(eventTypeOptions[0].value);

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
      </Header>
      <div className={styles.page}>
        <TrainingsTable eventType={selectedEventType} className={styles.table} />
      </div>
    </>
  );
}