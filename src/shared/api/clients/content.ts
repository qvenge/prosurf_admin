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
 * Content API client
 */
export const contentClient = {
  /**
   * Get all content with filtering and pagination
   * GET /content
   */
  async getContents(filters?: ContentFilters): Promise<PaginatedResponse<Content>> {
    const validatedFilters = ContentFiltersSchema.parse(filters || {});
    const queryString = createQueryString(validatedFilters);

    const response = await apiClient.get(`/content${queryString}`);
    return validateResponse(response.data, PaginatedResponseSchema(ContentSchema));
  },

  /**
   * Get content by unique key
   * GET /content/key/:key
   */
  async getContentByKey(key: string): Promise<Content> {
    const response = await apiClient.get(`/content/key/${encodeURIComponent(key)}`);
    return validateResponse(response.data, ContentSchema);
  },

  /**
   * Get multiple contents by keys (batch)
   * GET /content/keys?keys[]=...
   */
  async getContentsByKeys(keys: string[]): Promise<Content[]> {
    const params = new URLSearchParams();
    keys.forEach(key => params.append('keys', key));

    const response = await apiClient.get(`/content/keys?${params.toString()}`);
    return validateResponse(response.data, z.array(ContentSchema));
  },

  /**
   * Create new content (admin only)
   * POST /content
   */
  async createContent(data: ContentCreate): Promise<Content> {
    const response = await apiClient.post('/content', data);
    return validateResponse(response.data, ContentSchema);
  },

  /**
   * Update existing content (admin only)
   * PATCH /content/:id
   */
  async updateContent(id: string, data: ContentUpdate): Promise<Content> {
    const response = await apiClient.patch(`/content/${encodeURIComponent(id)}`, data);
    return validateResponse(response.data, ContentSchema);
  },

  /**
   * Delete content (admin only)
   * DELETE /content/:id
   */
  async deleteContent(id: string): Promise<void> {
    await apiClient.delete(`/content/${encodeURIComponent(id)}`);
  },

  /**
   * Reorder contents (admin only)
   * PATCH /content/reorder
   */
  async reorderContents(ids: string[]): Promise<Content[]> {
    const response = await apiClient.patch('/content/reorder', { ids });
    return validateResponse(response.data, z.array(ContentSchema));
  },
};
