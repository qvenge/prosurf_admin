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
 * API-клиент платежей.
 * Поддерживает одиночные методы оплаты (карта, сертификат, абонемент, бонусы) и комбинированные платежи.
 */
export const paymentsClient = {
  /**
   * Создание платежа для бронирования (бронирование должно быть в статусе HOLD).
   * POST /bookings/{id}/payment
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
   * Получение платежа по ID.
   * GET /payments/{id}
   */
  async getPaymentById(id: string): Promise<Payment> {
    const response = await apiClient.get(`/payments/${encodeURIComponent(id)}`);
    return validateResponse(response.data, PaymentSchema);
  },

  /**
   * Создание возврата для платежа.
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