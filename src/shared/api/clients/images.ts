import { z } from 'zod';
import { apiClient, validateResponse, createQueryString } from '../config';
import {
  ImageSchema,
  ImageFiltersSchema,
  PaginatedResponseSchema,
} from '../schemas';
import type {
  Image,
  ImageFilters,
  PaginatedResponse,
} from '../types';

/**
 * Images API client
 */
export const imagesClient = {
  /**
   * Get images with filtering and pagination
   * GET /images
   */
  async getImages(filters?: ImageFilters): Promise<PaginatedResponse<Image>> {
    const validatedFilters = ImageFiltersSchema.parse(filters || {});
    const queryString = createQueryString(validatedFilters);

    const response = await apiClient.get(`/images${queryString}`);
    return validateResponse(response.data, PaginatedResponseSchema(ImageSchema));
  },

  /**
   * Get image by ID
   * GET /images/{id}
   */
  async getImageById(id: string): Promise<Image> {
    const response = await apiClient.get(`/images/${encodeURIComponent(id)}`);
    return validateResponse(response.data, ImageSchema);
  },

  /**
   * Upload images with optional tags
   * POST /images
   */
  async uploadImages(files: File[], tags?: string[]): Promise<Image[]> {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append('files', file);
    });

    if (tags && tags.length > 0) {
      formData.append('tags', JSON.stringify(tags));
    }

    const response = await apiClient.post('/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return validateResponse(response.data, z.array(ImageSchema));
  },

  /**
   * Delete image by ID
   * DELETE /images/{id}
   */
  async deleteImage(id: string): Promise<void> {
    await apiClient.delete(`/images/${encodeURIComponent(id)}`);
  },
};
