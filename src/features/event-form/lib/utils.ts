import type { EventCreateDto, EventUpdateDto, SessionCreateDto, Event, SessionCompact } from '@/shared/api';
import type { Category, FormData, SessionForm } from './types';

export function convertFormDataToEventCreateDto(formData: FormData, labels: string[] = []): EventCreateDto {
  const priceInKopecks = Math.round(parseFloat(formData.price) * 100);
  const prepaymentInKopecks = formData.prepayment
    ? Math.round(parseFloat(formData.prepayment) * 100) : null;

  return {
    title: formData.title,
    description: [
      {
        heading: 'Описание',
        body: formData.description,
      },
      {
        heading: 'FAQ',
        body: formData.whatToBring,
      },
    ],
    location: formData.location,
    tickets: [
      {
        name: 'Разовое посещение',
        prepayment: prepaymentInKopecks ? {
          price: {
            currency: 'RUB',
            amountMinor: prepaymentInKopecks,
          },
          description: 'Предоплата',
        } : undefined,
        full: {
          price: {
            currency: 'RUB',
            amountMinor: priceInKopecks,
          },
          description: 'Полная стоимость',
        },
      },
    ],
    labels: [...labels, formData.category].filter((label?: string): label is string => label != null && typeof label === 'string'),
    capacity: parseInt(formData.capacity),
    images: formData.images.length > 0 ? formData.images : undefined,
  };
}

export function convertFormDataToEventUpdateDto(formData: FormData, labels?: string[]): EventUpdateDto {
  return convertFormDataToEventCreateDto(formData, labels) as EventUpdateDto;
}

export function convertSessionsToSessionCreateDtos(sessions: SessionForm[], rangeMode: boolean = false): SessionCreateDto[] {
  const sessionsData: SessionCreateDto[] = [];

  sessions.forEach(session => {
    if (rangeMode && session.endDate) {
      // For range mode, create a single session spanning from start to end date with 00:00 times
      const startDateTime = new Date(`${session.date}T00:00:00Z`);
      const endDateTime = new Date(`${session.endDate}T23:59:59Z`);

      sessionsData.push({
        startsAt: startDateTime.toISOString(),
        endsAt: endDateTime.toISOString()
      });
    } else {
      // For normal mode, create sessions based on time slots
      session.timeSlots.forEach(timeSlot => {
        const startDateTime = new Date(`${session.date}T${timeSlot.startTime}:00Z`);
        const endDateTime = new Date(startDateTime);
        endDateTime.setHours(endDateTime.getHours() + parseFloat(session.duration));

        sessionsData.push({
          startsAt: startDateTime.toISOString(),
          endsAt: endDateTime.toISOString()
        });
      });
    }
  });

  return sessionsData;
}

// interface EventData {
//   labels?: string[];
//   title: string;
//   location?: string;
//   capacity?: number;
//   tickets: Array<{
//     full: {
//       price: {
//         amountMinor: number;
//       };
//     };
//   }>;
//   description?: Array<{
//     heading: string;
//     body: string;
//   }>;
// }

interface SessionData {
  items: SessionCompact[];
}

export function convertEventDataToFormData(
  eventData: Event,
  sessionsData: SessionData,
  categories?: Category[]
): Partial<FormData> {
  // Map discipline from labels
  const category = categories != null && eventData.labels?.find((label: string) =>
    categories.some(option => option.value === label)
  ) || categories?.[0].value;

  // Get price from first ticket
  const ticketWithPrice = eventData.tickets?.find((ticket) => ticket.full.price.amountMinor > 0);

  const prepayment = ticketWithPrice?.prepayment?.price.amountMinor 
    ? (ticketWithPrice.prepayment?.price.amountMinor / 100).toString()
    : '';

  const price = ticketWithPrice
    ? (ticketWithPrice.full.price.amountMinor / 100).toString()
    : '';

  // Extract description and whatToBring from description array
  const descriptions = eventData.description || [];
  const descriptionItem = descriptions.find(d => d.heading === 'Описание тренировки');
  const whatToBringItem = descriptions.find(d => d.heading === 'Что с собой?');

  // Group sessions by date and convert to form structure
  const sessionsMap = new Map<string, SessionForm>();
  sessionsData.items.forEach((session, index: number) => {
    const sessionStartDate = new Date(session.startsAt);
    const sessionEndDate = session.endsAt ? new Date(session.endsAt) : null;
    const startDateKey = sessionStartDate.toISOString().split('T')[0];
    const endDateKey = sessionEndDate ? sessionEndDate.toISOString().split('T')[0] : startDateKey;
    const startTime = sessionStartDate.toTimeString().slice(0, 5);

    // Check if this is a range session (spans multiple days)
    const isRangeSession = startDateKey !== endDateKey;

    if (sessionsMap.has(startDateKey) && !isRangeSession) {
      // Add to existing single-day session
      sessionsMap.get(startDateKey)!.timeSlots.push({
        id: `time-${session.id}`,
        startTime,
      });
    } else {
      const duration = session.endsAt
        ? ((sessionEndDate!.getTime() - sessionStartDate.getTime()) / (1000 * 60 * 60)).toString()
        : '1.5';

      const sessionForm: SessionForm = {
        id: `session-${startDateKey}-${index}`,
        date: startDateKey,
        timeSlots: [{
          id: `time-${session.id}`,
          startTime,
        }],
        duration,
      };

      // Add endDate for range sessions
      if (isRangeSession) {
        sessionForm.endDate = endDateKey;
      }

      sessionsMap.set(startDateKey, sessionForm);
    }
  });

  const formSessions = Array.from(sessionsMap.values());

  return {
    category,
    title: eventData.title,
    location: eventData.location || '',
    prepayment,
    price,
    capacity: eventData.capacity?.toString() || '',
    sessions: formSessions.length > 0 ? formSessions : [{
      id: '1',
      date: '',
      timeSlots: [{ id: 'time-1', startTime: '' }],
      duration: '1.5',
    }],
    images: [],
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