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
 * API-клиент мероприятий.
 */
export const eventsClient = {
  /**
   * Получение каталога мероприятий с фильтрацией и пагинацией.
   * GET /events
   */
  async getEvents(filters?: EventFilters): Promise<PaginatedResponse<Event>> {
    const validatedFilters = EventFiltersSchema.parse(filters || {});
    const queryString = createQueryString(validatedFilters);

    const response = await apiClient.get(`/events${queryString}`);
    return validateResponse(response.data, PaginatedResponseSchema(EventSchema));
  },

  /**
   * Создание мероприятия (только ADMIN).
   * POST /events
   */
  async createEvent(data: EventCreateDto): Promise<Event> {
    const validatedData = EventCreateDtoSchema.parse(data);

    const formData = new FormData();

    formData.append('title', validatedData.title);
    if (validatedData.location) formData.append('location', validatedData.location);
    if (validatedData.mapUrl) formData.append('mapUrl', validatedData.mapUrl);
    if (validatedData.capacity !== undefined && validatedData.capacity !== null) {
      formData.append('capacity', validatedData.capacity.toString());
    }

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

    if (validatedData.images && validatedData.images.length > 0) {
      validatedData.images.forEach((file) => {
        formData.append('images', file);
      });
    }

    if (validatedData.previewImage) {
      formData.append('previewImage', validatedData.previewImage);
    }

    const response = await apiClient.post('/events', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return validateResponse(response.data, EventSchema);
  },

  /**
   * Получение мероприятия по ID.
   * GET /events/{id}
   */
  async getEventById(id: string): Promise<Event> {
    const response = await apiClient.get(`/events/${encodeURIComponent(id)}`);
    return validateResponse(response.data, EventSchema);
  },

  /**
   * Обновление мероприятия (только ADMIN).
   * PATCH /events/{id}
   *
   * @param force - Принудительное обновление даже при наличии активных бронирований
   */
  async updateEvent(id: string, data: EventUpdateDto, force?: boolean): Promise<Event> {
    const validatedData = EventUpdateDtoSchema.parse(data);

    const formData = new FormData();

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

    if (validatedData.images && validatedData.images.length > 0) {
      validatedData.images.forEach((file) => {
        formData.append('images', file);
      });
    }

    // existingImages передаются как JSON — бэкенд объединяет новые загрузки с этими URL
    if (validatedData.existingImages !== undefined) {
      formData.append('images', JSON.stringify(validatedData.existingImages));
    }

    if (validatedData.previewImage) {
      formData.append('previewImage', validatedData.previewImage);
    } else if (validatedData.removePreviewImage) {
      formData.append('removePreviewImage', 'true');
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
   * Удаление мероприятия (только ADMIN).
   * DELETE /events/{id}
   */
  async deleteEvent(id: string, force?: boolean): Promise<void> {
    const queryParams = force ? '?force=true' : '';
    await apiClient.delete(`/events/${encodeURIComponent(id)}${queryParams}`);
  },
};