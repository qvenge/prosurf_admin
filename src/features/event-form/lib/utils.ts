import type { EventCreateDto, EventUpdateDto, SessionCreateDto } from '@/shared/api';
import type { FormData, SessionForm } from './types';
import { disciplineOptions } from './constants';

export function convertFormDataToEventCreateDto(formData: FormData): EventCreateDto {
  const priceInKopecks = Math.round(parseFloat(formData.price) * 100);

  return {
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
}

export function convertFormDataToEventUpdateDto(formData: FormData): EventUpdateDto {
  return convertFormDataToEventCreateDto(formData) as EventUpdateDto;
}

export function convertSessionsToSessionCreateDtos(sessions: SessionForm[]): SessionCreateDto[] {
  const sessionsData: SessionCreateDto[] = [];

  sessions.forEach(session => {
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

  return sessionsData;
}

interface EventData {
  labels?: string[];
  title: string;
  location?: string;
  capacity?: number;
  tickets: Array<{
    full: {
      price: {
        amountMinor: number;
      };
    };
  }>;
  description?: Array<{
    heading: string;
    body: string;
  }>;
}

interface SessionData {
  items: Array<{
    id: string;
    startsAt: string;
    endsAt?: string;
  }>;
}

export function convertEventDataToFormData(eventData: EventData, sessionsData: SessionData): Partial<FormData> {
  // Map discipline from labels
  const discipline = eventData.labels?.find((label: string) =>
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
  sessionsData.items.forEach((session, index: number) => {
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

  return {
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
  };
}

export function generateTimeSlotId(): string {
  return `time-${Date.now()}`;
}

export function generateSessionId(): string {
  return Date.now().toString();
}

export function formatDateForDisplay(dateString: string): string {
  return new Intl.DateTimeFormat('ru-RU').format(new Date(dateString));
}