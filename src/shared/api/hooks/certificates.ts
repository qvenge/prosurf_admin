import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { certificatesClient } from '../clients/certificates';
import type {
  Certificate,
  CertificateCreateDto,
  CertificateFilters,
  PaginatedResponse,
  CertificateAdminFilters,
  AdminCreateCertificateDto,
  AdminUpdateCertificateDto,
} from '../types';

export const certificatesKeys = {
  all: ['certificates'] as const,
  lists: () => [...certificatesKeys.all, 'list'] as const,
  list: (filters?: CertificateFilters) => [...certificatesKeys.lists(), filters] as const,
} as const;

export const useCertificates = (filters?: CertificateFilters) => {
  return useQuery({
    queryKey: certificatesKeys.list(filters),
    queryFn: () => certificatesClient.getCertificates(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCertificatesInfinite = (filters?: Omit<CertificateFilters, 'cursor'>) => {
  return useInfiniteQuery({
    queryKey: certificatesKeys.list(filters),
    queryFn: ({ pageParam }) => certificatesClient.getCertificates({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: PaginatedResponse<Certificate>) => lastPage.next,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateCertificate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CertificateCreateDto) => certificatesClient.createCertificate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: certificatesKeys.lists() });
    },
  });
};

// Hook for client's certificates (for admin to view client's certificates)
export const useClientCertificates = (clientId: string | null) => {
  return useQuery({
    queryKey: certificatesKeys.list({ clientId: clientId! }),
    queryFn: () => certificatesClient.getCertificates({ clientId: clientId! }),
    enabled: Boolean(clientId),
    staleTime: 5 * 60 * 1000,
  });
};

// Legacy alias for backward compatibility
/**
 * @deprecated Use useClientCertificates instead
 */
export const useCurrentUserCertificates = () => useClientCertificates(null);

// ========================================
// Admin hooks
// ========================================

export const certificatesAdminKeys = {
  all: ['certificates-admin'] as const,
  lists: () => [...certificatesAdminKeys.all, 'list'] as const,
  list: (filters?: CertificateAdminFilters) => [...certificatesAdminKeys.lists(), filters] as const,
  details: () => [...certificatesAdminKeys.all, 'detail'] as const,
  detail: (id: string) => [...certificatesAdminKeys.details(), id] as const,
} as const;

/**
 * Get certificates for admin with page-based pagination
 */
export const useCertificatesAdmin = (filters?: CertificateAdminFilters) => {
  return useQuery({
    queryKey: certificatesAdminKeys.list(filters),
    queryFn: () => certificatesClient.getCertificatesAdmin(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Get single certificate by ID for admin
 */
export const useCertificateAdmin = (id: string | null) => {
  return useQuery({
    queryKey: certificatesAdminKeys.detail(id!),
    queryFn: () => certificatesClient.getCertificateAdmin(id!),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  });
};

/**
 * Create certificate as admin
 */
export const useCreateCertificateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AdminCreateCertificateDto) => certificatesClient.createCertificateAdmin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: certificatesAdminKeys.lists() });
    },
  });
};

/**
 * Update certificate as admin
 */
export const useUpdateCertificateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminUpdateCertificateDto }) =>
      certificatesClient.updateCertificateAdmin(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: certificatesAdminKeys.lists() });
      queryClient.invalidateQueries({ queryKey: certificatesAdminKeys.detail(variables.id) });
    },
  });
};

/**
 * Delete certificate as admin
 */
export const useDeleteCertificateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => certificatesClient.deleteCertificateAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: certificatesAdminKeys.lists() });
    },
  });
};