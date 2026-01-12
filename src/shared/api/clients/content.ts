import { z } from 'zod';
import { apiClient, validateResponse, createQueryString } from '../config';
import {
  ContentSchema,
  ContentFiltersSchema,
  PaginatedResponseSchema,
} from '../schemas';
import type {
  Content,
  ContentFilters,
  ContentCreate,
  ContentUpdate,
  PaginatedResponse,
} from '../types';

/**
 * API-клиент контента.
 */
export const contentClient = {
  /**
   * Получение контента с фильтрацией и пагинацией.
   * GET /content
   */
  async getContents(filters?: ContentFilters): Promise<PaginatedResponse<Content>> {
    const validatedFilters = ContentFiltersSchema.parse(filters || {});
    const queryString = createQueryString(validatedFilters);

    const response = await apiClient.get(`/content${queryString}`);
    return validateResponse(response.data, PaginatedResponseSchema(ContentSchema));
  },

  /**
   * Получение контента по уникальному ключу.
   * GET /content/key/:key
   */
  async getContentByKey(key: string): Promise<Content> {
    const response = await apiClient.get(`/content/key/${encodeURIComponent(key)}`);
    return validateResponse(response.data, ContentSchema);
  },

  /**
   * Получение нескольких контентов по ключам (батч-запрос).
   * GET /content/keys?keys[]=...
   */
  async getContentsByKeys(keys: string[]): Promise<Content[]> {
    const params = new URLSearchParams();
    keys.forEach(key => params.append('keys', key));

    const response = await apiClient.get(`/content/keys?${params.toString()}`);
    return validateResponse(response.data, z.array(ContentSchema));
  },

  /**
   * Создание контента (только ADMIN).
   * POST /content
   */
  async createContent(data: ContentCreate): Promise<Content> {
    const response = await apiClient.post('/content', data);
    return validateResponse(response.data, ContentSchema);
  },

  /**
   * Обновление контента (только ADMIN).
   * PATCH /content/:id
   */
  async updateContent(id: string, data: ContentUpdate): Promise<Content> {
    const response = await apiClient.patch(`/content/${encodeURIComponent(id)}`, data);
    return validateResponse(response.data, ContentSchema);
  },

  /**
   * Удаление контента (только ADMIN).
   * DELETE /content/:id
   */
  async deleteContent(id: string): Promise<void> {
    await apiClient.delete(`/content/${encodeURIComponent(id)}`);
  },

  /**
   * Изменение порядка контентов (только ADMIN).
   * PATCH /content/reorder
   */
  async reorderContents(ids: string[]): Promise<Content[]> {
    const response = await apiClient.patch('/content/reorder', { ids });
    return validateResponse(response.data, z.array(ContentSchema));
  },
};
