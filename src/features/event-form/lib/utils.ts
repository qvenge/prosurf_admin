import type { EventCreateDto, EventUpdateDto, SessionCreateDto, Event } from '@/shared/api';
import type { Category, FormData, SessionForm } from './types';
import { localInputToUTC } from '@/shared/lib/timezone';

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
    mapUrl: formData.mapUrl || null,
    tickets: [
      {
        name: 'Разовое посещение',
        prepayment: prepaymentInKopecks ? {
          price: {
            currency: formData.currency,
            amountMinor: prepaymentInKopecks,
          },
          description: 'Предоплата',
        } : undefined,
        full: {
          price: {
            currency: formData.currency,
            amountMinor: priceInKopecks,
          },
          description: 'Полная стоимость',
        },
      },
    ],
    labels: [...labels, formData.category].filter((label?: string): label is string => label != null && typeof label === 'string'),
    capacity: parseInt(formData.capacity),
    images: formData.images.length > 0 ? formData.images : undefined,
    previewImage: formData.previewImage || undefined,
  };
}

export function convertFormDataToEventUpdateDto(formData: FormData, labels?: string[]): EventUpdateDto {
  const baseDto = convertFormDataToEventCreateDto(formData, labels);
  return {
    ...baseDto,
    // existingImages сообщает API какие URL оставить:
    // - undefined: бэкенд объединяет новые загрузки со всеми существующими изображениями
    // - указан (даже пустой массив): бэкенд использует только эти URL + новые загрузки
    existingImages: formData.existingImages,
    previewImage: formData.previewImage || undefined,
    existingPreviewImage: formData.existingPreviewImage,
    removePreviewImage: !formData.previewImage && !formData.existingPreviewImage,
  } as EventUpdateDto;
}

/**
 * Конвертирует данные сессий формы в DTO для создания сессий.
 * В режиме диапазона создаёт одну сессию от начальной до конечной даты.
 * В обычном режиме создаёт сессии на основе временных слотов.
 */
export function convertSessionsToSessionCreateDtos(sessions: SessionForm[], rangeMode: boolean = false): SessionCreateDto[] {
  const sessionsData: SessionCreateDto[] = [];

  sessions.forEach(session => {
    if (rangeMode && session.endDate) {
      const startDateTime = localInputToUTC(session.date, '00:00');
      const endDateTime = localInputToUTC(session.endDate, '23:59');

      sessionsData.push({
        startsAt: startDateTime.toISOString(),
        endsAt: endDateTime.toISOString()
      });
    } else {
      session.timeSlots.forEach(timeSlot => {
        const startDateTime = localInputToUTC(session.date, timeSlot.startTime);
        const durationMs = parseFloat(session.duration) * 60 * 60 * 1000;
        const endDateTime = new Date(startDateTime.getTime() + durationMs);

        sessionsData.push({
          startsAt: startDateTime.toISOString(),
          endsAt: endDateTime.toISOString()
        });
      });
    }
  });

  return sessionsData;
}

/**
 * Конвертирует данные события с сервера в формат формы для редактирования.
 */
export function convertEventDataToFormData(
  eventData: Event,
  categories?: Category[]
): Partial<FormData> {
  const category = categories != null && eventData.labels?.find((label: string) =>
    categories.some(option => option.value === label)
  ) || categories?.[0].value;

  const ticketWithPrice = eventData.tickets?.find((ticket) => ticket.full.price.amountMinor > 0);

  const prepayment = ticketWithPrice?.prepayment?.price.amountMinor
    ? (ticketWithPrice.prepayment?.price.amountMinor / 100).toString()
    : '';

  const price = ticketWithPrice
    ? (ticketWithPrice.full.price.amountMinor / 100).toString()
    : '';

  const currency = (ticketWithPrice?.full.price.currency as 'RUB' | 'USD') || 'RUB';

  const descriptions = eventData.description || [];
  const descriptionItem = descriptions.find(d => d.heading === 'Описание тренировки' || d.heading === 'Описание');
  const whatToBringItem = descriptions.find(d => d.heading === 'Что с собой?' || d.heading === 'FAQ');

  return {
    category,
    title: eventData.title,
    location: eventData.location || '',
    mapUrl: eventData.mapUrl || '',
    prepayment,
    price,
    currency,
    capacity: eventData.capacity?.toString() || '',
    images: [],
    existingImages: eventData.images || [],
    previewImage: null,
    existingPreviewImage: eventData.previewImage || null,
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
