import { apiClient, validateResponse, withIdempotency } from '../config';
import {
  PaymentSchema,
  CreateBookingPaymentDtoSchema,
  RefundSchema,
  RefundRequestSchema
} from '../schemas';
import type {
  Payment,
  CreateBookingPaymentDto,
  Refund,
  RefundRequest,
  IdempotencyKey
} from '../types';

/**
 * Payments API client
 * 
 * Handles payment creation, retrieval, and refund operations.
 * Supports single payment methods (card, certificate, pass, cashback) and composite payments.
 */
export const paymentsClient = {
  /**
   * Create payment for booking
   * POST /bookings/{id}/payment
   *
   * Creates or continues a payment for the specified booking (booking must be in HOLD state).
   * The paymentMethods field accepts an array of payment methods, a single method, or a composite object.
   *
   * @param bookingId - The ID of the booking to pay for
   * @param data - Payment methods wrapped in paymentMethods field
   * @param idempotencyKey - Unique key for request idempotency (8-128 chars)
   * @returns Promise resolving to payment with status and next action
   *
   * @example
   * ```ts
   * // Single payment method (array format)
   * const payment = await paymentsClient.createPayment(
   *   'booking-123',
   *   { paymentMethods: [{ method: 'card', provider: 'telegram' }] },
   *   'idempotency-key-123'
   * );
   *
   * // Multiple payment methods
   * const compositePayment = await paymentsClient.createPayment(
   *   'booking-123',
   *   {
   *     paymentMethods: [
   *       { method: 'certificate', certificateId: 'cert-123' },
   *       { method: 'cashback', amount: { currency: 'KZT', amountMinor: 1500 } },
   *       { method: 'card', provider: 'telegram' }
   *     ]
   *   },
   *   'idempotency-key-456'
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

  /**
   * Get payment by ID
   * GET /payments/{id}
   */
  async getPaymentById(id: string): Promise<Payment> {
    const response = await apiClient.get(`/payments/${encodeURIComponent(id)}`);
    return validateResponse(response.data, PaymentSchema);
  },

  /**
   * Create refund for payment
   * POST /payments/{id}/refunds
   */
  async createRefund(
    paymentId: string, 
    idempotencyKey: IdempotencyKey,
    data?: RefundRequest
  ): Promise<Refund> {
    const validatedData = data ? RefundRequestSchema.parse(data) : {};
    
    const config = withIdempotency({}, idempotencyKey);
    const response = await apiClient.post(
      `/payments/${encodeURIComponent(paymentId)}/refunds`, 
      validatedData,
      config
    );
    return validateResponse(response.data, RefundSchema);
  },
};