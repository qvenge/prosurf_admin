import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contentClient } from '../clients/content';
import type { ContentFilters, ContentCreate, ContentUpdate } from '../types';

// Query key factory for content
export const contentKeys = {
  all: ['content'] as const,
  lists: () => [...contentKeys.all, 'list'] as const,
  list: (filters?: ContentFilters) => [...contentKeys.lists(), filters] as const,
  details: () => [...contentKeys.all, 'detail'] as const,
  detail: (id: string) => [...contentKeys.details(), id] as const,
  byKey: (key: string) => [...contentKeys.all, 'key', key] as const,
  byKeys: (keys: string[]) => [...contentKeys.all, 'keys', keys] as const,
} as const;

/**
 * Content hooks
 */

// Get all content with filtering and pagination
export const useContents = (filters?: ContentFilters) => {
  return useQuery({
    queryKey: contentKeys.list(filters),
    queryFn: () => contentClient.getContents(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get content by unique key
export const useContentByKey = (key: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: contentKeys.byKey(key),
    queryFn: () => contentClient.getContentByKey(key),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: options?.enabled ?? true,
  });
};

// Get multiple contents by keys (batch)
export const useContentsByKeys = (keys: string[], options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: contentKeys.byKeys(keys),
    queryFn: () => contentClient.getContentsByKeys(keys),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: (options?.enabled ?? true) && keys.length > 0,
  });
};

// Create new content
export const useCreateContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ContentCreate) => contentClient.createContent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentKeys.lists() });
    },
  });
};

// Update existing content
export const useUpdateContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ContentUpdate }) =>
      contentClient.updateContent(id, data),
    onSuccess: (updatedContent) => {
      // Update cache for the specific content
      queryClient.setQueryData(contentKeys.detail(updatedContent.id), updatedContent);
      queryClient.setQueryData(contentKeys.byKey(updatedContent.key), updatedContent);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: contentKeys.lists() });
    },
  });
};

// Delete content
export const useDeleteContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => contentClient.deleteContent(id),
    onSuccess: (_, contentId) => {
      queryClient.removeQueries({ queryKey: contentKeys.detail(contentId) });
      queryClient.invalidateQueries({ queryKey: contentKeys.lists() });
    },
  });
};

// Reorder contents
export const useReorderContents = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => contentClient.reorderContents(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentKeys.lists() });
    },
  });
};
