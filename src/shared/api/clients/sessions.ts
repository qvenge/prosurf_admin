import { apiClient, validateResponse, createQueryString, withIdempotency } from '../config';
import {
  SessionSchema,
  SessionCompactSchema,
  SessionCreateDtoSchema,
  SessionUpdateDtoSchema,
  SessionBulkUpdateDtoSchema,
  SessionBulkDeleteDtoSchema,
  SessionCreationResponseSchema,
  SessionBulkUpdateResponseSchema,
  SessionBulkDeleteResponseSchema,
  PaginatedResponseSchema,
  SessionFiltersSchema
} from '../schemas';
import type {
  Session,
  SessionCompact,
  SessionCreateDto,
  SessionUpdateDto,
  SessionBulkUpdateDto,
  SessionBulkDeleteDto,
  SessionCreationResponse,
  SessionBulkUpdateResponse,
  SessionBulkDeleteResponse,
  PaginatedResponse,
  SessionFilters,
  IdempotencyKey
} from '../types';

/**
 * API-клиент сессий.
 */
export const sessionsClient = {
  /**
   * Получение сессий мероприятия.
   * GET /events/{id}/sessions
   */
  async getEventSessions(eventId: string, filters?: SessionFilters): Promise<PaginatedResponse<SessionCompact>> {
    const validatedFilters = SessionFiltersSchema.parse(filters || {});
    const queryString = createQueryString(validatedFilters);

    const response = await apiClient.get(`/events/${encodeURIComponent(eventId)}/sessions${queryString}`);
    return validateResponse(response.data, PaginatedResponseSchema(SessionCompactSchema));
  },

  /**
   * Создание сессий для мероприятия (только ADMIN).
   * POST /events/{id}/sessions
   */
  async createEventSessions(
    eventId: string,
    data: SessionCreateDto | SessionCreateDto[],
    idempotencyKey: IdempotencyKey
  ): Promise<SessionCreationResponse> {
    let validatedData;
    if (Array.isArray(data)) {
      validatedData = data.map(session => SessionCreateDtoSchema.parse(session));
    } else {
      validatedData = SessionCreateDtoSchema.parse(data);
    }

    const config = withIdempotency({}, idempotencyKey);
    const response = await apiClient.post(
      `/events/${encodeURIComponent(eventId)}/sessions`,
      validatedData,
      config
    );
    return validateResponse(response.data, SessionCreationResponseSchema);
  },

  /**
   * Поиск сессий по всем мероприятиям.
   * GET /sessions
   */
  async getSessions(filters?: SessionFilters): Promise<PaginatedResponse<Session>> {
    const validatedFilters = SessionFiltersSchema.parse(filters || {});
    const queryString = createQueryString(validatedFilters);

    const response = await apiClient.get(`/sessions${queryString}`);
    return validateResponse(response.data, PaginatedResponseSchema(SessionSchema));
  },

  /**
   * Получение сессии по ID.
   * GET /sessions/{id}
   */
  async getSessionById(id: string): Promise<Session> {
    const response = await apiClient.get(`/sessions/${encodeURIComponent(id)}`);
    return validateResponse(response.data, SessionSchema);
  },

  /**
   * Обновление сессии (только ADMIN).
   * PATCH /sessions/{id}
   *
   * @param force - Принудительное обновление даже при наличии активных бронирований
   */
  async updateSession(id: string, data: SessionUpdateDto, force?: boolean): Promise<Session> {
    const validatedData = SessionUpdateDtoSchema.parse(data);
    const queryParams = force ? '?force=true' : '';

    const response = await apiClient.patch(
      `/sessions/${encodeURIComponent(id)}${queryParams}`,
      validatedData
    );
    return validateResponse(response.data, SessionSchema);
  },

  /**
   * Удаление сессии (только ADMIN).
   * DELETE /sessions/{id}
   *
   * Поведение зависит от наличия бронирований:
   * - Нет бронирований: полное удаление (возвращает null)
   * - Есть бронирования + force: мягкая отмена, статус CANCELLED (возвращает Session)
   * - Есть бронирования без force: ошибка 409 Conflict
   *
   * @param force - Принудительная отмена даже при наличии активных бронирований
   */
  async deleteSession(id: string, force?: boolean): Promise<Session | null> {
    const queryParams = force ? '?force=true' : '';
    const response = await apiClient.delete(`/sessions/${encodeURIComponent(id)}${queryParams}`);
    if (response.data) {
      return validateResponse(response.data, SessionSchema);
    }
    return null;
  },

  /**
   * Массовое обновление сессий (только ADMIN).
   * PATCH /sessions
   */
  async bulkUpdateSessions(
    sessions: SessionBulkUpdateDto[],
    idempotencyKey: IdempotencyKey
  ): Promise<SessionBulkUpdateResponse> {
    const validatedData = sessions.map(session => SessionBulkUpdateDtoSchema.parse(session));

    const config = withIdempotency({}, idempotencyKey);
    const response = await apiClient.patch('/sessions', validatedData, config);
    return validateResponse(response.data, SessionBulkUpdateResponseSchema);
  },

  /**
   * Массовое удаление сессий (только ADMIN).
   * DELETE /sessions
   */
  async bulkDeleteSessions(
    data: SessionBulkDeleteDto,
    idempotencyKey: IdempotencyKey
  ): Promise<SessionBulkDeleteResponse> {
    const validatedData = SessionBulkDeleteDtoSchema.parse(data);

    const config = withIdempotency({}, idempotencyKey);
    const response = await apiClient.delete('/sessions', {
      ...config,
      data: validatedData
    });
    return validateResponse(response.data, SessionBulkDeleteResponseSchema);
  },
};