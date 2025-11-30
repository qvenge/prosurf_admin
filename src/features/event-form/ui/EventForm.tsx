import type { EventFormProps } from '../lib/types';
import { EventFormProvider, useEventFormContext } from '../lib/context';
import { EventFormMainInfo } from './EventFormMainInfo';
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
    <form className={styles.root}>
      <div className={styles.info}>
        <EventFormMainInfo />
        <EventFormImages />
        <EventFormDescription />
      </div>
      <EventFormActions />
    </form>
  );
}

export function EventForm({ onClose, eventId, categories, labels }: EventFormProps) {
  return (
    <EventFormProvider
      onClose={onClose}
      eventId={eventId}
      categories={categories}
      labels={labels}
    >
      <EventFormContent />
    </EventFormProvider>
  );
}