import { apiClient, validateResponse, createQueryString, withIdempotency } from '../config';
import { 
  WaitlistEntrySchema,
  PaginatedResponseSchema,
  WaitlistFiltersSchema
} from '../schemas';
import type { 
  WaitlistEntry,
  PaginatedResponse,
  WaitlistFilters,
  IdempotencyKey
} from '../types';

/**
 * API-клиент листа ожидания.
 */
export const waitlistClient = {
  /**
   * Записаться в лист ожидания на сессию.
   * POST /sessions/{id}/waitlist
   */
  async joinWaitlist(sessionId: string, idempotencyKey: IdempotencyKey): Promise<WaitlistEntry> {
    const config = withIdempotency({}, idempotencyKey);
    const response = await apiClient.post(
      `/sessions/${encodeURIComponent(sessionId)}/waitlist`,
      {},
      config
    );
    return validateResponse(response.data, WaitlistEntrySchema);
  },

  /**
   * Получение записей листа ожидания пользователя (свои или ADMIN).
   * GET /users/{id}/waitlist
   */
  async getUserWaitlist(userId: string, filters?: WaitlistFilters): Promise<PaginatedResponse<WaitlistEntry>> {
    const validatedFilters = WaitlistFiltersSchema.parse(filters || {});
    const queryString = createQueryString(validatedFilters);

    const response = await apiClient.get(`/users/${encodeURIComponent(userId)}/waitlist${queryString}`);
    return validateResponse(response.data, PaginatedResponseSchema(WaitlistEntrySchema));
  },
};