import { apiClient, validateResponse, createQueryString, withIdempotency } from '../config';
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
 * Bookings API client
 * 
 * Manages session bookings including creation, retrieval, cancellation, and confirmation.
 * Bookings start in HOLD status and must be paid within the hold TTL period.
 */
export const bookingsClient = {
  /**
   * Book seats in a session
   * POST /sessions/{id}/book
   *
   * Creates a booking for the specified session. Supports both regular user bookings
   * and admin-created bookings with guest contact information.
   *
   * @param sessionId - The ID of the session to book
   * @param data - Booking creation data
   * @param idempotencyKey - Unique key for request idempotency (8-128 chars)
   * @returns Promise resolving to booking data with hold TTL information
   *
   * @example
   * ```ts
   * // Regular user booking
   * const result = await bookingsClient.bookSession(
   *   'session-123',
   *   { quantity: 2 },
   *   'booking-idempotency-key'
   * );
   *
   * // Admin booking for guest
   * const adminResult = await bookingsClient.bookSession(
   *   'session-123',
   *   {
   *     quantity: 1,
   *     guestContact: {
   *       phone: '+1234567890',
   *       firstName: 'John',
   *       lastName: 'Doe',
   *       email: 'john@example.com'
   *     },
   *     status: 'CONFIRMED',
   *     notes: 'VIP guest booking'
   *   },
   *   'admin-booking-key'
   * );
   * ```
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

    const booking = validateResponse(response.data, BookingExtendedSchema);
    const holdTtlSeconds = response.headers['x-hold-ttl']
      ? parseInt(response.headers['x-hold-ttl'] as string, 10)
      : null;

    return {
      booking,
      holdTtlSeconds,
    };
  },

  /**
   * Get list of bookings (self or ADMIN with extended filtering)
   * GET /bookings
   *
   * @param filters - Filtering options including session, status, booking type, and inclusion flags
   * @returns Promise resolving to paginated list of bookings (extended if admin flags are used)
   */
  async getBookings(filters?: BookingFilters): Promise<PaginatedResponse<Booking | BookingExtended>> {
    const validatedFilters = BookingFiltersSchema.parse(filters || {});
    const queryString = createQueryString(validatedFilters);

    const response = await apiClient.get(`/bookings${queryString}`);

    // Determine response schema based on whether extended fields are requested
    const hasExtendedFields = validatedFilters.includeUser ||
                             validatedFilters.includeSession ||
                             validatedFilters.includePaymentInfo ||
                             validatedFilters.includeGuestContact;

    const schema = hasExtendedFields ? BookingExtendedSchema : BookingSchema;
    return validateResponse(response.data, PaginatedResponseSchema(schema));
  },

  /**
   * Get booking by ID
   * GET /bookings/{id}
   */
  async getBookingById(id: string): Promise<Booking> {
    const response = await apiClient.get(`/bookings/${encodeURIComponent(id)}`);
    return validateResponse(response.data, BookingSchema);
  },

  /**
   * Cancel booking (self for HOLD/CONFIRMED within policy, or ADMIN)
   * POST /bookings/{id}/cancel
   */
  async cancelBooking(id: string): Promise<Booking> {
    const response = await apiClient.post(`/bookings/${encodeURIComponent(id)}/cancel`);
    return validateResponse(response.data, BookingSchema);
  },

  /**
   * Confirm booking (offline payment, ADMIN only)
   * POST /bookings/{id}/confirm
   */
  async confirmBooking(id: string): Promise<Booking> {
    const response = await apiClient.post(`/bookings/${encodeURIComponent(id)}/confirm`);
    return validateResponse(response.data, BookingSchema);
  },

  /**
   * Update booking (ADMIN only)
   * PATCH /bookings/{id}
   *
   * Allows administrators to update booking details including quantity,
   * guest contact information, and notes.
   *
   * @param id - Booking ID to update
   * @param data - Update data
   * @returns Promise resolving to updated booking with extended information
   *
   * @example
   * ```ts
   * const updatedBooking = await bookingsClient.updateBooking('booking-123', {
   *   quantity: 3,
   *   guestContact: {
   *     phone: '+1234567890',
   *     firstName: 'Jane',
   *     lastName: 'Smith',
   *     email: 'jane@example.com'
   *   },
   *   notes: 'Updated guest information'
   * });
   * ```
   */
  async updateBooking(id: string, data: BookingUpdateDto): Promise<BookingExtended> {
    const validatedData = BookingUpdateDtoSchema.parse(data);

    const response = await apiClient.patch(
      `/bookings/${encodeURIComponent(id)}`,
      validatedData
    );

    return validateResponse(response.data, BookingExtendedSchema);
  },

  /**
   * Create payment for booking
   * POST /bookings/{id}/payment
   *
   * Initiates payment for a booking that is in HOLD status.
   * Supports multiple payment methods including card, certificate, season ticket pass, and cashback.
   *
   * @param bookingId - The ID of the booking to pay for
   * @param data - Payment methods to use
   * @param idempotencyKey - Unique key for request idempotency (8-128 chars)
   * @returns Promise resolving to payment information with next action
   *
   * @example
   * ```ts
   * // Pay with card
   * const payment = await bookingsClient.createPayment(
   *   'booking-123',
   *   { paymentMethods: [{ method: 'card', provider: 'yookassa' }] },
   *   'payment-idempotency-key'
   * );
   *
   * // Pay with certificate
   * const certPayment = await bookingsClient.createPayment(
   *   'booking-123',
   *   { paymentMethods: [{ method: 'certificate', certificateId: 'cert-456' }] },
   *   'cert-payment-key'
   * );
   * ```
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
};