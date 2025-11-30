import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { adminClient } from '../clients/admin';
import type {
  Admin,
  AdminCreateDto,
  AdminUpdateDto,
  AdminSelfUpdateDto,
  ChangePasswordDto,
  AdminFilters,
  AuditLog,
  AuditLogFilters,
  PaginatedResponse,
} from '../types';

// Query key factory for admin operations
export const adminKeys = {
  all: ['admin'] as const,
  // Admin management
  admins: () => [...adminKeys.all, 'admins'] as const,
  adminsList: (filters?: AdminFilters) => [...adminKeys.admins(), 'list', filters] as const,
  adminDetail: (id: string) => [...adminKeys.admins(), 'detail', id] as const,
  // Current admin profile
  me: () => [...adminKeys.all, 'me'] as const,
  // Admin-only operations
  auditLogs: (filters?: AuditLogFilters) => [...adminKeys.all, 'audit-logs', filters] as const,
  jobs: () => [...adminKeys.all, 'jobs'] as const,
} as const;

// ============================================
// Admin Management Hooks
// ============================================

// Get list of admins (ADMIN only)
export const useAdmins = (filters?: AdminFilters) => {
  return useQuery({
    queryKey: adminKeys.adminsList(filters),
    queryFn: () => adminClient.getAdmins(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Infinite query for admins list
export const useAdminsInfinite = (filters?: Omit<AdminFilters, 'cursor'>) => {
  return useInfiniteQuery({
    queryKey: adminKeys.adminsList(filters),
    queryFn: ({ pageParam }) => adminClient.getAdmins({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: PaginatedResponse<Admin>) => lastPage.next,
    staleTime: 2 * 60 * 1000,
  });
};

// Get admin by ID (ADMIN only)
export const useAdmin = (id: string) => {
  return useQuery({
    queryKey: adminKeys.adminDetail(id),
    queryFn: () => adminClient.getAdminById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create admin mutation (ADMIN only)
export const useCreateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AdminCreateDto) => adminClient.createAdmin(data),
    onSuccess: (newAdmin) => {
      // Add the new admin to the cache
      queryClient.setQueryData(adminKeys.adminDetail(newAdmin.id), newAdmin);

      // Invalidate admins list to show the new admin
      queryClient.invalidateQueries({ queryKey: adminKeys.admins() });
    },
    onError: (error) => {
      console.error('Failed to create admin:', error);
    },
  });
};

// Update admin mutation (ADMIN only)
export const useUpdateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminUpdateDto }) =>
      adminClient.updateAdmin(id, data),
    onSuccess: (updatedAdmin, variables) => {
      // Update the specific admin in cache
      queryClient.setQueryData(adminKeys.adminDetail(variables.id), updatedAdmin);

      // Invalidate admins list to ensure consistency
      queryClient.invalidateQueries({ queryKey: adminKeys.admins() });
    },
    onError: (error) => {
      console.error('Failed to update admin:', error);
    },
  });
};

// Delete admin mutation (ADMIN only)
export const useDeleteAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminClient.deleteAdmin(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: adminKeys.adminDetail(deletedId) });

      // Invalidate admins list
      queryClient.invalidateQueries({ queryKey: adminKeys.admins() });
    },
    onError: (error) => {
      console.error('Failed to delete admin:', error);
    },
  });
};

// ============================================
// Current Admin Profile Hooks
// ============================================

// Get current admin profile
export const useAdminMe = () => {
  return useQuery({
    queryKey: adminKeys.me(),
    queryFn: () => adminClient.getMe(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Update current admin profile
export const useUpdateAdminMe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AdminSelfUpdateDto) => adminClient.updateMe(data),
    onSuccess: (updatedAdmin) => {
      // Update the me query cache
      queryClient.setQueryData(adminKeys.me(), updatedAdmin);

      // Also update the admin in the admins list if it exists
      queryClient.setQueryData(adminKeys.adminDetail(updatedAdmin.id), updatedAdmin);
    },
    onError: (error) => {
      console.error('Failed to update profile:', error);
    },
  });
};

// Change current admin's password
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordDto) => adminClient.changePassword(data),
    onError: (error) => {
      console.error('Failed to change password:', error);
    },
  });
};

// ============================================
// Admin-Only Operations Hooks
// ============================================

// Get audit logs
export const useAuditLogs = (filters?: AuditLogFilters) => {
  return useQuery({
    queryKey: adminKeys.auditLogs(filters),
    queryFn: () => adminClient.getAuditLogs(filters),
    staleTime: 5 * 60 * 1000,
  });
};

// Infinite query for audit logs
export const useAuditLogsInfinite = (filters?: Omit<AuditLogFilters, 'cursor'>) => {
  return useInfiniteQuery({
    queryKey: adminKeys.auditLogs(filters),
    queryFn: ({ pageParam }) => adminClient.getAuditLogs({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: PaginatedResponse<AuditLog>) => lastPage.next,
    staleTime: 5 * 60 * 1000,
  });
};

// Run booking expiry job
export const useRunBookingExpiryJob = () => {
  return useMutation({
    mutationFn: () => adminClient.runBookingExpiryJob(),
  });
};

// Run certificate expiry job
export const useRunCertificateExpiryJob = () => {
  return useMutation({
    mutationFn: () => adminClient.runCertificateExpiryJob(),
  });
};

// Run season ticket expiry job
export const useRunSeasonTicketExpiryJob = () => {
  return useMutation({
    mutationFn: () => adminClient.runSeasonTicketExpiryJob(),
  });
};
