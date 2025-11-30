import { apiClient, validateResponse, createQueryString, withIdempotency } from '../config';
import {
  SeasonTicketPlanSchema,
  SeasonTicketPlanCreateDtoSchema,
  SeasonTicketPlanUpdateDtoSchema,
  SeasonTicketSchema,
  PaymentSchema,
  PurchaseSeasonTicketDtoSchema,
  PaginatedResponseSchema,
  SeasonTicketPlanFiltersSchema,
  SeasonTicketFiltersSchema,
  EventSchema
} from '../schemas';
import type {
  SeasonTicketPlan,
  SeasonTicketPlanCreateDto,
  SeasonTicketPlanUpdateDto,
  SeasonTicket,
  Payment,
  PurchaseSeasonTicketDto,
  PaginatedResponse,
  SeasonTicketPlanFilters,
  SeasonTicketFilters,
  IdempotencyKey,
  Event,
  CursorParam,
  LimitParam
} from '../types';

/**
 * Season Tickets API client
 */
export const seasonTicketsClient = {
  /**
   * Get season ticket plans catalog
   * GET /season-ticket-plans
   */
  async getSeasonTicketPlans(filters?: SeasonTicketPlanFilters): Promise<PaginatedResponse<SeasonTicketPlan>> {
    const validatedFilters = SeasonTicketPlanFiltersSchema.parse(filters || {});
    const queryString = createQueryString(validatedFilters);

    const response = await apiClient.get(`/season-ticket-plans${queryString}`);
    return validateResponse(response.data, PaginatedResponseSchema(SeasonTicketPlanSchema));
  },

  /**
   * Get single season ticket plan
   * GET /season-ticket-plans/{id}
   */
  async getSeasonTicketPlan(id: string): Promise<SeasonTicketPlan> {
    const response = await apiClient.get(`/season-ticket-plans/${encodeURIComponent(id)}`);
    return validateResponse(response.data, SeasonTicketPlanSchema);
  },

  /**
   * Create season ticket plan (ADMIN only)
   * POST /season-ticket-plans
   */
  async createSeasonTicketPlan(data: SeasonTicketPlanCreateDto): Promise<SeasonTicketPlan> {
    const validatedData = SeasonTicketPlanCreateDtoSchema.parse(data);
    
    const response = await apiClient.post('/season-ticket-plans', validatedData);
    return validateResponse(response.data, SeasonTicketPlanSchema);
  },

  /**
   * Update season ticket plan (ADMIN only)
   * PATCH /season-ticket-plans/{id}
   */
  async updateSeasonTicketPlan(id: string, data: SeasonTicketPlanUpdateDto): Promise<SeasonTicketPlan> {
    const validatedData = SeasonTicketPlanUpdateDtoSchema.parse(data);

    const response = await apiClient.patch(
      `/season-ticket-plans/${encodeURIComponent(id)}`,
      validatedData
    );
    return validateResponse(response.data, SeasonTicketPlanSchema);
  },

  /**
   * Delete season ticket plan (ADMIN only)
   * DELETE /season-ticket-plans/{id}
   */
  async deleteSeasonTicketPlan(id: string): Promise<void> {
    await apiClient.delete(`/season-ticket-plans/${encodeURIComponent(id)}`);
  },

  /**
   * Get events applicable to a season ticket plan
   * GET /season-ticket-plans/{id}/applicable-events
   */
  async getSeasonTicketPlanApplicableEvents(
    id: string,
    filters?: { cursor?: CursorParam; limit?: LimitParam }
  ): Promise<PaginatedResponse<Event>> {
    const queryString = createQueryString(filters || {});

    const response = await apiClient.get(
      `/season-ticket-plans/${encodeURIComponent(id)}/applicable-events${queryString}`
    );
    return validateResponse(response.data, PaginatedResponseSchema(EventSchema));
  },

  /**
   * Purchase season ticket (userId from token)
   * POST /season-ticket-plans/{id}/purchase
   *
   * @param planId - The ID of the season ticket plan to purchase
   * @param data - Payment methods wrapped in paymentMethods field
   * @param idempotencyKey - Unique key for request idempotency (8-128 chars)
   * @returns Promise resolving to payment with status and next action
   *
   * @example
   * ```ts
   * const payment = await seasonTicketsClient.purchaseSeasonTicket(
   *   'plan-123',
   *   { paymentMethods: [{ method: 'card', provider: 'yookassa' }] },
   *   'purchase-idempotency-key'
   * );
   * ```
   */
  async purchaseSeasonTicket(
    planId: string,
    data: PurchaseSeasonTicketDto,
    idempotencyKey: IdempotencyKey
  ): Promise<Payment> {
    const validatedData = PurchaseSeasonTicketDtoSchema.parse(data);

    const config = withIdempotency({}, idempotencyKey);
    const response = await apiClient.post(
      `/season-ticket-plans/${encodeURIComponent(planId)}/purchase`,
      validatedData,
      config
    );
    return validateResponse(response.data, PaymentSchema);
  },

  /**
   * Get season tickets (user's own or filtered by userId for ADMIN)
   * GET /season-tickets
   */
  async getSeasonTickets(filters?: SeasonTicketFilters): Promise<PaginatedResponse<SeasonTicket>> {
    const validatedFilters = SeasonTicketFiltersSchema.parse(filters || {});
    const queryString = createQueryString(validatedFilters);
    
    const response = await apiClient.get(`/season-tickets${queryString}`);
    return validateResponse(response.data, PaginatedResponseSchema(SeasonTicketSchema));
  },
};