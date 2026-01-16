import { apiClient, validateResponse, createQueryString } from '../config';
import { joinApiUrl } from '../../lib/url-utils';
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
 * Трансформация photoUrl клиента в полный URL.
 */
const transformClient = (client: Client): Client => ({
  ...client,
  photoUrl: joinApiUrl(client.photoUrl) ?? client.photoUrl,
});

/**
 * API-клиент управления клиентами (пользователями Telegram).
 */
export const clientsClient = {
  /**
   * Получение списка клиентов (только ADMIN).
   * GET /clients
   */
  async getClients(filters?: ClientFilters): Promise<PaginatedResponse<Client>> {
    const validatedFilters = ClientFiltersSchema.parse(filters || {});
    const queryString = createQueryString(validatedFilters);

    const response = await apiClient.get(`/clients${queryString}`);
    const data = validateResponse(response.data, PaginatedResponseSchema(ClientSchema));

    return {
      ...data,
      items: data.items.map(transformClient),
    };
  },

  /**
   * Получение клиента по ID (только ADMIN).
   * GET /clients/{id}
   *
   * @param id - telegramId клиента
   */
  async getClientById(id: string): Promise<Client> {
    const response = await apiClient.get(`/clients/${encodeURIComponent(id)}`);
    return transformClient(validateResponse(response.data, ClientSchema));
  },

  /**
   * Обновление клиента (только ADMIN).
   * PATCH /clients/{id}
   *
   * @param id - telegramId клиента
   */
  async updateClient(id: string, data: ClientUpdateDto): Promise<Client> {
    const validatedData = ClientUpdateDtoSchema.parse(data);

    const response = await apiClient.patch(
      `/clients/${encodeURIComponent(id)}`,
      validatedData
    );
    return transformClient(validateResponse(response.data, ClientSchema));
  },

  /**
   * Обновление клиента с возможностью загрузки/удаления фото (только ADMIN).
   * PATCH /clients/{id}
   *
   * @param id - telegramId клиента
   * @param data - данные для обновления
   * @param photo - файл фото для загрузки (опционально)
   * @param deletePhoto - флаг удаления текущего фото (опционально)
   */
  async updateClientWithPhoto(
    id: string,
    data: ClientUpdateDto,
    photo?: File | null,
    deletePhoto?: boolean
  ): Promise<Client> {
    const validatedData = ClientUpdateDtoSchema.parse(data);
    const formData = new FormData();

    // Добавляем только заполненные поля
    if (validatedData.firstName !== undefined) {
      formData.append('firstName', validatedData.firstName ?? '');
    }
    if (validatedData.lastName !== undefined) {
      formData.append('lastName', validatedData.lastName ?? '');
    }
    if (validatedData.phone !== undefined) {
      formData.append('phone', validatedData.phone ?? '');
    }
    if (validatedData.email !== undefined) {
      formData.append('email', validatedData.email ?? '');
    }
    if (validatedData.dateOfBirth !== undefined) {
      formData.append('dateOfBirth', validatedData.dateOfBirth ?? '');
    }

    // Добавляем фото, если есть
    if (photo) {
      formData.append('photo', photo);
    }

    // Флаг удаления фото
    if (deletePhoto) {
      formData.append('deletePhoto', 'true');
    }

    const response = await apiClient.patch(
      `/clients/${encodeURIComponent(id)}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return transformClient(validateResponse(response.data, ClientSchema));
  },

  /**
   * Получение абонементов клиента (только ADMIN).
   * GET /clients/{id}/season-tickets
   *
   * @param id - telegramId клиента
   */
  async getClientSeasonTickets(id: string): Promise<PaginatedResponse<SeasonTicket>> {
    const response = await apiClient.get(
      `/clients/${encodeURIComponent(id)}/season-tickets`
    );
    return validateResponse(response.data, PaginatedResponseSchema(SeasonTicketSchema));
  },

  /**
   * Получение бонусного кошелька клиента (только ADMIN).
   * GET /users/{id}/bonus
   *
   * @param id - UUID клиента (не telegramId)
   */
  async getClientBonus(id: string): Promise<BonusWallet> {
    const response = await apiClient.get(
      `/users/${encodeURIComponent(id)}/bonus`
    );
    return validateResponse(response.data, BonusWalletSchema);
  },

  /**
   * Выдача абонемента клиенту (только ADMIN).
   * POST /clients/{id}/season-tickets
   *
   * @param id - telegramId клиента
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
