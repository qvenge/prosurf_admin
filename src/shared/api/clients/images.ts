import { z } from 'zod';
import { apiClient, validateResponse, createQueryString } from '../config';
import { joinApiUrl } from '../../lib/url-utils';
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
 * Трансформация URL изображения в полный URL.
 */
const transformImageUrl = (image: Image): Image => ({
  ...image,
  url: joinApiUrl(image.url) || image.url,
});

/**
 * API-клиент изображений.
 */
export const imagesClient = {
  /**
   * Получение изображений с фильтрацией и пагинацией.
   * GET /images
   */
  async getImages(filters?: ImageFilters): Promise<PaginatedResponse<Image>> {
    const validatedFilters = ImageFiltersSchema.parse(filters || {});
    const queryString = createQueryString(validatedFilters);

    const response = await apiClient.get(`/images${queryString}`);
    const data = validateResponse(response.data, PaginatedResponseSchema(ImageSchema));

    return {
      ...data,
      items: data.items.map(transformImageUrl),
    };
  },

  /**
   * Получение изображения по ID.
   * GET /images/{id}
   */
  async getImageById(id: string): Promise<Image> {
    const response = await apiClient.get(`/images/${encodeURIComponent(id)}`);
    return transformImageUrl(validateResponse(response.data, ImageSchema));
  },

  /**
   * Загрузка изображений с опциональными тегами.
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
    return validateResponse(response.data, z.array(ImageSchema)).map(transformImageUrl);
  },

  /**
   * Удаление изображения по ID.
   * DELETE /images/{id}
   */
  async deleteImage(id: string): Promise<void> {
    await apiClient.delete(`/images/${encodeURIComponent(id)}`);
  },
};
