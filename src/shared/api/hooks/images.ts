import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { imagesClient } from '../clients/images';
import type { ImageFilters } from '../types';

export const imagesKeys = {
  all: ['images'] as const,
  lists: () => [...imagesKeys.all, 'list'] as const,
  list: (filters?: ImageFilters) => [...imagesKeys.lists(), filters] as const,
  details: () => [...imagesKeys.all, 'detail'] as const,
  detail: (id: string) => [...imagesKeys.details(), id] as const,
} as const;

export const useImages = (filters?: ImageFilters) => {
  return useQuery({
    queryKey: imagesKeys.list(filters),
    queryFn: () => imagesClient.getImages(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useImage = (id?: string, enabled?: boolean) => {
  return useQuery({
    queryKey: imagesKeys.detail(id ?? ''),
    queryFn: () => imagesClient.getImageById(id ?? ''),
    staleTime: 10 * 60 * 1000,
    enabled,
  });
};

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
