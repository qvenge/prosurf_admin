import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TextInput, Select, Button, Textarea, AlternativeTabs, IconButton, ButtonContainer } from '@/shared/ui';
import { useCreateEvent, useCreateEventSessions, useUpdateEvent, useBulkDeleteSessions, sessionsClient, sessionsKeys, eventsClient, eventsKeys } from '@/shared/api';
import type { EventCreateDto, EventUpdateDto, SessionCreateDto } from '@/shared/api';
import { PlusBold, TrashRegular } from '@/shared/ds/icons';
import { Icon } from '@/shared/ui';
import styles from './EventForm.module.scss';

interface EventFormProps {
  onClose: () => void;
  eventId?: string; // For edit mode
  rangeMode?: boolean;
}

interface TimeSlot {
  id: string;
  startTime: string;
}

interface SessionForm {
  id: string;
  date: string;
  timeSlots: TimeSlot[];
  duration: string;
}

interface FormData {
  discipline: string;
  title: string;
  location: string;
  price: string;
  capacity: string;
  sessions: SessionForm[];
  photos: File[];
  description: string;
  whatToBring: string;
}

const disciplineOptions = [
  { value: 'training:surfing', label: 'Серфинг' },
  { value: 'training:surfskate', label: 'Серфскейт' },
  { value: 'tour', label: 'Тур' },
  { value: 'activity', label: 'Ивент' },
];

export function EventForm({ onClose, eventId, rangeMode = false }: EventFormProps) {
  const [formData, setFormData] = useState<FormData>({
    discipline: disciplineOptions[0].value,
    title: '',
    location: '',
    price: '',
    capacity: '',
    sessions: [{
      id: '1',
      date: '',
      timeSlots: [{
        id: 'time-1',
        startTime: ''
      }],
      duration: '1.5',
    }],
    photos: [],
    description: '',
    whatToBring: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedSessionId, setSelectedSessionId] = useState<string>(formData.sessions[0].id);
  const [isInitialized, setIsInitialized] = useState(false);
  const [existingSessions, setExistingSessions] = useState<string[]>([]);

  const isEditMode = !!eventId;

  // API hooks
  const createEventMutation = useCreateEvent();
  const createSessionsMutation = useCreateEventSessions();
  const updateEventMutation = useUpdateEvent();
  const bulkDeleteSessionsMutation = useBulkDeleteSessions();

  // Fetch event data when in edit mode
  const { data: eventData, isLoading: eventLoading } = useQuery({
    queryKey: eventsKeys.detail(eventId || ''),
    queryFn: () => eventsClient.getEventById(eventId || ''),
    enabled: isEditMode,
    staleTime: 10 * 60 * 1000,
  });
  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: sessionsKeys.eventSessions(eventId || ''),
    queryFn: () => sessionsClient.getEventSessions(eventId || ''),
    enabled: isEditMode,
    staleTime: 2 * 60 * 1000,
  });

  // Initialize form with existing data when in edit mode
  useEffect(() => {
    if (isEditMode && eventData && sessionsData && !isInitialized) {
      // Map discipline from labels
      const discipline = eventData.labels?.find(label =>
        disciplineOptions.some(option => option.value === label)
      ) || disciplineOptions[0].value;

      // Get price from first ticket
      const price = eventData.tickets[0]?.full.price.amountMinor
        ? (eventData.tickets[0].full.price.amountMinor / 100).toString()
        : '';

      // Extract description and whatToBring from description array
      const descriptions = eventData.description || [];
      const descriptionItem = descriptions.find(d => d.heading === 'Описание тренировки');
      const whatToBringItem = descriptions.find(d => d.heading === 'Что с собой?');

      // Group sessions by date and convert to form structure
      const sessionsMap = new Map<string, SessionForm>();
      sessionsData.items.forEach((session, index) => {
        const sessionDate = new Date(session.startsAt);
        const dateKey = sessionDate.toISOString().split('T')[0];
        const startTime = sessionDate.toTimeString().slice(0, 5);

        if (sessionsMap.has(dateKey)) {
          sessionsMap.get(dateKey)!.timeSlots.push({
            id: `time-${session.id}`,
            startTime,
          });
        } else {
          const duration = session.endsAt
            ? ((new Date(session.endsAt).getTime() - sessionDate.getTime()) / (1000 * 60 * 60)).toString()
            : '1.5';

          sessionsMap.set(dateKey, {
            id: `session-${dateKey}-${index}`,
            date: dateKey,
            timeSlots: [{
              id: `time-${session.id}`,
              startTime,
            }],
            duration,
          });
        }
      });

      const formSessions = Array.from(sessionsMap.values());

      // Store existing session IDs for comparison later
      setExistingSessions(sessionsData.items.map(s => s.id));

      setFormData({
        discipline,
        title: eventData.title,
        location: eventData.location || '',
        price,
        capacity: eventData.capacity?.toString() || '',
        sessions: formSessions.length > 0 ? formSessions : [{
          id: '1',
          date: '',
          timeSlots: [{ id: 'time-1', startTime: '' }],
          duration: '1.5',
        }],
        photos: [],
        description: descriptionItem?.body || '',
        whatToBring: whatToBringItem?.body || '',
      });

      setSelectedSessionId(formSessions[0]?.id || '1');
      setIsInitialized(true);
    }
  }, [eventData, sessionsData, isEditMode, isInitialized]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSessionChange = (sessionId: string, field: keyof Omit<SessionForm, 'timeSlots'>, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      sessions: prev.sessions.map(session =>
        session.id === sessionId ? { ...session, [field]: value } : session
      ),
    }));
  };

  const handleTimeSlotChange = (sessionId: string, timeSlotId: string, field: keyof TimeSlot, value: string) => {
    setFormData(prev => ({
      ...prev,
      sessions: prev.sessions.map(session =>
        session.id === sessionId
          ? {
              ...session,
              timeSlots: session.timeSlots.map(timeSlot =>
                timeSlot.id === timeSlotId ? { ...timeSlot, [field]: value } : timeSlot
              ),
            }
          : session
      ),
    }));
  };

  const addTimeSlot = (sessionId: string) => {
    const newTimeSlot: TimeSlot = {
      id: `time-${Date.now()}`,
      startTime: '',
    };
    setFormData(prev => ({
      ...prev,
      sessions: prev.sessions.map(session =>
        session.id === sessionId
          ? { ...session, timeSlots: [...session.timeSlots, newTimeSlot] }
          : session
      ),
    }));
  };

  const removeTimeSlot = (sessionId: string, timeSlotId: string) => {
    setFormData(prev => ({
      ...prev,
      sessions: prev.sessions.map(session =>
        session.id === sessionId
          ? { ...session, timeSlots: session.timeSlots.filter(ts => ts.id !== timeSlotId) }
          : session
      ),
    }));
  };

  const addSession = () => {
    const newSession: SessionForm = {
      id: Date.now().toString(),
      date: '',
      timeSlots: [{
        id: `time-${Date.now()}`,
        startTime: '',
      }],
      duration: '1.5',
    };
    setFormData(prev => ({
      ...prev,
      sessions: [...prev.sessions, newSession],
    }));
    // Automatically select the newly added session
    setSelectedSessionId(newSession.id);
  };

  const removeSession = (sessionId: string) => {
    setFormData(prev => {
      const filteredSessions = prev.sessions.filter(session => session.id !== sessionId);

      // If removing the currently selected session, switch to the first remaining one
      if (sessionId === selectedSessionId && filteredSessions.length > 0) {
        setSelectedSessionId(filteredSessions[0].id);
      }

      return {
        ...prev,
        sessions: filteredSessions,
      };
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Название обязательно';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Место обязательно';
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Цена обязательна';
    } else if (isNaN(Number(formData.price))) {
      newErrors.price = 'Цена должна быть числом';
    }

    if (!formData.capacity.trim()) {
      newErrors.capacity = 'Количество мест обязательно';
    } else if (isNaN(Number(formData.capacity)) || Number(formData.capacity) <= 0) {
      newErrors.capacity = 'Количество мест должно быть положительным числом';
    }

    formData.sessions.forEach((session) => {
      if (!session.date) {
        newErrors[`session_${session.id}_date`] = 'Дата обязательна';
      }
      session.timeSlots.forEach((timeSlot) => {
        if (!timeSlot.startTime) {
          newErrors[`session_${session.id}_timeSlot_${timeSlot.id}_time`] = 'Время обязательно';
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      // Convert price to minor units (kopecks)
      const priceInKopecks = Math.round(parseFloat(formData.price) * 100);

      if (isEditMode) {
        // Update mode
        const eventUpdateData: EventUpdateDto = {
          title: formData.title,
          description: [
            {
              heading: 'Описание тренировки',
              body: formData.description,
            },
            {
              heading: 'Что с собой?',
              body: formData.whatToBring,
            },
          ],
          location: formData.location,
          tickets: [
            {
              name: 'Разовое посещение',
              prepayment: {
                price: {
                  currency: 'RUB',
                  amountMinor: priceInKopecks,
                },
                description: 'Предоплата',
              },
              full: {
                price: {
                  currency: 'RUB',
                  amountMinor: priceInKopecks,
                },
                description: 'Полная стоимость',
              },
            },
          ],
          labels: [formData.discipline],
          capacity: parseInt(formData.capacity),
        };

        // Update event
        await updateEventMutation.mutateAsync({ id: eventId!, data: eventUpdateData });

        // Handle sessions update
        // First, delete all existing sessions
        if (existingSessions.length > 0) {
          await bulkDeleteSessionsMutation.mutateAsync({
            data: { ids: existingSessions },
            idempotencyKey: `delete-sessions-${eventId}-${Date.now()}`,
          });
        }

        // Create new sessions - flatten timeSlots into separate sessions
        const sessionsData: SessionCreateDto[] = [];
        formData.sessions.forEach(session => {
          session.timeSlots.forEach(timeSlot => {
            const startDateTime = new Date(`${session.date}T${timeSlot.startTime}:00`);
            const endDateTime = new Date(startDateTime);
            endDateTime.setHours(endDateTime.getHours() + parseFloat(session.duration));

            sessionsData.push({
              startsAt: startDateTime.toISOString(),
              endsAt: endDateTime.toISOString()
            });
          });
        });

        if (sessionsData.length > 0) {
          await createSessionsMutation.mutateAsync({
            eventId: eventId!,
            data: sessionsData,
            idempotencyKey: `update-sessions-${eventId}-${Date.now()}`,
          });
        }
      } else {
        // Create mode
        const eventCreateData: EventCreateDto = {
          title: formData.title,
          description: [
            {
              heading: 'Описание тренировки',
              body: formData.description,
            },
            {
              heading: 'Что с собой?',
              body: formData.whatToBring,
            },
          ],
          location: formData.location,
          tickets: [
            {
              name: 'Разовое посещение',
              prepayment: {
                price: {
                  currency: 'RUB',
                  amountMinor: priceInKopecks,
                },
                description: 'Предоплата',
              },
              full: {
                price: {
                  currency: 'RUB',
                  amountMinor: priceInKopecks,
                },
                description: 'Полная стоимость',
              },
            },
          ],
          labels: [formData.discipline],
          capacity: parseInt(formData.capacity),
        };

        // Create event
        const createdEvent = await createEventMutation.mutateAsync(eventCreateData);

        // Create sessions - flatten timeSlots into separate sessions
        const sessionsData: SessionCreateDto[] = [];
        formData.sessions.forEach(session => {
          session.timeSlots.forEach(timeSlot => {
            const startDateTime = new Date(`${session.date}T${timeSlot.startTime}:00`);
            const endDateTime = new Date(startDateTime);
            endDateTime.setHours(endDateTime.getHours() + parseFloat(session.duration));

            sessionsData.push({
              startsAt: startDateTime.toISOString(),
              endsAt: endDateTime.toISOString()
            });
          });
        });

        await createSessionsMutation.mutateAsync({
          eventId: createdEvent.id,
          data: sessionsData,
          idempotencyKey: `event-${createdEvent.id}-${Date.now()}`,
        });
      }

      onClose();
    } catch (error) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} event:`, error);
    }
  };

  const isLoading = createEventMutation.isPending || createSessionsMutation.isPending || updateEventMutation.isPending || bulkDeleteSessionsMutation.isPending;
  const isInitialLoading = isEditMode && (eventLoading || sessionsLoading);

  // Show loading state while fetching data in edit mode
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
      <div className={styles.form}>
        <div className={styles.mainInfo}>
          <Select
            label="Дисциплина"
            options={disciplineOptions}
            value={formData.discipline}
            onChange={(value) => handleInputChange('discipline', value)}
          />

          <TextInput
            label="Название"
            placeholder="Тренировка на волне"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            error={!!errors.title}
            hint={errors.title}
          />

          <TextInput
            label="Место"
            placeholder="Ставропольская ул., 43, Москва"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            error={!!errors.location}
            hint={errors.location}
          />

          <TextInput
            label="Цена разовой тренировки"
            placeholder="7900"
            type="number"
            step="1"
            min="0"
            value={formData.price}
            onChange={(e) => handleInputChange('price', e.target.value)}
            error={!!errors.price}
            hint={errors.price}
          />

          <TextInput
            label="Кол-во мест"
            type="number"
            placeholder="10"
            value={formData.capacity}
            onChange={(e) => handleInputChange('capacity', e.target.value)}
            error={!!errors.capacity}
            hint={errors.capacity}
          />
        </div>

        <AlternativeTabs
          className={styles.dateTabs}
          items={formData.sessions.map((session, i) => ({
            label: (
              <>
                {session.date ? new Intl.DateTimeFormat('ru-RU').format(new Date(session.date)) : `${rangeMode ? 'Даты' : 'Дата'} ${i + 1}`}
                {formData.sessions.length > 1 && <ButtonContainer onClick={() => removeSession(session.id)}>
                  <Icon className={styles.removeIcon} src={TrashRegular} width={20} height={20} />
                </ButtonContainer>}
              </>
            ),
            value: session.id
          }))}
          value={selectedSessionId}
          onChange={(value) => {
            setSelectedSessionId(value);
          }}
        />

        <div className={styles.sessionsSection}>
          {(() => {
            const selectedSession = formData.sessions.find(session => session.id === selectedSessionId);
            if (!selectedSession) return null;

            return (
              <div key={selectedSession.id} className={styles.dateWrapper}>
                <div className={styles.dateAndDuration}>
                  <TextInput
                    label={rangeMode ? 'Дата начала' : 'Дата'}
                    type="date"
                    value={selectedSession.date}
                    onChange={(e) => handleSessionChange(selectedSession.id, 'date', e.target.value)}
                    error={!!errors[`session_${selectedSession.id}_date`]}
                    hint={errors[`session_${selectedSession.id}_date`]}
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
                {rangeMode && (
                  <div className={styles.dateAndDuration}>
                    <TextInput
                      label={rangeMode ? 'Дата начала' : 'Дата'}
                      type="date"
                      value={selectedSession.date}
                      onChange={(e) => handleSessionChange(selectedSession.id, 'date', e.target.value)}
                      error={!!errors[`session_${selectedSession.id}_date`]}
                      hint={errors[`session_${selectedSession.id}_date`]}
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
                )}
                {!rangeMode && <div className={styles.timesWrapper}>
                  <div className={styles.timesLabel}>Время</div>
                    <div className={styles.times}>
                      {selectedSession.timeSlots.map((timeSlot) => (
                        <TextInput
                          key={timeSlot.id}
                          className={styles.time}
                          type="time"
                          value={timeSlot.startTime}
                          onChange={(e) => handleTimeSlotChange(selectedSession.id, timeSlot.id, 'startTime', e.target.value)}
                          error={!!errors[`session_${selectedSession.id}_timeSlot_${timeSlot.id}_time`]}
                          hint={errors[`session_${selectedSession.id}_timeSlot_${timeSlot.id}_time`]}
                        >
                          {selectedSession.timeSlots.length > 1 &&
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
                          }
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
                </div>}
              </div>
            );
          })()}
        </div>

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

        {/* <div className={styles.photosSection}>
          <h3 className={styles.sectionTitle}>Фотографии</h3>
          <p className={styles.photoHint}>не более 10</p>
          <div className={styles.photoGrid}>
            {Array.from({ length: Math.min(formData.photos.length + 1, 10) }).map((_, photoIndex) => (
              <UploadImageInput
                key={photoIndex}
                className={styles.photoUpload}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFormData(prev => ({
                      ...prev,
                      photos: [...prev.photos.slice(0, photoIndex), file, ...prev.photos.slice(photoIndex + 1)],
                    }));
                  }
                }}
              />
            ))}
          </div>
        </div> */}

        <div className={styles.description}>
          <Textarea
            label="Описание тренировки"
            placeholder="Введите текст"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            maxLength={500}
            showCounter
            autoResize
          />

          <Textarea
            label="Что с собой?"
            placeholder="Введите текст"
            value={formData.whatToBring}
            onChange={(e) => handleInputChange('whatToBring', e.target.value)}
            maxLength={500}
            showCounter
            autoResize
          />
        </div>
      </div>

      <div className={styles.actions}>
        <Button
          type="primary"
          size="l"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? 'Сохранение...' : (isEditMode ? 'Сохранить' : 'Добавить')}
        </Button>
        {/* <Button
          type="secondary"
          size="l"
          onClick={onClose}
          disabled={isLoading}
        >
          Удалить
        </Button> */}
      </div>
    </div>
  );
}