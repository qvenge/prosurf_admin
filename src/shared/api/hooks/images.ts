import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { imagesClient } from '../clients/images';
import type { ImageFilters } from '../types';

// Query key factory for images
export const imagesKeys = {
  all: ['images'] as const,
  lists: () => [...imagesKeys.all, 'list'] as const,
  list: (filters?: ImageFilters) => [...imagesKeys.lists(), filters] as const,
  details: () => [...imagesKeys.all, 'detail'] as const,
  detail: (id: string) => [...imagesKeys.details(), id] as const,
} as const;

/**
 * Images hooks
 */

// Get images with filtering and pagination
export const useImages = (filters?: ImageFilters) => {
  return useQuery({
    queryKey: imagesKeys.list(filters),
    queryFn: () => imagesClient.getImages(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get image by ID
export const useImage = (id?: string, enabled?: boolean) => {
  return useQuery({
    queryKey: imagesKeys.detail(id ?? ''),
    queryFn: () => imagesClient.getImageById(id ?? ''),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled,
  });
};

// Upload images with tags
export const useUploadImages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ files, tags }: { files: File[]; tags?: string[] }) =>
      imagesClient.uploadImages(files, tags),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: imagesKeys.lists() });
    },
  });
};

// Delete image by ID
export const useDeleteImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => imagesClient.deleteImage(id),
    onSuccess: (_, imageId) => {
      queryClient.removeQueries({ queryKey: imagesKeys.detail(imageId) });
      queryClient.invalidateQueries({ queryKey: imagesKeys.lists() });
    },
  });
};
