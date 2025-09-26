import { TextInput, IconButton, ButtonContainer, Icon } from '@/shared/ui';
import { PlusBold, TrashRegular } from '@/shared/ds/icons';
import type { TimeSlot, ValidationErrors } from '../lib/types';
import styles from './EventForm.module.scss';

interface EventFormTimeSlotsProps {
  sessionId: string;
  timeSlots: TimeSlot[];
  errors: ValidationErrors;
  onTimeSlotChange: (sessionId: string, timeSlotId: string, field: keyof TimeSlot, value: string) => void;
  onAddTimeSlot: (sessionId: string) => void;
  onRemoveTimeSlot: (sessionId: string, timeSlotId: string) => void;
}

export function EventFormTimeSlots({
  sessionId,
  timeSlots,
  errors,
  onTimeSlotChange,
  onAddTimeSlot,
  onRemoveTimeSlot
}: EventFormTimeSlotsProps) {
  return (
    <div className={styles.timesWrapper}>
      <div className={styles.timesLabel}>Время</div>
      <div className={styles.times}>
        {timeSlots.map((timeSlot) => (
          <TextInput
            key={timeSlot.id}
            className={styles.time}
            type="time"
            value={timeSlot.startTime}
            onChange={(e) => onTimeSlotChange(sessionId, timeSlot.id, 'startTime', e.target.value)}
            error={!!errors[`session_${sessionId}_timeSlot_${timeSlot.id}_time`]}
            hint={errors[`session_${sessionId}_timeSlot_${timeSlot.id}_time`]}
          >
            {timeSlots.length > 1 &&
              <ButtonContainer
                className={styles.removeTimeWrapper}
                onClick={() => onRemoveTimeSlot(sessionId, timeSlot.id)}
              >
                <Icon
                  className={styles.removeTime}
                  src={TrashRegular}
                  width={20}
                  height={20}
                />
              </ButtonContainer>
            }
          </TextInput>
        ))}
        <IconButton
          className={styles.addTime}
          src={PlusBold}
          type="secondary"
          size="l"
          onClick={() => onAddTimeSlot(sessionId)}
        />
      </div>
    </div>
  );
}