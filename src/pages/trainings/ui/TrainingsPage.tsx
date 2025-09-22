import { Header } from '@/shared/ui';
import { TrainingsTable } from './components/TrainingsTable';
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
          onClick={() => setIsModalOpen(true)}
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
        <TrainingsTable eventType={selectedEventType} className={styles.table} />
      </div>
      {isModalOpen && <SideModal onClose={() => setIsModalOpen(false)}>
        {/* Here will be the form to add a new training or edit existing one */}
      </SideModal>}
    </>
  );
}