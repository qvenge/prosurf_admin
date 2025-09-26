import { TextInput, IconButton, ButtonContainer, Icon } from '@/shared/ui';
import { PlusBold, TrashRegular } from '@/shared/ds/icons';
import { useEventFormContext } from '../lib/context';
import type { SessionForm, TimeSlot } from '../lib/types';
import styles from './EventForm.module.scss';

export function EventFormTimeSlots() {
  const {
    formData,
    selectedSessionId,
    errors,
    handleTimeSlotChange,
    addTimeSlot,
    removeTimeSlot
  } = useEventFormContext();

  const session = formData.sessions.find((s: SessionForm) => s.id === selectedSessionId);

  if (!session) return null;

  const { timeSlots } = session;
  const sessionId = selectedSessionId;
  return (
    <div className={styles.timesWrapper}>
      <div className={styles.timesLabel}>Время</div>
      <div className={styles.times}>
        {timeSlots.map((timeSlot: TimeSlot) => (
          <TextInput
            key={timeSlot.id}
            className={styles.time}
            type="time"
            value={timeSlot.startTime}
            onChange={(e) => handleTimeSlotChange(sessionId, timeSlot.id, 'startTime', e.target.value)}
            error={!!errors[`session_${sessionId}_timeSlot_${timeSlot.id}_time`]}
            hint={errors[`session_${sessionId}_timeSlot_${timeSlot.id}_time`]}
          >
            {timeSlots.length > 1 &&
              <ButtonContainer
                className={styles.removeTimeWrapper}
                onClick={() => removeTimeSlot(sessionId, timeSlot.id)}
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
          onClick={() => addTimeSlot(sessionId)}
        />
      </div>
    </div>
  );
}