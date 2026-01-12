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
 * Трансформация imageUrl шаблона в полный URL.
 */
const transformTemplate = (template: NotificationTemplate): NotificationTemplate => ({
  ...template,
  imageUrl: joinApiUrl(template.imageUrl) ?? template.imageUrl,
});

/**
 * API-клиент шаблонов уведомлений.
 */
export const notificationTemplatesClient = {
  /**
   * Получение всех шаблонов уведомлений.
   * GET /notification-templates
   */
  async getAll(): Promise<NotificationTemplate[]> {
    const response = await apiClient.get('/notification-templates');
    return validateResponse(response.data, z.array(NotificationTemplateSchema)).map(transformTemplate);
  },

  /**
   * Получение шаблона уведомления по типу.
   * GET /notification-templates/:type
   */
  async getByType(type: NotificationTemplateType): Promise<NotificationTemplate> {
    const response = await apiClient.get(
      `/notification-templates/${encodeURIComponent(type)}`,
    );
    return transformTemplate(validateResponse(response.data, NotificationTemplateSchema));
  },

  /**
   * Обновление шаблона уведомления.
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
