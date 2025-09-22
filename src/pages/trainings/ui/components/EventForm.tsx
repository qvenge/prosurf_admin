import { useState } from 'react';
import { TextInput, Select, Button, Textarea, UploadImageInput, AlternativeTabs, IconButton } from '@/shared/ui';
import { useCreateEvent, useCreateEventSessions } from '@/shared/api';
import type { EventCreateDto, SessionCreateDto } from '@/shared/api';
import { PlusBold, TrashRegular } from '@/shared/ds/icons';
import { Icon } from '@/shared/ui';
import styles from './EventForm.module.scss';

interface EventFormProps {
  onClose: () => void;
  eventId?: string; // For edit mode
}

interface SessionForm {
  id: string;
  date: string;
  startTime: string;
  duration: string;
  capacity: number;
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
  { value: 'surfing', label: 'Серфинг' },
  { value: 'surfskate', label: 'Серфскейт' },
];

export function EventForm({ onClose, eventId }: EventFormProps) {
  const [formData, setFormData] = useState<FormData>({
    discipline: disciplineOptions[0].value,
    title: '',
    location: '',
    price: '',
    capacity: '',
    sessions: [{
      id: '1',
      date: '',
      startTime: '',
      duration: '1.5',
      capacity: 10,
    }],
    photos: [],
    description: '',
    whatToBring: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createEventMutation = useCreateEvent();
  const createSessionsMutation = useCreateEventSessions();

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSessionChange = (sessionId: string, field: keyof SessionForm, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      sessions: prev.sessions.map(session =>
        session.id === sessionId ? { ...session, [field]: value } : session
      ),
    }));
  };

  const addSession = () => {
    const newSession: SessionForm = {
      id: Date.now().toString(),
      date: '',
      startTime: '',
      duration: '1.5',
      capacity: parseInt(formData.capacity) || 10,
    };
    setFormData(prev => ({
      ...prev,
      sessions: [...prev.sessions, newSession],
    }));
  };

  const removeSession = (sessionId: string) => {
    setFormData(prev => ({
      ...prev,
      sessions: prev.sessions.filter(session => session.id !== sessionId),
    }));
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
      if (!session.startTime) {
        newErrors[`session_${session.id}_time`] = 'Время обязательно';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      // Convert price to minor units (kopecks)
      const priceInKopecks = Math.round(parseFloat(formData.price) * 100);

      // Create event data
      const eventData: EventCreateDto = {
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
        labels: [`training:${formData.discipline}`],
        attributes: {
          discipline: formData.discipline,
          capacity: parseInt(formData.capacity),
        },
      };

      // Create event
      const createdEvent = await createEventMutation.mutateAsync(eventData);

      // Create sessions
      const sessionsData: SessionCreateDto[] = formData.sessions.map(session => {
        const startDateTime = new Date(`${session.date}T${session.startTime}:00`);
        const endDateTime = new Date(startDateTime);
        endDateTime.setHours(endDateTime.getHours() + parseFloat(session.duration));

        return {
          startsAt: startDateTime.toISOString(),
          endsAt: endDateTime.toISOString(),
          capacity: session.capacity,
        };
      });

      await createSessionsMutation.mutateAsync({
        eventId: createdEvent.id,
        data: sessionsData,
        idempotencyKey: `event-${createdEvent.id}-${Date.now()}`,
      });

      onClose();
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  const isLoading = createEventMutation.isPending || createSessionsMutation.isPending;

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
                {session.date ? new Date(session.date).toLocaleDateString() : `Дата ${i + 1}`}
                <Icon className={styles.removeIcon} src={TrashRegular} width={20} height={20} />
              </>
            ),
            value: session.id
          }))}
          value={formData.sessions[0].id}
          onChange={(value) => {
            const selectedSession = formData.sessions.find(session => session.id === value);
            if (selectedSession) {
              setFormData(prev => ({
                ...prev,
                selectedSessionId: selectedSession.id,
              }));
            }
          }}
        />

        <div className={styles.sessionsSection}>
          {formData.sessions.map((session, index) => (
            <div key={session.id} className={styles.dateWrapper}>
              {/* <div className={styles.sessionHeader}>
                <span className={styles.sessionLabel}>Дата {index + 1}</span>
                {formData.sessions.length > 1 && (
                  <Button
                    type="secondary"
                    size="s"
                    onClick={() => removeSession(session.id)}
                  >
                    <Icon src={TrashRegular} width={16} height={16} />
                  </Button>
                )}
              </div> */}

              <div className={styles.dateAndDuration}>
                <TextInput
                  label="Дата"
                  type="date"
                  value={session.date}
                  onChange={(e) => handleSessionChange(session.id, 'date', e.target.value)}
                  error={!!errors[`session_${session.id}_date`]}
                  hint={errors[`session_${session.id}_date`]}
                />

                <TextInput
                  label="Длительность, часов"
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="8"
                  value={session.duration}
                  onChange={(e) => handleSessionChange(session.id, 'duration', e.target.value)}
                />
              </div>
              <div className={styles.timesWrapper}>
                <div className={styles.timesLabel}>Время</div>
                <div className={styles.times}>
                  <TextInput
                    className={styles.time}
                    type="time"
                    value={session.startTime}
                    onChange={(e) => handleSessionChange(session.id, 'startTime', e.target.value)}
                    error={!!errors[`session_${session.id}_time`]}
                    hint={errors[`session_${session.id}_time`]}
                  />
                  <IconButton
                    className={styles.addTime}
                    src={PlusBold}
                    type="secondary"
                    size="l"
                    onClick={() => removeSession(session.id)}
                  />
                </div>
              </div> 
            </div>
          ))}
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

        <div className={styles.photosSection}>
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
        </div>

        <Textarea
          label="Описание тренировки"
          placeholder="Введите текст"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          maxLength={500}
          showCounter
          hint="до 500 символов"
        />

        <Textarea
          label="Что с собой?"
          placeholder="Введите текст"
          value={formData.whatToBring}
          onChange={(e) => handleInputChange('whatToBring', e.target.value)}
          maxLength={500}
          showCounter
          hint="до 500 символов"
        />
      </div>

      <div className={styles.actions}>
        <Button
          type="secondary"
          size="l"
          onClick={onClose}
          disabled={isLoading}
        >
          Отмена
        </Button>
        <Button
          type="primary"
          size="l"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? 'Сохранение...' : 'Добавить'}
        </Button>
      </div>
    </div>
  );
}