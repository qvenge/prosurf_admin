import { AlternativeTabs, Button, ButtonContainer, Icon } from '@/shared/ui';
import { PlusBold, TrashRegular } from '@/shared/ds/icons';
import type { SessionForm, ValidationErrors } from '../lib/types';
import { EventFormSessionDetails } from './EventFormSessionDetails';
import { formatDateForDisplay } from '../lib/utils';
import styles from './EventForm.module.scss';

interface EventFormSessionsProps {
  sessions: SessionForm[];
  selectedSessionId: string;
  errors: ValidationErrors;
  rangeMode?: boolean;
  onSelectedSessionChange: (sessionId: string) => void;
  onSessionChange: (sessionId: string, field: keyof Omit<SessionForm, 'timeSlots'>, value: string | number) => void;
  onTimeSlotChange: (sessionId: string, timeSlotId: string, field: keyof import('../lib/types').TimeSlot, value: string) => void;
  onAddTimeSlot: (sessionId: string) => void;
  onRemoveTimeSlot: (sessionId: string, timeSlotId: string) => void;
  onAddSession: () => void;
  onRemoveSession: (sessionId: string) => void;
}

export function EventFormSessions({
  sessions,
  selectedSessionId,
  errors,
  rangeMode = false,
  onSelectedSessionChange,
  onSessionChange,
  onTimeSlotChange,
  onAddTimeSlot,
  onRemoveTimeSlot,
  onAddSession,
  onRemoveSession
}: EventFormSessionsProps) {
  const selectedSession = sessions.find(session => session.id === selectedSessionId);

  return (
    <>
      {!rangeMode && (
        <AlternativeTabs
          className={styles.dateTabs}
          items={sessions.map((session, i) => ({
            label: (
              <>
                {session.date ? formatDateForDisplay(session.date) : `${rangeMode ? 'Даты' : 'Дата'} ${i + 1}`}
                {sessions.length > 1 && (
                  <ButtonContainer onClick={() => onRemoveSession(session.id)}>
                    <Icon className={styles.removeIcon} src={TrashRegular} width={20} height={20} />
                  </ButtonContainer>
                )}
              </>
            ),
            value: session.id
          }))}
          value={selectedSessionId}
          onChange={onSelectedSessionChange}
        />
      )}

      <div className={styles.sessionsSection}>
        {selectedSession && (
          <EventFormSessionDetails
            key={selectedSession.id}
            session={selectedSession}
            errors={errors}
            rangeMode={rangeMode}
            onSessionChange={onSessionChange}
            onTimeSlotChange={onTimeSlotChange}
            onAddTimeSlot={onAddTimeSlot}
            onRemoveTimeSlot={onRemoveTimeSlot}
          />
        )}
      </div>

      {!rangeMode && (
        <Button
          type="secondary"
          size="l"
          streched={true}
          onClick={onAddSession}
          className={styles.addSessionButton}
        >
          <Icon src={PlusBold} width={20} height={20} />
          Добавить ещё дату
        </Button>
      )}
    </>
  );
}