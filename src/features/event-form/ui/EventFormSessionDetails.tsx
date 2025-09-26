import { TextInput } from '@/shared/ui';
import type { SessionForm, ValidationErrors } from '../lib/types';
import { EventFormTimeSlots } from './EventFormTimeSlots';
import styles from './EventForm.module.scss';

interface EventFormSessionDetailsProps {
  session: SessionForm;
  errors: ValidationErrors;
  rangeMode?: boolean;
  onSessionChange: (sessionId: string, field: keyof Omit<SessionForm, 'timeSlots'>, value: string | number) => void;
  onTimeSlotChange: (sessionId: string, timeSlotId: string, field: keyof import('../lib/types').TimeSlot, value: string) => void;
  onAddTimeSlot: (sessionId: string) => void;
  onRemoveTimeSlot: (sessionId: string, timeSlotId: string) => void;
}

export function EventFormSessionDetails({
  session,
  errors,
  rangeMode = false,
  onSessionChange,
  onTimeSlotChange,
  onAddTimeSlot,
  onRemoveTimeSlot
}: EventFormSessionDetailsProps) {
  return (
    <div className={styles.dateWrapper}>
      <div className={styles.dateAndDuration}>
        <TextInput
          label={rangeMode ? 'Дата начала' : 'Дата'}
          type="date"
          value={session.date}
          onChange={(e) => onSessionChange(session.id, 'date', e.target.value)}
          error={!!errors[`session_${session.id}_date`]}
          hint={errors[`session_${session.id}_date`]}
        />
        {!rangeMode && (
          <TextInput
            className={styles.duration}
            label="Часов"
            type="number"
            step="0.5"
            min="0.5"
            max="8"
            value={session.duration}
            onChange={(e) => onSessionChange(session.id, 'duration', e.target.value)}
          />
        )}
      </div>
      {!rangeMode && (
        <EventFormTimeSlots
          sessionId={session.id}
          timeSlots={session.timeSlots}
          errors={errors}
          onTimeSlotChange={onTimeSlotChange}
          onAddTimeSlot={onAddTimeSlot}
          onRemoveTimeSlot={onRemoveTimeSlot}
        />
      )}
    </div>
  );
}