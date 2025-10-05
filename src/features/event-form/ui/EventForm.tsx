import type { EventFormProps } from '../lib/types';
import { EventFormProvider, useEventFormContext } from '../lib/context';
import { EventFormMainInfo } from './EventFormMainInfo';
import { EventFormSessions } from './EventFormSessions';
import { EventFormImages } from './EventFormImages';
import { EventFormDescription } from './EventFormDescription';
import { EventFormActions } from './EventFormActions';
import styles from './EventForm.module.scss';

function EventFormContent() {
  const { isInitialLoading } = useEventFormContext();

  if (isInitialLoading) {
    return (
      <div className={styles.root}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          Загрузка данных события...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.info}>
        <EventFormMainInfo />
        <EventFormSessions />
        <EventFormImages />
        <EventFormDescription />
      </div>
      <EventFormActions />
    </div>
  );
}

export function EventForm({ onClose, eventId, rangeMode = false, categories, labels }: EventFormProps) {
  return (
    <EventFormProvider
      onClose={onClose}
      eventId={eventId}
      rangeMode={rangeMode}
      categories={categories}
      labels={labels}
    >
      <EventFormContent />
    </EventFormProvider>
  );
}