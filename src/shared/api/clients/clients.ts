import { apiClient, validateResponse, createQueryString } from '../config';
import {
  ClientSchema,
  ClientUpdateDtoSchema,
  ClientFiltersSchema,
  PaginatedResponseSchema,
  SeasonTicketSchema,
  BonusWalletSchema,
  AdminGrantSeasonTicketDtoSchema,
} from '../schemas';
import type {
  Client,
  ClientUpdateDto,
  ClientFilters,
  PaginatedResponse,
  SeasonTicket,
  BonusWallet,
  AdminGrantSeasonTicketDto,
} from '../types';

/**
 * Clients API client
 *
 * Provides methods for managing Telegram clients (end-users).
 * These endpoints are typically admin-only.
 */
export const clientsClient = {
  /**
   * Get list of clients (ADMIN only)
   * GET /clients
   */
  async getClients(filters?: ClientFilters): Promise<PaginatedResponse<Client>> {
    const validatedFilters = ClientFiltersSchema.parse(filters || {});
    const queryString = createQueryString(validatedFilters);

    const response = await apiClient.get(`/clients${queryString}`);
    return validateResponse(response.data, PaginatedResponseSchema(ClientSchema));
  },

  /**
   * Get client by ID (ADMIN only)
   * GET /clients/{id}
   *
   * @param id - Client's telegramId
   */
  async getClientById(id: string): Promise<Client> {
    const response = await apiClient.get(`/clients/${encodeURIComponent(id)}`);
    return validateResponse(response.data, ClientSchema);
  },

  /**
   * Update client (ADMIN only)
   * PATCH /clients/{id}
   *
   * @param id - Client's telegramId
   * @param data - Update data
   */
  async updateClient(id: string, data: ClientUpdateDto): Promise<Client> {
    const validatedData = ClientUpdateDtoSchema.parse(data);

    const response = await apiClient.patch(
      `/clients/${encodeURIComponent(id)}`,
      validatedData
    );
    return validateResponse(response.data, ClientSchema);
  },

  /**
   * Get client's season tickets (ADMIN only)
   * GET /clients/{id}/season-tickets
   *
   * @param id - Client's telegramId
   */
  async getClientSeasonTickets(id: string): Promise<PaginatedResponse<SeasonTicket>> {
    const response = await apiClient.get(
      `/clients/${encodeURIComponent(id)}/season-tickets`
    );
    return validateResponse(response.data, PaginatedResponseSchema(SeasonTicketSchema));
  },

  /**
   * Get client's bonus wallet (ADMIN only)
   * GET /clients/{id}/bonus
   *
   * @param id - Client's telegramId
   */
  async getClientBonus(id: string): Promise<BonusWallet> {
    const response = await apiClient.get(
      `/clients/${encodeURIComponent(id)}/bonus`
    );
    return validateResponse(response.data, BonusWalletSchema);
  },

  /**
   * Grant season ticket to client (ADMIN only)
   * POST /clients/{id}/season-tickets
   *
   * @param id - Client's telegramId
   * @param data - Grant data with planId and optional expiresIn
   */
  async grantSeasonTicket(id: string, data: AdminGrantSeasonTicketDto): Promise<SeasonTicket> {
    const validatedData = AdminGrantSeasonTicketDtoSchema.parse(data);

    const response = await apiClient.post(
      `/clients/${encodeURIComponent(id)}/season-tickets`,
      validatedData
    );
    return validateResponse(response.data, SeasonTicketSchema);
  },
};
