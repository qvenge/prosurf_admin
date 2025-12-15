import { z } from 'zod';
import { apiClient, validateResponse } from '../config';
import { joinApiUrl } from '../../lib/url-utils';
import { NotificationTemplateSchema } from '../schemas';
import type {
  NotificationTemplate,
  NotificationTemplateType,
  NotificationTemplateUpdate,
} from '../types';

/**
 * Transform template imageUrl to full URL
 */
const transformTemplate = (template: NotificationTemplate): NotificationTemplate => ({
  ...template,
  imageUrl: joinApiUrl(template.imageUrl) ?? template.imageUrl,
});

/**
 * Notification Templates API client
 */
export const notificationTemplatesClient = {
  /**
   * Get all notification templates
   * GET /notification-templates
   */
  async getAll(): Promise<NotificationTemplate[]> {
    const response = await apiClient.get('/notification-templates');
    return validateResponse(response.data, z.array(NotificationTemplateSchema)).map(transformTemplate);
  },

  /**
   * Get notification template by type
   * GET /notification-templates/:type
   */
  async getByType(type: NotificationTemplateType): Promise<NotificationTemplate> {
    const response = await apiClient.get(
      `/notification-templates/${encodeURIComponent(type)}`,
    );
    return transformTemplate(validateResponse(response.data, NotificationTemplateSchema));
  },

  /**
   * Update notification template
   * PATCH /notification-templates/:type
   */
  async update(
    type: NotificationTemplateType,
    data: NotificationTemplateUpdate,
  ): Promise<NotificationTemplate> {
    const response = await apiClient.patch(
      `/notification-templates/${encodeURIComponent(type)}`,
      data,
    );
    return transformTemplate(validateResponse(response.data, NotificationTemplateSchema));
  },
};
