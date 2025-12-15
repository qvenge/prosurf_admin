import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationTemplatesClient } from '../clients/notification-templates';
import type { NotificationTemplateType, NotificationTemplateUpdate } from '../types';

// Query key factory for notification templates
export const notificationTemplatesKeys = {
  all: ['notification-templates'] as const,
  lists: () => [...notificationTemplatesKeys.all, 'list'] as const,
  list: () => [...notificationTemplatesKeys.lists()] as const,
  details: () => [...notificationTemplatesKeys.all, 'detail'] as const,
  detail: (type: NotificationTemplateType) =>
    [...notificationTemplatesKeys.details(), type] as const,
} as const;

/**
 * Notification Template hooks
 */

// Get all notification templates
export const useNotificationTemplates = () => {
  return useQuery({
    queryKey: notificationTemplatesKeys.list(),
    queryFn: () => notificationTemplatesClient.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get notification template by type
export const useNotificationTemplate = (
  type: NotificationTemplateType,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: notificationTemplatesKeys.detail(type),
    queryFn: () => notificationTemplatesClient.getByType(type),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled ?? true,
  });
};

// Update notification template
export const useUpdateNotificationTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      type,
      data,
    }: {
      type: NotificationTemplateType;
      data: NotificationTemplateUpdate;
    }) => notificationTemplatesClient.update(type, data),
    onSuccess: (updatedTemplate) => {
      // Update cache for the specific template
      queryClient.setQueryData(
        notificationTemplatesKeys.detail(updatedTemplate.type),
        updatedTemplate,
      );
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: notificationTemplatesKeys.lists() });
    },
  });
};
