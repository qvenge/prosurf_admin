import { apiClient, validateResponse, createQueryString, withIdempotency } from '../config';
import { joinApiUrl } from '../../lib/url-utils';
import {
  BookingSchema,
  BookingExtendedSchema,
  BookingCreateDtoSchema,
  BookingUpdateDtoSchema,
  PaginatedResponseSchema,
  BookingFiltersSchema,
  CreateBookingPaymentDtoSchema,
  PaymentSchema
} from '../schemas';
import type {
  Booking,
  BookingExtended,
  BookingCreateDto,
  BookingUpdateDto,
  BookingWithHoldTTL,
  PaginatedResponse,
  BookingFilters,
  IdempotencyKey,
  CreateBookingPaymentDto,
  Payment
} from '../types';

/**
 * Трансформация BookingExtended: добавление полного URL фото пользователя
 */
const transformBookingExtended = (booking: BookingExtended): BookingExtended => ({
  ...booking,
  user: booking.user
    ? {
        ...booking.user,
        photoUrl: joinApiUrl(booking.user.photoUrl) ?? booking.user.photoUrl,
      }
    : booking.user,
});

/**
 * API-клиент бронирований.
 * Управляет бронированиями сессий: создание, получение, отмена, подтверждение.
 * Бронирования начинаются в статусе HOLD и должны быть оплачены в течение TTL периода.
 */
export const bookingsClient = {
  /**
   * Бронирование мест на сессию.
   * POST /sessions/{id}/book
   *
   * @param sessionId - ID сессии
   * @param data - Данные бронирования
   * @param idempotencyKey - Ключ идемпотентности (8-128 символов)
   * @returns Бронирование с информацией о TTL холда
   */
  async bookSession(
    sessionId: string,
    data: BookingCreateDto,
    idempotencyKey: IdempotencyKey
  ): Promise<BookingWithHoldTTL> {
    const validatedData = BookingCreateDtoSchema.parse(data);

    const config = withIdempotency({}, idempotencyKey);
    const response = await apiClient.post(
      `/sessions/${encodeURIComponent(sessionId)}/book`,
      validatedData,
      config
    );

    const booking = transformBookingExtended(validateResponse(response.data, BookingExtendedSchema));
    const holdTtlSeconds = response.headers['x-hold-ttl']
      ? parseInt(response.headers['x-hold-ttl'] as string, 10)
      : null;

    return {
      booking,
      holdTtlSeconds,
    };
  },

  /**
   * Получение списка бронирований.
   * GET /bookings
   *
   * @param filters - Фильтры (сессия, статус, тип, флаги включения расширенных полей)
   * @returns Пагинированный список бронирований
   */
  async getBookings(filters?: BookingFilters): Promise<PaginatedResponse<Booking | BookingExtended>> {
    const validatedFilters = BookingFiltersSchema.parse(filters || {});
    const queryString = createQueryString(validatedFilters);

    const response = await apiClient.get(`/bookings${queryString}`);

    const hasExtendedFields = validatedFilters.includeUser ||
                             validatedFilters.includeSession ||
                             validatedFilters.includePaymentInfo ||
                             validatedFilters.includeGuestContact;

    const schema = hasExtendedFields ? BookingExtendedSchema : BookingSchema;
    const data = validateResponse(response.data, PaginatedResponseSchema(schema));

    if (hasExtendedFields) {
      return {
        ...data,
        items: data.items.map((booking) => transformBookingExtended(booking as BookingExtended)),
      };
    }

    return data;
  },

  /**
   * Получение бронирования по ID.
   * GET /bookings/{id}
   */
  async getBookingById(id: string): Promise<Booking> {
    const response = await apiClient.get(`/bookings/${encodeURIComponent(id)}`);
    return validateResponse(response.data, BookingSchema);
  },

  /**
   * Отмена бронирования.
   * POST /bookings/{id}/cancel
   */
  async cancelBooking(id: string): Promise<Booking> {
    const response = await apiClient.post(`/bookings/${encodeURIComponent(id)}/cancel`);
    return validateResponse(response.data, BookingSchema);
  },

  /**
   * Подтверждение бронирования (оффлайн-оплата, только ADMIN).
   * POST /bookings/{id}/confirm
   */
  async confirmBooking(id: string): Promise<Booking> {
    const response = await apiClient.post(`/bookings/${encodeURIComponent(id)}/confirm`);
    return validateResponse(response.data, BookingSchema);
  },

  /**
   * Обновление бронирования (только ADMIN).
   * PATCH /bookings/{id}
   *
   * @param id - ID бронирования
   * @param data - Данные для обновления
   * @returns Обновлённое бронирование с расширенной информацией
   */
  async updateBooking(id: string, data: BookingUpdateDto): Promise<BookingExtended> {
    const validatedData = BookingUpdateDtoSchema.parse(data);

    const response = await apiClient.patch(
      `/bookings/${encodeURIComponent(id)}`,
      validatedData
    );

    return transformBookingExtended(validateResponse(response.data, BookingExtendedSchema));
  },

  /**
   * Создание платежа для бронирования.
   * POST /bookings/{id}/payment
   *
   * @param bookingId - ID бронирования
   * @param data - Методы оплаты
   * @param idempotencyKey - Ключ идемпотентности (8-128 символов)
   * @returns Информация о платеже
   */
  async createPayment(
    bookingId: string,
    data: CreateBookingPaymentDto,
    idempotencyKey: IdempotencyKey
  ): Promise<Payment> {
    const validatedData = CreateBookingPaymentDtoSchema.parse(data);

    const config = withIdempotency({}, idempotencyKey);
    const response = await apiClient.post(
      `/bookings/${encodeURIComponent(bookingId)}/payment`,
      validatedData,
      config
    );

    return validateResponse(response.data, PaymentSchema);
  },

  /**
   * Отметка бронирования как оплаченного (только ADMIN).
   * POST /bookings/{id}/mark-paid
   *
   * Работает только для CONFIRMED бронирований с isPaid=false.
   *
   * @param id - ID бронирования
   * @returns Обновлённое бронирование
   */
  async markBookingAsPaid(id: string): Promise<Booking> {
    const response = await apiClient.post(`/bookings/${encodeURIComponent(id)}/mark-paid`);
    return validateResponse(response.data, BookingSchema);
  },
};