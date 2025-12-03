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
 * Sessions API client
 */
export const sessionsClient = {
  /**
   * Get sessions for an event
   * GET /events/{id}/sessions
   */
  async getEventSessions(eventId: string, filters?: SessionFilters): Promise<PaginatedResponse<SessionCompact>> {
    const validatedFilters = SessionFiltersSchema.parse(filters || {});
    const queryString = createQueryString(validatedFilters);

    const response = await apiClient.get(`/events/${encodeURIComponent(eventId)}/sessions${queryString}`);
    return validateResponse(response.data, PaginatedResponseSchema(SessionCompactSchema));
  },

  /**
   * Create sessions for an event (ADMIN only)
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
   * Search sessions across all events
   * GET /sessions
   */
  async getSessions(filters?: SessionFilters): Promise<PaginatedResponse<Session>> {
    const validatedFilters = SessionFiltersSchema.parse(filters || {});
    const queryString = createQueryString(validatedFilters);
    
    const response = await apiClient.get(`/sessions${queryString}`);
    return validateResponse(response.data, PaginatedResponseSchema(SessionSchema));
  },

  /**
   * Get session by ID
   * GET /sessions/{id}
   */
  async getSessionById(id: string): Promise<Session> {
    const response = await apiClient.get(`/sessions/${encodeURIComponent(id)}`);
    return validateResponse(response.data, SessionSchema);
  },

  /**
   * Update session (ADMIN only)
   * PATCH /sessions/{id}
   * @param force - Force update even if session has active bookings
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
   * Delete session (ADMIN only)
   * DELETE /sessions/{id}
   * - No bookings: Hard delete (returns null)
   * - Has bookings + force: Soft cancel, sets status to CANCELLED (returns Session)
   * - Has bookings + no force: Throws 409 Conflict error
   * @param force - Force cancel even if session has active bookings
   */
  async deleteSession(id: string, force?: boolean): Promise<Session | null> {
    const queryParams = force ? '?force=true' : '';
    const response = await apiClient.delete(`/sessions/${encodeURIComponent(id)}${queryParams}`);
    // Hard delete returns empty response, soft cancel returns Session
    if (response.data) {
      return validateResponse(response.data, SessionSchema);
    }
    return null;
  },

  /**
   * Bulk update sessions (ADMIN only)
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
   * Bulk delete sessions (ADMIN only)
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