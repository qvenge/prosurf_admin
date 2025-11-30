import type { EventCreateDto, EventUpdateDto, SessionCreateDto, Event } from '@/shared/api';
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

// Session-related utilities (kept for separate session management)
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

export function convertEventDataToFormData(
  eventData: Event,
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
  const descriptionItem = descriptions.find(d => d.heading === 'Описание тренировки' || d.heading === 'Описание');
  const whatToBringItem = descriptions.find(d => d.heading === 'Что с собой?' || d.heading === 'FAQ');

  return {
    category,
    title: eventData.title,
    location: eventData.location || '',
    prepayment,
    price,
    capacity: eventData.capacity?.toString() || '',
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
