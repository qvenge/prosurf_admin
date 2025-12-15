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

    // Construct FormData for multipart/form-data
    const formData = new FormData();

    // Add plain fields
    formData.append('title', validatedData.title);
    if (validatedData.location) formData.append('location', validatedData.location);
    if (validatedData.mapUrl) formData.append('mapUrl', validatedData.mapUrl);
    if (validatedData.capacity !== undefined && validatedData.capacity !== null) {
      formData.append('capacity', validatedData.capacity.toString());
    }

    // Add complex fields as JSON strings
    if (validatedData.description) {
      formData.append('description', JSON.stringify(validatedData.description));
    }
    formData.append('tickets', JSON.stringify(validatedData.tickets));
    if (validatedData.labels) {
      formData.append('labels', JSON.stringify(validatedData.labels));
    }
    if (validatedData.attributes) {
      formData.append('attributes', JSON.stringify(validatedData.attributes));
    }

    // Add image files
    if (validatedData.images && validatedData.images.length > 0) {
      validatedData.images.forEach((file) => {
        formData.append('images', file);
      });
    }

    const response = await apiClient.post('/events', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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
   * @param force - Force update even if event has sessions with active bookings
   */
  async updateEvent(id: string, data: EventUpdateDto, force?: boolean): Promise<Event> {
    const validatedData = EventUpdateDtoSchema.parse(data);

    // Construct FormData for multipart/form-data
    const formData = new FormData();

    // Add plain fields (only if provided)
    if (validatedData.title) formData.append('title', validatedData.title);
    if (validatedData.location !== undefined) {
      formData.append('location', validatedData.location || '');
    }
    if (validatedData.mapUrl !== undefined) {
      formData.append('mapUrl', validatedData.mapUrl || '');
    }
    if (validatedData.capacity !== undefined && validatedData.capacity !== null) {
      formData.append('capacity', validatedData.capacity.toString());
    }

    // Add complex fields as JSON strings (only if provided)
    if (validatedData.description !== undefined) {
      formData.append('description', JSON.stringify(validatedData.description));
    }
    if (validatedData.tickets) {
      formData.append('tickets', JSON.stringify(validatedData.tickets));
    }
    if (validatedData.labels) {
      formData.append('labels', JSON.stringify(validatedData.labels));
    }
    if (validatedData.attributes) {
      formData.append('attributes', JSON.stringify(validatedData.attributes));
    }

    // Add new image files
    if (validatedData.images && validatedData.images.length > 0) {
      validatedData.images.forEach((file) => {
        formData.append('images', file);
      });
    }

    // Send existing images to keep as JSON string
    // Backend's @Transform decorator parses this to string[]
    // This triggers "replace mode" - backend merges new uploads with these URLs
    if (validatedData.existingImages !== undefined) {
      formData.append('images', JSON.stringify(validatedData.existingImages));
    }

    const queryParams = force ? '?force=true' : '';
    const response = await apiClient.patch(
      `/events/${encodeURIComponent(id)}${queryParams}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
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