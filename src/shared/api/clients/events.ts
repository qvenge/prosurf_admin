import { apiClient, validateResponse, createQueryString } from '../config';
import {
  EventSchema,
  EventCreateDtoSchema,
  EventUpdateDtoSchema,
  PaginatedResponseSchema,
  EventFiltersSchema
} from '../schemas';
import type {
  Event,
  EventCreateDto,
  EventUpdateDto,
  PaginatedResponse,
  EventFilters
} from '../types';

/**
 * Events API client
 */
export const eventsClient = {
  /**
   * Get events catalog with filtering and pagination
   * GET /events
   */
  async getEvents(filters?: EventFilters): Promise<PaginatedResponse<Event>> {
    const validatedFilters = EventFiltersSchema.parse(filters || {});
    const queryString = createQueryString(validatedFilters);
    
    const response = await apiClient.get(`/events${queryString}`);
    return validateResponse(response.data, PaginatedResponseSchema(EventSchema));
  },

  /**
   * Create new event (ADMIN only)
   * POST /events
   */
  async createEvent(data: EventCreateDto): Promise<Event> {
    const validatedData = EventCreateDtoSchema.parse(data);
    
    const response = await apiClient.post('/events', validatedData);
    return validateResponse(response.data, EventSchema);
  },

  /**
   * Get event by ID
   * GET /events/{id}
   */
  async getEventById(id: string): Promise<Event> {
    const response = await apiClient.get(`/events/${encodeURIComponent(id)}`);
    return validateResponse(response.data, EventSchema);
  },

  /**
   * Update event (ADMIN only)
   * PATCH /events/{id}
   */
  async updateEvent(id: string, data: EventUpdateDto): Promise<Event> {
    const validatedData = EventUpdateDtoSchema.parse(data);

    const response = await apiClient.patch(
      `/events/${encodeURIComponent(id)}`,
      validatedData
    );
    return validateResponse(response.data, EventSchema);
  },

  /**
   * Delete event (ADMIN only)
   * DELETE /events/{id}
   */
  async deleteEvent(id: string, force?: boolean): Promise<void> {
    const queryParams = force ? '?force=true' : '';
    await apiClient.delete(`/events/${encodeURIComponent(id)}${queryParams}`);
  },
};