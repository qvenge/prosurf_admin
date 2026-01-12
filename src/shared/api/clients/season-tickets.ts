import { apiClient, validateResponse, createQueryString, withIdempotency } from '../config';
import { joinApiUrl } from '../../lib/url-utils';
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
  EventSchema,
  SeasonTicketAdminSchema,
  SeasonTicketAdminPaginatedResponseSchema,
  SeasonTicketAdminFiltersSchema,
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
  LimitParam,
  SeasonTicketAdmin,
  SeasonTicketAdminPaginatedResponse,
  SeasonTicketAdminFilters,
} from '../types';

/**
 * Трансформация SeasonTicketAdmin с полным URL фото владельца.
 */
const transformSeasonTicketAdmin = (ticket: SeasonTicketAdmin): SeasonTicketAdmin => ({
  ...ticket,
  owner: {
    ...ticket.owner,
    photoUrl: joinApiUrl(ticket.owner.photoUrl) ?? ticket.owner.photoUrl,
  },
});

/**
 * API-клиент абонементов.
 */
export const seasonTicketsClient = {
  /**
   * Получение каталога тарифных планов абонементов.
   * GET /season-ticket-plans
   */
  async getSeasonTicketPlans(filters?: SeasonTicketPlanFilters): Promise<PaginatedResponse<SeasonTicketPlan>> {
    const validatedFilters = SeasonTicketPlanFiltersSchema.parse(filters || {});
    const queryString = createQueryString(validatedFilters);

    const response = await apiClient.get(`/season-ticket-plans${queryString}`);
    return validateResponse(response.data, PaginatedResponseSchema(SeasonTicketPlanSchema));
  },

  /**
   * Получение тарифного плана абонемента.
   * GET /season-ticket-plans/{id}
   */
  async getSeasonTicketPlan(id: string): Promise<SeasonTicketPlan> {
    const response = await apiClient.get(`/season-ticket-plans/${encodeURIComponent(id)}`);
    return validateResponse(response.data, SeasonTicketPlanSchema);
  },

  /**
   * Создание тарифного плана абонемента (только ADMIN).
   * POST /season-ticket-plans
   */
  async createSeasonTicketPlan(data: SeasonTicketPlanCreateDto): Promise<SeasonTicketPlan> {
    const validatedData = SeasonTicketPlanCreateDtoSchema.parse(data);

    const response = await apiClient.post('/season-ticket-plans', validatedData);
    return validateResponse(response.data, SeasonTicketPlanSchema);
  },

  /**
   * Обновление тарифного плана абонемента (только ADMIN).
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
   * Удаление тарифного плана абонемента (только ADMIN).
   * DELETE /season-ticket-plans/{id}
   */
  async deleteSeasonTicketPlan(id: string): Promise<void> {
    await apiClient.delete(`/season-ticket-plans/${encodeURIComponent(id)}`);
  },

  /**
   * Получение мероприятий, применимых к тарифному плану абонемента.
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
   * Покупка абонемента (userId из токена).
   * POST /season-ticket-plans/{id}/purchase
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
   * Получение абонементов (свои или по userId для ADMIN).
   * GET /season-tickets
   */
  async getSeasonTickets(filters?: SeasonTicketFilters): Promise<PaginatedResponse<SeasonTicket>> {
    const validatedFilters = SeasonTicketFiltersSchema.parse(filters || {});
    const queryString = createQueryString(validatedFilters);

    const response = await apiClient.get(`/season-tickets${queryString}`);
    return validateResponse(response.data, PaginatedResponseSchema(SeasonTicketSchema));
  },

  /**
   * Отмена абонемента (пропорциональный возврат).
   * POST /season-tickets/{id}/cancel
   */
  async cancelSeasonTicket(id: string): Promise<SeasonTicket> {
    const response = await apiClient.post(`/season-tickets/${encodeURIComponent(id)}/cancel`);
    return validateResponse(response.data, SeasonTicketSchema);
  },

  /**
   * Получение всех абонементов для админа с постраничной пагинацией.
   * GET /admin/season-tickets
   */
  async getSeasonTicketsAdmin(filters?: SeasonTicketAdminFilters): Promise<SeasonTicketAdminPaginatedResponse> {
    const validatedFilters = SeasonTicketAdminFiltersSchema.parse(filters || {});

    const { sort, ...restFilters } = validatedFilters;
    const serializedFilters: Record<string, unknown> = { ...restFilters };
    if (sort && sort.length > 0) {
      serializedFilters.sort = sort.map((s) => `${s.field}:${s.order}`).join(',');
    }

    const queryString = createQueryString(serializedFilters);

    const response = await apiClient.get(`/admin/season-tickets${queryString}`);
    const data = validateResponse(response.data, SeasonTicketAdminPaginatedResponseSchema);

    return {
      ...data,
      items: data.items.map(transformSeasonTicketAdmin),
    };
  },

  /**
   * Получение абонемента по ID для админа.
   * GET /admin/season-tickets/:id
   */
  async getSeasonTicketAdmin(id: string): Promise<SeasonTicketAdmin> {
    const response = await apiClient.get(`/admin/season-tickets/${encodeURIComponent(id)}`);
    return transformSeasonTicketAdmin(validateResponse(response.data, SeasonTicketAdminSchema));
  },
};