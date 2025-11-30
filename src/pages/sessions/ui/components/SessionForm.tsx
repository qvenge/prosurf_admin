import { useState, useCallback } from 'react';
import { AlternativeTabs, Button, ButtonContainer, IconButton, Icon, Select, TextInput } from '@/shared/ui';
import { PlusBold, TrashRegular } from '@/shared/ds/icons';
import { useEvents } from '@/shared/api/hooks/events';
import { useCreateEventSessions } from '@/shared/api/hooks/sessions';
import {
  generateSessionId,
  generateTimeSlotId,
  formatDateForDisplay,
  convertSessionsToSessionCreateDtos
} from '@/features/event-form/lib/utils';
import type { SessionForm as SessionFormType, TimeSlot } from '@/features/event-form/lib/types';
import styles from './SessionForm.module.scss';

interface SessionFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

function createInitialSession(): SessionFormType {
  return {
    id: generateSessionId(),
    date: '',
    endDate: '',
    timeSlots: [{ id: generateTimeSlotId(), startTime: '' }],
    duration: '1.5',
  };
}

export function SessionForm({ onClose, onSuccess }: SessionFormProps) {
  const [eventId, setEventId] = useState<string>('');
  const [sessions, setSessions] = useState<SessionFormType[]>([createInitialSession()]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>(sessions[0].id);

  const { data: eventsData, isLoading: isLoadingEvents } = useEvents();
  const createSessionMutation = useCreateEventSessions();

  const events = eventsData?.items ?? [];
  const selectedEvent = events.find(e => e.id === eventId);
  const rangeMode = selectedEvent?.labels?.includes('tour') ?? false;

  const eventOptions = events.map((event) => ({
    value: event.id,
    label: event.title,
  }));

  const selectedSession = sessions.find(s => s.id === selectedSessionId);

  // Session handlers
  const addSession = useCallback(() => {
    const newSession = createInitialSession();
    setSessions(prev => [...prev, newSession]);
    setSelectedSessionId(newSession.id);
  }, []);

  const removeSession = useCallback((sessionId: string) => {
    setSessions(prev => {
      const newSessions = prev.filter(s => s.id !== sessionId);
      if (selectedSessionId === sessionId && newSessions.length > 0) {
        setSelectedSessionId(newSessions[0].id);
      }
      return newSessions;
    });
  }, [selectedSessionId]);

  const handleSessionChange = useCallback((sessionId: string, field: keyof SessionFormType, value: string) => {
    setSessions(prev => prev.map(s =>
      s.id === sessionId ? { ...s, [field]: value } : s
    ));
  }, []);

  // TimeSlot handlers
  const addTimeSlot = useCallback((sessionId: string) => {
    setSessions(prev => prev.map(s =>
      s.id === sessionId
        ? { ...s, timeSlots: [...s.timeSlots, { id: generateTimeSlotId(), startTime: '' }] }
        : s
    ));
  }, []);

  const removeTimeSlot = useCallback((sessionId: string, timeSlotId: string) => {
    setSessions(prev => prev.map(s =>
      s.id === sessionId
        ? { ...s, timeSlots: s.timeSlots.filter(ts => ts.id !== timeSlotId) }
        : s
    ));
  }, []);

  const handleTimeSlotChange = useCallback((sessionId: string, timeSlotId: string, field: keyof TimeSlot, value: string) => {
    setSessions(prev => prev.map(s =>
      s.id === sessionId
        ? {
            ...s,
            timeSlots: s.timeSlots.map(ts =>
              ts.id === timeSlotId ? { ...ts, [field]: value } : ts
            )
          }
        : s
    ));
  }, []);

  const handleSubmit = async () => {
    if (!eventId || sessions.length === 0) {
      return;
    }

    // Validate sessions
    const hasValidSessions = sessions.every(s => {
      if (rangeMode) {
        return s.date && s.endDate;
      }
      return s.date && s.timeSlots.some(ts => ts.startTime);
    });

    if (!hasValidSessions) {
      return;
    }

    try {
      const sessionDtos = convertSessionsToSessionCreateDtos(sessions, rangeMode);

      await createSessionMutation.mutateAsync({
        eventId,
        data: sessionDtos,
        idempotencyKey: `create-sessions-${eventId}-${Date.now()}`,
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to create sessions:', error);
    }
  };

  const isSubmitDisabled = !eventId || createSessionMutation.isPending;

  return (
    <div className={styles.root}>
      <h2 className={styles.title}>Новый сеанс</h2>

      <div className={styles.fields}>
        <Select
          label="Мероприятие"
          placeholder={isLoadingEvents ? 'Загрузка...' : 'Выберите мероприятие'}
          options={eventOptions}
          value={eventId}
          onChange={setEventId}
          disabled={isLoadingEvents}
        />

        {eventId && (
          <>
            {/* Session tabs */}
            {!rangeMode && (
              <AlternativeTabs
                className={styles.dateTabs}
                items={sessions.map((session, i) => ({
                  label: (
                    <>
                      {session.date ? formatDateForDisplay(session.date) : `Дата ${i + 1}`}
                      {sessions.length > 1 && (
                        <ButtonContainer onClick={() => removeSession(session.id)}>
                          <Icon className={styles.removeIcon} src={TrashRegular} width={20} height={20} />
                        </ButtonContainer>
                      )}
                    </>
                  ),
                  value: session.id
                }))}
                value={selectedSessionId}
                onChange={setSelectedSessionId}
              />
            )}

            {/* Session details */}
            <div className={styles.sessionsSection}>
              {selectedSession && (
                <div className={styles.dateWrapper}>
                  <div className={styles.dateAndDuration}>
                    <TextInput
                      label={rangeMode ? 'Дата начала' : 'Дата'}
                      type="date"
                      value={selectedSession.date}
                      onChange={(e) => handleSessionChange(selectedSession.id, 'date', e.target.value)}
                    />
                    {!rangeMode && (
                      <TextInput
                        className={styles.duration}
                        label="Часов"
                        type="number"
                        step="0.5"
                        min="0.5"
                        max="8"
                        value={selectedSession.duration}
                        onChange={(e) => handleSessionChange(selectedSession.id, 'duration', e.target.value)}
                      />
                    )}
                  </div>

                  {rangeMode ? (
                    <TextInput
                      label="Дата окончания"
                      type="date"
                      value={selectedSession.endDate || ''}
                      onChange={(e) => handleSessionChange(selectedSession.id, 'endDate', e.target.value)}
                    />
                  ) : (
                    /* Time slots */
                    <div className={styles.timesWrapper}>
                      <div className={styles.timesLabel}>Время</div>
                      <div className={styles.times}>
                        {selectedSession.timeSlots.map((timeSlot) => (
                          <TextInput
                            key={timeSlot.id}
                            type="time"
                            value={timeSlot.startTime}
                            onChange={(e) => handleTimeSlotChange(selectedSession.id, timeSlot.id, 'startTime', e.target.value)}
                          >
                            {selectedSession.timeSlots.length > 1 && (
                              <ButtonContainer
                                className={styles.removeTimeWrapper}
                                onClick={() => removeTimeSlot(selectedSession.id, timeSlot.id)}
                              >
                                <Icon
                                  className={styles.removeTime}
                                  src={TrashRegular}
                                  width={20}
                                  height={20}
                                />
                              </ButtonContainer>
                            )}
                          </TextInput>
                        ))}
                        <IconButton
                          className={styles.addTime}
                          src={PlusBold}
                          type="secondary"
                          size="l"
                          onClick={() => addTimeSlot(selectedSession.id)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Add session button */}
            {!rangeMode && (
              <Button
                type="secondary"
                size="l"
                streched={true}
                onClick={addSession}
                className={styles.addSessionButton}
              >
                <Icon src={PlusBold} width={20} height={20} />
                Добавить ещё дату
              </Button>
            )}
          </>
        )}
      </div>

      <div className={styles.actions}>
        <Button
          type="primary"
          size="l"
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
        >
          {createSessionMutation.isPending ? 'Создание...' : 'Создать'}
        </Button>
      </div>
    </div>
  );
}
